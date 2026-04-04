let audioCtx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    audioCtx = new AC()
  }
  return audioCtx
}

/** 短促成功音（无需外部资源） */
export function playSuccessChime(soundEnabled: boolean, reduceMotion: boolean): void {
  if (!soundEnabled || reduceMotion) return
  const ctx = getCtx()
  if (!ctx) return

  const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve()
  void resume.then(() => {
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, t)
    osc.frequency.exponentialRampToValueAtTime(1320, t + 0.06)
    gain.gain.setValueAtTime(0.12, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t)
    osc.stop(t + 0.22)
  })
}
