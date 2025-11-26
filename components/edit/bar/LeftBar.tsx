import SvgIcon from '@/components/svgIcon';
import styles from './leftBar.module.css'
import { ChartData, ElementData, getComponentDraggedPosition, isMouseInnerCanvas } from '@/utils';
import { useEffect, useRef } from 'react'

interface LeftBarProps {
  pageScale: number,
  chartData: ChartData,
  setChartData: React.Dispatch<React.SetStateAction<ChartData>>
}

export function LeftBar({ chartData, setChartData, pageScale }: LeftBarProps) {
  const drag = useRef<boolean>(false)
  const canvasPosition = useRef<DOMRect>(undefined)
  const nextFigureIdRef = useRef<number>(0);

  function addComponentToCanvas(clientX?: number, clientY?: number) {
    const nextFigureId = nextFigureIdRef.current + 1;
    nextFigureIdRef.current = nextFigureId;

    // 新增图表
    const element: ElementData = {
      x: 0,
      y: 0,
      w: 200,
      h: 200,
      r: 0,
      figureId: nextFigureId,
      active: true,
      isHide: false,
    }

    if (drag.current && canvasPosition.current) {
      const [posX, posY] = getComponentDraggedPosition(clientX, clientY, element.w, element.h, canvasPosition.current, pageScale)
      element.x = posX
      element.y = posY
    } else {
      element.x = 10
      element.y = 10
    }

    setChartData({
      ...chartData,
      elements: [
        ...chartData.elements.map((e) => ({ ...e, active: false })),
        element
      ]
    })
  }

  function handleClick() {
    addComponentToCanvas()
  }

  function handleDragStart() {
    drag.current = true
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault()
  }

  function handleDragEnd(event: React.DragEvent) {
    const { clientX, clientY } = event
    if (canvasPosition.current && isMouseInnerCanvas(clientX, clientY, canvasPosition.current)) {
      addComponentToCanvas(clientX, clientY)
    }

    drag.current = false
  }

  // 初始化 nextFigureId
  useEffect(() => {
    if (chartData.elements.length > 0) {
      nextFigureIdRef.current = Math.max(...chartData.elements.map(e => e.figureId));
    }
  }, [chartData]);

  useEffect(() => {
    canvasPosition.current = document.getElementById('screen')?.getBoundingClientRect()
  }, []);


  return (
    <div className={styles.container}>
      <div
        className="component_item flex flex-col mx-4 my-4 p-2 border-1 border-solid border-amber-300"
        onClick={handleClick}
        draggable="true"
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <span className="text-xs">拓展组件</span>
        <SvgIcon name="noData" width="100%" height="5em" fill="blue"></SvgIcon>
      </div>
    </div>
  )
}
