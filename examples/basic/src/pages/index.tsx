import { Counter } from '../components/Counter.js'

export default async function HomePage() {
    return (
        <div>
            <h1>🚀 Waku + Fastify</h1>
            <p>
                Welcome to the <strong>waku-fastify</strong> example! This demo shows how to
                integrate{' '}
                <a
                    href="https://waku.gg/"
                    target="_blank"
                    rel="noopener"
                >
                    Waku
                </a>{' '}
                (React framework) with{' '}
                <a
                    href="https://fastify.dev/"
                    target="_blank"
                    rel="noopener"
                >
                    Fastify
                </a>{' '}
                (web server).
            </p>

            <h2>✨ Features</h2>
            <ul>
                <li>React Server Components (RSC)</li>
                <li>Fast development with HMR</li>
                <li>Optimized production build</li>
                <li>Fastify's high performance</li>
                <li>TypeScript support</li>
            </ul>

            <h2>🎮 Try the Counter</h2>
            <p>This component demonstrates client-side interactivity:</p>
            <Counter />

            <h2>📚 Learn More</h2>
            <p>
                Check out the <a href="/about">About page</a> to learn more about this project.
            </p>

            <div style={{ marginTop: '40px', fontSize: '14px', color: '#666' }}>
                <p>
                    Powered by{' '}
                    <a
                        href="https://waku.gg/"
                        target="_blank"
                        rel="noopener"
                    >
                        Waku
                    </a>{' '}
                    and{' '}
                    <a
                        href="https://fastify.dev/"
                        target="_blank"
                        rel="noopener"
                    >
                        Fastify
                    </a>
                </p>
            </div>
        </div>
    )
}

export const getConfig = async () => {
    return {
        render: 'dynamic'
    }
}
