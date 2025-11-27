'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DisplayGroup } from '@/app/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addDisplayPage } from '@/actions/display'

interface HomePageProps {
  displayGroups: DisplayGroup[]
}

export default function HomePage({ displayGroups }: HomePageProps) {
  const router = useRouter()

  const [count, setCount] = useState<number>(-1)
  const [inputName, setInputName] = useState<string>('')

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInputName(e.target.value)
  }

  async function handleEdit(id?: number) {
    if (id) {
      router.push(`/edit/${id}`)
    } else {
      try {
        await addDisplayPage(inputName)
      } catch (e) {
        console.error('Error creating new display group:', e)
      }
    }
  }

  const groupsDom: React.ReactElement[] = []
  displayGroups.forEach((group) => {
    groupsDom.push(
      <Button key={group.id} variant="outline" onClick={() => handleEdit(group.id)}>Ready: {group.displayName}</Button>
    )
  })

  async function handlePutDB() {
    const response = await fetch('/api/counter', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ increment: 1 })
    })
    const data = await response.json()

    setCount(data.count)
  }

  return (
    <>
      <div className="flex w-full max-w-sm items-center gap-2">
        <Input type="text" value={inputName} onChange={handleChange} />
        <Button variant="outline" onClick={() => handleEdit()} >
          Create: CreateNewNewNew
        </Button>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        {groupsDom}
      </div>
      <h1 onClick={handlePutDB}>TestDB: {count}</h1>
    </>
  )
}
