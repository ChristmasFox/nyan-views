/**
 * @description: 定义 Schema (数据模型)
 */

import { integer, pgTable, serial, timestamp } from 'drizzle-orm/pg-core';

// 表定义
export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
