import { createServerAdapter } from '@whatwg-node/server'
import type { FastifyInstance } from 'fastify'
import type { RunnableDevEnvironment } from 'vite'
import { createServer as createViteServer } from 'vite'
import { loadWakuConfig } from './utils/load-config.js'
import { rscPlugin } from './utils/rsc-plugin.js'
import type { WakuFastifyOptions } from './types.js'

export async function setupDevMode(
    fastify: FastifyInstance,
    options: WakuFastifyOptions
): Promise<void> {
    const { root, viteOptions, basePath = '/', childServerOptions } = options

    const cwd = root ?? process.cwd()

    const wakuConfig = await loadWakuConfig(cwd)

    const vite = await createViteServer({
        root: cwd,
        ...viteOptions,
        appType: 'custom',
        configFile: false,
        plugins: [rscPlugin(wakuConfig)].flat().filter(Boolean),
        server: {
            middlewareMode: true,
            hmr: viteOptions?.server?.hmr ?? true,
            ...viteOptions?.server
        }
    })

    const environment = vite.environments.rsc as RunnableDevEnvironment | undefined
    if (!environment) {
        throw new Error(
            'RSC environment not found. Make sure Waku is properly configured and its Vite plugins are loaded.'
        )
    }

    await fastify.register(import('@fastify/middie'))

    if (basePath === '/') {
        fastify.use(vite.middlewares)
    } else {
        fastify.use(basePath, vite.middlewares)
    }

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

    // Register route handler
    await fastify.register(
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
        { prefix: basePath }
    )

    fastify.addHook('onClose', async () => {
        await vite.close()
        await handler.dispose?.()
    })
}
