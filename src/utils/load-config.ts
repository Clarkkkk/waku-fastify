import { existsSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import type { Config } from 'waku/config'
import { resolveConfig } from './config.js'

export async function loadWakuConfig(root: string): Promise<Required<Config>> {
    let config: Config | undefined

    const tsConfigPath = `${root}/waku.config.ts`
    const jsConfigPath = `${root}/waku.config.js`

    if (existsSync(tsConfigPath)) {
        const imported = await import(pathToFileURL(tsConfigPath).href)
        config = imported.default
    } else if (existsSync(jsConfigPath)) {
        const imported = await import(pathToFileURL(jsConfigPath).href)
        config = imported.default
    }

    return resolveConfig(config)
}
