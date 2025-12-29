import type { Config } from 'waku/config'

const getDefaultAdapter = () =>
    // prettier-ignore
    process.env.VERCEL
        ? 'waku/adapters/vercel'
        : process.env.NETLIFY
            ? 'waku/adapters/netlify'
            : 'waku/adapters/node'

export function resolveConfig(config: Config | undefined): Required<Config> {
    const resolvedConfig = {
        basePath: '/',
        srcDir: 'src',
        distDir: 'dist',
        privateDir: 'private',
        rscBase: 'RSC',
        unstable_adapter: getDefaultAdapter(),
        ...config
    } as Required<Config>

    if (!resolvedConfig.basePath.endsWith('/')) {
        throw new Error('basePath must end with /')
    }

    return resolvedConfig
}
