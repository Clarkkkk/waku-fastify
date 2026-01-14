import { reactRouterFastify } from '@mcansh/remix-fastify/react-router'
import Fastify from 'fastify'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { wakuFastify } from 'waku-fastify'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const server = Fastify({
    logger: true
})

const mode = process.env.NODE_ENV === 'production' ? 'production' : 'development'

// Register Remix (React Router v7)
// Assuming remix-fastify handles the vite integration in dev mode
await server.register(reactRouterFastify, {
    mode,
    prefix: '/react-router',
    // In production, we would point to the build output
    buildDirectory: 'build/react-router'
})

// Register Waku
// Waku expects to manage its own sub-app or be mounted.
// Our waku-fastify plugin supports a `basePath`.
await server.register(wakuFastify, {
    mode,
    basePath: '/waku/',
    root: process.cwd(),
    build: {
        distDir: 'build/waku'
    },

    // 子服务器配置（RouteShorthandOptions）
    childServerOptions: {
        onRequest: (request: any, _reply: any, done: any) => {
            console.log('[Waku] Incoming request', {
                method: request.method,
                url: request.url
            })
            done()
        },
        onError: (request: any, _reply: any, error: any, done: any) => {
            console.log('[Waku] Route error', {
                method: request.method,
                url: request.url,
                message: error?.message,
                stack: error?.stack
            })
            done()
        },
        onSend: (request: any, reply: any, payload: any, done: any) => {
            if (reply?.statusCode >= 500) {
                const isBuffer = typeof Buffer !== 'undefined' && Buffer.isBuffer(payload)
                const payloadType = isBuffer ? 'buffer' : typeof payload
                console.log('[Waku] 5xx response', {
                    method: request.method,
                    url: request.url,
                    statusCode: reply.statusCode,
                    payloadType,
                    // prettier-ignore
                    payloadLength: isBuffer
                        ? payload.length
                        : typeof payload === 'string'
                            ? payload.length
                            : undefined,
                    // prettier-ignore
                    snippet:
                        typeof payload === 'string'
                            ? payload.slice(0, 500)
                            : isBuffer
                                ? payload.toString('utf-8').slice(0, 500)
                                : undefined
                })
            }
            done(null, payload)
        }
    },

    // 开发模式配置
    dev: {
        viteOptions: {
            // IMPORTANT: avoid clashing with the React Router (admin) Vite dev server.
            cacheDir: join(process.cwd(), 'node_modules/.vite-waku-fastify'),
            resolve: {
                alias: {
                    server: join(__dirname, '../../server'),
                    app: join(__dirname, '../../app'),
                    lib: join(__dirname, '../../lib')
                }
            },
            server: {
                hmr: {
                    port: 3001
                }
            }
        }
    }
})

server.get('/', async () => {
    return { hello: 'world', links: ['/waku/', '/react-router/'] }
})

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000
        await server.listen({ port, host: '0.0.0.0' })
        console.log(`Server listening on http://localhost:${port}`)
        console.log(`Waku: http://localhost:${port}/waku/`)
        console.log(`React Router: http://localhost:${port}/react-router/`)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}

start()
