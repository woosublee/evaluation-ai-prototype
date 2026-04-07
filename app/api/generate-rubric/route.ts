import { NextResponse } from 'next/server'
import { AchievementStandard, RubricItem } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { standard, prompt } = await req.json() as { standard: AchievementStandard, prompt?: string }

    // Mock response for [4국03-04]
    if (standard.code === '[4국03-04]') {
      const rubric: RubricItem[] = [
        {
          id: (Date.now() + 0).toString(),
          name: "마음 표현의 진정성",
          levels: [
            { score: 5, description: "자신의 경험과 연결하여 마음을 구체적이고 솔직하게 표현함" },
            { score: 3, description: "마음을 표현하였으나 구체적인 경험이나 상황 연결이 부족함" },
            { score: 1, description: "마음 표현이 모호하거나 형식적인 수준에 그침" }
          ]
        },
        {
          id: (Date.now() + 1).toString(),
          name: "읽는 이 인식",
          levels: [
            { score: 5, description: "받는 사람의 상황이나 관계를 고려한 표현이 자연스럽게 드러남" },
            { score: 3, description: "받는 사람을 의식하고 있으나 말투나 내용이 일관되지 않음" },
            { score: 1, description: "누구에게 쓰는 글인지 드러나지 않거나 읽는 이를 전혀 고려하지 않음" }
          ]
        },
        {
          id: (Date.now() + 2).toString(),
          name: "글의 흐름",
          levels: [
            { score: 5, description: "인사→마음 전달→마무리의 흐름이 자연스럽고 문장 간 연결이 매끄러움" },
            { score: 3, description: "글의 구조는 있으나 문장 간 연결이 다소 어색함" },
            { score: 1, description: "글의 구조가 없거나 문장이 나열되어 있음" }
          ]
        }
      ]
      return NextResponse.json(rubric)
    }

    // Default mock response for other standards
    const rubric: RubricItem[] = [
      {
        id: (Date.now() + 0).toString(),
        name: `${standard.subject} 지식 이해`,
        levels: [
          { score: 5, description: "관련 개념을 정확하게 이해하고 체계적으로 설명함" },
          { score: 3, description: "기본적인 개념은 이해하고 있으나 설명이 다소 부족함" },
          { score: 1, description: "개념 이해가 부족하거나 오개념이 나타남" }
        ]
      },
      {
        id: (Date.now() + 1).toString(),
        name: "탐구 및 분석 능력",
        levels: [
          { score: 5, description: "주어진 자료를 깊이 있게 분석하고 창의적인 결론을 도출함" },
          { score: 3, description: "자료를 분석하여 일반적인 결론을 도출함" },
          { score: 1, description: "자료 분석이 단편적이고 결론 도출이 미흡함" }
        ]
      },
      {
        id: (Date.now() + 2).toString(),
        name: "태도 및 실천",
        levels: [
          { score: 5, description: "학습 내용과 삶을 연결하여 적극적으로 실천하려는 태도를 보임" },
          { score: 3, description: "학습 내용의 중요성을 인지하고 긍정적인 태도를 보임" },
          { score: 1, description: "학습 참여도가 낮고 가치 인식 및 실천 의지가 부족함" }
        ]
      }
    ]

    // TODO: Claude API 연동
    // import Anthropic from '@anthropic-ai/sdk'
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // const response = await client.messages.create({
    //   model: 'claude-3-5-sonnet-20240620',
    //   max_tokens: 2048,
    //   messages: [{
    //     role: 'user',
    //     content: `성취기준: ${standard.content}. 추가 프롬프트: ${prompt || '없음'}`
    //   }]
    // })

    return NextResponse.json(rubric)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate rubric' }, { status: 500 })
  }
}
