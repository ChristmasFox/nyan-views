import { DAILY_ROUTE_CARD_GOAL, type DailyProgress, type StreakState } from '@/lib/study/types'
import { getMeta, putMeta } from '@/lib/study/storage/idb'

export function localDateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function yesterdayKey(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return localDateKey(d)
}

export async function loadOrCreateDailyProgress(): Promise<DailyProgress> {
  const today = localDateKey()
  const existing = await getMeta('daily')
  if (existing && existing.dateKey === today) {
    return existing
  }
  return {
    dateKey: today,
    cardsGraded: 0,
    routeDone: false
  }
}

export async function incrementDailyGraded(): Promise<DailyProgress> {
  const cur = await loadOrCreateDailyProgress()
  const next: DailyProgress = {
    ...cur,
    cardsGraded: cur.cardsGraded + 1,
    routeDone:
      cur.routeDone || cur.cardsGraded + 1 >= DAILY_ROUTE_CARD_GOAL
  }
  await putMeta('daily', next)

  if (!cur.routeDone && next.routeDone) {
    await applyStreakForComplete()
  }

  return next
}

async function applyStreakForComplete(): Promise<void> {
  const today = localDateKey()
  const prev = (await getMeta('streak')) ?? {
    streak: 0,
    lastCompletedDateKey: null
  }

  if (prev.lastCompletedDateKey === today) {
    return
  }

  let streak = 1
  if (prev.lastCompletedDateKey === yesterdayKey()) {
    streak = prev.streak + 1
  }

  await putMeta('streak', {
    streak,
    lastCompletedDateKey: today
  } satisfies StreakState)
}

export async function loadStreak(): Promise<StreakState> {
  return (
    (await getMeta('streak')) ?? {
      streak: 0,
      lastCompletedDateKey: null
    }
  )
}

export function emitStudyUpdated(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('nyan-study-updated'))
}
