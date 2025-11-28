import DragFrame from './DragFrame'
import { ChartData, ElementData, isCtrlEvent } from '@/utils'
import { ChartDataAction } from '@/components/edit/EditLayout'

type Props = {
  pageScale: number,
  chartData: ChartData,
  elementData: ElementData,
  chartDataDispatch: React.Dispatch<Partial<ChartDataAction>>
}

export default function AllRender({ chartData, elementData, pageScale, chartDataDispatch }: Props) {
  function dragEnd() {
  }

  function dragMove(deltaX: number, deltaY: number) {
    const newElements = chartData.elements.map((el) => {
      if (el.active) {
        let newX = Math.round(el.x + deltaX / pageScale)
        let newY = Math.round(el.y + deltaY / pageScale)

        newX = Math.max(0, Math.min(newX, chartData.w - el.w))
        newY = Math.max(0, Math.min(newY, chartData.h - el.h))

        return {
          ...el,
          x: newX,
          y: newY
        }
      } else {
        return el
      }
    })

    chartDataDispatch({
      type: 'UPDATE_ELEMENTS',
      elements: newElements
    })
  }

  function handleClick(event: React.MouseEvent) {
    const isCtrl = isCtrlEvent(event)
    const newElements = chartData.elements.map((el) => {
      return {
        ...el,
        active: el.figureId === elementData.figureId || (isCtrl && el.active)
      }
    })
    chartDataDispatch({
      type: 'UPDATE_ELEMENTS',
      elements: newElements
    })
  }
  function resize(newElementData: ElementData) {
    const newElements = chartData.elements.map((el) => {
      if (el.figureId === newElementData.figureId) {
        return newElementData
      } else {
        return el
      }
    })
    chartDataDispatch({
      type: 'UPDATE_ELEMENTS',
      elements: newElements
    })
  }

  return (
    <DragFrame
      isActive={elementData.active}
      chartData={chartData}
      elementData={elementData}
      pageScale={pageScale}
      dragEnd={dragEnd}
      dragMove={dragMove}
      onClick={handleClick}
      resize={resize}
    >
      <div>
        name
      </div>
    </DragFrame>
  )
}
