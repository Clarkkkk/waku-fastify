import { fastify } from 'fastify'
import { wakuFastify } from 'waku-fastify'

const app = fastify({
    logger: true
})

await app.register(wakuFastify, {
    mode: 'production',
    distDir: 'dist',
    assetCacheControl: {
        maxAge: '31536000',
        immutable: true
    },
    defaultCacheControl: {
        maxAge: '3600'
    }
})

const host = process.env.HOST || '0.0.0.0'
const port = Number(process.env.PORT) || 3000

await app.listen({ port, host })
console.log(`✅ Production server running on port ${port}`)
