import { RubricItem, RubricLevel } from './types'

export function parseRubricText(text: string): RubricItem[] | null {
  if (!text.trim()) return null

  const items: RubricItem[] = []

  // Try Pattern B (Tab separated) first as it's more specific
  if (text.includes('\t')) {
    const lines = text.split('\n').filter(l => l.trim().length > 0)
    let currentItem: RubricItem | null = null

    for (const line of lines) {
      const parts = line.split('\t')
      if (parts.length >= 2) {
        const itemName = parts[0].trim()
        const scoreStr = parts[1].trim()
        const description = parts[2]?.trim() || ''
        const score = parseInt(scoreStr, 10)

        if (!isNaN(score)) {
          if (itemName) {
            if (items.length >= 5) break
            currentItem = {
              id: Math.random().toString(36).substring(7),
              name: itemName,
              levels: []
            }
            items.push(currentItem)
          }

          if (currentItem) {
            currentItem.levels.push({ score, description })
          }
        }
      }
    }
    return items.length > 0 ? items : null
  }

  // Pattern A (Line-break based)
  const lines = text.split('\n').map(l => l.trim())
  let currentItem: RubricItem | null = null
  let lastScore: number | null = null

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === '') {
      currentItem = null
      continue
    }

    const score = parseInt(line, 10)
    if (!isNaN(score) && line === score.toString()) {
      // It's a score line
      if (currentItem && i + 1 < lines.length) {
        const description = lines[i + 1]
        currentItem.levels.push({ score, description })
        i++ // Skip description line
      }
    } else {
      // It's a category name line
      if (items.length >= 5) continue
      currentItem = {
        id: Math.random().toString(36).substring(7),
        name: line,
        levels: []
      }
      items.push(currentItem)
    }
  }

  return items.length > 0 ? items : null
}
