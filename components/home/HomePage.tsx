'use client'

import {useRouter} from 'next/navigation'

export default function HomePage() {
  const router = useRouter();

  function handleClick() {
    router.push('/edit');
  }

  return (
    <>
      <h1 onClick={handleClick}>Ready</h1>
    </>
  );
}
