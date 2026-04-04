import type { JlptLevel, VocabEntry } from '@/lib/study/types'
import { N5_SAMPLE } from '@/lib/study/vocab/n5-sample'

const BY_LEVEL: Record<JlptLevel, VocabEntry[]> = {
  N5: N5_SAMPLE,
  N4: [],
  N3: [],
  N2: []
}

export function getAllVocab(): VocabEntry[] {
  return [...BY_LEVEL.N5, ...BY_LEVEL.N4, ...BY_LEVEL.N3, ...BY_LEVEL.N2]
}

export function getVocabByLevels(levels: JlptLevel[]): VocabEntry[] {
  const set = new Set(levels)
  return getAllVocab().filter((v) => set.has(v.level))
}

export function getVocabById(id: string): VocabEntry | undefined {
  return getAllVocab().find((v) => v.id === id)
}
