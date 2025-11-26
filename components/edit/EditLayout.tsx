'use client'

import Canvas from '@/components/edit/canvas';
import './editLayout.css'

import { useCallback, useEffect, useRef, useState } from 'react';
import { LeftBar } from '@/components/edit/bar/LeftBar';
import { ChartData } from '@/utils';

interface EditLayoutProps {
  displayData: ChartData,
  displayId: string
}

export default function EditLayout({ displayId, displayData }: EditLayoutProps) {
  const [pageScale, setPageScale] = useState(1)
  const [chartData, setChartData] = useState<ChartData>({ ...displayData })

  const canvasWrapper = useRef<HTMLDivElement | null>(null);

  const handleAdd = useCallback(() => {
    setPageScale(Number((pageScale + 0.01).toFixed(2)))
  }, [pageScale])

  const handleRemove = useCallback(() => {
    setPageScale(Number((pageScale - 0.01).toFixed(2)))
  }, [pageScale])

  useEffect(() => {
    const canvasWrapperRef = canvasWrapper.current;
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
  }, [canvasWrapper, handleAdd, handleRemove]);

  async function handleSave() {
    const response = await fetch('/api/display/saveDisplay', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: displayId,
        displayData: {
          ...chartData,
          elements: [
            ...chartData.elements.map((e) => ({ ...e, active: false })),
          ]
        },
      }),
    })
    const data = await response.json()
    if (data.success) {
      alert('保存成功')
    } else {
      alert('保存失败')
    }
  }

  return (
    <div className="layout">
      <div className="layout__topbar text-center bg-amber-900 text-amber-200">
        @nyan-views@nyan-views@nyan-views@nyan-views
        <button onClick={handleSave}>保存</button>
      </div>
      <div className="layout__wrapper">
        <div className="left-sidebar text-amber-50">
          <LeftBar chartData={chartData} setChartData={setChartData} pageScale={pageScale}></LeftBar>
        </div>
        <div className="main">
          <div ref={canvasWrapper} className="canvas__wrapper">
            <Canvas chartData={chartData} setChartData={setChartData} pageScale={pageScale}></Canvas>
          </div>
          <div className="canvas__bar"></div>
        </div>
      </div>
    </div>
  )
}
