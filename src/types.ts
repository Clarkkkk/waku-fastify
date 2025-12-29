import type { FastifyPluginAsync, RouteShorthandOptions } from 'fastify'
import type { InlineConfig } from 'vite'

export interface WakuFastifyOptions {
    mode?: 'development' | 'production'

    root?: string

    viteOptions?: InlineConfig

    distDir?: string

    basePath?: string

    assetCacheControl?: {
        maxAge?: string
        immutable?: boolean
    }

    defaultCacheControl?: {
        maxAge?: string
    }

    childServerOptions?: RouteShorthandOptions
}

export type WakuFastifyPlugin = FastifyPluginAsync<WakuFastifyOptions>
