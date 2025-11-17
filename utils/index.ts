export function isCtrlEvent(event: React.MouseEvent) {
  // 判断不同系统的多选事件
  const isMac = navigator.userAgent.indexOf('Mac OS X') != -1
  return (isMac && event.metaKey) || (!isMac && event.ctrlKey)
}

export function getTime() {
  return Date.now()
}
