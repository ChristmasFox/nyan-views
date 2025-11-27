import EditLayout from '@/components/edit/EditLayout'
import { db } from '@/libs/DB'
import { eq } from 'drizzle-orm'
import { displaySchema } from '@/models/Schema'
import { Suspense } from 'react'
import DefaultLoading from '@/components/ui/loading'

interface EditProps {
  params: Promise<{ id: string }>
}

async function GetDisplayPage({ params }: EditProps) {
  const { id } = await params
  const data = await db
    .query
    .displaySchema
    .findFirst({
      where: eq(displaySchema.id, Number(id))
    })
  const displayName = data?.displayName ?? ''
  const displayData = data?.displayData ? JSON.parse(data.displayData) : null
  return (
    <EditLayout displayId={id} displayName={displayName} displayData={displayData}></EditLayout>
  )
}

export default async function Edit({ params }: EditProps) {
  return (
    <>
      <Suspense fallback={<DefaultLoading />}>
        <GetDisplayPage params={params}></GetDisplayPage>
      </Suspense>
    </>
  )
}
