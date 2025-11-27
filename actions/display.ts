'use server'

/**
 * @description: Actions 层
 * 用于更新数据
 * 直接操作数据库 处理数据突变
 */

import { ChartData, initDisplayData } from '@/utils'
import { revalidatePath } from 'next/cache'
import { redirect as redirectPath } from 'next/navigation'
import { db } from '@/libs/DB'
import { displaySchema } from '@/models/Schema'
import { eq } from 'drizzle-orm'

// 新建大屏
export async function addDisplayPage(inputName: string) {
  const displayData = initDisplayData()
  const data = await db
    .insert(displaySchema)
    .values({
      displayName: inputName || 'New Display',
      displayData: JSON.stringify(displayData)
    })
    .returning()

  // 重新验证
  revalidatePath('/')
  // 跳转编辑
  redirectPath(`/edit/${data[0].id}`)
}

// 保存大屏数据
export async function saveDisplayPage(id: number, displayData: ChartData) {
  const data = await db
    .update(displaySchema)
    .set({ displayData: JSON.stringify(displayData) })
    .where(eq(displaySchema.id, Number(id)))
    .returning()

  // 重新验证
  revalidatePath(`/edit/${id}`)
  return data?.[0]?.id
}
