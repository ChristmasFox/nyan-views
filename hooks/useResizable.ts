import { useRef, useCallback } from 'react';
import { ChartData, ElementData } from '@/components/edit/canvas';
import { getPoints, getSize, heightMap, pointMap, rad2deg, tr2bl, widthMap } from '@/utils/resize';

interface ResizableProps {
  wrapper: any
  chartData: ChartData
  elementData: ElementData
  pageScale: number
  resize(elementData: ElementData): void;
}
interface ResizeOpt {
  matrix?: { x: number; y: number }[]
  opposite: { x: number; y: number }
  currentRatio: number
  type: string
  pressAngle: number
  startAngle: number
}
interface ParentRect {
  left: number
  top: number
}

type ResizableReturns = [
  (event: MouseEvent) => void,
  (event: MouseEvent) => void,
  (event: MouseEvent) => void
]


export const useResizable = ({ wrapper, chartData, elementData, resize, pageScale } : ResizableProps): ResizableReturns => {
  const _resizeOpt = useRef<ResizeOpt>(null)
  const _parentRect = useRef<ParentRect>(null)

  const handleMouseDown = (event: React.MouseEvent) => {
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

  const handleMouseMove = useCallback((ev: Event) => {
    const event = ev as MouseEvent
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
  }, [chartData, elementData, pageScale, resize])

  const handleMouseUp = useCallback((ev: Event) => {
  }, [])

  return [handleMouseMove, handleMouseUp, handleMouseDown]
}
