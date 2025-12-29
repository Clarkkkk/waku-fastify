import { fsRouter } from 'waku'
import adapter from 'waku/adapters/default'

const router = fsRouter(import.meta.glob('./**/*.{tsx,ts}', { base: './pages' }))

console.log('NODE_ENV', process.env.NODE_ENV)

export const getRouterConfigs = () => router.unstable_getRouterConfigs()

export default adapter(router)
