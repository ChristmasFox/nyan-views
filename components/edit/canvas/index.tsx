import './css/index.css'
import AllRender from '@/components/edit/canvas/AllRender'
import { ChartData } from '@/utils'
import { ChartDataAction } from '@/components/edit/EditLayout'

type CanvasProps = {
  pageScale: number,
  chartData: ChartData,
  chartDataDispatch: React.Dispatch<Partial<ChartDataAction>>
}

export default function Canvas({ pageScale, chartData, chartDataDispatch }: CanvasProps) {
  const screenStyle = {
    transform: `scale(${pageScale})`,
    transformDrag: `1/scale(${pageScale})`,
    transformOrigin: '0 0',
    width: `${chartData.w}px`,
    height: `${chartData.h}px`
  }

  const allRenderList = chartData.elements.map((element) => {
    return (
      <AllRender
        key={element.figureId}
        chartData={chartData}
        elementData={element}
        pageScale={pageScale}
        chartDataDispatch={chartDataDispatch}
      />
    )
  })

  function handleClick() {
    chartDataDispatch({
      type: 'CANCEL_ACTIVE'
    })
  }

  return (
    <div
      id="screen"
      className="screen_box"
      style={screenStyle}
      onClick={handleClick}
      onDragOver={(e) => e.preventDefault()}
      onDragEnter={(e) => e.preventDefault()}
    >
      <div className="screen">
        {allRenderList}
      </div>
    </div>
  )
}
