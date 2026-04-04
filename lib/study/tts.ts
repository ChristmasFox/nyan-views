/**
 * 浏览器 TTS；需在用户手势后调用以符合自动播放策略
 */
export function speakJapanese(text: string): void {
  if (typeof window === 'undefined' || !window.speechSynthesis) return

  window.speechSynthesis.cancel()
  const utter = new SpeechSynthesisUtterance(text)
  utter.lang = 'ja-JP'
  utter.rate = 0.95

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const ja =
      voices.find((v) => v.lang.toLowerCase().startsWith('ja')) ?? null
    if (ja) {
      utter.voice = ja
    }
    window.speechSynthesis.speak(utter)
  }

  if (window.speechSynthesis.getVoices().length) {
    pickVoice()
    return
  }
  const once = () => {
    window.speechSynthesis.removeEventListener('voiceschanged', once)
    pickVoice()
  }
  window.speechSynthesis.addEventListener('voiceschanged', once)
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}
