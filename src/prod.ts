import fastifyStatic from '@fastify/static'
import { createServerAdapter } from '@whatwg-node/server'
import { tokenize } from 'cache-parser'
import type { FastifyInstance } from 'fastify'
import path from 'node:path'
import url from 'node:url'
import { loadWakuConfig } from './utils/load-config.js'
import { defaultOptions } from './defaults.js'
import type { WakuFastifyOptions } from './types.js'

function getMountPrefix(basePath: string): string {
    const normalized = basePath || '/'
    if (!normalized.endsWith('/')) {
        throw new Error('basePath must end with /')
    }
    return normalized === '/' ? '/' : normalized.slice(0, -1)
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

export async function setupProdMode(
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
    const { root, childServerOptions, build: buildOptions } = mergedOptions
    // Only treat an explicitly provided value as user intent (do not validate defaults).
    const rawBasePath = options.basePath
    const { distDir, assetCacheControl, defaultCacheControl } = buildOptions

    const cwd = root ?? process.cwd()
    const wakuConfig = await loadWakuConfig(cwd)
    const effectiveBasePath = wakuConfig.basePath
    const mountPrefix = getMountPrefix(effectiveBasePath)

    // Enforce a single source of truth: waku.config.ts basePath.
    assertNoBasePathConflict({
        source: 'options.basePath',
        expectedBasePath: wakuConfig.basePath,
        actualBasePath: rawBasePath
    })

    // If user set vite.base in waku.config.ts, it must not contradict basePath.
    assertNoBasePathConflict({
        source: 'waku.config.ts vite.base',
        expectedBasePath: wakuConfig.basePath,
        actualBasePath: wakuConfig.vite?.base
    })

    const resolvedDistDir = path.resolve(cwd, distDir!)

    const SERVER_BUILD = path.join(resolvedDistDir, 'server', 'index.js')
    const SERVER_BUILD_URL = url.pathToFileURL(SERVER_BUILD).href

    const serverEntry = await import(SERVER_BUILD_URL)

    const handler = createServerAdapter((req: Request) => {
        return serverEntry.INTERNAL_runFetch(process.env as any, req)
    })

    const CLIENT_BUILD = path.join(resolvedDistDir, 'public')
    const ASSET_DIR = path.join(CLIENT_BUILD, 'assets')

    const assetCacheControlStr = tokenize(assetCacheControl).join(', ')
    const defaultCacheControlStr = tokenize(defaultCacheControl).join(', ')

    const setupOnInstance = async (scoped: FastifyInstance) => {
        await scoped.register(fastifyStatic, {
            root: CLIENT_BUILD,
            // IMPORTANT:
            // Only mount static assets under `/assets/`.
            // If we mount static at `/`, its wildcard route can "win" over Waku's catch-all handler
            // and incorrectly return 404 for app routes (e.g. `/pages-waku/global-about-us`).
            // If we're mounted under a Fastify prefix scope, this must be relative.
            prefix: '/assets/',
            decorateReply: false,
            wildcard: false,
            cacheControl: false,
            dotfiles: 'allow',
            etag: true,
            serveDotFiles: true,
            lastModified: true,
            setHeaders(res, filepath) {
                const isAsset = filepath.startsWith(ASSET_DIR)
                if (isAsset) {
                    res.setHeader('cache-control', assetCacheControlStr)
                } else {
                    res.setHeader('cache-control', defaultCacheControlStr)
                }
            }
        })

        await scoped.register(
            async (childServer) => {
                childServer.removeAllContentTypeParsers()
                childServer.addContentTypeParser('*', (_request, payload, done) => {
                    done(null, payload)
                })

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
            await handler.dispose?.()
        })
    }

    if (mountPrefix === '/') {
        await setupOnInstance(fastify)
    } else {
        await fastify.register(async (scoped) => setupOnInstance(scoped), { prefix: mountPrefix })
    }
}
