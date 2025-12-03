import { useRef } from 'react'
import { ChartData, ElementData, getTime } from '@/utils'
import { getNewHandler } from '@/utils/resize'
import { useDraggable } from '@/hooks/useDraggable'
import { useResizable } from '@/hooks/useResizable'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from '@/components/ui/context-menu'

interface Props {
  chartData: ChartData
  children: React.ReactNode;
  elementData: ElementData;
  pageScale: number;
  isActive: boolean;
  onClick: React.MouseEventHandler;
  onContextMenu: (action: string, figureId: number) => void;
  dragEnd(): void;
  dragMove(deltaX: number, deltaY: number): void;
  resize(elementData: ElementData): void;
}

export default function DragFrame({ chartData, children, elementData, pageScale, dragMove, dragEnd, onClick, onContextMenu, isActive, resize }: Props) {
  const lastDownTimer = useRef(0)
  const wrapper = useRef(null)

  const resizeHandler: string[] = ['tl', 'tm', 'tr', 'r', 'br', 'bm', 'bl', 'l']
  const resizeHandlerSpan: React.ReactElement[] = []
  resizeHandler.forEach((item) => {
    const style = getNewHandler(item)
    resizeHandlerSpan.push(
      <span
        data-resizetype={item}
        key={item}
        className={`resize-handler ${item}`}
        style={style}
      />
    )
  })

  const resizeFrame = <div>{ resizeHandlerSpan }</div>

  const [handleMouseDownDrag] = useDraggable({
    dragMove,
    dragEnd
  })

  const [handleMouseDownResize] = useResizable({
    wrapper,
    chartData,
    elementData,
    pageScale,
    resize
  })

  function handleMouseDown(event: React.MouseEvent) {
    lastDownTimer.current = getTime()
    if (event.buttons == 2) return
    const target = event.target as HTMLElement
    if (target.dataset.resizetype) {
      handleMouseDownResize(event)
    } else {
      handleMouseDownDrag(event)
    }
  }

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation()

    if (getTime() - lastDownTimer.current < 200) {
      onClick(event)
    }
  }

  function handleContextMenu(event: React.MouseEvent) {
    onClick(event)
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          ref={wrapper}
          className={isActive ? 'drag-container active' : 'drag-container'}
          style={{
            width: `${elementData.w}px`,
            height: `${elementData.h}px`,
            transform: `translate(${elementData.x}px, ${elementData.y}px)`
          }}
          onClick={handleClick}
          onContextMenu={handleContextMenu}
          onMouseDown={handleMouseDown}
        >
          { children }
          { isActive && resizeFrame }
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem inset onClick={() => onContextMenu('DELETE', elementData.figureId)}>删除</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}
