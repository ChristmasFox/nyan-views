import {useEffect, useRef} from 'react';

interface DraggableProps {
  dragMove(deltaX: number, deltaY: number): void;
  dragEnd(): void;
}

type DraggableReturns = [
  (event: React.MouseEvent) => void,
]


export const useDraggable = ({ dragMove, dragEnd }: DraggableProps): DraggableReturns  => {
  const lastStation = useRef<{ x: number; y: number }>({ x: 0, y: 0, })
  const dragMoveRef = useRef(dragMove);
  const dragEndRef = useRef(dragEnd);
  const animationFrame = useRef<number>(0);

  // 保持回调最新 (解决闭包问题)
  useEffect(() => {
    dragMoveRef.current = dragMove;
    dragEndRef.current = dragEnd
  });

  function handleMouseDown(event: React.MouseEvent) {
    const { clientX, clientY } = event;
    lastStation.current = { x: clientX, y: clientY }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  function handleMouseUp() {
    cancelAnimationFrame(animationFrame.current);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    dragEndRef.current()
  }

  function handleMouseMove(event: MouseEvent) {
    if (event.buttons == 2) return
    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      const {clientX, clientY} = event;
      const deltaX = clientX - lastStation.current.x;
      const deltaY = clientY - lastStation.current.y;

      lastStation.current = {x: clientX, y: clientY}
      dragMoveRef.current(deltaX, deltaY)
    })
  }

  return [handleMouseDown]
}
