import { fsRouter } from 'waku'
import nodeAdapter from 'waku/adapters/node'

const router = fsRouter(import.meta.glob('/waku-src/pages/**/*.{tsx,ts}', { base: './pages' }))

const routerAny = router as any
if (typeof routerAny.handleRequest === 'function') {
    const original = routerAny.handleRequest.bind(routerAny)
    routerAny.handleRequest = async (...args: any[]) => {
        try {
            return await original(...args)
        } catch (e) {
            console.error('[Waku] handleRequest error', e)
            if (e instanceof Error) {
                console.error(e.stack)
            }
            throw e
        }
    }
}

export const getRouterConfigs = () => router.unstable_getRouterConfigs()

export default nodeAdapter(routerAny)
