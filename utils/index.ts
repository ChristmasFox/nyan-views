export type ChartData = {
  w: number,
  h: number,
  elements: Array<ElementData>
}

export type ElementData = {
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  figureId: number,
  active: boolean,
  isHide: boolean,
}
export const initDisplayData = (): ChartData => {
  return {
    w: 1920,
    h: 1080,
    elements: []
  }
}

export function isCtrlEvent(event: React.MouseEvent) {
  // 判断不同系统的多选事件
  const isMac = navigator.userAgent.indexOf('Mac OS X') != -1
  return (isMac && event.metaKey) || (!isMac && event.ctrlKey)
}

export function getTime() {
  return Date.now()
}

export function isMouseInnerCanvas(clientX: number = 0, clientY: number = 0, canvasPosition: DOMRect) {
  return clientX >= canvasPosition.left && clientX <= canvasPosition.left + canvasPosition.width &&
    clientY >= canvasPosition.top && clientY <= canvasPosition.top + canvasPosition.height
}

export function getComponentDraggedPosition(
  clientX: number = 0,
  clientY: number = 0,
  elementW: number = 0,
  elementH: number = 0,
  canvasPosition: DOMRect,
  pageScale: number = 1
): [number, number] {
  let posX: number = 0
  let posY: number = 0
  if (clientX && clientY && canvasPosition) {
    posX = clientX - canvasPosition.left - (elementW / 2 * pageScale)
    posY = clientY - canvasPosition.top - (elementH / 2 * pageScale)
    if (posX < 0) {
      posX = 0
    }
    if (posY < 0) {
      posY = 0
    }
    if (canvasPosition.width - posX < (elementW * pageScale)) {
      posX = canvasPosition.width - (elementW * pageScale)
    }
    if (canvasPosition.height - posY < (elementH * pageScale)) {
      posY = canvasPosition.height - (elementH * pageScale)
    }
    posX = posX / pageScale
    posY = posY / pageScale
  }
  return [posX, posY]
}
