export default async function AboutPage() {
    return (
        <div>
            <h1>📖 About</h1>
            <p>
                This is an example project showcasing the <strong>waku-fastify</strong> plugin,
                which seamlessly integrates Waku (a modern React framework) with Fastify (a
                high-performance web server).
            </p>

            <h2>🎯 Key Technologies</h2>
            <ul>
                <li>
                    <strong>Waku</strong> - React framework with React Server Components
                </li>
                <li>
                    <strong>Fastify</strong> - Fast and low overhead web framework
                </li>
                <li>
                    <strong>@whatwg-node/server</strong> - Web standard adapter for Node.js
                </li>
                <li>
                    <strong>Vite</strong> - Next generation frontend tooling
                </li>
            </ul>

            <h2>🚀 How It Works</h2>
            <p>
                The <code>waku-fastify</code> plugin acts as a bridge between Fastify and Waku:
            </p>
            <ol>
                <li>
                    <strong>Development Mode:</strong> Uses Vite's dev server with HMR support
                </li>
                <li>
                    <strong>Production Mode:</strong> Serves pre-built assets with optimized caching
                </li>
                <li>
                    <strong>Request Handling:</strong> Converts Node.js requests to Web Standard
                    Request/Response
                </li>
            </ol>

            <h2>📁 Project Structure</h2>
            <pre
                style={{
                    background: '#f5f5f5',
                    padding: '15px',
                    borderRadius: '5px',
                    overflow: 'auto'
                }}
            >
                {`waku-fastify-example/
├── src/
│   ├── components/    # React components
│   ├── pages/         # Waku pages (file-based routing)
│   └── waku.server.tsx # Waku server entry
├── server/
│   ├── dev.ts         # Development server
│   └── prod.ts        # Production server
├── public/            # Static assets
└── waku.config.ts     # Waku configuration`}
            </pre>

            <p style={{ marginTop: '30px' }}>
                <a href="/">← Back to Home</a>
            </p>
        </div>
    )
}

export const getConfig = async () => {
    return {
        render: 'static'
    }
}
