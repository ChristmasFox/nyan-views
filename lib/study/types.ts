export type JlptLevel = 'N5' | 'N4' | 'N3' | 'N2'

export type AnswerMode = 'typing' | 'voice'

/** 词条（词表） */
export interface VocabEntry {
  id: string
  level: JlptLevel
  /** 主要表记（汉字混合等） */
  surface: string
  /** 读音（假名） */
  reading: string
  /** 中文释义（作提示面） */
  glossZh: string
}

/** SM-2 单卡调度状态 */
export interface SrsCardState {
  vocabId: string
  easeFactor: number
  intervalDays: number
  repetitions: number
  /** 下次复习时间戳 ms */
  nextReviewAt: number
}

export interface StudySettings {
  answerMode: AnswerMode
  /** 选中的级别（至少一项） */
  levels: JlptLevel[]
  soundEnabled: boolean
}

export interface DailyProgress {
  /** 本地日历日 yyyy-mm-dd */
  dateKey: string
  /** 今日已 grading 的卡片次数 */
  cardsGraded: number
  /** 今日路线是否已达成 */
  routeDone: boolean
}

export interface StreakState {
  streak: number
  lastCompletedDateKey: string | null
}

/** 语音判分：与正确文本的最小相似度（0–1），低于设计为宽松 */
export const VOICE_MATCH_MIN_RATIO = 0.35

export const DAILY_ROUTE_CARD_GOAL = 20

export const MAX_VOICE_RETRIES = 3

export const STORAGE_KEYS = {
  lastAnswerMode: 'nyan-study:last-answer-mode',
  lastLevels: 'nyan-study:last-levels',
  soundEnabled: 'nyan-study:sound-enabled'
} as const
