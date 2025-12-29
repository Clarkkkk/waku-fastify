# Waku + Fastify Example

This is an example project demonstrating how to use **waku-fastify** to integrate [Waku](https://waku.gg/) (React framework) with [Fastify](https://fastify.dev/) (web server).

## Getting Started

### Installation

```bash
pnpm install
```

### Development

Start the development server with HMR:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### Production

Build and start the production server:

```bash
pnpm build
pnpm start
```

Or preview the production build:

```bash
pnpm preview
```

## Project Structure

```
waku-fastify-example/
├── src/
│   ├── components/       # React components
│   │   └── Counter.tsx   # Client component example
│   ├── pages/            # File-based routing
│   │   ├── _layout.tsx   # Root layout
│   │   ├── index.tsx     # Home page
│   │   └── about.tsx     # About page
│   └── waku.server.tsx   # Waku server entry
├── server/
│   ├── dev.ts            # Development server
│   └── prod.ts           # Production server
├── public/               # Static assets
├── waku.config.ts        # Waku configuration
└── tsconfig.json         # TypeScript configuration
```

## Learn More

- [Waku Documentation](https://waku.gg/)
- [Fastify Documentation](https://fastify.dev/)
- [waku-fastify Plugin](../../README.md)
