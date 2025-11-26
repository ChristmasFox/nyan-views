import { db } from '@/libs/DB'
import { displaySchema } from '@/models/Schema'
import { NextResponse } from 'next/server'

export const POST = async (request: Request) => {
  const json = await request.json()
  const { displayName, displayData } = json

  const data = await db
    .insert(displaySchema)
    .values({
      displayName: displayName || 'New Display',
      displayData: displayData
    })
    .returning()

  return NextResponse.json({ data: data[0] })
}
