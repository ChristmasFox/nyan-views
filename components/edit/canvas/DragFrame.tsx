import {useCallback, useEffect, useRef, useState} from 'react';
import {ElementData} from '@/components/edit/canvas';

interface Props {
  children: React.ReactNode;
  elementData: ElementData;
  pageScale: number;
  dragEnd: () => void;
  dragMove: (_deltaX: number, _deltaY: number) => void;
  onClick: React.MouseEventHandler;
  isActive: boolean;
}

interface LastStation {
  x: number;
  y: number;
}

export default function DragFrame({children, elementData, dragMove, dragEnd, onClick, isActive}: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const lastStation = useRef<LastStation>({x: 0, y: 0,})
  const animationFrame = useRef<number>(0);
  const lastDownTimer = useRef(0);

  function handleMouseDown(event: React.MouseEvent) {
    const {clientX, clientY} = event;
    setIsDragging(isActive)
    lastStation.current = {x: clientX, y: clientY}
    lastDownTimer.current = Date.now()
  }

  const handleMouseMove = useCallback((ev: Event) => {
    const event = ev as MouseEvent
    if (event.buttons == 2 || !isDragging) return
    const {clientX, clientY} = event;
    const deltaX = clientX - lastStation.current.x;
    const deltaY = clientY - lastStation.current.y;

    lastStation.current = {x: clientX, y: clientY}

    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      dragMove(deltaX, deltaY)
    });
  }, [isDragging, dragMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragEnd()
  }, [dragEnd])

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();

    const now = Date.now();
    if (now - lastDownTimer.current < 200) {
      onClick(event)
    }
  }

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
      className={isActive ? 'drag-container active' : 'drag-container'}
      style={{
        width: elementData.w + 'px',
        height: elementData.h + 'px',
        transform: `translate(${elementData.x}px, ${elementData.y}px)`,
      }}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
    >
      {children}
    </div>
  )
}
