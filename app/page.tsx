import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center space-y-6 max-w-2xl px-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
          <span className="text-white font-bold text-3xl">E</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
          AI 평가 생성기 프로토타입
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          성취기준을 바탕으로 채점기준과 평가 설명 및 조건을 <br className="hidden sm:block" />
          AI를 활용해 손쉽게 생성하고 관리하세요.
        </p>
        <div className="pt-4">
          <Link href="/distribute">
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-semibold shadow-md">
              평가 생성하기 시작
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 container max-w-4xl px-4">
        <FeatureCard 
          title="AI 자동 생성" 
          description="성취기준에 최적화된 채점기준과 평가 가이드를 즉시 생성합니다."
        />
        <FeatureCard 
          title="불러오기 지원" 
          description="이미지 OCR 및 텍스트 파싱을 통해 기존 자료를 손쉽게 디지털화합니다."
        />
        <FeatureCard 
          title="맞춤형 커스터마이징" 
          description="항목 추가, 단계 조절 등 선생님의 의도에 맞게 정밀하게 편집 가능합니다."
        />
      </div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  )
}
