# waku-fastify

A Fastify plugin that integrates [Waku](https://waku.gg/) (The React Framework) into your Fastify server. It leverages Vite 6's Environment API for a robust development experience and `@whatwg-node/server` for standard Web Request/Response handling.

## Installation

```bash
npm install waku-fastify
pnpm i waku-fastify
yarn add waku-fastify
```

## Usage

### Basic Setup

Here is a basic example of how to set up `waku-fastify` in your server entry point (e.g., `server.ts`):

```typescript
import { fastify } from 'fastify'
import { wakuFastify } from 'waku-fastify'

const app = fastify({ logger: true })

await app.register(wakuFastify, {
  // 'development' or 'production'
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  
  // Waku project root
  root: process.cwd(),
  
  // Configuration for development mode
  dev: {
    viteOptions: {
      server: {
        hmr: { port: 3001 }
      }
    }
  },
  
  // Configuration for production mode
  build: {
    distDir: 'dist',
    assetCacheControl: {
      maxAge: 31536000,
      immutable: true
    }
  }
})

const host = process.env.HOST || '127.0.0.1'
const port = Number(process.env.PORT) || 3000

await app.listen({ port, host })
console.log(`Server running on http://${host}:${port}`)
```

### Configuration Options

The plugin accepts the following options:

| Option                      | Type                            | Default                           | Description                                            |
| --------------------------- | ------------------------------- | --------------------------------- | ------------------------------------------------------ |
| `mode`                      | `'development' \| 'production'` | `'development'`                   | Application running mode.                              |
| `basePath`                  | `string`                        | `'/'`                             | Base path for the application.                         |
| `root`                      | `string`                        | `process.cwd()`                   | Root directory of the Waku project.                    |
| `dev`                       | `object`                        | `{}`                              | Options specific to development mode.                  |
| `dev.viteOptions`           | `InlineConfig`                  | `undefined`                       | Custom Vite configuration overrides.                   |
| `build`                     | `object`                        | `{...}`                           | Options specific to production mode.                   |
| `build.distDir`             | `string`                        | `'./dist'`                        | Directory containing the built Waku assets.            |
| `build.assetCacheControl`   | `CacheControl`                  | `{ maxAge: 1y, immutable: true }` | Cache-Control header for static assets (hashed files). |
| `build.defaultCacheControl` | `CacheControl`                  | `{ maxAge: 1h }`                  | Default Cache-Control header for other static files.   |
| `childServerOptions`        | `RouteShorthandOptions`         | `undefined`                       | Fastify options for the child server instance.         |

### Notes for `basePath` in real Fastify apps

- `basePath` **must end with** `/` (e.g. `'/pages-waku/'`).
- In development, the plugin mounts Vite in middleware mode. If your app already uses Vite (e.g. another SSR framework),
  you should set an isolated cache directory via `dev.viteOptions.cacheDir` to avoid `504 Outdated Optimize Dep`.

Example:

```ts
await app.register(wakuFastify, {
  basePath: '/pages-waku/',
  dev: {
    viteOptions: {
      cacheDir: 'node_modules/.vite-waku-fastify',
    },
  },
})
```

## Project Structure

Your Waku project should follow the standard structure:

```
waku-project/
├── src/
│   ├── components/
│   ├── pages/
│   └── waku.server.tsx       # Server entry point
├── public/
├── package.json
├── tsconfig.json
└── waku.config.ts            # Waku configuration
```

## Scripts

Update your `package.json` scripts to support both dev and prod:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx watch server/index.ts",
    "build": "waku build",
    "start": "NODE_ENV=production node dist/server.js"
  }
}
```

## License

MIT
