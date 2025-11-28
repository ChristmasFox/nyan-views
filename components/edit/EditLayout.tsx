'use client'

import Canvas from '@/components/edit/canvas'
import './editLayout.css'

import { useCallback, useEffect, useRef, useState, useReducer } from 'react'
import { LeftBar } from '@/components/edit/bar/LeftBar'
import { ChartData, ElementData } from '@/utils'
import { saveDisplayPage } from '@/actions/display'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EditLayoutProps {
  displayData: ChartData
  displayName: string
  displayId: string
}
export interface ChartDataAction {
  type: string
  element?: ElementData
  elements: ElementData[]
}

function chartDataReducer(state: ChartData, action: Partial<ChartDataAction>): ChartData {
  switch (action.type) {
    case 'ADD_ELEMENT': {
      if (!action.element) return { ...state }
      return {
        ...state,
        elements: [
          ...state.elements.map((e) => ({ ...e, active: false })),
          action.element
        ]
      }
    }
    case 'CANCEL_ACTIVE': {
      return {
        ...state,
        elements: state.elements.map((element) => ({
          ...element,
          active: false
        }))
      }
    }
    case 'UPDATE_ELEMENTS': {
      if (!action.elements) return { ...state }
      return {
        ...state,
        elements: action.elements
      }
    }
    default: {
      return { ...state }
    }
  }
}

export default function EditLayout({ displayId, displayName, displayData }: EditLayoutProps) {
  const router = useRouter()
  const [pageScale, setPageScale] = useState(1)
  // const [chartData, setChartData] = useState<ChartData>({ ...displayData })
  const [chartData, dispatch] = useReducer(chartDataReducer, { ...displayData })

  const canvasWrapper = useRef<HTMLDivElement | null>(null)

  const handleAdd = useCallback(() => {
    setPageScale(Number((pageScale + 0.01).toFixed(2)))
  }, [pageScale])

  const handleRemove = useCallback(() => {
    setPageScale(Number((pageScale - 0.01).toFixed(2)))
  }, [pageScale])

  useEffect(() => {
    const canvasWrapperRef = canvasWrapper.current
    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault()
        event.stopPropagation()
        if (event.deltaY < 0) {
          // 鼠标滚轮往下滚动
          handleAdd()
        }
        if (event.deltaY > 0) {
          // 鼠标滚轮往上滚动
          handleRemove()
        }
      }
    }

    if (canvasWrapperRef) canvasWrapperRef.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      if (canvasWrapperRef) canvasWrapperRef.removeEventListener('wheel', handleWheel)
    }
  }, [canvasWrapper, handleAdd, handleRemove])

  async function handleSave() {
    const displayData = {
      ...chartData,
      elements: [
        ...chartData.elements.map((e) => ({ ...e, active: false }))
      ]
    }
    const id = await saveDisplayPage(Number(displayId), displayData)
    if (id) {
      toast.success('保存成功!')
    } else {
      toast.error('保存失败!')
    }
  }

  return (
    <div className="layout">
      <div className="layout__topbar text-center bg-amber-900 text-amber-200">
        <button onClick={() => router.push('/')}>返回</button>
        @nyan-views@nyan-views
        <span className="text-amber-50 ml-2 mr-2">{ displayName }</span>
        @nyan-views@nyan-views
        <button onClick={handleSave}>保存</button>
      </div>
      <div className="layout__wrapper">
        <div className="left-sidebar text-amber-50">
          <LeftBar chartData={chartData} chartDataDispatch={dispatch} pageScale={pageScale}></LeftBar>
        </div>
        <div className="main">
          <div ref={canvasWrapper} className="canvas__wrapper">
            <Canvas chartData={chartData} chartDataDispatch={dispatch} pageScale={pageScale}></Canvas>
          </div>
          <div className="canvas__bar"></div>
        </div>
      </div>
    </div>
  )
}
