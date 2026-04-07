import { NextResponse } from 'next/server'
import { AchievementStandard, RubricItem } from '@/lib/types'

export async function POST(request: Request) {
  const body = await request.json()
  const { standard, prompt }: { standard: AchievementStandard; prompt?: string } = body

  // Mock data for [4국03-04]
  if (standard.code === '4국03-04') {
    const rubric: RubricItem[] = [
      {
        id: '1',
        name: '마음 표현의 진정성',
        levels: [
          { score: 5, description: '자신의 경험과 연결하여 마음을 구체적이고 솔직하게 표현함' },
          { score: 3, description: '마음을 표현하였으나 구체적인 경험이나 상황 연결이 부족함' },
          { score: 1, description: '마음 표현이 모호하거나 형식적인 수준에 그침' },
        ],
      },
      {
        id: '2',
        name: '읽는 이 인식',
        levels: [
          { score: 5, description: '받는 사람의 상황이나 관계를 고려한 표현이 자연스럽게 드러남' },
          { score: 3, description: '받는 사람을 의식하고 있으나 말투나 내용이 일관되지 않음' },
          { score: 1, description: '누구에게 쓰는 글인지 드러나지 않거나 읽는 이를 전혀 고려하지 않음' },
        ],
      },
      {
        id: '3',
        name: '글의 흐름',
        levels: [
          { score: 5, description: '인사→마음 전달→마무리의 흐름이 자연스럽고 문장 간 연결이 매끄러움' },
          { score: 3, description: '글의 구조는 있으나 문장 간 연결이 다소 어색함' },
          { score: 1, description: '글의 구조가 없거나 문장이 나열되어 있음' },
        ],
      },
    ]
    return NextResponse.json(rubric)
  }

  // Default mock for other standards
  const defaultRubric: RubricItem[] = [
    {
      id: '1',
      name: '내용의 정확성',
      levels: [
        { score: 5, description: `${standard.content} 내용을 매우 정확하게 파악하고 서술함` },
        { score: 3, description: `${standard.content} 내용을 대체로 파악하였으나 일부 오류가 있음` },
        { score: 1, description: `${standard.content} 내용 파악이 미흡함` },
      ],
    },
    {
      id: '2',
      name: '탐구 역량',
      levels: [
        { score: 5, description: '주어진 주제에 대해 창의적이고 심층적으로 탐구함' },
        { score: 3, description: '주어진 주제에 대해 일반적인 수준에서 탐구함' },
        { score: 1, description: '탐구 과정이 부족하거나 결과가 미흡함' },
      ],
    },
    {
      id: '3',
      name: '의사소통 및 표현',
      levels: [
        { score: 5, description: '자신의 생각을 논리적이고 체계적으로 표현함' },
        { score: 3, description: '자신의 생각을 표현하였으나 논리가 다소 부족함' },
        { score: 1, description: '생각을 표현하는 데 어려움이 있음' },
      ],
    },
  ]

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
      messages: [{ role: 'user', content: `Generate a rubric for: ${standard.content}. ${prompt || ''}` }]
    })
  })
  const result = await response.json()
  return NextResponse.json(JSON.parse(result.content[0].text))
  */

  return NextResponse.json(defaultRubric)
}
