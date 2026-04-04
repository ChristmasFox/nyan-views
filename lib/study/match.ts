import type { VocabEntry } from '@/lib/study/types'
import { normalizeForCompare, normalizeInput } from '@/lib/study/normalize'

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const row = new Array<number>(n + 1)
  for (let j = 0; j <= n; j++) row[j] = j
  for (let i = 1; i <= m; i++) {
    let prev = row[0]
    row[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = row[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + cost)
      prev = tmp
    }
  }
  return row[n]
}

/** 相似度 0–1，1 为完全相同 */
export function stringSimilarity(a: string, b: string): number {
  const x = normalizeForCompare(a)
  const y = normalizeForCompare(b)
  if (x.length === 0 && y.length === 0) return 1
  if (x.length === 0 || y.length === 0) return 0
  if (x === y) return 1
  if (x.includes(y) || y.includes(x)) {
    return Math.max(
      0.85,
      (2 * Math.min(x.length, y.length)) / (x.length + y.length)
    )
  }
  const d = levenshtein(x, y)
  const maxLen = Math.max(x.length, y.length)
  return 1 - d / maxLen
}

export function matchesVocabEntry(
  userAnswer: string,
  entry: VocabEntry,
  minRatio: number
): boolean {
  const u = normalizeInput(userAnswer)
  if (!u) return false
  const targets = [entry.surface, entry.reading]
  return targets.some((t) => stringSimilarity(u, t) >= minRatio)
}

/** 打字模式：要求更严（全等或高相似） */
export function matchesTypingAnswer(userAnswer: string, entry: VocabEntry): boolean {
  return matchesVocabEntry(userAnswer, entry, 0.82)
}

/** 语音模式：宽松 */
export function matchesVoiceAnswer(userAnswer: string, entry: VocabEntry): boolean {
  return matchesVocabEntry(userAnswer, entry, 0.35)
}
