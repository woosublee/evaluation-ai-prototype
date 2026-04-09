import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AchievementStandard, RubricItem } from '@/lib/types'

const SCHOOL_LEVEL_KO: Record<string, string> = {
  elementary: '초등학교',
  middle: '중학교',
  high: '고등학교',
}

export async function POST(req: Request) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const { standard, existingRubric, itemName, prompt } = await req.json() as {
      standard: AchievementStandard | null
      existingRubric: RubricItem[]
      itemName?: string
      prompt?: string
    }

    // 기존 항목의 배점 패턴 파악
    const levelCount = existingRubric[0]?.levels.length || 3
    const scores = existingRubric[0]?.levels.map(l => l.score) || [5, 3, 1]

    const existingSummary = existingRubric
      .filter(item => item.name.trim())
      .map(item => `- ${item.name}`)
      .join('\n')

    const systemPrompt = `당신은 초·중·고 서논술형 평가 전문가입니다.
기존 채점기준 항목들을 참고하여 새로운 채점기준 항목 하나를 생성하세요.

규칙:
- 기존 항목들과 중복되지 않고 보완적인 새 항목을 생성
- 배점 단계: ${levelCount}단계, 배점: ${scores.join('/')}점 (기존과 동일하게 유지)
- 상 수준: 자기주도적·구체적·연결/확장
- 중 수준: 부분적 달성·구체성 부족·연결 약함
- 하 수준: 미달성 또는 나열·형식적 수준
- 학교급에 맞는 난이도와 용어 사용

반드시 아래 JSON 형식으로만 응답하세요:
{
  "name": "채점기준 항목명",
  "levels": [
    { "score": ${scores[0]}, "description": "상 수준 기술" }${levelCount > 1 ? `,
    { "score": ${scores[1]}, "description": "중 수준 기술" }` : ''}${levelCount > 2 ? `,
    { "score": ${scores[scores.length - 1]}, "description": "하 수준 기술" }` : ''}
  ]
}`

    const userPrompt = [
      standard ? `학교급: ${SCHOOL_LEVEL_KO[standard.schoolLevel] || ''}` : '',
      standard ? `과목: ${standard.subject}` : '',
      standard?.content ? `성취기준: ${standard.code ? standard.code + ' ' : ''}${standard.content}` : '',
      `\n기존 채점기준 항목:\n${existingSummary}`,
      itemName?.trim() ? `\n새 항목명 (교사 입력): ${itemName}` : '',
      prompt?.trim() ? `\n교사 추가 요청: ${prompt}` : '',
    ].filter(Boolean).join('\n')

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content || '{}'
    const parsed = JSON.parse(content)

    const rubricItem: RubricItem = {
      id: `${Date.now()}`,
      name: parsed.name || itemName || '',
      levels: (parsed.levels || []).map((l: { score: number; description: string }) => ({
        score: Number(l.score),
        description: l.description || '',
      })),
    }

    return NextResponse.json(rubricItem)
  } catch (error) {
    console.error('generate-single-rubric error:', error)
    return NextResponse.json({ error: '항목 생성에 실패했습니다.' }, { status: 500 })
  }
}
