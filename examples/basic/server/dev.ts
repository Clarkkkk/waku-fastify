import { fastify } from 'fastify'
import { wakuFastify } from 'waku-fastify'

const app = fastify({
    logger: {
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
})

await app.register(wakuFastify, {
    mode: 'development',
    root: process.cwd()
})

app.addHook('onRequest', async (req) => {
    app.log.info(`==========> Request: ${req.method} ${req.url}`)
})

const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT) || 3000

await app.listen({ port, host })
console.log(process.env.NODE_ENV)
console.log(`🚀 Development server ready at http://${host}:${port}`)
