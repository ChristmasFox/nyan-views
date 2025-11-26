import { useRef } from 'react';
import { ChartData, ElementData, getTime } from '@/utils';
import { getNewHandler } from '@/utils/resize';
import { useDraggable } from '@/hooks/useDraggable';
import { useResizable } from '@/hooks/useResizable';

interface Props {
  chartData: ChartData
  children: React.ReactNode;
  elementData: ElementData;
  pageScale: number;
  isActive: boolean;
  onClick: React.MouseEventHandler;
  dragEnd(): void;

  dragMove(deltaX: number, deltaY: number): void;
  resize(elementData: ElementData): void;
}

export default function DragFrame({ chartData, children, elementData, pageScale, dragMove, dragEnd, onClick, isActive, resize }: Props) {
  const lastDownTimer = useRef(0);
  const wrapper = useRef(null);

  const resizeHandler: string[] = ['tl', 'tm', 'tr', 'r', 'br', 'bm', 'bl', 'l']
  const resizeHandlerSpan: React.ReactElement[] = []
  resizeHandler.forEach(item => {
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

    const target = event.target as HTMLElement;
    if (target.dataset.resizetype) {
      handleMouseDownResize(event)
    } else {
      handleMouseDownDrag(event)
    }
  }

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();

    if (getTime() - lastDownTimer.current < 200) {
      onClick(event)
    }
  }

  return (
    <div
      ref={wrapper}
      className={isActive ? 'drag-container active' : 'drag-container'}
      style={{
        width: elementData.w + 'px',
        height: elementData.h + 'px',
        transform: `translate(${elementData.x}px, ${elementData.y}px)`,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      { children }
      { isActive && resizeFrame }
    </div>
  )
}
