import type { WakuFastifyOptions } from './types'

export const defaultOptions = {
    mode: 'development',
    basePath: '/',
    root: process.cwd(),
    dev: {},
    build: {
        distDir: './dist',
        assetCacheControl: {
            maxAge: 365 * 24 * 60 * 60,
            immutable: true
        },
        defaultCacheControl: {
            maxAge: 60 * 60
        }
    }
} satisfies WakuFastifyOptions
