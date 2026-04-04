import {
  STORAGE_KEYS,
  type AnswerMode,
  type JlptLevel,
  type StudySettings
} from '@/lib/study/types'

const DEFAULT_LEVELS: JlptLevel[] = ['N5']

export function readLastAnswerMode(): AnswerMode {
  if (typeof window === 'undefined') return 'typing'
  try {
    const v = window.localStorage.getItem(STORAGE_KEYS.lastAnswerMode)
    return v === 'voice' ? 'voice' : 'typing'
  } catch {
    return 'typing'
  }
}

export function writeLastAnswerMode(mode: AnswerMode): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEYS.lastAnswerMode, mode)
  } catch {
    /* 无痕模式 / 部分 WebView 会禁用 storage */
  }
}

export function readLastLevels(): JlptLevel[] {
  if (typeof window === 'undefined') return DEFAULT_LEVELS
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.lastLevels)
    if (!raw) return DEFAULT_LEVELS
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return DEFAULT_LEVELS
    const allowed = new Set<JlptLevel>(['N5', 'N4', 'N3', 'N2'])
    const levels = parsed.filter((x): x is JlptLevel => allowed.has(x as JlptLevel))
    return levels.length ? levels : DEFAULT_LEVELS
  } catch {
    return DEFAULT_LEVELS
  }
}

export function writeLastLevels(levels: JlptLevel[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEYS.lastLevels, JSON.stringify(levels))
  } catch {
    /* noop */
  }
}

export function readSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const v = window.localStorage.getItem(STORAGE_KEYS.soundEnabled)
    if (v === '0' || v === 'false') return false
    return true
  } catch {
    return true
  }
}

export function writeSoundEnabled(on: boolean): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEYS.soundEnabled, on ? '1' : '0')
  } catch {
    /* noop */
  }
}

export function loadStudySettings(): StudySettings {
  return {
    answerMode: readLastAnswerMode(),
    levels: readLastLevels(),
    soundEnabled: readSoundEnabled()
  }
}
