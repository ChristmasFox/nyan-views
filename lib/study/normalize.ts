/**
 * 日文答案规范化：NFKC + 去首尾空白；读音比较时统一为平假名
 */

const kataToHiraMap: Record<string, string> = {}
for (let i = 0; i < 96; i++) {
  const kata = String.fromCharCode(0x30a1 + i)
  const hira = String.fromCharCode(0x3041 + i)
  kataToHiraMap[kata] = hira
}
// 长音等
kataToHiraMap['ー'] = 'ー'

export function normalizeInput(raw: string): string {
  return raw.normalize('NFKC').trim()
}

/** 将字符串转为平假名风格（片假名→平假名），用于读音匹配 */
export function toHiraganaLoose(s: string): string {
  const n = normalizeInput(s)
  let out = ''
  for (const ch of n) {
    out += kataToHiraMap[ch] ?? ch
  }
  return out
}

export function normalizeForCompare(s: string): string {
  return toHiraganaLoose(s).replace(/\s+/g, '')
}
