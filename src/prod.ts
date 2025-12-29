import fastifyStatic from '@fastify/static'
import { createServerAdapter } from '@whatwg-node/server'
import type { FastifyInstance } from 'fastify'
import path from 'node:path'
import url from 'node:url'
import type { WakuFastifyOptions } from './types.js'

export async function setupProdMode(
    fastify: FastifyInstance,
    options: WakuFastifyOptions
): Promise<void> {
    const {
        root,
        distDir = 'dist',
        basePath = '/',
        assetCacheControl,
        defaultCacheControl,
        childServerOptions
    } = options

    const cwd = root ?? process.cwd()
    const resolvedDistDir = path.resolve(cwd, distDir)

    const SERVER_BUILD = path.join(resolvedDistDir, 'server', 'index.js')
    const SERVER_BUILD_URL = url.pathToFileURL(SERVER_BUILD).href

    const serverEntry = await import(SERVER_BUILD_URL)

    const handler = createServerAdapter((req: Request) => {
        return serverEntry.INTERNAL_runFetch(process.env as any, req)
    })

    const CLIENT_BUILD = path.join(resolvedDistDir, 'public')
    const ASSET_DIR = path.join(CLIENT_BUILD, 'assets')

    await fastify.register(fastifyStatic, {
        root: CLIENT_BUILD,
        prefix: basePath,
        wildcard: false,
        cacheControl: false,
        dotfiles: 'allow',
        etag: true,
        serveDotFiles: true,
        lastModified: true,
        setHeaders(res, filepath) {
            const isAsset = filepath.startsWith(ASSET_DIR)
            if (isAsset) {
                res.setHeader(
                    'cache-control',
                    `public, max-age=${assetCacheControl?.maxAge || '31536000'}${
                        assetCacheControl?.immutable !== false ? ', immutable' : ''
                    }`
                )
            } else {
                res.setHeader(
                    'cache-control',
                    `public, max-age=${defaultCacheControl?.maxAge || '3600'}`
                )
            }
        }
    })

    await fastify.register(
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
        { prefix: basePath }
    )

    fastify.addHook('onClose', async () => {
        await handler.dispose?.()
    })
}
