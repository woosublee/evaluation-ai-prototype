'use client'

import React, { useState } from 'react'
import { AchievementStandard, RubricItem, EvaluationGuide } from '@/lib/types'
import { Loader2, List, ListOrdered, Link } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface EvaluationSectionProps {
  standard: AchievementStandard | null
  levelsReady: boolean
  rubric: RubricItem[]
  guide: EvaluationGuide
  setGuide: (guide: EvaluationGuide) => void
  evalName: string
  setEvalName: (name: string) => void
  evalType: 'online' | 'offline'
}

export function EvaluationSection({ standard, levelsReady, rubric, guide, setGuide, evalName, setEvalName, evalType }: EvaluationSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [referenceUrl, setReferenceUrl] = useState('')
  const [showAiPromptInput, setShowAiPromptInput] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('')
  const [showConfirmReplace, setShowConfirmReplace] = useState(false)

  const isRubricFilled = Array.isArray(rubric) &&
    rubric.filter(item =>
      item.name.trim() &&
      item.levels.length >= 3 &&
      item.levels.every(l => l.description.trim())
    ).length >= 3
  const hasGuide = !!(guide.description || guide.conditions)
  const evalNameError = evalName.length > 40

  const handleTriggerGenerate = () => {
    if (hasGuide) {
      setShowConfirmReplace(true)
    } else {
      setShowAiPromptInput(true)
    }
  }

  const handleAiGenerate = async () => {
    if (!standard) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standard, rubric, prompt: aiPrompt })
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setGuide(data)
      setShowAiPromptInput(false)
      setAiPrompt('')
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="border border-[#DDDDDD] rounded-[8px] bg-white p-6 flex flex-col gap-8">

      {/* 평가명 */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-bold text-[#2B2B2B]">평가명 <span className="text-[#FF595F]">*</span></span>
        <input
          type="text"
          value={evalName}
          onChange={e => setEvalName(e.target.value)}
          placeholder="평가명을 입력해 주세요."
          className={`border rounded-[4px] p-3 text-[16px] text-[#2B2B2B] w-full focus:outline-none ${evalNameError ? 'border-[#FF595F]' : 'border-[#DDDDDD] focus:border-[#9013FE]'}`}
        />
        {evalNameError && (
          <p className="text-[14px] text-[#FF595F]">평가명은 40자까지 입력할 수 있어요.</p>
        )}
      </div>

      {/* 온라인 전용: 참고 이미지 */}
      {evalType === 'online' && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold text-[#2B2B2B]">참고 이미지</span>
          <div className="w-[140px] h-[106px] bg-[#F5F5F5] rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-[#EEEEEE] transition-colors border border-dashed border-[#DDDDDD]">
            <span className="text-[24px] text-[#AAAAAA]">+</span>
          </div>
        </div>
      )}

      {/* 온라인 전용: 참고 영상 URL */}
      {evalType === 'online' && (
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold text-[#2B2B2B]">참고 영상 URL</span>
          <input
            type="url"
            value={referenceUrl}
            onChange={e => setReferenceUrl(e.target.value)}
            placeholder="URL 주소를 입력해 주세요. (예: https://classting.com)"
            className="border border-[#DDDDDD] rounded-[4px] p-3 text-[16px] text-[#808080] w-full focus:outline-none focus:border-[#9013FE] placeholder:text-[#808080]"
          />
        </div>
      )}

      {/* 평가 설명 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[14px] font-bold text-[#2B2B2B]">
            {evalType === 'online' ? <>평가 설명 <span className="text-[#FF595F]">*</span></> : '평가 설명 (선택)'}
          </span>
          <div className="flex items-center gap-2">
            {hasGuide ? (
              <button
                onClick={handleTriggerGenerate}
                disabled={isGenerating || showAiPromptInput}
                className="flex items-center gap-1.5 border border-[#DDDDDD] text-[#2B2B2B] text-[14px] font-bold rounded-full px-4 py-1.5 hover:bg-gray-50 disabled:opacity-40"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : '↺'}
                재생성
              </button>
            ) : (
              <button
                onClick={handleTriggerGenerate}
                disabled={!isRubricFilled || isGenerating || showAiPromptInput}
                className="flex items-center gap-1.5 bg-[#9013FE] text-white text-[14px] font-bold rounded-full px-4 py-1.5 hover:bg-[#7B0FD9] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : '✦'}
                AI로 생성
              </button>
            )}
          </div>
        </div>

        {/* AI 프롬프트 입력 */}
        {showAiPromptInput && (
          <div className="border border-[#9013FE] rounded-[8px] p-4 bg-[#F9F0FF] flex flex-col gap-3">
            <span className="text-[14px] font-bold text-[#2B2B2B]">추가 요청 사항 (선택)</span>
            <input
              type="text"
              value={aiPrompt}
              onChange={e => setAiPrompt(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAiGenerate()}
              placeholder="예: 초등학생 눈높이에 맞춰줘, 실험 관찰 보고서 형식으로"
              className="border border-[#DDDDDD] rounded-[4px] px-3 py-2 text-[14px] w-full bg-white focus:outline-none focus:border-[#9013FE]"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => { setShowAiPromptInput(false); setAiPrompt('') }} className="text-[14px] text-[#808080] px-4 py-2 rounded-full hover:bg-white">취소</button>
              <button onClick={handleAiGenerate} disabled={isGenerating} className="bg-[#9013FE] text-white text-[14px] font-bold rounded-full px-5 py-2 disabled:opacity-40 flex items-center gap-2">
                {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                생성
              </button>
            </div>
          </div>
        )}

        <div className="relative">
          <textarea
            value={guide.description}
            onChange={e => setGuide({ ...guide, description: e.target.value })}
            placeholder="평가 설명을 입력해 주세요."
            rows={4}
            className={`border rounded-[4px] p-3 text-[16px] text-[#2B2B2B] w-full focus:outline-none resize-none ${guide.description.length > 200 ? 'border-[#FF595F]' : 'border-[#DDDDDD] focus:border-[#9013FE]'}`}
          />
          <span className={`absolute right-3 bottom-3 text-[12px] ${guide.description.length > 200 ? 'text-[#FF595F]' : 'text-[#808080]'}`}>
            {guide.description.length}/200
          </span>
        </div>
        {guide.description.length > 200 && (
          <p className="text-[14px] text-[#FF595F]">평가 설명은 200자까지 입력할 수 있어요.</p>
        )}
      </div>

      {/* 평가 조건 */}
      <div className="flex flex-col gap-2">
        <span className="text-[14px] font-bold text-[#2B2B2B]">
          {evalType === 'online' ? <>평가 조건 <span className="text-[#FF595F]">*</span></> : '평가 조건 (선택)'}
        </span>
        <div className={`border rounded-[4px] ${guide.conditions.length >= 350 ? 'border-[#FF595F]' : 'border-[#DDDDDD] focus-within:border-[#9013FE]'}`}>
          {/* 툴바 */}
          <div className="flex items-center gap-1 px-2 pt-2 pb-1 border-b border-[#F0F0F0]">
            <button className="w-10 h-10 flex items-center justify-center rounded-[4px] hover:bg-gray-100">
              <List className="h-5 w-5 text-[#2B2B2B]" />
            </button>
            <button className="w-10 h-10 flex items-center justify-center rounded-[4px] hover:bg-gray-100">
              <ListOrdered className="h-5 w-5 text-[#2B2B2B]" />
            </button>
            <div className="w-px h-6 bg-[#F0F0F0] mx-1" />
            <button className="w-10 h-10 flex items-center justify-center rounded-[4px] hover:bg-gray-100">
              <Link className="h-5 w-5 text-[#2B2B2B]" />
            </button>
          </div>
          <div className="relative">
            <textarea
              value={guide.conditions}
              onChange={e => setGuide({ ...guide, conditions: e.target.value })}
              placeholder="평가 조건을 입력해 주세요."
              rows={6}
              className="w-full p-3 text-[16px] text-[#2B2B2B] focus:outline-none resize-none bg-transparent"
            />
            <span className={`absolute right-3 bottom-3 text-[12px] ${guide.conditions.length > 350 ? 'text-[#FF595F]' : 'text-[#808080]'}`}>
              {guide.conditions.length}/350
            </span>
          </div>
        </div>
        {guide.conditions.length > 350 && (
          <p className="text-[14px] text-[#FF595F]">평가 조건은 350자까지 입력할 수 있어요.</p>
        )}
      </div>

      {/* 온라인 전용: 평가 미리보기 버튼 */}
      {evalType === 'online' && (
        <button
          disabled
          className="w-full h-[52px] border border-[#DDDDDD] rounded-full flex items-center justify-center gap-2 text-[#AAAAAA] text-[16px] font-bold cursor-not-allowed"
        >
          <span>📋</span>
          평가 미리보기
        </button>
      )}

      {/* 덮어쓰기 확인 AlertDialog */}
      <AlertDialog open={showConfirmReplace} onOpenChange={setShowConfirmReplace}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기존 내용을 대체하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              기존 평가 설명 및 평가 조건이 AI 생성 결과로 대체됩니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowConfirmReplace(false); setShowAiPromptInput(true) }}>
              계속
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
