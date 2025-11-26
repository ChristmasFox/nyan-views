/**
 * @description: 创建 Drizzle 客户端实例
 */

import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from '@/models/Schema'

export const createDbConnection = () => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 1
  })

  return drizzle({
    client: pool,
    schema
  })
}
