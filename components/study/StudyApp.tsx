'use client'

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mic, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  DAILY_ROUTE_CARD_GOAL,
  MAX_VOICE_RETRIES,
  type AnswerMode,
  type JlptLevel,
  type VocabEntry
} from '@/lib/study/types'
import { buildSessionQueue } from '@/lib/study/queue'
import {
  loadOrCreateDailyProgress,
  incrementDailyGraded,
  emitStudyUpdated
} from '@/lib/study/daily'
import {
  loadStudySettings,
  writeLastAnswerMode,
  writeLastLevels,
  writeSoundEnabled
} from '@/lib/study/client-settings'
import { getVocabByLevels } from '@/lib/study/vocab'
import { matchesTypingAnswer, matchesVoiceAnswer } from '@/lib/study/match'
import { createInitialSrsState, gradeToQuality, scheduleSm2 } from '@/lib/study/srs-sm2'
import { getSrsState, putSrsState } from '@/lib/study/storage/idb'
import { speakJapanese, stopSpeaking } from '@/lib/study/tts'
import { playSuccessChime } from '@/lib/study/sound'

const LEVELS: JlptLevel[] = ['N5', 'N4', 'N3', 'N2']

const QUEUE_BUILD_TIMEOUT_MS = 12_000

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} 超时`)), ms)
    promise
      .then((v) => {
        clearTimeout(t)
        resolve(v)
      })
      .catch((e) => {
        clearTimeout(t)
        reject(e)
      })
  })
}

function levelHasWords(level: JlptLevel): boolean {
  return getVocabByLevels([level]).length > 0
}

function usePrefersReducedMotion(): boolean {
  const [v, setV] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fn = () => setV(mq.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])
  return v
}

export default function StudyApp() {
  const reduceMotion = usePrefersReducedMotion()
  const [phase, setPhase] = useState<'setup' | 'session' | 'done'>('setup')
  const [answerMode, setAnswerMode] = useState<AnswerMode>('typing')
  const [levels, setLevels] = useState<JlptLevel[]>(['N5'])
  const [soundEnabled, setSoundEnabled] = useState(true)

  const [queue, setQueue] = useState<VocabEntry[]>([])
  const [index, setIndex] = useState(0)
  const [step, setStep] = useState<'respond' | 'reveal'>('respond')
  const [textAnswer, setTextAnswer] = useState('')
  const [voiceTries, setVoiceTries] = useState(0)
  const [voiceFallback, setVoiceFallback] = useState(false)
  const [listening, setListening] = useState(false)
  const [lastTranscript, setLastTranscript] = useState('')

  const [dailySnapshot, setDailySnapshot] = useState({ cardsGraded: 0, routeDone: false })
  const [starting, setStarting] = useState(false)
  /** 同步防抖：避免 iOS 上 pointer/click 连发或连点两次重复进入 */
  const sessionStartingRef = useRef(false)

  useEffect(() => {
    startTransition(() => {
      try {
        const s = loadStudySettings()
        setAnswerMode(s.answerMode)
        setLevels(s.levels)
        setSoundEnabled(s.soundEnabled)
      } catch {
        /* 避免 storage 异常导致整页交互失效 */
      }
    })
  }, [])

  const refreshDaily = useCallback(async () => {
    const d = await loadOrCreateDailyProgress()
    setDailySnapshot({ cardsGraded: d.cardsGraded, routeDone: d.routeDone })
  }, [])

  useEffect(() => {
    startTransition(() => {
      void refreshDaily()
    })
  }, [refreshDaily])

  const entry = queue[index]

  const toggleLevel = (l: JlptLevel) => {
    if (!levelHasWords(l)) return
    setLevels((prev) => {
      const has = prev.includes(l)
      if (has && prev.length === 1) return prev
      if (has) return prev.filter((x) => x !== l)
      return [...prev, l]
    })
  }

  const startSession = async () => {
    if (sessionStartingRef.current) return
    sessionStartingRef.current = true
    setStarting(true)
    try {
      writeLastAnswerMode(answerMode)
      writeLastLevels(levels)
      writeSoundEnabled(soundEnabled)

      const q = await withTimeout(
        buildSessionQueue(levels),
        QUEUE_BUILD_TIMEOUT_MS,
        '加载学习队列'
      )
      if (!q.length) {
        toast.message('当前级别暂无词条', {
          description: '请先勾选含词表的级别（目前仅有 N5 示例）。'
        })
        return
      }
      setQueue(q)
      setIndex(0)
      setStep('respond')
      setTextAnswer('')
      setVoiceTries(0)
      setVoiceFallback(false)
      setLastTranscript('')
      stopSpeaking()
      setPhase('session')
    } catch (e) {
      console.error(e)
      toast.error('无法开始本轮', {
        description:
          e instanceof Error && e.message.includes('超时')
            ? '本地数据库响应过慢，请刷新页面或检查存储空间后重试。'
            : '可能是浏览器存储受限，请换系统浏览器或关闭无痕模式后重试。'
      })
    } finally {
      sessionStartingRef.current = false
      setStarting(false)
    }
  }

  const playFeedback = useCallback(() => {
    playSuccessChime(soundEnabled, reduceMotion)
  }, [soundEnabled, reduceMotion])

  const goReveal = useCallback(
    (entryNow: VocabEntry) => {
      setStep('reveal')
      if (!reduceMotion) {
        speakJapanese(`${entryNow.surface}、${entryNow.reading}`)
      }
    },
    [reduceMotion]
  )

  const submitTyping = () => {
    if (!entry) return
    if (matchesTypingAnswer(textAnswer, entry)) {
      playFeedback()
      goReveal(entry)
    } else {
      toast.error('再试试看？', { description: '与词条或读音不太一致。' })
    }
  }

  const startVoice = useCallback(() => {
    if (!entry) return
    const Rec =
      typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition)
    if (!Rec) {
      toast.error('当前浏览器不支持语音识别', {
        description: '请改用 Chrome / Edge，或使用打字模式。'
      })
      return
    }

    setListening(true)
    setLastTranscript('')
    const rec = new Rec()
    rec.lang = 'ja-JP'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (ev: {
      results: ArrayLike<{ 0?: { transcript: string } }>
    }) => {
      const t = ev.results[0]?.[0]?.transcript ?? ''
      setLastTranscript(t)
      try {
        rec.stop()
      } catch {
        /* noop */
      }
      if (matchesVoiceAnswer(t, entry)) {
        playFeedback()
        goReveal(entry)
        return
      }
      setVoiceTries((n) => {
        const next = n + 1
        if (next >= MAX_VOICE_RETRIES) {
          toast.message('多次未通过', { description: '已切换到打字，请键盘输入。' })
          setVoiceFallback(true)
        } else {
          toast.message('没听清或不太像', { description: '可重试或改用打字。' })
        }
        return next
      })
    }
    rec.onerror = () => {
      toast.error('语音识别出错', { description: '请检查麦克风权限后重试。' })
    }
    rec.onend = () => setListening(false)
    try {
      rec.start()
    } catch {
      setListening(false)
      toast.error('无法启动语音识别')
    }
  }, [entry, goReveal, playFeedback])

  const showAnswer = () => {
    if (!entry) return
    setStep('reveal')
  }

  const grade = async (g: 'again' | 'hard' | 'good' | 'easy') => {
    if (!entry) return
    let prev = await getSrsState(entry.id)
    if (!prev) prev = createInitialSrsState(entry.id)
    const q = gradeToQuality(g)
    const next = scheduleSm2(prev, q)
    await putSrsState(next)
    await incrementDailyGraded()
    emitStudyUpdated()
    void refreshDaily()
    stopSpeaking()

    if (index >= queue.length - 1) {
      setPhase('done')
      return
    }
    setIndex((i) => i + 1)
    setStep('respond')
    setTextAnswer('')
    setVoiceTries(0)
    setVoiceFallback(false)
    setLastTranscript('')
  }

  const setupLevelsLabel = useMemo(
    () => levels.slice().sort().join(' + '),
    [levels]
  )

  if (phase === 'setup') {
    return (
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col gap-6 px-4 py-8 pb-[max(1.75rem,env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="shrink-0" asChild>
            <Link href="/" aria-label="返回首页">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <h1 className="text-xl font-semibold">开始学习</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">作答方式</CardTitle>
            <p className="text-sm text-muted-foreground">
              打字模式仅键盘输入；语音模式先识别，可重试后改用打字过关。
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={answerMode === 'typing' ? 'default' : 'outline'}
                className="min-h-11 touch-manipulation"
                onClick={() => setAnswerMode('typing')}
              >
                打字
              </Button>
              <Button
                type="button"
                variant={answerMode === 'voice' ? 'default' : 'outline'}
                className="min-h-11 touch-manipulation"
                onClick={() => setAnswerMode('voice')}
              >
                语音
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">级别（可多选）</CardTitle>
            <p className="text-sm text-muted-foreground">
              混选时随机混合；N4～N2 词表将陆续加入。
            </p>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {LEVELS.map((l) => {
              const ok = levelHasWords(l)
              const on = levels.includes(l)
              return (
                <Button
                  key={l}
                  type="button"
                  size="sm"
                  variant={on ? 'default' : 'outline'}
                  disabled={!ok}
                  className="touch-manipulation"
                  onClick={() => toggleLevel(l)}
                >
                  {l}
                  {!ok ? '（暂无）' : ''}
                </Button>
              )
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">音效</CardTitle>
          </CardHeader>
          <CardContent>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="size-4 rounded border"
              />
              答对时播放提示音（减少动效开启时自动静音）
            </label>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              className="w-full min-h-11 touch-manipulation"
              disabled={starting}
              onClick={startSession}
            >
              {starting ? '准备中…' : `开始本轮（约 ${setupLevelsLabel}）`}
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (phase === 'done') {
    return (
      <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center gap-6 px-4 py-12 text-center">
        <h2 className="text-2xl font-semibold">本轮完成</h2>
        <p className="text-muted-foreground">
          今日已 grading {dailySnapshot.cardsGraded} 张，目标 {DAILY_ROUTE_CARD_GOAL} 张
          {dailySnapshot.routeDone ? '（今日路线已达成）' : ''}。
        </p>
        <div className="flex w-full max-w-xs flex-col gap-2">
          <Button
            className="min-h-11 touch-manipulation"
            onClick={() => {
              setPhase('setup')
            }}
          >
            再选设置
          </Button>
          <Button variant="outline" className="min-h-11 touch-manipulation" asChild>
            <Link href="/">回首页</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (!entry) {
    return null
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col gap-4 px-4 py-6 pb-24">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">首页</Link>
        </Button>
        <span className="text-sm text-muted-foreground tabular-nums">
          {index + 1} / {queue.length}
        </span>
      </div>

      <div className="relative min-h-[220px] rounded-xl border bg-card p-6 shadow-sm">
        {step === 'respond' ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">请说出或输入对应的日语</p>
            <p className="text-2xl font-medium leading-snug">{entry.glossZh}</p>
            {answerMode === 'typing' || voiceFallback ? (
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  lang="ja"
                  autoCapitalize="off"
                  autoCorrect="off"
                  className="min-h-11 flex-1 text-lg"
                  placeholder="日文输入"
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitTyping()}
                />
                <Button type="button" className="min-h-11 touch-manipulation" onClick={submitTyping}>
                  提交
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-11 touch-manipulation gap-2"
                  disabled={listening}
                  onClick={() => startVoice()}
                >
                  {listening ? (
                    <>
                      <Mic className="size-4 animate-pulse" />
                      聆听中…
                    </>
                  ) : (
                    <>
                      <Mic className="size-4" />
                      点击跟读识别
                    </>
                  )}
                </Button>
                {lastTranscript ? (
                  <p className="text-xs text-muted-foreground">识别：{lastTranscript}</p>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  {voiceTries > 0 && voiceTries < MAX_VOICE_RETRIES ? (
                    <Button type="button" variant="outline" size="sm" onClick={() => startVoice()}>
                      重试语音 ({voiceTries}/{MAX_VOICE_RETRIES})
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setVoiceFallback(true)}
                  >
                    改用打字
                  </Button>
                </div>
              </div>
            )}
            <Button type="button" variant="link" className="h-auto p-0 text-muted-foreground" onClick={showAnswer}>
              想不起来了，看答案
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">答案</p>
            <p className="text-3xl font-semibold">{entry.surface}</p>
            <p className="text-xl text-muted-foreground">{entry.reading}</p>
            <p className="text-lg">{entry.glossZh}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2 touch-manipulation"
              onClick={() => speakJapanese(`${entry.surface}、${entry.reading}`)}
            >
              <Volume2 className="size-4" />
              再听读音
            </Button>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                type="button"
                variant="destructive"
                className="min-h-11 touch-manipulation"
                onClick={() => void grade('again')}
              >
                忘记
              </Button>
              <Button type="button" variant="secondary" className="min-h-11 touch-manipulation" onClick={() => void grade('hard')}>
                困难
              </Button>
              <Button type="button" className="min-h-11 touch-manipulation" onClick={() => void grade('good')}>
                良好
              </Button>
              <Button type="button" variant="outline" className="min-h-11 touch-manipulation" onClick={() => void grade('easy')}>
                简单
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        语音需在 HTTPS 下使用；移动端请允许麦克风权限。
      </p>
    </div>
  )
}
