import { createAppSlice } from '@/libs/redux/createAppSlice'
import type { AppThunk } from '@/libs/redux/store'
import type { PayloadAction } from '@reduxjs/toolkit'
import { fetchCount } from './counterAPI'

export interface CounterSliceState {
  value: number;
  status: 'idle' | 'loading' | 'failed';
}

const initialState: CounterSliceState = {
  value: 0,
  status: 'idle'
}

// - reducers: (create) => ({
//   [actions]: create.reducer(state, action?: PayloadAction)
//   [actions]: create.asyncThunk(() => Promise, { pending, fulfilled, rejected })
// })
export const counterSlice = createAppSlice({
  name: 'counter',
  initialState,
  reducers: (create) => ({
    increment: create.reducer((state) => {
      // Redux Toolkit 允许我们在 reducers 中编写“变异”逻辑。它
      // 实际上并没有改变状态，因为它使用了 Immer 库，
      // 检测“草稿状态”的变化并生成一个全新的
      // 基于这些变化的不可变状态
      state.value += 1
    }),
    decrement: create.reducer((state) => {
      state.value -= 1
    }),
    // 使用`PayloadAction`类型来声明`action.payload`的内容
    incrementByAmount: create.reducer(
      (state, action: PayloadAction<number>) => {
        state.value += action.payload
      }
    ),
    // 下面的函数称为 thunk，允许我们执行异步逻辑。它
    // 可以像常规操作一样调度：`dispatch(incrementAsync(10))`。这个
    // 将使用 `dispatch` 函数作为第一个参数来调用 thunk。异步
    // 然后可以执行代码并分派其他操作。谢谢
    // 通常用于发出异步请求。
    incrementAsync: create.asyncThunk(
      async (amount: number) => {
        const response = await fetchCount(amount)
        // The value we return becomes the `fulfilled` action payload
        return response.data
      },
      {
        pending: (state) => {
          state.status = 'loading'
        },
        fulfilled: (state, action) => {
          state.status = 'idle'
          state.value += action.payload
        },
        rejected: (state) => {
          state.status = 'failed'
        }
      }
    )
  }),
  // 您可以在这里定义您的选择器。这些选择器接收切片
  // 状态作为他们的第一个参数。
  selectors: {
    selectCount: (counter) => counter.value,
    selectStatus: (counter) => counter.status
  }
})

// 为每个 case reducers 函数生成动作创建者。
export const { decrement, increment, incrementByAmount, incrementAsync } = counterSlice.actions

// `slice.selectors` 返回的选择器将根状态作为第一个参数。
export const { selectCount, selectStatus } = counterSlice.selectors

// 我们也可以手工编写thunk，它可能同时包含同步和异步逻辑。
// 这是一个根据当前状态有条件地调度操作的示例。
export const incrementIfOdd = (amount: number): AppThunk => {
  return (dispatch, getState) => {
    const currentValue = selectCount(getState())

    if (currentValue % 2 === 1 || currentValue % 2 === -1) {
      dispatch(incrementByAmount(amount))
    }
  }
}
