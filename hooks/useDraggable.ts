import { useRef, useCallback } from 'react';

interface DraggableProps {
  dragMove(_deltaX: number, _deltaY: number): void;
  dragEnd(): void;
}

type DraggableReturns = [
  (event: MouseEvent) => void,
  (event: MouseEvent) => void,
  (event: MouseEvent) => void
]


export const useDraggable = ({ dragMove, dragEnd }: DraggableProps): DraggableReturns  => {
  const lastStation = useRef<{ x: number; y: number }>({ x: 0, y: 0, })

  const handleMouseDown = (event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    lastStation.current = { x: clientX, y: clientY }
  }

  const handleMouseMove = useCallback((ev: Event) => {
    const event = ev as MouseEvent
    const { clientX, clientY } = event;
    const deltaX = clientX - lastStation.current.x;
    const deltaY = clientY - lastStation.current.y;

    lastStation.current = { x: clientX, y: clientY }
    dragMove(deltaX, deltaY)
  }, [dragMove])

  const handleMouseUp = useCallback(() => {
    dragEnd()
  }, [dragEnd])

  return [handleMouseMove, handleMouseUp, handleMouseDown]
}
