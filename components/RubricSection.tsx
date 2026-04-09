'use client'

import React, { useState, useRef } from 'react'
import { RubricItem, AchievementStandard } from '@/lib/types'
import { Loader2, Plus, Trash2 } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { parseRubricText } from '@/lib/rubric-parser'

interface RubricSectionProps {
  standard: AchievementStandard | null
  levelsReady: boolean
  rubric: RubricItem[]
  setRubric: (rubric: RubricItem[]) => void
}

export function RubricSection({ standard, levelsReady, rubric, setRubric }: RubricSectionProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [showConfirmReplace, setShowConfirmReplace] = useState(false)
  const [pendingAction, setPendingAction] = useState<'generate' | 'import' | 'paste' | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [pasteText, setPasteText] = useState('')
  const [showAiPromptInput, setShowAiPromptInput] = useState(false)
  const [showPasteDialog, setShowPasteDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [pasteError, setPasteError] = useState('')
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fillingItemId, setFillingItemId] = useState<string | null>(null)
  const [fillPrompts, setFillPrompts] = useState<Record<string, string>>({})
  const [generatingItemId, setGeneratingItemId] = useState<string | null>(null)

  const hasContent = rubric.some(item => item.name || item.levels.some(l => l.description))
  const hasFilledItem = rubric.some(item =>
    item.name.trim() &&
    item.levels.length >= 3 &&
    item.levels.every(l => l.description.trim())
  )

  const triggerAction = (action: 'generate' | 'import' | 'paste') => {
    if (hasContent) {
      setPendingAction(action)
      setShowConfirmReplace(true)
    } else {
      executeAction(action)
    }
  }

  const handleFillItem = async (itemId: string) => {
    const item = rubric.find(r => r.id === itemId)
    if (!item) return
    setGeneratingItemId(itemId)
    try {
      const res = await fetch('/api/generate-single-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          standard,
          existingRubric: rubric.filter(r => r.id !== itemId && r.name.trim()),
          itemName: item.name,
          prompt: fillPrompts[itemId] || '',
        }),
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      setRubric(rubric.map(r => r.id === itemId ? { ...data, id: itemId } : r))
      setFillingItemId(null)
      setFillPrompts(prev => { const next = { ...prev }; delete next[itemId]; return next })
    } catch (e) {
      console.error(e)
    } finally {
      setGeneratingItemId(null)
    }
  }

  const executeAction = (action: 'generate' | 'import' | 'paste') => {
    if (action === 'generate') setShowAiPromptInput(true)
    else if (action === 'import') setShowImageDialog(true)
    else if (action === 'paste') setShowPasteDialog(true)
  }

  const handleAiGenerate = async () => {
    if (!standard) return
    setIsGenerating(true)
    try {
      const res = await fetch('/api/generate-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ standard, prompt: aiPrompt })
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid response')
      setRubric(data)
      setShowAiPromptInput(false)
      setAiPrompt('')
    } catch (e) {
      console.error(e)
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePasteImport = () => {
    setPasteError('')
    console.log('[paste] raw:', JSON.stringify(pasteText))
    console.log('[paste] hasTab:', pasteText.includes('\t'))
    const parsed = parseRubricText(pasteText)
    console.log('[paste] parsed:', parsed)
    if (parsed) {
      setRubric(parsed)
      setShowPasteDialog(false)
      setPasteText('')
    } else {
      setPasteError('채점기준 형식을 인식하지 못했습니다. 직접 입력해 주세요.')
    }
  }

  const handleImageImport = async () => {
    if (!selectedImage) return
    setIsImporting(true)
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result as string
          // data:image/...;base64, 접두사 제거
          resolve(result.split(',')[1])
        }
        reader.onerror = reject
        reader.readAsDataURL(selectedImage)
      })
      const res = await fetch('/api/import-rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 })
      })
      if (!res.ok) throw new Error(`Server error: ${res.status}`)
      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) throw new Error('Invalid response')
      setRubric(data)
      setSelectedImage(null)
      setShowImageDialog(false)
    } catch (e) {
      console.error(e)
    } finally {
      setIsImporting(false)
    }
  }

  const updateName = (idx: number, name: string) => {
    const next = [...rubric]
    next[idx] = { ...next[idx], name }
    setRubric(next)
  }

  const updateDesc = (itemIdx: number, levelIdx: number, description: string) => {
    const next = [...rubric]
    next[itemIdx] = {
      ...next[itemIdx],
      levels: next[itemIdx].levels.map((l, i) => i === levelIdx ? { ...l, description } : l)
    }
    setRubric(next)
  }

  const updateScore = (itemIdx: number, levelIdx: number, score: number) => {
    const next = [...rubric]
    next[itemIdx] = {
      ...next[itemIdx],
      levels: next[itemIdx].levels.map((l, i) => i === levelIdx ? { ...l, score } : l)
    }
    setRubric(next)
  }

  const addItem = () => {
    if (rubric.length >= 5) return
    // 기존 첫 번째 항목의 배점 값을 그대로 복사 (빈 기술로)
    const templateLevels = (rubric[0]?.levels || [{ score: 5, description: '' }, { score: 3, description: '' }, { score: 1, description: '' }])
      .map(l => ({ score: l.score, description: '' }))
    setRubric([...rubric, { id: `${Date.now()}`, name: '', levels: templateLevels }])
  }

  const removeItem = (idx: number) => {
    if (rubric.length <= 3) return
    setRubric(rubric.filter((_, i) => i !== idx))
  }

  // 배점 추가/삭제는 각 항목별 독립 동작
  const addLevel = (itemIdx: number) => {
    const item = rubric[itemIdx]
    if (!item || item.levels.length >= 5) return
    const levels = item.levels
    const gap = levels.length >= 2
      ? levels[levels.length - 2].score - levels[levels.length - 1].score
      : 1
    const minScore = levels[levels.length - 1]?.score ?? 1
    const newScore = Math.max(minScore - gap, 0)
    const next = [...rubric]
    next[itemIdx] = { ...item, levels: [...levels, { score: newScore, description: '' }] }
    setRubric(next)
  }

  const removeLevel = (itemIdx: number, levelIdx: number) => {
    const item = rubric[itemIdx]
    if (!item || item.levels.length <= 3) return
    const next = [...rubric]
    next[itemIdx] = { ...item, levels: item.levels.filter((_, i) => i !== levelIdx) }
    setRubric(next)
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <span className="text-[14px] font-bold text-[#2B2B2B]">
          채점 기준 <span className="text-[#FF595F]">*</span> <span className="font-normal">(3-5개)</span>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => triggerAction('generate')}
            disabled={!levelsReady || isGenerating}
            className="flex items-center gap-2 bg-[#9013FE] text-white text-[14px] font-bold rounded-full px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#7B0FD9] transition-colors"
          >
            {isGenerating
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : <span>✦</span>
            }
            AI로 생성
          </button>
          <button
            onClick={() => triggerAction('import')}
            disabled={isGenerating || isImporting}
            className="flex items-center gap-1.5 border border-[#DDDDDD] text-[#2B2B2B] text-[14px] font-bold rounded-full px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            🖼 이미지로 불러오기
          </button>
          <button
            onClick={() => triggerAction('paste')}
            disabled={isGenerating || isImporting}
            className="flex items-center gap-1.5 border border-[#DDDDDD] text-[#2B2B2B] text-[14px] font-bold rounded-full px-4 py-2 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            📋 텍스트로 붙여넣기
          </button>
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
            placeholder="예: 실생활 사례를 포함해줘, 실험 관찰 내용 위주로"
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

      {/* 채점기준 항목들 */}
      {rubric.map((item, itemIdx) => (
        <div key={item.id} className="flex flex-col gap-2">
          <div className="border border-[#DDDDDD] rounded-[4px] overflow-hidden">
            <div className="flex">
              {/* 좌측 항목명 */}
              <div className="w-[128px] shrink-0 bg-[#F1F5F9] border-r border-[#DDDDDD] flex items-center justify-center p-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => updateName(itemIdx, e.target.value)}
                  placeholder="항목명"
                  className="w-full text-[14px] font-bold text-[#2B2B2B] text-center bg-transparent border-none outline-none placeholder:text-[#AAAAAA]"
                />
              </div>
              {/* 우측 배점/기술 행들 */}
              <div className="flex-1 flex flex-col">
                {item.levels.map((level, levelIdx) => (
                  <div key={levelIdx} className={`flex items-stretch ${levelIdx < item.levels.length - 1 ? 'border-b border-[#DDDDDD]' : ''}`}>
                    <div className="w-[54px] shrink-0 border-r border-[#DDDDDD] flex items-center justify-center p-2">
                      <input
                        type="number"
                        value={level.score}
                        onChange={e => updateScore(itemIdx, levelIdx, Number(e.target.value))}
                        className="w-full text-[14px] font-bold text-[#2B2B2B] text-center bg-transparent border-none outline-none"
                      />
                    </div>
                    <div className="flex-1 p-2">
                      <textarea
                        value={level.description}
                        onChange={e => updateDesc(itemIdx, levelIdx, e.target.value)}
                        placeholder="수준 기술"
                        rows={2}
                        className="w-full text-[14px] text-[#2B2B2B] bg-transparent border-none outline-none resize-none leading-[1.43] placeholder:text-[#AAAAAA]"
                      />
                    </div>
                    {item.levels.length >= 4 && (
                      <div className="w-10 shrink-0 flex items-center justify-center border-l border-[#DDDDDD]">
                        <button
                          onClick={() => removeLevel(itemIdx, levelIdx)}
                          className="text-[#AAAAAA] hover:text-[#FF595F] p-1"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* 배점 추가/삭제/AI채우기 */}
          <div className="flex items-center justify-between px-1">
            {item.levels.length < 5 && (
              <button
                onClick={() => addLevel(itemIdx)}
                className="flex items-center gap-1 text-[14px] font-bold text-[#2B2B2B]"
              >
                <Plus className="h-5 w-5" /> 배점 추가
              </button>
            )}
            <div className="flex items-center gap-3">
              {/* 빈 항목이고 다른 채워진 항목이 있을 때만 표시 */}
              {hasFilledItem && !item.name.trim() && !item.levels.some(l => l.description.trim()) && (
                <button
                  onClick={() => setFillingItemId(fillingItemId === item.id ? null : item.id)}
                  className="flex items-center gap-1 text-[14px] font-bold text-[#9013FE]"
                >
                  ✦ AI로 채우기
                </button>
              )}
              {rubric.length > 3 && (
                <>
                  <button
                    onClick={() => setRubric(rubric.map((r, i) => i === itemIdx
                      ? { ...r, name: '', levels: r.levels.map(l => ({ ...l, description: '' })) }
                      : r
                    ))}
                    className="flex items-center gap-1 text-[14px] font-bold text-[#808080] hover:text-[#2B2B2B]"
                  >
                    ◇ 전부 지우기
                  </button>
                  <button
                    onClick={() => removeItem(itemIdx)}
                    className="flex items-center gap-1 text-[14px] font-bold text-[#808080] hover:text-[#FF595F]"
                  >
                    <Trash2 className="h-4 w-4" /> 표 제거
                  </button>
                </>
              )}
            </div>
          </div>

          {/* AI로 채우기 인라인 프롬프트 */}
          {fillingItemId === item.id && (
            <div className="border border-[#9013FE] rounded-[8px] p-4 bg-[#F9F0FF] flex flex-col gap-3">
              <span className="text-[14px] font-bold text-[#2B2B2B]">추가 요청 사항 (선택)</span>
              <input
                type="text"
                value={fillPrompts[item.id] || ''}
                onChange={e => setFillPrompts(prev => ({ ...prev, [item.id]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && handleFillItem(item.id)}
                placeholder="예: 비판적 사고 위주로, 실생활 연결 포함해줘"
                className="border border-[#DDDDDD] rounded-[4px] px-3 py-2 text-[14px] w-full bg-white focus:outline-none focus:border-[#9013FE]"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => { setFillingItemId(null); setFillPrompts(prev => { const next = { ...prev }; delete next[item.id]; return next }) }}
                  className="text-[14px] text-[#808080] px-4 py-2 rounded-full hover:bg-white"
                >
                  취소
                </button>
                <button
                  onClick={() => handleFillItem(item.id)}
                  disabled={generatingItemId === item.id}
                  className="bg-[#9013FE] text-white text-[14px] font-bold rounded-full px-5 py-2 disabled:opacity-40 flex items-center gap-2"
                >
                  {generatingItemId === item.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  생성
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 채점기준 추가 */}
      {rubric.length < 5 && (
        <button
          onClick={addItem}
          className="flex items-center gap-2 border border-[#DDDDDD] rounded-full px-5 py-2 text-[14px] font-bold text-[#2B2B2B] hover:bg-gray-50 w-fit"
        >
          <Plus className="h-5 w-5" /> 채점 기준 추가
        </button>
      )}

      {/* 덮어쓰기 확인 AlertDialog */}
      <AlertDialog open={showConfirmReplace} onOpenChange={setShowConfirmReplace}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>기존 채점기준을 대체하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              기존 채점기준이 새로운 내용으로 대체됩니다. 계속하시겠습니까?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowConfirmReplace(false); if (pendingAction) executeAction(pendingAction) }}>
              계속
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 텍스트 붙여넣기 Dialog */}
      <Dialog open={showPasteDialog} onOpenChange={setShowPasteDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>텍스트로 붙여넣기</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-2">
            <p className="text-[14px] text-[#808080]">한글/엑셀 등에서 복사한 채점기준을 붙여넣어 주세요.</p>
            <textarea
              value={pasteText}
              onChange={e => { setPasteText(e.target.value); setPasteError('') }}
              onKeyDown={e => {
                if (e.key === 'Tab') {
                  e.preventDefault()
                  const el = e.currentTarget
                  const start = el.selectionStart
                  const end = el.selectionEnd
                  const next = pasteText.substring(0, start) + '\t' + pasteText.substring(end)
                  setPasteText(next)
                  // 커서 위치 복원
                  requestAnimationFrame(() => { el.selectionStart = el.selectionEnd = start + 1 })
                }
              }}
              placeholder={`예시 (줄바꿈형):\n작품이해\n3\n정확하게 파악하고 구체적으로 서술함\n2\n대체로 파악하였으나 부분적으로 부족함\n1\n파악이 미흡함`}
              className="border border-[#DDDDDD] rounded-[4px] p-3 text-[14px] font-mono min-h-[250px] w-full focus:outline-none focus:border-[#9013FE] resize-none"
            />
            {pasteError && <p className="text-[14px] text-[#FF595F]">{pasteError}</p>}
          </div>
          <DialogFooter>
            <button onClick={() => { setShowPasteDialog(false); setPasteText(''); setPasteError('') }} className="border border-[#DDDDDD] rounded-full px-5 py-2 text-[14px] font-bold text-[#2B2B2B] hover:bg-gray-50">취소</button>
            <button onClick={handlePasteImport} className="bg-[#9013FE] text-white text-[14px] font-bold rounded-full px-5 py-2 hover:bg-[#7B0FD9]">불러오기</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 이미지 불러오기 Dialog */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>이미지로 불러오기</DialogTitle>
          </DialogHeader>
          <div
            className="py-8 flex flex-col items-center justify-center border-2 border-dashed border-[#DDDDDD] rounded-[8px] bg-[#F8F8F8] gap-3 cursor-pointer hover:bg-[#F0F0F0] transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="text-[40px]">🖼</span>
            {selectedImage
              ? <p className="text-[14px] text-[#9013FE] font-bold">{selectedImage.name}</p>
              : <p className="text-[14px] text-[#808080]">채점기준 표가 포함된 이미지를 업로드하세요</p>
            }
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => setSelectedImage(e.target.files?.[0] || null)}
            />
          </div>
          <DialogFooter>
            <button onClick={() => { setShowImageDialog(false); setSelectedImage(null) }} className="border border-[#DDDDDD] rounded-full px-5 py-2 text-[14px] font-bold text-[#2B2B2B] hover:bg-gray-50">취소</button>
            <button onClick={handleImageImport} disabled={isImporting || !selectedImage} className="bg-[#9013FE] text-white text-[14px] font-bold rounded-full px-5 py-2 hover:bg-[#7B0FD9] flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
              {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
              인식하기
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
