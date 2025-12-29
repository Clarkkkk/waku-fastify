'use client'

import { useState } from 'react'

export function Counter() {
    const [count, setCount] = useState(0)

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Interactive Counter</h2>
            <p>Count: {count}</p>
            <button
                onClick={() => setCount(count + 1)}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginRight: '10px'
                }}
            >
                Increment
            </button>
            <button
                onClick={() => setCount(count - 1)}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    cursor: 'pointer'
                }}
            >
                Decrement
            </button>
        </div>
    )
}
