import react from '@vitejs/plugin-react'
import rsc from '@vitejs/plugin-rsc'
import type { PluginOption } from 'vite'
import type { Config } from 'waku/config'
import {
    unstable_allowServerPlugin,
    unstable_buildMetadataPlugin,
    unstable_defaultAdapterPlugin,
    unstable_fallbackHtmlPlugin,
    unstable_fsRouterTypegenPlugin,
    unstable_mainPlugin,
    unstable_notFoundPlugin,
    unstable_patchRsdwPlugin,
    unstable_privateDirPlugin,
    unstable_userEntriesPlugin,
    unstable_virtualConfigPlugin
} from 'waku/vite-plugins'

export function rscPlugin(config: Required<Config>): PluginOption {
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
        unstable_patchRsdwPlugin(),
        unstable_buildMetadataPlugin(config),
        unstable_privateDirPlugin(config),
        unstable_fallbackHtmlPlugin(),
        unstable_fsRouterTypegenPlugin(config)
    ]
}
