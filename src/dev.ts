import { createServerAdapter } from '@whatwg-node/server'
import type { FastifyInstance } from 'fastify'
import path from 'node:path'
import type { RunnableDevEnvironment } from 'vite'
import { loadWakuConfig } from './utils/load-config.js'
import { rscPlugin } from './utils/rsc-plugin.js'
import { defaultOptions } from './defaults.js'
import type { WakuFastifyOptions } from './types.js'

function getMountPrefix(basePath: string): string {
    if (!basePath.endsWith('/')) {
        throw new Error('basePath must end with /')
    }
    // Fastify plugin prefix should not end with '/', except root.
    return basePath === '/' ? '/' : basePath.slice(0, -1)
}

function assertNoBasePathConflict(opts: {
    source: string
    expectedBasePath: string
    actualBasePath?: string
}) {
    const { source, expectedBasePath, actualBasePath } = opts
    if (actualBasePath && actualBasePath !== expectedBasePath) {
        throw new Error(
            `[waku-fastify] basePath mismatch: ${source}=${JSON.stringify(actualBasePath)} must match waku.config.ts basePath=${JSON.stringify(expectedBasePath)}`
        )
    }
}

export async function setupDevMode(
    fastify: FastifyInstance,
    options: WakuFastifyOptions
): Promise<void> {
    const instancePrefix = (fastify as any).prefix
    if (instancePrefix && instancePrefix !== '/') {
        throw new Error(
            `[waku-fastify] This plugin owns route mounting. Do not register it with an external Fastify prefix (got prefix=${JSON.stringify(instancePrefix)}). Configure waku.config.ts basePath instead.`
        )
    }

    const mergedOptions = { ...defaultOptions, ...options }
    const { root, childServerOptions, dev: devOptions } = mergedOptions
    // Only treat an explicitly provided value as user intent (do not validate defaults).
    const rawBasePath = options.basePath

    const cwd = root ?? process.cwd()
    const { viteOptions = {} } = (devOptions ?? {}) as NonNullable<WakuFastifyOptions['dev']>

    const wakuConfig = await loadWakuConfig(cwd)
    const effectiveBasePath = wakuConfig.basePath
    const mountPrefix = getMountPrefix(effectiveBasePath)

    // Enforce a single source of truth: waku.config.ts basePath.
    assertNoBasePathConflict({
        source: 'options.basePath',
        expectedBasePath: effectiveBasePath,
        actualBasePath: rawBasePath
    })

    // If user set vite.base in waku.config.ts, it must not contradict basePath.
    // (We always force Vite's base to effectiveBasePath.)
    assertNoBasePathConflict({
        source: 'waku.config.ts vite.base',
        expectedBasePath: effectiveBasePath,
        actualBasePath: wakuConfig.vite?.base
    })

    assertNoBasePathConflict({
        source: 'options.dev.viteOptions.base',
        expectedBasePath: effectiveBasePath,
        actualBasePath: viteOptions?.base
    })

    // Ensure the dev Vite cache dir is isolated by default.
    // This avoids 504 "Outdated Optimize Dep" when multiple Vite servers run in one repo.
    const resolvedViteOptions = (() => {
        // Merge waku.config.ts `vite` into dev viteOptions (dev viteOptions wins), but keep base controlled.
        const wakuVite = (wakuConfig as any).vite ?? {}
        return {
            ...wakuVite,
            ...viteOptions,
            resolve: {
                ...(wakuVite.resolve ?? {}),
                ...(viteOptions.resolve ?? {}),
                alias: {
                    ...((wakuVite.resolve ?? {}).alias ?? {}),
                    ...((viteOptions.resolve ?? {}).alias ?? {})
                }
            },
            server: {
                ...(wakuVite.server ?? {}),
                ...(viteOptions.server ?? {})
            },
            cacheDir:
                viteOptions.cacheDir ??
                wakuVite.cacheDir ??
                path.join(cwd, 'node_modules/.vite-waku-fastify')
        }
    })()

    // Register middie only once.
    // waku-fastify runs in environments where the host app may already have middie registered.
    if (!fastify.hasDecorator('use')) {
        await fastify.register(import('@fastify/middie'))
    }

    const setupOnInstance = async (scoped: FastifyInstance) => {
        const { createServer: createViteServer } = await import('vite')
        const vite = await createViteServer({
            root: cwd,
            ...resolvedViteOptions,
            base: effectiveBasePath,
            appType: 'custom',
            configFile: false,
            plugins: [await rscPlugin(wakuConfig)].flat().filter(Boolean),
            server: {
                middlewareMode: true,
                hmr: resolvedViteOptions?.server?.hmr ?? true,
                ...resolvedViteOptions?.server
            }
        })

        const environment = vite.environments.rsc as RunnableDevEnvironment | undefined
        if (!environment) {
            throw new Error(
                'RSC environment not found. Make sure Waku is properly configured and its Vite plugins are loaded.'
            )
        }

        // Mount Vite middlewares for all requests under this scope.
        // IMPORTANT: do NOT pass basePath here, otherwise fastify-middie will prefix it again
        // and we can end up with a double-prefixed path like /pages-waku/pages-waku/@vite/client.
        scoped.use(vite.middlewares)

        // Get server entry module ID
        const entryId = (environment.config.build.rollupOptions.input as any)?.index
        if (!entryId) {
            throw new Error('Server entry module not found in RSC environment')
        }

        // Create request handler adapter
        const handler = createServerAdapter(async (req: Request) => {
            const mod = await environment.runner.import(entryId)

            // Call Waku's internal fetch handler
            // Note: process.env must be passed as the first argument
            return mod.INTERNAL_runFetch(process.env as any, req)
        })

        // Register route handler at '/' within the scoped prefix.
        await scoped.register(
            async (childServer) => {
                // Remove default content type parsers to let Waku handle the body
                childServer.removeAllContentTypeParsers()
                childServer.addContentTypeParser('*', (_request, payload, done) => {
                    done(null, payload)
                })

                // Register wildcard route
                if (childServerOptions) {
                    childServer.all('*', childServerOptions, async (req, reply) => {
                        return handler.requestListener(req.raw, reply.raw)
                    })
                } else {
                    childServer.all('*', async (req, reply) => {
                        return handler.requestListener(req.raw, reply.raw)
                    })
                }
            },
            { prefix: '/' }
        )

        scoped.addHook('onClose', async () => {
            await vite.close()
            await handler.dispose?.()
        })
    }

    // If basePath is '/', don't add another prefixed scope. This keeps behavior identical to the
    // original waku-fastify implementation and avoids edge cases with nested plugin prefixes.
    if (mountPrefix === '/') {
        await setupOnInstance(fastify)
    } else {
        await fastify.register(async (scoped) => setupOnInstance(scoped), { prefix: mountPrefix })
    }
}
