import fp from 'fastify-plugin'
import { setupDevMode } from './dev.js'
import { setupProdMode } from './prod.js'
import type { WakuFastifyPlugin } from './types.js'

const wakuFastifyPlugin: WakuFastifyPlugin = async (fastify, options) => {
    const mode =
        options.mode || (process.env.NODE_ENV === 'production' ? 'production' : 'development')

    if (mode === 'development') {
        await setupDevMode(fastify, options)
    } else {
        await setupProdMode(fastify, options)
    }
}

export const wakuFastify = fp(wakuFastifyPlugin, {
    name: 'waku-fastify',
    fastify: '5.x'
})

export type { WakuFastifyOptions } from './types.js'
