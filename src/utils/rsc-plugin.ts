import react from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import { createRequire } from 'node:module'
import type { Plugin } from 'vite'
import type { Config } from 'waku/config'

function compatPatchRsdwPlugin(): Plugin {
    return {
        // `waku` has a built-in plugin that rewrites `react-server-dom-webpack/client` to
        // `@vitejs/plugin-rsc/browser` for Vite dev. However, the current implementation uses
        // `import.meta.resolve(...)` in generated client code, which fails in browsers
        // (`import_meta.resolve is not a function`).
        //
        // We provide a compatibility version that does not rely on `import.meta.resolve`.
        name: 'waku-fastify:compat-patch-rsdw',
        enforce: 'pre',
        resolveId(source) {
            if (source === 'react-server-dom-webpack/client') {
                return '\0' + source
            }
            return undefined
        },
        async load(id) {
            if (id === '\0react-server-dom-webpack/client') {
                if (this.environment.name === 'client') {
                    const localRequire = createRequire(import.meta.url)
                    const resolvedPath = localRequire.resolve('@vitejs/plugin-rsc/browser')
                    const resolvedId = `/@fs${resolvedPath}`
                    return `
import * as ReactClient from ${JSON.stringify(resolvedId)};
export default ReactClient;
`
                }
                return `export default {};`
            }
            return undefined
        }
    }
}

export async function rscPlugin(config: Required<Config>) {
    const {
        unstable_allowServerPlugin,
        unstable_buildMetadataPlugin,
        unstable_defaultAdapterPlugin,
        unstable_fallbackHtmlPlugin,
        unstable_fsRouterTypegenPlugin,
        unstable_mainPlugin,
        unstable_notFoundPlugin,
        unstable_privateDirPlugin,
        unstable_userEntriesPlugin,
        unstable_virtualConfigPlugin
    } = await import('waku/vite-plugins')

    const extraPlugins = [...(config.vite?.plugins ?? [])]
    if (!extraPlugins.flat().some((p) => p && 'name' in p && p.name.startsWith('vite:react'))) {
        extraPlugins.push(react())
    }

    const mainPlugin = unstable_mainPlugin(config)
    // Remove configureServer to disable Waku's default middleware
    // We handle the request manually in dev.ts
    delete mainPlugin.configureServer

    return [
        ...extraPlugins,
        // Must run before Waku's runtime imports `react-server-dom-webpack/client`.
        compatPatchRsdwPlugin(),
        unstable_allowServerPlugin(),
        rsc({
            serverHandler: false,
            keepUseCientProxy: true,
            useBuildAppHook: true,
            clientChunks: (meta: any) => meta.serverChunk
        }),
        mainPlugin,
        unstable_userEntriesPlugin(config),
        unstable_virtualConfigPlugin(config),
        unstable_defaultAdapterPlugin(config),
        unstable_notFoundPlugin(),
        // NOTE:
        // `unstable_patchRsdwPlugin` currently throws in some Vite module-runner contexts
        // ("import_meta.resolve is not a function"). It's optional for our Fastify middleware setup,
        // so we skip it to keep dev mode stable.
        unstable_buildMetadataPlugin(config),
        unstable_privateDirPlugin(config),
        unstable_fallbackHtmlPlugin(),
        unstable_fsRouterTypegenPlugin(config)
    ]
}
