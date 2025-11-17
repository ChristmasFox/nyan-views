import { useCallback, useEffect, useRef, useState } from 'react';
import { ChartData, ElementData } from '@/components/edit/canvas';
import { getNewHandler, getPoints, getSize, heightMap, pointMap, rad2deg, tr2bl, widthMap } from '@/utils/resize';

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

interface LastStation {
  x: number;
  y: number;
}
type xyTs = {
  x: number
  y: number
}
interface ResizeOpt {
  matrix?: xyTs[]
  opposite: xyTs
  currentRatio: number
  type: string
  pressAngle: number
  startAngle: number
}
interface ParentRect {
  left: number
  top: number
}

export default function DragFrame({ chartData, children, elementData, pageScale, dragMove, dragEnd, onClick, isActive, resize }: Props) {
  const [isDragging, setIsDragging] = useState(false)

  const lastStation = useRef<LastStation>({ x: 0, y: 0, })
  const animationFrame = useRef<number>(0);
  const lastDownTimer = useRef(0);
  const handleType = useRef('');
  const wrapper = useRef(null);
  const _resizeOpt = useRef<ResizeOpt>(null)
  const _parentRect = useRef<ParentRect>(null)

  function getNow() {
    return Date.now()
  }

  function handleMouseDown(event: React.MouseEvent) {
    const { clientX, clientY, target } = event;
    setIsDragging(isActive)
    lastStation.current = { x: clientX, y: clientY }
    lastDownTimer.current = getNow()
    if (target.dataset.resizetype) {
      handleType.current = 'resize'
      handleResizeStart(event)
    } else {
      handleType.current = 'drag'
    }
  }

  function handleResizeStart(event: React.MouseEvent) {
    const { clientX, clientY, target } = event;
    _parentRect.current = wrapper.current?.parentNode.getBoundingClientRect();
    if (!_parentRect.current) return
    const type = target.dataset.resizetype;
    const matrix = getPoints(elementData);
    let pressAngle;
    const opposite = matrix[pointMap[type]];
    const x1 = (clientX  - _parentRect.current.left) / pageScale - opposite.x;
    const y1 = (clientY  - _parentRect.current.top) / pageScale - opposite.y;
    let _width = elementData.w,
      _height = elementData.h;
    const currentRatio = _width / _height;
    if (tr2bl[type]) {
      if (widthMap[type]) _height /= 2;
      pressAngle = rad2deg(Math.atan2(_width, _height));
    } else {
      if (heightMap[type]) _width /= 2;
      pressAngle = rad2deg(Math.atan2(_height, _width));
    }
    const startAngle = rad2deg(Math.atan2(y1, x1));
    _resizeOpt.current = {
      matrix,
      type,
      opposite,
      currentRatio,
      pressAngle,
      startAngle
    };
  }

  const handleResizeMove = useCallback((event: MouseEvent) => {
    if (!_parentRect.current || !_resizeOpt.current) return
    const { clientX, clientY } = event;

    const { opposite, type, pressAngle, startAngle } = _resizeOpt.current
    let {
      currentRatio,
    } = _resizeOpt.current
    const x = (clientX - _parentRect.current.left) / pageScale - opposite.x,
      y = (clientY - _parentRect.current.top) / pageScale - opposite.y,
      dis = Math.hypot(y, x),
      ratio = event.shiftKey
    const { w, h } = getSize({
      type,
      dis,
      x,
      y,
      ratio,
      startAngle,
      pressAngle,
      currentRatio
    });
    const transform = Object.assign({}, elementData)
    if (widthMap[type] && !ratio) {
      transform.w = w;
    } else if (heightMap[type] && !ratio) {
      transform.h = h;
    } else {
      transform.w = w;
      transform.h = h;
    }
    if (transform.w < 1) {
      transform.w = 1;
    }
    if (transform.h < 1) {
      transform.h = 1;
    }
    transform.w = Math.round(transform.w) ;
    transform.h = Math.round(transform.h) ;
    currentRatio = transform.w / transform.h;
    const matrix = getPoints(transform);
    const _opp = matrix[pointMap[type]];
    const deltaX = -(_opp.x - opposite.x),
      deltaY = -(_opp.y - opposite.y);
    transform.x = Math.round(transform.x + deltaX) ;
    transform.y = Math.round(transform.y + deltaY) ;

    transform.x = Math.max(0, Math.min(transform.x, chartData.w - transform.w));
    transform.y = Math.max(0, Math.min(transform.y, chartData.h - transform.h));
    _resizeOpt.current.currentRatio = currentRatio;

    resize({
      ...transform
    })
  }, [elementData, pageScale, resize]);

  const handleMouseMove = useCallback((ev: Event) => {
    const event = ev as MouseEvent
    cancelAnimationFrame(animationFrame.current);
    animationFrame.current = requestAnimationFrame(() => {
      if (handleType.current === 'resize') {
        handleResizeMove(event)
      } else {
        if (event.buttons == 2 || !isDragging) return
        const { clientX, clientY } = event;
        const deltaX = clientX - lastStation.current.x;
        const deltaY = clientY - lastStation.current.y;

        lastStation.current = { x: clientX, y: clientY }
        dragMove(deltaX, deltaY)
      }
    })
  }, [isDragging, dragMove, handleResizeMove])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragEnd()
  }, [dragEnd])

  function handleClick(event: React.MouseEvent) {
    event.stopPropagation();

    const now = getNow()
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
