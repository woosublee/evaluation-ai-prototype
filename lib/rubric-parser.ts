import { RubricItem } from './types'

export function parseRubricText(text: string): RubricItem[] | null {
  if (!text.trim()) return null

  const items: RubricItem[] = []
  const lines = text.split('\n').map(line => line.trim())

  // Check if it's Tab-separated (Pattern B)
  const isTabSeparated = lines.some(line => line.includes('\t'))

  if (isTabSeparated) {
    let currentItemName = ''
    let currentItem: RubricItem | null = null

    for (const line of lines) {
      if (!line) continue
      const parts = line.split('\t')
      if (parts.length >= 2) {
        const namePart = parts[0].trim()
        const scorePart = parts[1].trim()
        const descPart = parts[2]?.trim() || ''

        const score = parseInt(scorePart)
        if (!isNaN(score)) {
          if (namePart) {
            currentItemName = namePart
            currentItem = {
              id: (Date.now() + items.length).toString(),
              name: currentItemName,
              levels: []
            }
            items.push(currentItem)
          }

          if (currentItem) {
            currentItem.levels.push({ score, description: descPart })
          }
        }
      }
    }
  } else {
    // Newline-based (Pattern A)
    // Basic heuristic: Number only lines are scores, empty lines are separators
    let currentItem: RubricItem | null = null
    let tempName = ''

    const blocks = text.split(/\n\s*\n/) // Split by empty lines
    for (const block of blocks) {
      const blockLines = block.split('\n').map(l => l.trim()).filter(l => l)
      if (blockLines.length < 2) continue

      const name = blockLines[0]
      const levels: { score: number; description: string }[] = []

      for (let i = 1; i < blockLines.length; i++) {
        const line = blockLines[i]
        const scoreMatch = line.match(/^(\d+)/)
        if (scoreMatch) {
          const score = parseInt(scoreMatch[1])
          const description = line.replace(/^\d+[\s.]*/, '').trim()
          levels.push({ score, description })
        }
      }

      if (levels.length > 0) {
        items.push({
          id: (Date.now() + items.length).toString(),
          name,
          levels
        })
      }
    }
  }

  if (items.length === 0) return null
  return items.slice(0, 5)
}
