import { NextResponse } from 'next/server'
import { RubricItem } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { image } = await req.json()

    // Mock: Always return 3 sample rubric items
    const rubric: RubricItem[] = [
      {
        id: (Date.now() + 0).toString(),
        name: "핵심 개념의 정확성",
        levels: [
          { score: 5, description: "성취기준과 관련된 핵심 개념을 오개념 없이 정확하게 기술함" },
          { score: 3, description: "기본적인 개념은 맞으나 일부 서술이 모호함" },
          { score: 1, description: "핵심 개념을 잘못 이해하거나 중요 내용을 누락함" }
        ]
      },
      {
        id: (Date.now() + 1).toString(),
        name: "근거 제시의 타당성",
        levels: [
          { score: 5, description: "자료를 바탕으로 객관적이고 구체적인 근거를 3가지 이상 제시함" },
          { score: 3, description: "적절한 근거를 제시하였으나 구체성이 다소 부족함" },
          { score: 1, description: "근거가 부적절하거나 주관적인 의견에만 의존함" }
        ]
      },
      {
        id: (Date.now() + 2).toString(),
        name: "글쓰기 형식의 적절성",
        levels: [
          { score: 5, description: "문장 간 연결이 자연스럽고 원고지 사용법을 완벽히 준수함" },
          { score: 3, description: "글의 구조는 갖추었으나 문장이 다소 매끄럽지 못함" },
          { score: 1, description: "글의 형식이 어긋나거나 맞춤법 오류가 다수 발견됨" }
        ]
      }
    ]

    // TODO: Claude API vision 연동
    // import Anthropic from '@anthropic-ai/sdk'
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // const response = await client.messages.create({
    //   model: 'claude-3-5-sonnet-20240620',
    //   max_tokens: 2048,
    //   messages: [{
    //     role: 'user',
    //     content: [{ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: image } }, { type: 'text', text: 'Extract rubric' }]
    //   }]
    // })

    return NextResponse.json(rubric)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to import rubric' }, { status: 500 })
  }
}
