import { fastify } from 'fastify'
import { wakuFastify } from 'waku-fastify'

const app = fastify({
    logger:
        // prettier-ignore
        process.env.NODE_ENV === 'development'
            ? {
                level: 'info',
                transport: {
                    target: 'pino-pretty',
                    options: {
                        colorize: true,
                        translateTime: 'HH:MM:ss Z',
                        ignore: 'pid,hostname'
                    }
                }
            }
            : true
})

await app.register(wakuFastify, {
    mode: process.env.NODE_ENV as 'development' | 'production',
    build: {
        distDir: 'dist',
        assetCacheControl: {
            maxAge: 31536000,
            immutable: true
        },
        defaultCacheControl: {
            maxAge: 3600
        }
    }
})

if (process.env.NODE_ENV === 'development') {
    app.addHook('onRequest', async (req) => {
        app.log.info(`==========> Request: ${req.method} ${req.url}`)
    })
}

const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT) || 3000

await app.listen({ port, host })
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log(
    `${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} server running on http://${host}:${port}`
)
