import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  out: './migrations', // 生成的迁移文件
  schema: './models/Schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ''
  },
  verbose: true,
  strict: true
})
