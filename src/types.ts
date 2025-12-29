import type { CacheControl } from 'cache-parser'
import type { FastifyPluginAsync, RouteShorthandOptions } from 'fastify'
import type { InlineConfig } from 'vite'

export type { CacheControl }

export interface WakuFastifyOptions {
    /**
     * Application mode: 'development' or 'production'
     *
     * if `mode` is `development`, the plugin will start a Vite dev server
     *
     */
    mode?: 'development' | 'production'
    /**
     * Base path for the application
     *
     * Defaults to '/'
     */
    basePath?: string
    childServerOptions?: RouteShorthandOptions
    /** The root of the application */
    root?: string

    /** Options for development */
    dev?: {
        /** Vite configuration options */
        viteOptions?: InlineConfig
    }

    /** Options for production */
    build?: {
        /** Directory for built assets */
        distDir?: string
        /** Cache control for asset files */
        assetCacheControl?: CacheControl
        /** Default cache control for other files */
        defaultCacheControl?: CacheControl
    }
}

export type WakuFastifyPlugin = FastifyPluginAsync<WakuFastifyOptions>
