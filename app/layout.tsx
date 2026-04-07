import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '서·논술형 평가 배부 | Classting AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <header className="bg-white h-[60px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] sticky top-0 z-50 flex items-center justify-between px-4">
          <div className="flex items-center gap-12">
            <span className="text-[#9013FE] font-bold text-[16px] tracking-tight">CLASSTING AI</span>
            <div className="flex items-center gap-2 text-[14px]">
              <span className="text-[#808080]">학습 관리</span>
              <span className="text-[#808080]">›</span>
              <span className="text-[#2B2B2B] font-bold">서·논술형 평가 배부</span>
            </div>
          </div>
          <button className="flex items-center gap-1.5 border border-[#E0E0E0] rounded-full px-4 py-2 text-[14px] text-[#666] hover:bg-gray-50">
            <span>💬</span>
            <span>클래스톡</span>
          </button>
        </header>
        <main className="min-h-screen bg-[#F8F8F8]">
          {children}
        </main>
      </body>
    </html>
  )
}
