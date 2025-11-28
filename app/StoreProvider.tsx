'use client'
import { type AppStore, makeStore } from '@/libs/redux/store'
import { setupListeners } from '@reduxjs/toolkit/query'
import { type ReactNode, useEffect, useRef } from 'react'
import { Provider } from 'react-redux'

interface Props {
  readonly children: ReactNode;
}

export const StoreProvider = ({ children }: Props) => {
  const storeRef = useRef<AppStore | null>(null)

  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore()
  }

  useEffect(() => {
    if (storeRef.current != null) {
      // 使用提供的默认值配置监听器
      // 可选，但 `refetchOnFocus`/`refetchOnReconnect` 行为是必需的
      return setupListeners(storeRef.current.dispatch)
    }
  }, [])

  // eslint-disable-next-line react-hooks/refs
  return <Provider store={storeRef.current}>{children}</Provider>
}
