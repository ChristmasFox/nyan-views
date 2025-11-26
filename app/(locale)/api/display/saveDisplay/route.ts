import { db } from '@/libs/DB';
import { displaySchema } from '@/models/Schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export const POST = async (request: Request) => {
  const json = await request.json();

  const { id, displayData } = json;

  const data = await db
    .update(displaySchema)
    .set({ displayData: JSON.stringify(displayData) })
    .where(eq(displaySchema.id, Number(id)))
    .returning();

  return NextResponse.json({
    success: true,
    data
  });
}
