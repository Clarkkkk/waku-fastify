import fastifyStatic from '@fastify/static'
import { createServerAdapter } from '@whatwg-node/server'
import { tokenize } from 'cache-parser'
import type { FastifyInstance } from 'fastify'
import path from 'node:path'
import url from 'node:url'
import { defaultOptions } from './defaults.js'
import type { WakuFastifyOptions } from './types.js'

export async function setupProdMode(
    fastify: FastifyInstance,
    options: WakuFastifyOptions
): Promise<void> {
    const {
        root,
        basePath,
        childServerOptions,
        build: buildOptions
    } = { ...defaultOptions, ...options }
    const { distDir, assetCacheControl, defaultCacheControl } = buildOptions

    const cwd = root ?? process.cwd()
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
                res.setHeader('cache-control', assetCacheControlStr)
            } else {
                res.setHeader('cache-control', defaultCacheControlStr)
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
