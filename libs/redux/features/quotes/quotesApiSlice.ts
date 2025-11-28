// 需要使用React特定的入口点来导入`createApi`
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Quote {
  id: number;
  quote: string;
  author: string;
}

interface QuotesApiResponse {
  quotes: Quote[];
  total: number;
  skip: number;
  limit: number;
}

// 使用基本 URL 和预期端点定义服务
export const quotesApiSlice = createApi({
  baseQuery: fetchBaseQuery({ baseUrl: 'https://dummyjson.com/quotes' }),
  reducerPath: 'quotesApi',
  // 标签类型用于缓存和失效。
  tagTypes: ['Quotes'],
  endpoints: (build) => ({
    // 为返回类型提供泛型（在本例中为 `QuotesApiResponse`）
    // 和预期的查询参数。如果没有参数，则使用“void”
    // 代替参数类型。
    getQuotes: build.query<QuotesApiResponse, number>({
      query: (limit = 10) => `?limit=${limit}`,
      // `providesTags` 确定哪个“标签”附加到
      // 查询返回的缓存数据。
      providesTags: (result, error, id) => [{ type: 'Quotes', id }]
    })
  })
})

// Hooks 由 RTK-Query 自动生成
// 与 `quotesApiSlice.endpoints.getQuotes.useQuery` 相同
export const { useGetQuotesQuery } = quotesApiSlice
