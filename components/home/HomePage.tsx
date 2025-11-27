'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DisplayGroup } from '@/app/page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { addDisplayPage, delDisplayPage } from '@/actions/display'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction, AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'

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

  const groupsDom: React.ReactElement[] = []
  displayGroups.forEach((group) => {
    groupsDom.push(
      <DisplayCard key={group.id} group={group} handleEdit={handleEdit}></DisplayCard>
    )
  })

  return (
    <div className="p-[12px]">
      <div className="flex w-full max-w-xl items-ce nter gap-2">
        <Input type="text" value={inputName} onChange={handleChange} />
        <Button variant="outline" className="cursor-pointer" onClick={() => handleEdit()} >
          Create: CreateNewNewNew
        </Button>
      </div>
      <div className="grid grid-cols-5 gap-4 mt-4">
        {groupsDom}
      </div>
      <h1 onClick={handlePutDB}>TestDB: {count}</h1>
    </div>
  )
}

function DisplayCard({ group, handleEdit }: { group: DisplayGroup, handleEdit: (id?: number) => Promise<void> }) {
  async function handleDelete(id: number) {
    try {
      await delDisplayPage(id)
    } catch (e) {
      console.error('Error delete new display group:', e)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{group.displayName}</CardTitle>
      </CardHeader>
      <CardContent>
        Empty
      </CardContent>
      <CardFooter className="flex flex-row-reverse gap-2">
        <Button type="submit" className="cursor-pointer" onClick={() => handleEdit(group.id)}>
          编辑
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button type="submit" className="cursor-pointer" variant="outline">
              删除
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>你确定要继续吗？</AlertDialogTitle>
              <AlertDialogDescription>
                该操作无法撤销，将永久删除此大屏全部数据。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">取消</AlertDialogCancel>
              <AlertDialogAction className="cursor-pointer" onClick={() => handleDelete(group.id)}>继续</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
