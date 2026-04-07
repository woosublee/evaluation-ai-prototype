import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { AchievementStandard, RubricItem, EvaluationGuide } from '@/lib/types'



const SCHOOL_LEVEL_KO: Record<string, string> = {
  elementary: '초등학교',
  middle: '중학교',
  high: '고등학교',
}

const STYLE_GUIDE: Record<string, string> = {
  elementary: '초등학생 눈높이에 맞는 친근한 말투로 작성. 문체: ~해 보세요, ~써 봅시다',
  middle: '중학생 수준의 명확한 문체로 작성. 문체: ~하세요, ~설명하세요',
  high: '고등학생 수준의 학문적 문체로 작성. 문체: ~하시오, ~논술하시오',
}

export async function POST(req: Request) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const { standard, rubric, prompt } = await req.json() as {
      standard: AchievementStandard
      rubric: RubricItem[]
      prompt?: string
    }

    const rubricSummary = rubric
      .map(item => `- ${item.name}: ${item.levels.map(l => `${l.score}점(${l.description})`).join(' / ')}`)
      .join('\n')

    const systemPrompt = `당신은 초·중·고 서논술형 평가 전문가입니다.
성취기준과 채점기준을 바탕으로 학생에게 전달할 평가 설명과 평가 조건을 생성하세요.

생성 규칙:
- 평가 설명: 성취기준을 학생이 수행할 구체적인 과제로 변환한 문제 안내문. 끝에 총점 표시.
- 평가 조건: 채점기준의 각 항목을 학생 행동 지시문으로 변환. "항목명 (배점 N점)\n- 지시사항" 형식.
- 글자수 제한: 평가 설명 200자 이내, 평가 조건 350자 이내

반드시 아래 JSON 형식으로만 응답하세요:
{
  "description": "평가 설명 텍스트",
  "conditions": "평가 조건 텍스트"
}`

    const totalScore = rubric.reduce((sum, item) => sum + Math.max(...item.levels.map(l => l.score)), 0)

    const userPrompt = `학교급: ${SCHOOL_LEVEL_KO[standard.schoolLevel]}
과목: ${standard.subject}
성취기준: ${standard.code} ${standard.content}
문체 기준: ${STYLE_GUIDE[standard.schoolLevel]}
총점: ${totalScore}점

채점기준:
${rubricSummary}
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

    const content = response.choices[0].message.content || '{}'
    const parsed = JSON.parse(content)

    const guide: EvaluationGuide = {
      description: (parsed.description || '').slice(0, 200),
      conditions: (parsed.conditions || '').slice(0, 350),
    }

    return NextResponse.json(guide)
  } catch (error) {
    console.error('generate-evaluation error:', error)
    return NextResponse.json({ error: '평가 안내 생성에 실패했습니다.' }, { status: 500 })
  }
}
