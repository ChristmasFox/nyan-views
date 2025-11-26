import HomePage from '@/components/home/HomePage'
import { db } from '@/libs/DB'

export interface DisplayGroup {
  id: number;
  displayName: string | null;
}

export default async function Home() {
  const displayGroups: DisplayGroup[] = await db.query.displaySchema.findMany({
    columns: {
      displayData: false,
      createdAt: false,
      updatedAt: false
    }
  })

  return (
    <>
      <HomePage displayGroups={displayGroups}></HomePage>
    </>
  )
}
