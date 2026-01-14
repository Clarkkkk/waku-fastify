import './style.css'

export default async function HomePage() {
    return (
        <div style={{ padding: 20 }}>
            <h1 id="waku-heading">Hello from Waku!</h1>
            <p>This is rendered via Waku Fastify plugin.</p>
        </div>
    )
}
