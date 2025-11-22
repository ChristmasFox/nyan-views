'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter();
  const [count, setCount] = useState<number>(-1)

  function handleRouteGo() {
    router.push('/edit');
  }

  async function handlePutDB() {
    const response = await fetch('/api/counter', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ increment: 1 }),
    });
    const data = await response.json();

    setCount(data.count)
  }

  return (
    <>
      <h1 onClick={handleRouteGo}>Ready</h1>
      <h1 onClick={handlePutDB}>TestDB: {count}</h1>
    </>
  );
}
