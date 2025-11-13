import DragFrame from './DragFrame';
import {ChartData, ElementData} from '@/components/edit/canvas';
import {isCtrlEvent} from '@/utils';

type Props = {
  pageScale: number,
  chartData: ChartData,
  elementData: ElementData,
  setChartData: React.Dispatch<React.SetStateAction<ChartData>>
}

export default function AllRender({chartData, elementData, pageScale, setChartData}: Props) {
  function dragEnd() {
  }

  function dragMove(deltaX: number, deltaY: number) {
    const newElements = chartData.elements.map((el) => {
      if (el.active) {
        return {
          ...el,
          x: Math.round(el.x + deltaX / pageScale),
          y: Math.round(el.y + deltaY / pageScale)
        }
      } else {
        return el
      }
    })

    setChartData({
      ...chartData,
      elements: newElements
    })
  }

  function handleClick(event: React.MouseEvent) {
    const isCtrl = isCtrlEvent(event);
    setChartData({
      ...chartData,
      elements: chartData.elements.map((el) => {
        return {
          ...el,
          active: el.figureId === elementData.figureId || (isCtrl && el.active)
        }
      })
    })
  }

  return (
    <DragFrame
      isActive={elementData.active}
      elementData={elementData}
      pageScale={pageScale}
      dragEnd={dragEnd}
      dragMove={dragMove}
      onClick={handleClick}
    >
      <div>
        name
      </div>
    </DragFrame>
  )
}
