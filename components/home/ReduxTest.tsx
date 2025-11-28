import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/libs/redux/hooks'
import {
  increment,
  decrement,
  selectCount,
  selectStatus,
  incrementByAmount, incrementAsync, incrementIfOdd
} from '@/libs/redux/features/counter/counterSlice'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useGetQuotesQuery } from '@/libs/redux/features/quotes/quotesApiSlice'

export default function ReduxTest() {
  const dispatch = useAppDispatch()
  const count = useAppSelector(selectCount)
  const status = useAppSelector(selectStatus)

  const [incrementAmount, setIncrementAmount] = useState<string>('2')

  const incrementValue = Number(incrementAmount) || 0

  function handleAdd() {
    dispatch(increment())
  }
  function handleDel() {
    dispatch(decrement())
  }
  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setIncrementAmount(e.target.value)
  }
  function handleAddAmount() {
    dispatch(incrementByAmount(incrementValue))
  }
  function handleAddAsync() {
    dispatch(incrementAsync(incrementValue))
  }
  function handleAddIfOdd() {
    dispatch(incrementIfOdd(incrementValue))
  }

  return (
    <>
      <div>
        <Button variant="outline" onClick={handleDel}> - </Button>
        <span className="py-2 px-4 text-amber-600">{ count }</span>
        <Button variant="outline" onClick={handleAdd}> + </Button>
        <span className="ml-4">{ status }</span>
      </div>
      <div className="mt-2 flex gap-2 max-w-xl">
        <Input type="number" value={incrementAmount} onChange={handleChange}></Input>
        <Button variant="outline" onClick={handleAddAmount}> Add Amount </Button>
        <Button variant="outline" disabled={status !== 'idle'} onClick={handleAddAsync}>
          { status === 'loading' && <Spinner /> }
          Add Async
        </Button>
        <Button variant="outline" onClick={handleAddIfOdd}> Add If Odd </Button>
      </div>

      <ReduxQuotesApiTest></ReduxQuotesApiTest>
    </>
  )
}

function ReduxQuotesApiTest() {
  const { data, isError, isLoading, isSuccess } = useGetQuotesQuery(10)

  let result: React.ReactElement | null = null
  if (isError) {
    result = <h1>There was an error!!!</h1>
  }
  if (isLoading) {
    result = <h1>Loading...</h1>
  }
  if (isSuccess) {
    result = <h1>Redux Api Test: Quotes Success { data.quotes.length }</h1>
  }
  return (
    <div className="mt-2">{ result }</div>
  )
}
