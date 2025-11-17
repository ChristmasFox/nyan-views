import { useCallback, useEffect, useRef, useState } from 'react';
import { ChartData, ElementData } from '@/components/edit/canvas';
import { getNewHandler } from '@/utils/resize';
import { useDraggable } from '@/hooks/useDraggable';
import { useResizable } from '@/hooks/useResizable';
import { getTime } from '@/utils';

interface Props {
  chartData: ChartData
  children: React.ReactNode;
  elementData: ElementData;
  pageScale: number;
  isActive: boolean;
  onClick: React.MouseEventHandler;
  dragEnd(): void;
  dragMove(_deltaX: number, _deltaY: number): void;
  resize(elementData: ElementData): void;
}

export default function DragFrame({ chartData, children, elementData, pageScale, dragMove, dragEnd, onClick, isActive, resize }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const [handleType, setHandleType] = useState('')

  const animationFrame = useRef<number>(0);
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

  const [handleMouseMoveDrag, handleMouseUpDrag, handleMouseDownDrag] = useDraggable({
    dragMove,
    dragEnd
  })

  const [handleMouseMoveResize, handleMouseUpResize, handleMouseDownResize] = useResizable({
    wrapper,
    chartData,
    elementData,
    pageScale,
    resize
  })

  function handleMouseDown(event: React.MouseEvent) {
    lastDownTimer.current = getTime()
    setIsDragging(true)

    if (event.target.dataset.resizetype) {
      setHandleType('resize')
      handleMouseDownResize(event)
    } else {
      setHandleType('drag')
      handleMouseDownDrag(event)
    }
  }

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();

    if (getTime() - lastDownTimer.current < 200) {
      onClick(event)
    }
  }

  const handleMouseMove = useCallback((ev: Event) => {
    const event = ev as MouseEvent
    if (event.buttons == 2 || !isDragging) return
    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      if (handleType === 'resize') {
        handleMouseMoveResize(event)
      } else {
        handleMouseMoveDrag(event)
      }
    })
  }, [isDragging, handleType, handleMouseMoveResize, handleMouseMoveDrag])

  const handleMouseUp = useCallback((ev: Event) => {
    setIsDragging(false)
    const event = ev as MouseEvent
    if (handleType === 'resize') {
      handleMouseUpResize(event)
    } else {
      handleMouseUpDrag(event)
    }
  }, [handleType, handleMouseUpResize, handleMouseUpDrag])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, false);
      document.addEventListener('mouseup', handleMouseUp, false);
    } else {
      document.removeEventListener('mousemove', handleMouseMove, false);
      document.removeEventListener('mouseup', handleMouseUp, false);
    }
    return () => {
      cancelAnimationFrame(animationFrame.current);
      document.removeEventListener('mousemove', handleMouseMove, false);
      document.removeEventListener('mouseup', handleMouseUp, false);
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

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
