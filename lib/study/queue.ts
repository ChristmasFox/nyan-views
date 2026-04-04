import type { JlptLevel, VocabEntry } from '@/lib/study/types'
import { getVocabByLevels } from '@/lib/study/vocab'
import { getAllSrsStates } from '@/lib/study/storage/idb'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const tmp = a[i]
    a[i] = a[j]!
    a[j] = tmp!
  }
  return a
}

/**
 * 构建本轮学习队列：优先到期复习，再补充未见/新词，上限 limit
 */
export async function buildSessionQueue(
  levels: JlptLevel[],
  limit = 28
): Promise<VocabEntry[]> {
  const pool = getVocabByLevels(levels)
  if (!pool.length) return []

  const states = await getAllSrsStates()
  const map = new Map(states.map((s) => [s.vocabId, s]))
  const now = Date.now()

  const due: VocabEntry[] = []
  const rest: VocabEntry[] = []

  for (const v of pool) {
    const s = map.get(v.id)
    if (!s) {
      rest.push(v)
    } else if (s.nextReviewAt <= now) {
      due.push(v)
    } else {
      rest.push(v)
    }
  }

  const ordered = [...shuffle(due), ...shuffle(rest)]
  return ordered.slice(0, limit)
}
