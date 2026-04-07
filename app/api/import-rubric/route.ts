import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { RubricItem } from '@/lib/types'



export async function POST(req: Request) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  try {
    const { image } = await req.json() as { image: string }

    const systemPrompt = `이미지에서 채점기준 표를 추출하세요.
반드시 아래 JSON 형식으로만 응답하세요:
[
  {
    "name": "항목명",
    "levels": [
      { "score": 5, "description": "수준 기술" },
      { "score": 3, "description": "수준 기술" },
      { "score": 1, "description": "수준 기술" }
    ]
  }
]
- 최대 5개 항목까지만 반환
- 배점은 숫자로, 높은 순서로 정렬
- 표에서 읽은 내용을 그대로 사용`

    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${image}`,
                detail: 'high',
              },
            },
            { type: 'text', text: systemPrompt },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    })

    const content = response.choices[0].message.content || '[]'
    const parsed = JSON.parse(content)
    const rawItems = Array.isArray(parsed) ? parsed : parsed.rubric || parsed.items || []

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
    console.error('import-rubric error:', error)
    return NextResponse.json({ error: '이미지 인식에 실패했습니다.' }, { status: 500 })
  }
}
