import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChartData, ElementData } from '@/utils'
import { ChartDataAction } from '@/components/edit/EditLayout'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'


interface ReightBarProps {
  chartData: ChartData,
  chartDataDispatch: React.Dispatch<Partial<ChartDataAction>>
}

type fieldType = 'x' | 'y' | 'w' | 'h'

function PageSetting() {
  return (
    <Tabs defaultValue="pageSetting" className="w-full">
      <TabsList className="grid w-full grid-cols-1 bg-neutral-800 p-1 rounded-xl">
        <TabsTrigger value="pageSetting" className="text-neutral-400 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:font-semibold rounded-lg transition-all duration-200">
          页面设置
        </TabsTrigger>
        <TabsContent value="pageSetting" className="p-4 mt-6  text-neutral-200 rounded-xl">
          <div className="grid grid-cols-2 gap-2">
          </div>
        </TabsContent>
      </TabsList>
    </Tabs>
  )
}
interface FieldItemProps {
  field: fieldType,
  chartData: ChartData,
  chartDataDispatch: React.Dispatch<Partial<ChartDataAction>>,
  currentElement: ElementData
}
function FieldItem({ field, currentElement, chartData, chartDataDispatch }: FieldItemProps) {
  const [value, setValue] = useState(currentElement[field])
  useEffect(() => {
    setValue(currentElement[field])
  }, [currentElement, field])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValue(Number(e.target.value))
  }
  function handleBlur() {
    const elements = chartData.elements.map((el) => {
      if (el.figureId === currentElement.figureId) {
        return {
          ...el,
          [field]: value
        }
      } else {
        return el
      }
    })
    chartDataDispatch({
      type: 'UPDATE_ELEMENTS',
      elements
    })
  }
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block w-4">{ field }</span>
      <Input value={value} onChange={handleChange} onBlur={handleBlur}></Input>
    </div>
  )
}

function SingleActiveTabs({ chartData, chartDataDispatch, currentElement }: { chartData: ChartData, chartDataDispatch: React.Dispatch<Partial<ChartDataAction>>, currentElement: ElementData }) {
  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="settings"> 配置 </TabsTrigger>
        <TabsTrigger value="data"> 数据 </TabsTrigger>
      </TabsList>
      <TabsContent value="settings" className="p-2">
        <div className="grid grid-cols-2 gap-2">
          <FieldItem field="x" currentElement={currentElement} chartData={chartData} chartDataDispatch={chartDataDispatch}></FieldItem>
          <FieldItem field="y" currentElement={currentElement} chartData={chartData} chartDataDispatch={chartDataDispatch}></FieldItem>
          <FieldItem field="w" currentElement={currentElement} chartData={chartData} chartDataDispatch={chartDataDispatch}></FieldItem>
          <FieldItem field="h" currentElement={currentElement} chartData={chartData} chartDataDispatch={chartDataDispatch}></FieldItem>
        </div>
      </TabsContent>
      <TabsContent value="data" className="p-2">
        管理您的数据。
      </TabsContent>
    </Tabs>
  )
}

export default function ReightBar({ chartData, chartDataDispatch }: ReightBarProps) {
  const activeElements: ElementData[] = chartData.elements.filter((el) => el.active)
  return (
    <>
      { (activeElements.length === 0) && <PageSetting></PageSetting> }
      { (activeElements.length === 1) && <SingleActiveTabs chartData={chartData} chartDataDispatch={chartDataDispatch} currentElement={activeElements[0]}></SingleActiveTabs> }
    </>
  )
}
