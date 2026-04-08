'use client'

import React, { useState, useMemo } from 'react'
import { SchoolLevel, Curriculum, RubricItem, EvaluationGuide } from '@/lib/types'
import { SAMPLE_ACHIEVEMENT_STANDARDS } from '@/lib/sample-data'
import { RubricSection } from '@/components/RubricSection'
import { EvaluationSection } from '@/components/EvaluationSection'

type EvalType = 'online' | 'offline'

export default function DistributePage() {
  const [evalType, setEvalType] = useState<EvalType>('online')
  const [curriculum, setCurriculum] = useState<Curriculum>('2015')
  const [schoolLevel, setSchoolLevel] = useState<SchoolLevel>('' as SchoolLevel)
  const [subject, setSubject] = useState<string>('')
  const [selectedStandardCode, setSelectedStandardCode] = useState<string>('')
  const [directInput, setDirectInput] = useState(false)
  const [directInputText, setDirectInputText] = useState('')
  const [directLevels, setDirectLevels] = useState([
    { grade: 'A', description: '' },
    { grade: 'B', description: '' },
    { grade: 'C', description: '' },
  ])

  const [rubric, setRubric] = useState<RubricItem[]>([
    { id: 'default-1', name: '', levels: [{ score: 5, description: '' }, { score: 3, description: '' }, { score: 1, description: '' }] },
    { id: 'default-2', name: '', levels: [{ score: 5, description: '' }, { score: 3, description: '' }, { score: 1, description: '' }] },
    { id: 'default-3', name: '', levels: [{ score: 5, description: '' }, { score: 3, description: '' }, { score: 1, description: '' }] },
  ])

  const [guide, setGuide] = useState<EvaluationGuide>({ description: '', conditions: '' })
  const [evalName, setEvalName] = useState('')

  const filteredStandards = useMemo(() =>
    SAMPLE_ACHIEVEMENT_STANDARDS.filter(s =>
      s.curriculum === curriculum && s.schoolLevel === schoolLevel && s.subject === subject
    ), [curriculum, schoolLevel, subject])

  const selectedStandard = useMemo(() => {
    if (directInput && directInputText.trim()) {
      return {
        code: '',
        content: directInputText.trim(),
        schoolLevel,
        subject,
        curriculum,
        levels: [],
      }
    }
    return SAMPLE_ACHIEVEMENT_STANDARDS.find(s => s.code === selectedStandardCode) || null
  }, [directInput, directInputText, selectedStandardCode, schoolLevel, subject, curriculum])

  const subjects = useMemo(() => {
    const all = SAMPLE_ACHIEVEMENT_STANDARDS
      .filter(s => s.schoolLevel === schoolLevel && s.curriculum === curriculum)
      .map(s => s.subject)
    return [...new Set(all)]
  }, [schoolLevel, curriculum])

  const canProceed = useMemo(() => {
    const hasStandard = directInput ? directInputText.trim().length > 0 : !!selectedStandardCode
    const hasRubric = Array.isArray(rubric) && rubric.filter(item => item.name.trim()).length >= 3
    const hasEvalName = evalName.trim().length > 0 && evalName.length <= 40
    if (evalType === 'online') {
      return hasStandard && hasRubric && hasEvalName &&
        guide.description.trim().length > 0 && guide.description.length <= 200 &&
        guide.conditions.trim().length > 0 && guide.conditions.length <= 350
    }
    return hasStandard && hasRubric && hasEvalName
  }, [selectedStandardCode, rubric, evalName, evalType, guide])

  return (
    <div className="max-w-[912px] mx-auto py-6 pb-20 flex flex-col gap-6 px-4">

      {/* 제목 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold text-[#2B2B2B]" style={{ fontFamily: 'Noto Sans KR, Pretendard, sans-serif' }}>
          서·논술형 평가 배부
        </h1>
        <p className="text-[14px] text-[#808080]">평가와 배부 대상을 설정해 주세요.</p>
      </div>

      {/* 스텝 인디케이터 */}
      <div className="border border-[#DDDDDD] rounded-[8px] flex overflow-hidden">
        <div className="flex flex-1 items-center gap-3 p-3 bg-[#F5EEFF]">
          <div className="w-7 h-7 rounded-full border-2 border-[#9013FE] flex items-center justify-center shrink-0">
            <span className="text-[14px] font-bold text-[#9013FE]">1</span>
          </div>
          <span className="text-[14px] font-bold text-[#2B2B2B]">평가 계획 및 설정</span>
        </div>
        <div className="flex flex-1 items-center gap-3 p-3">
          <div className="w-7 h-7 rounded-full border-2 border-[#AAAAAA] flex items-center justify-center shrink-0">
            <span className="text-[14px] font-bold text-[#AAAAAA]">2</span>
          </div>
          <span className="text-[14px] font-bold text-[#808080]">배부 대상 선택</span>
        </div>
      </div>

      {/* 카드 1: 평가 정보 */}
      <div className="border border-[#DDDDDD] rounded-[8px] bg-white p-6 flex flex-col gap-8">

        {/* 평가 유형 */}
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold text-[#2B2B2B]">평가 유형</span>
          <div className="flex gap-3">
            <button
              onClick={() => setEvalType('online')}
              className={`flex-1 border rounded-[12px] p-3 text-left transition-colors ${evalType === 'online' ? 'border-[#6D28D9]' : 'border-[#E5E5E5]'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${evalType === 'online' ? 'border-[#9013FE]' : 'border-[#AAAAAA]'}`}>
                  {evalType === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-[#9013FE]" />}
                </div>
                <span className="text-[16px] font-medium text-[#2B2B2B]">온라인 평가</span>
              </div>
              <p className="text-[12px] text-[#808080] ml-7">학생이 클래스팅에서 직접 작성하고 제출합니다.</p>
            </button>
            <button
              onClick={() => setEvalType('offline')}
              className={`flex-1 border rounded-[12px] p-3 text-left transition-colors ${evalType === 'offline' ? 'border-[#6D28D9]' : 'border-[#E5E5E5]'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${evalType === 'offline' ? 'border-[#9013FE]' : 'border-[#AAAAAA]'}`}>
                  {evalType === 'offline' && <div className="w-2.5 h-2.5 rounded-full bg-[#9013FE]" />}
                </div>
                <span className="text-[16px] font-medium text-[#2B2B2B]">오프라인 평가 (종이 시험지 OCR 채점)</span>
              </div>
              <p className="text-[12px] text-[#808080] ml-7">종이로 시험을 진행한 후 답안을 스캔하여 제출합니다.</p>
            </button>
          </div>
        </div>

        {/* 교육과정 */}
        <div className="flex flex-col gap-2">
          <span className="text-[14px] font-bold text-[#2B2B2B]">교육과정</span>
          <div className="flex gap-8">
            {(['2015', '2022'] as Curriculum[]).map(c => (
              <button key={c} onClick={() => setCurriculum(c)} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${curriculum === c ? 'border-[#9013FE]' : 'border-[#AAAAAA]'}`}>
                  {curriculum === c && <div className="w-2.5 h-2.5 rounded-full bg-[#9013FE]" />}
                </div>
                <span className="text-[16px] font-medium text-[#2B2B2B]">{c}년 개정</span>
              </button>
            ))}
          </div>
        </div>

        {/* 학교급 + 과목 */}
        <div className="flex gap-6">
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-[14px] font-bold text-[#2B2B2B]">학교급</span>
            <div className="relative">
              <select
                value={schoolLevel}
                onChange={e => { setSchoolLevel(e.target.value as SchoolLevel); setSubject(''); setSelectedStandardCode('') }}
                className={`w-full border border-[#DDDDDD] rounded-[4px] p-3 text-[16px] font-bold bg-white appearance-none cursor-pointer ${schoolLevel ? 'text-[#2B2B2B]' : 'text-[#AAAAAA]'}`}
              >
                <option value="" disabled>학교급</option>
                <option value="elementary">초등학교</option>
                <option value="middle">중학교</option>
                <option value="high">고등학교</option>
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808080] pointer-events-none">▾</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <span className="text-[14px] font-bold text-[#2B2B2B]">과목</span>
            <div className={`relative ${!schoolLevel ? 'pointer-events-none' : ''}`}>
              <select
                value={subject}
                onChange={e => { setSubject(e.target.value); setSelectedStandardCode('') }}
                className={`w-full border border-[#DDDDDD] rounded-[4px] p-3 text-[16px] font-bold appearance-none ${!schoolLevel ? 'bg-[#F5F5F5] text-[#AAAAAA] cursor-not-allowed' : 'bg-white text-[#2B2B2B] cursor-pointer'}`}
              >
                <option value="" disabled>과목</option>
                {subjects.length > 0
                  ? subjects.map(s => <option key={s} value={s}>{s}</option>)
                  : ['국어', '사회', '과학', '도덕'].map(s => <option key={s} value={s}>{s}</option>)
                }
              </select>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808080] pointer-events-none">▾</span>
            </div>
          </div>
        </div>

        {/* 성취기준 */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-5">
              <span className="text-[14px] font-bold text-[#2B2B2B]">성취 기준 <span className="text-[#FF595F]">*</span></span>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => {
                    setDirectInput(!directInput)
                    setDirectInputText('')
                    setDirectLevels([
                      { grade: 'A', description: '' },
                      { grade: 'B', description: '' },
                      { grade: 'C', description: '' },
                    ])
                  }}
                  className={`w-5 h-5 border rounded-[4px] flex items-center justify-center cursor-pointer ${directInput ? 'bg-[#9013FE] border-[#9013FE]' : 'border-[#DDDDDD] bg-white'}`}
                >
                  {directInput && <span className="text-white text-[12px]">✓</span>}
                </div>
                <span className="text-[14px] text-[#2B2B2B]">직접 입력</span>
              </label>
            </div>
            {directInput ? (
              <input
                type="text"
                value={directInputText}
                onChange={e => setDirectInputText(e.target.value)}
                placeholder="성취기준을 직접 입력하세요"
                className="w-full border border-[#9013FE] rounded-[4px] px-3 py-3 text-[16px] text-[#2B2B2B] bg-white focus:outline-none"
                autoFocus
              />
            ) : (
              <div className={`relative ${!subject ? 'pointer-events-none' : ''}`}>
                <select
                  value={selectedStandardCode}
                  onChange={e => setSelectedStandardCode(e.target.value)}
                  className={`w-full border border-[#DDDDDD] rounded-[4px] px-3 py-3 text-[16px] font-bold appearance-none ${!subject ? 'bg-[#F5F5F5] text-[#AAAAAA] cursor-not-allowed' : 'bg-white text-[#2B2B2B] cursor-pointer'}`}
                >
                  <option value="">성취기준을 선택하세요</option>
                  {filteredStandards.map((s, i) => (
                    <option key={`${s.code}-${i}`} value={s.code}>{s.code} {s.content}</option>
                  ))}
                </select>
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#808080] pointer-events-none">▾</span>
              </div>
            )}
          </div>

          {/* A/B/C 성취수준 테이블 */}
          {directInput ? (
            <div className="flex flex-col gap-2">
              <div className="border border-[#DDDDDD] rounded-[4px] overflow-hidden">
                {directLevels.map((level, i) => (
                  <div key={level.grade} className={`flex items-stretch ${i < directLevels.length - 1 ? 'border-b border-[#DDDDDD]' : ''}`}>
                    <div className="w-[128px] shrink-0 bg-[#F1F5F9] border-r border-[#DDDDDD] flex items-center justify-center p-2">
                      <input
                        value={level.grade}
                        onChange={e => {
                          const next = [...directLevels]
                          next[i] = { ...next[i], grade: e.target.value }
                          setDirectLevels(next)
                        }}
                        className="w-full text-[14px] font-bold text-[#2B2B2B] text-center bg-transparent border-none outline-none"
                        maxLength={5}
                      />
                    </div>
                    <div className="flex-1 p-2">
                      <textarea
                        value={level.description}
                        onChange={e => {
                          const next = [...directLevels]
                          next[i] = { ...next[i], description: e.target.value }
                          setDirectLevels(next)
                        }}
                        placeholder={`${level.grade} 수준 기술을 입력하세요`}
                        rows={2}
                        className="w-full text-[14px] text-[#2B2B2B] bg-transparent border-none outline-none resize-none leading-[1.43] placeholder:text-[#AAAAAA]"
                      />
                    </div>
                    {directLevels.length > 3 && (
                      <button
                        onClick={() => setDirectLevels(directLevels.filter((_, j) => j !== i))}
                        className="px-3 text-[#AAAAAA] hover:text-[#FF595F] text-[18px]"
                      >×</button>
                    )}
                  </div>
                ))}
              </div>
              {directLevels.length < 5 && (
                <button
                  onClick={() => {
                    const grades = ['A', 'B', 'C', 'D', 'E']
                    setDirectLevels([...directLevels, { grade: grades[directLevels.length], description: '' }])
                  }}
                  className="flex items-center gap-1 text-[14px] font-bold text-[#2B2B2B] w-fit"
                >
                  <span className="text-[18px]">+</span> 수준 추가
                </button>
              )}
            </div>
          ) : selectedStandard && (
            <div className="border border-[#DDDDDD] rounded-[4px] overflow-hidden">
              {selectedStandard.levels.map((level, i) => (
                <div key={level.grade} className={`flex items-center ${i < selectedStandard.levels.length - 1 ? 'border-b border-[#DDDDDD]' : ''}`}>
                  <div className="w-[128px] shrink-0 bg-[#F1F5F9] border-r border-[#DDDDDD] flex items-center justify-center p-3 self-stretch">
                    <span className="text-[14px] font-bold text-[#2B2B2B] text-center">{level.grade}</span>
                  </div>
                  <div className="flex-1 p-3">
                    <p className="text-[14px] text-[#2B2B2B] leading-[1.43]">{level.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 채점기준 */}
        <RubricSection
          standard={selectedStandard}
          rubric={rubric}
          setRubric={setRubric}
        />
      </div>

      {/* 카드 2: 평가명/설명/조건 */}
      <EvaluationSection
        standard={selectedStandard}
        rubric={rubric}
        guide={guide}
        setGuide={setGuide}
        evalName={evalName}
        setEvalName={setEvalName}
        evalType={evalType}
      />

      {/* 다음 버튼 */}
      <button
        disabled={!canProceed}
        className={`w-full h-[52px] text-white text-[16px] font-bold rounded-full transition-colors ${canProceed ? 'bg-[#9013FE] hover:bg-[#7B0FD9] cursor-pointer' : 'bg-[#DDDDDD] cursor-not-allowed'}`}
      >
        다음
      </button>
    </div>
  )
}
