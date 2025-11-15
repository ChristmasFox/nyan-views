'use client'

import Canvas from '@/components/edit/canvas';
import './editLayout.css'

import { useCallback, useEffect, useRef, useState } from 'react';

export default function EditLayout() {
  const [pageScale, setPageScale] = useState(1)
  const [chartData, setChartData] = useState({
    w: 1920,
    h: 1080,
    elements: [
      {
        x: 0,
        y: 0,
        w: 100,
        h: 100,
        r: 0,
        figureId: 1,
        active: false,
        isHide: false,
      },
      {
        x: 101,
        y: 0,
        w: 130,
        h: 130,
        r: 0,
        figureId: 2,
        active: false,
        isHide: false,
      }
    ]
  })

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

  return (
    <div className="layout">
      <div className="layout__topbar text-center bg-amber-900 text-amber-200">
        @nyan-views@nyan-views@nyan-views@nyan-views
      </div>
      <div className="layout__wrapper">
        <div className="left-sidebar text-amber-50">Sidebar Left</div>
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
