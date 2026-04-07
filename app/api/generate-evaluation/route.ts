import { NextResponse } from 'next/server'
import { AchievementStandard, RubricItem, EvaluationGuide } from '@/lib/types'

export async function POST(request: Request) {
  const body = await request.json()
  const { standard, rubric, prompt }: { standard: AchievementStandard; rubric: RubricItem[]; prompt?: string } = body

  // Mock data for evaluation guide
  const guide: EvaluationGuide = {
    description: `본 평가는 성취기준 [${standard.code}] "${standard.content}"을(를) 달성하기 위해 설계되었습니다. 학생들은 제시된 조건에 따라 ${rubric.map(r => r.name).join(', ')}을(를) 중심으로 평가를 받게 됩니다.`,
    conditions: `1. 정해진 시간(40분) 내에 작성을 완료해야 합니다.\n2. 자신의 경험을 바탕으로 진솔하게 서술해야 합니다.\n3. 분량은 A4 용지 1매 내외(약 600자)로 제한합니다.\n4. 맞춤법 및 띄어쓰기 규정을 준수해야 합니다.`
  }

  // Claude API 연동 예시 (주석)
  /*
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      messages: [{ role: 'user', content: `Generate an evaluation guide for: ${standard.content} with rubric: ${JSON.stringify(rubric)}. ${prompt || ''}` }]
    })
  })
  const result = await response.json()
  return NextResponse.json(JSON.parse(result.content[0].text))
  */

  return NextResponse.json(guide)
}
