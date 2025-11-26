import Matrix from '@/utils/Matrix'
import { Points, ResizeMap, Size } from '@/types/common'

const handlerMap: ResizeMap = { 'tl' : 0, 'tm' : 1, 'tr' : 2, 'r' : 3, 'br' : 4, 'bm' : 5, 'bl' : 6, 'l' : 7 }
const cursorMap = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']


export const pointMap: ResizeMap = {
  br : 0,
  tr : 3,
  tl : 2,
  bl : 1,
  tm : 2,
  bm : 0,
  l : 1,
  r : 3
}
export const widthMap: ResizeMap = {
  l : 1,
  r : 1
}
export const heightMap: ResizeMap = {
  tm : 1,
  bm : 1
}
export const tr2bl: ResizeMap = {
  tr : 1,
  bl : 1,
  r : 1,
  l : 1
}
export function deg2rad(deg: number) {
  return deg * Math.PI / 180
}

export function rad2deg(rad: number) {
  return rad * 180 / Math.PI
}
export function getPoints({ x, y, w, h, r }: Points) {
  const a = r * Math.PI / 180
  const wc = w / 2
  const hc = h / 2
  const deg = new Matrix([[Math.cos(a), Math.sin(a)], [-Math.sin(a), Math.cos(a)]])
  const rect = new Matrix([
    [-wc, hc],
    [wc, hc],
    [wc, -hc],
    [-wc, -hc]
  ])
  return deg.dot(rect.T()).T().valueOf().map((item: [number, number]) => {
    return { x : Math.floor(item[0] + wc + x), y : Math.floor(-(item[1] - hc) + y) }
  })
}
export function getSize({ type, x, y, dis, ratio, pressAngle, startAngle, currentRatio }: Size) {
  let w; let h
  const currentAngle = rad2deg(Math.atan2(y, x))
  const rad = deg2rad(pressAngle + currentAngle - startAngle)
  if (tr2bl[type]) {
    h = Math.cos(rad) * dis
    w = Math.sin(rad) * dis
  } else {
    h = Math.sin(rad) * dis
    w = Math.cos(rad) * dis
  }
  if (ratio) {
    if (widthMap[type]) {
      h = w / currentRatio
    } else {
      if (heightMap) {
        w = h * currentRatio
      }
    }
  }
  return { w, h }
}
function getHandler(type: string, rotation: number) {
  const originIndex: number = handlerMap[type] as number
  const currentIndex = (originIndex + Math.floor(rotation / 45)) % 8
  return cursorMap[currentIndex]
}
export function getNewHandler(type: string, rotation: number = 0) {
  const cursor = getHandler(type, rotation)
  const handlerSize = 10
  let props = {}
  const half = `${-Math.floor(handlerSize / 2)}px`
  switch (type) {
  case 'tl':
    props = {
      top: half,
      left: half
    }
    break
  case 'tm':
    props = { top: half, 'marginLeft': half }
    break
  case 'tr':
    props = { right: half, top: half }
    break
  case 'r':
    props = { right: half, 'marginTop': half }
    break
  case 'br':
    props = { bottom: half, right: half }
    break
  case 'bm':
    props = { 'marginLeft': half, bottom: half }
    break
  case 'bl':
    props = { left: half, bottom: half }
    break
  case 'l':
    props = { 'marginTop': half, left: half }
    break
  default:
    break
  }
  return {
    cursor: `${cursor}-resize`,
    width: `${Math.ceil(handlerSize)}px`,
    height: `${Math.ceil(handlerSize)}px`,
    ...props
  }
}
