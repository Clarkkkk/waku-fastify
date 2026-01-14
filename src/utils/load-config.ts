import { existsSync } from 'node:fs'
import type { Config } from 'waku/config'
import { resolveConfig } from './config.js'

export async function loadWakuConfig(root: string): Promise<Required<Config>> {
    let config: Config | undefined

    const tsConfigPath = `${root}/waku.config.ts`
    const jsConfigPath = `${root}/waku.config.js`
    const hasConfigFile = existsSync(tsConfigPath) || existsSync(jsConfigPath)

    // Use Vite's runnerImport (same mechanism Waku CLI uses) so that
    // production can load waku.config.ts without relying on a TS Node loader.
    try {
        const vite = await import('vite')
        if ('runnerImport' in vite && typeof (vite as any).runnerImport === 'function') {
            if (hasConfigFile) {
                const imported = await (vite as any).runnerImport('/waku.config', {
                    root,
                    configFile: false
                })
                config = imported?.module?.default
            }
        }
    } catch (e) {
        console.error(e)
    }

    if (hasConfigFile && !config) {
        throw new Error(
            '[waku-fastify] Failed to load waku.config.ts/js at runtime. ' +
                'Waku expects config to be loadable via Vite runnerImport; ' +
                'ensure "vite" is available and the config file is valid ESM.'
        )
    }

    return resolveConfig(config)
}
