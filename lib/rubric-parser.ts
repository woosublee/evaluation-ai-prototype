import { RubricItem } from './types'

export function parseRubricText(text: string): RubricItem[] | null {
  if (!text.trim()) return null

  // 패턴 B: 탭 구분형 (엑셀/한글 표 열 단위 복사)
  const lines = text.split('\n').map(line => line.trimEnd())
  const isTabSeparated = lines.some(line => line.includes('\t'))

  if (isTabSeparated) {
    return parseTabPattern(lines)
  } else {
    return parseNewlinePattern(lines)
  }
}

// 패턴 B: 탭으로 구분 - "항목명\t배점\t기술" 형태
function parseTabPattern(lines: string[]): RubricItem[] | null {
  const items: RubricItem[] = []
  let currentItem: RubricItem | null = null

  for (const line of lines) {
    if (!line.trim()) continue
    const parts = line.split('\t')
    if (parts.length < 2) continue

    const namePart = parts[0].trim()
    const scorePart = parts[1].trim()
    const descPart = parts[2]?.trim() || ''

    const score = parseInt(scorePart)
    if (isNaN(score)) continue

    if (namePart) {
      // 새 항목 시작
      currentItem = {
        id: `${Date.now()}-${items.length}`,
        name: namePart,
        levels: [],
      }
      items.push(currentItem)
    }

    if (currentItem) {
      currentItem.levels.push({ score, description: descPart })
    }
  }

  if (items.length === 0) return null
  return items.slice(0, 5)
}

// 패턴 A: 줄바꿈형 - "항목명 / 숫자 / 기술 / 숫자 / 기술 ..." 형태
// 빈 줄로 항목이 구분되거나, 구분 없이 이어지는 경우 모두 처리
function parseNewlinePattern(rawLines: string[]): RubricItem[] | null {
  const lines = rawLines.map(l => l.trim()).filter(l => l)
  if (lines.length === 0) return null

  const items: RubricItem[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]
    const isNumber = /^\d+$/.test(line)

    // 숫자가 아닌 줄 → 항목명 후보
    if (!isNumber) {
      const name = line
      const levels: { score: number; description: string }[] = []
      i++

      // 이후 숫자+기술 쌍 수집
      while (i < lines.length) {
        const scoreLine = lines[i]
        const isOnlyNumber = /^\d+$/.test(scoreLine)

        if (isOnlyNumber) {
          const score = parseInt(scoreLine)
          i++
          // 다음 줄이 기술 (숫자가 아닌 경우)
          if (i < lines.length && !/^\d+$/.test(lines[i])) {
            levels.push({ score, description: lines[i] })
            i++
          } else {
            levels.push({ score, description: '' })
          }
        } else {
          // 숫자가 아닌 줄 → 다음 항목명이므로 중단
          break
        }
      }

      if (levels.length > 0) {
        items.push({
          id: `${Date.now()}-${items.length}`,
          name,
          levels,
        })
      }
    } else {
      i++
    }
  }

  if (items.length === 0) return null
  return items.slice(0, 5)
}
