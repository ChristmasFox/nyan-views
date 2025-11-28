import {
  type Action,
  type ThunkAction,
  combineSlices,
  configureStore
} from '@reduxjs/toolkit'
import { counterSlice } from './features/counter/counterSlice'
import { quotesApiSlice } from './features/quotes/quotesApiSlice'

// `combineSlices` 使用自动组合 reducer
// 他们的`reducerPath`，因此我们不再需要调用`combineReducers`。
const reducers = [counterSlice, quotesApiSlice]
const rootReducer = combineSlices(...reducers)
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// `makeStore` encapsulates the store configuration to allow
// creating unique store instances, which is particularly important for
// server-side rendering (SSR) scenarios. In SSR, separate store instances
// are needed for each request to prevent cross-request state pollution.
export const makeStore = () => {
  return configureStore({
    reducer: rootReducer,
    // 添加api中间件可以实现缓存、失效、轮询、
    // 以及 `rtk-query` 的其他有用功能。
    middleware: (getDefaultMiddleware) => {
      return getDefaultMiddleware().concat(quotesApiSlice.middleware)
    }
  })
}

// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
  ThunkReturnType,
  RootState,
  unknown,
  Action
>;
