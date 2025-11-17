export type Points = {
  x: number
  y: number
  w: number
  h: number
  r: number
}
export type Size = {
  type: string
  x: number
  y: number
  dis: number
  ratio: boolean
  pressAngle: number
  startAngle: number
  currentRatio: number
}

export interface indexAssign {
  [key: string]: string | number | undefined;
}

export interface ResizeMap extends indexAssign {
  br?: number
  tr?: number
  tl?: number
  bl?: number
  tm?: number
  bm?: number
  l?: number
  r?: number
}
