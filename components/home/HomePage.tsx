'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DisplayGroup } from '@/app/page';
import { initDisplayData } from '@/utils';

interface HomePageProps {
  displayGroups: DisplayGroup[]
}

export default function HomePage({ displayGroups }: HomePageProps) {
  const router = useRouter();

  const [count, setCount] = useState<number>(-1)
  const [inputName, setInputName] = useState<string>('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputName(e.target.value)
  }

  async function handleEdit(id?: number) {
    if (id) {
      router.push(`/edit/${id}`);
    } else {
      // 新增
      const response = await fetch('/api/display/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: inputName,
          displayData: initDisplayData()
        }),
      })
      const data = await response.json();
      router.push(`/edit/${data.data.id}`);
      router.refresh()
    }
  }

  const groupsDom: React.ReactElement[] = []
  displayGroups.forEach(group => {
    groupsDom.push(
      <h1 key={group.id} onClick={() => handleEdit(group.id)}>Ready: {group.displayName}</h1>
    )
  })

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
      <div>
        <input type="text" value={inputName} onChange={handleChange}/>
        <h1 onClick={() => handleEdit()}>Create: CreateNewNewNew</h1>
      </div>
      {groupsDom}
      <h1 onClick={handlePutDB}>TestDB: {count}</h1>
    </>
  );
}
