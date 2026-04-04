import type { SrsCardState } from '@/lib/study/types'

/** SM-2 质量 0–5；按钮映射在 UI 层 */
export type Sm2Quality = 0 | 1 | 2 | 3 | 4 | 5

export function createInitialSrsState(vocabId: string): SrsCardState {
  return {
    vocabId,
    easeFactor: 2.5,
    intervalDays: 0,
    repetitions: 0,
    nextReviewAt: Date.now()
  }
}

/**
 * 经典 SM-2 间隔更新；返回新状态与「间隔天数」（用于展示）
 * 参考 SuperMemo 2 算法
 */
export function scheduleSm2(
  prev: SrsCardState,
  quality: Sm2Quality
): SrsCardState {
  let { easeFactor, intervalDays, repetitions } = { ...prev }

  if (quality < 3) {
    repetitions = 0
    intervalDays = 0
  } else {
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.max(1, Math.round(intervalDays * easeFactor))
    }
    repetitions += 1
  }

  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  if (easeFactor < 1.3) {
    easeFactor = 1.3
  }

  const dayMs = 24 * 60 * 60 * 1000
  const nextReviewAt = Date.now() + intervalDays * dayMs

  return {
    vocabId: prev.vocabId,
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewAt
  }
}

/** UI 四档 → SM-2 quality */
export function gradeToQuality(
  grade: 'again' | 'hard' | 'good' | 'easy'
): Sm2Quality {
  switch (grade) {
    case 'again':
      return 0
    case 'hard':
      return 2
    case 'good':
      return 4
    case 'easy':
      return 5
    default:
      return 4
  }
}
