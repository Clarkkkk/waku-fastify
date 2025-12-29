import type { ReactNode } from 'react'

export default async function RootLayout({ children }: { children: ReactNode }) {
    console.log('rendering layout', process.env.NODE_ENV)
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                />
                <title>Waku + Fastify Example</title>
                <style>{`
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .card {
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
          }
          h1 {
            margin-top: 0;
            color: #667eea;
          }
          a {
            color: #667eea;
            text-decoration: none;
            font-weight: 500;
          }
          a:hover {
            text-decoration: underline;
          }
        `}</style>
            </head>
            <body>
                <div className="container">
                    <div className="card">{children}</div>
                </div>
            </body>
        </html>
    )
}
