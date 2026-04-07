import { NextResponse } from 'next/server'
import { AchievementStandard, RubricItem, EvaluationGuide } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { standard, rubric, prompt } = await req.json() as { standard: AchievementStandard, rubric: RubricItem[], prompt?: string }

    let guide: EvaluationGuide = {
      description: '',
      conditions: ''
    }

    if (standard.code === '[4국03-04]') {
      guide = {
        description: '고마운 사람에게 마음을 전하는 편지를 써 보세요. 읽는 사람이 누구인지 생각하면서, 자신의 마음이 잘 전해지도록 글을 써 봅시다. (15점)',
        conditions: `1. 마음 표현 (배점 5점)\n- 고마운 마음이 무엇인지 구체적으로 써 보세요.\n- 왜 고마운지 까닭을 함께 써 보세요.\n2. 읽는 이 고려 (배점 5점)\n- 편지를 받는 사람이 누구인지 알 수 있게 써 보세요.\n3. 글의 구조 (배점 5점)\n- 인삿말과 끝인사를 포함하여 자연스러운 흐름으로 써 보세요.`
      }
    } else {
      guide = {
        description: `${standard.content}와 관련하여 본인의 생각을 논술해 보세요.`,
        conditions: `1. 내용의 타당성 (배점 5점)\n- 근거를 명확히 제시하세요.\n2. 논리적 구성 (배점 5점)\n- 서론, 본론, 결론의 형식을 갖추세요.\n3. 언어 표현의 적절성 (배점 5점)\n- 맞춤법과 어법을 준수하세요.`
      }
    }

    // TODO: Claude API 연동
    // import Anthropic from '@anthropic-ai/sdk'
    // const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // const response = await client.messages.create({
    //   model: 'claude-3-5-sonnet-20240620',
    //   max_tokens: 2048,
    //   messages: [{
    //     role: 'user',
    //     content: `성취기준: ${standard.content}. 채점기준: ${JSON.stringify(rubric)}. 프롬프트: ${prompt || '없음'}`
    //   }]
    // })

    return NextResponse.json(guide)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate evaluation' }, { status: 500 })
  }
}
