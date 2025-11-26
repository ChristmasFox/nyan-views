import './css/index.css'
import AllRender from '@/components/edit/canvas/AllRender'
import { ChartData } from '@/utils'

type CanvasProps = {
  pageScale: number,
  chartData: ChartData,
  setChartData: React.Dispatch<React.SetStateAction<ChartData>>
}

export default function Canvas({ pageScale, chartData, setChartData }: CanvasProps) {
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
        setChartData={setChartData}
      />
    )
  })

  function handleClick() {
    setChartData({
      ...chartData,
      elements: chartData.elements.map((element) => {
        return {
          ...element,
          active: false
        }
      })
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
