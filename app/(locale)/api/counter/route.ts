import { db } from '@/libs/DB'
import { sql } from 'drizzle-orm'
import { counterSchema } from '@/models/Schema'
import { type NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  const body: { amount: number } = await request.json()
  const { amount = 1 } = body

  // simulate IO latency
  await new Promise((resolve) => setTimeout(resolve, 500))

  return NextResponse.json({ data: amount })
}

export const PUT = async (request: Request) => {
  const json = await request.json()
  const { increment } = json

  const id = Number((await headers()).get('x-e2e-random-id')) || 0

  const count = await db
    .insert(counterSchema)
    .values({ id, count: increment })
    .onConflictDoUpdate({
      target: counterSchema.id,
      set: {
        count: sql`${counterSchema.count} + ${increment}`
      }
    })
    .returning()

  return NextResponse.json({
    count: count[0]?.count
  })
}
