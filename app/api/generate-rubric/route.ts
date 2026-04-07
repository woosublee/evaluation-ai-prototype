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
    const { standard, prompt } = await req.json() as {
      standard: AchievementStandard
      prompt?: string
    }

    const systemPrompt = `당신은 초·중·고 서논술형 평가 전문가입니다.
교사가 제공한 성취기준을 바탕으로 채점기준을 생성해야 합니다.

채점기준 생성 규칙:
- 항목 수: 3~5개
- 각 항목별 배점 단계: 3~5단계 (반드시 등차배점 - 동일한 간격)
- 배점은 높은 순서로 정렬 (예: 5, 3, 1 또는 4, 3, 2, 1)
- 각 수준 기술은 해당 학교급과 학년군에 맞는 난이도와 용어로 작성
- 상 수준: 자기주도적·구체적·연결·확장
- 중 수준: 부분적 달성·구체성 부족·연결 약함
- 하 수준: 미달성 또는 나열·형식적 수준

반드시 아래 JSON 형식으로만 응답하세요:
{
  "items": [
    {
      "name": "채점기준 항목명",
      "levels": [
        { "score": 5, "description": "상 수준 기술" },
        { "score": 3, "description": "중 수준 기술" },
        { "score": 1, "description": "하 수준 기술" }
      ]
    }
  ]
}`

    const userPrompt = `학교급: ${SCHOOL_LEVEL_KO[standard.schoolLevel]}
과목: ${standard.subject}
교육과정: ${standard.curriculum}년 개정
성취기준 코드: ${standard.code}
성취기준 내용: ${standard.content}
${prompt ? `\n교사 추가 요청: ${prompt}` : ''}`

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content || '[]'
    const parsed = JSON.parse(content)
    const rawItems = parsed.items || parsed.rubric || (Array.isArray(parsed) ? parsed : [])

    const rubric: RubricItem[] = rawItems.slice(0, 5).map((item: { name: string; levels: { score: number; description: string }[] }, i: number) => ({
      id: `${Date.now()}-${i}`,
      name: item.name || '',
      levels: (item.levels || []).map((l: { score: number; description: string }) => ({
        score: Number(l.score),
        description: l.description || '',
      })),
    }))

    return NextResponse.json(rubric)
  } catch (error) {
    console.error('generate-rubric error:', error)
    return NextResponse.json({ error: '채점기준 생성에 실패했습니다.' }, { status: 500 })
  }
}
