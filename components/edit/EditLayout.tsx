'use client'

import Canvas from '@/components/edit/canvas';

import {useState} from 'react';

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

  function handleAdd() {
    setPageScale(Number((pageScale + 0.1).toFixed(2)))
  }

  function handleRemove() {
    setPageScale(Number((pageScale - 0.1).toFixed(2)))
  }

  return (
    <div>
      layout-edit
      <button onClick={handleAdd}> + </button>
      <button onClick={handleRemove}> -</button>
      <Canvas chartData={chartData} setChartData={setChartData} pageScale={pageScale}></Canvas>
    </div>
  )
}
