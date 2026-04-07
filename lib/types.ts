export type SchoolLevel = 'elementary' | 'middle' | 'high'
export type Curriculum = '2015' | '2022'

export interface AchievementStandard {
  code: string
  content: string
  schoolLevel: SchoolLevel
  subject: string
  curriculum: Curriculum
}

export interface RubricLevel {
  score: number
  description: string
}

export interface RubricItem {
  id: string
  name: string
  levels: RubricLevel[]
}

export interface EvaluationGuide {
  description: string
  conditions: string
}
