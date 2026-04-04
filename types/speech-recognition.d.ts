/** 标准与 webkit 前缀的语音识别构造函数 */
declare global {
  interface Window {
    SpeechRecognition?: { new (): SpeechRecognition }
    webkitSpeechRecognition?: { new (): SpeechRecognition }
  }
}

export {}
