import { defineConfig } from 'waku/config'

export default defineConfig({
    basePath: '/waku/',
    distDir: 'build/waku',
    srcDir: 'waku-src',
    vite: {
        cacheDir: 'node_modules/.cache-waku'
    }
})
