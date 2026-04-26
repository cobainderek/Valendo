'use client'

import { useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import type { QuestionInfo, AnswerResponse } from '@/services/rooms'

interface QuestionCardProps {
  question: QuestionInfo
  questionNumber: number
  totalQuestions: number
  onAnswer: (questionId: string, answer: string) => Promise<AnswerResponse>
  onNext: () => void
}

export function QuestionCard({ question, questionNumber, totalQuestions, onAnswer, onNext }: QuestionCardProps) {
  const [selecionada, setSelecionada] = useState<string | null>(null)
  const [resultado, setResultado] = useState<AnswerResponse | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSelect(option: string) {
    if (resultado || enviando) return
    setSelecionada(option)
    setEnviando(true)
    try {
      const res = await onAnswer(question.id, option)
      setResultado(res)
    } catch {
      setSelecionada(null)
    } finally {
      setEnviando(false)
    }
  }

  function getOptionStyle(option: string) {
    const base: React.CSSProperties = {
      width: '100%',
      textAlign: 'left' as const,
      padding: '14px 16px',
      border: '2.5px solid var(--ink)',
      borderRadius: 12,
      background: 'var(--bg-card)',
      fontWeight: 800,
      fontSize: 14,
      cursor: resultado ? 'default' : 'pointer',
      transition: 'all 0.15s ease',
      font: 'inherit',
    }

    if (!resultado) {
      if (option === selecionada) {
        return { ...base, background: 'var(--primary-soft)', borderColor: 'var(--primary)' }
      }
      return base
    }

    if (option === resultado.correctAnswer) {
      return { ...base, background: '#e8f8ee', borderColor: 'var(--green)', boxShadow: '2px 2px 0 var(--ink)' }
    }
    if (option === selecionada && !resultado.isCorrect) {
      return { ...base, background: '#fde8e8', borderColor: 'var(--red)' }
    }
    return { ...base, opacity: 0.5 }
  }

  const isLast = questionNumber >= totalQuestions

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="chip" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
          Pergunta {questionNumber} de {totalQuestions}
        </span>
        {resultado && (
          <span
            className="chip"
            style={{
              borderColor: resultado.isCorrect ? 'var(--green)' : 'var(--red)',
              color: resultado.isCorrect ? 'var(--green)' : 'var(--red)',
              background: resultado.isCorrect ? '#e8f8ee' : '#fde8e8',
            }}
          >
            {resultado.isCorrect ? `+${resultado.xpEarned} XP` : `+${resultado.xpEarned} XP`}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ height: 6, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${(questionNumber / totalQuestions) * 100}%`, background: 'var(--primary)', borderRadius: 999, transition: 'width 0.3s ease' }} />
      </div>

      {/* Question text */}
      <div className="doodle-card" style={{ padding: 20 }}>
        <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 18, margin: 0, lineHeight: 1.4 }}>
          {question.text}
        </p>
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {(question.options as string[]).map((option, i) => (
          <button
            key={i}
            type="button"
            style={getOptionStyle(option)}
            onClick={() => handleSelect(option)}
            disabled={!!resultado || enviando}
          >
            <span style={{ marginRight: 10, color: 'var(--muted)' }}>{String.fromCharCode(65 + i)}.</span>
            {option}
            {resultado && option === resultado.correctAnswer && (
              <span style={{ float: 'right', color: 'var(--green)' }}>✓</span>
            )}
            {resultado && option === selecionada && !resultado.isCorrect && option !== resultado.correctAnswer && (
              <span style={{ float: 'right', color: 'var(--red)' }}>✗</span>
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {resultado && resultado.explanationAi && (
        <div className="doodle-card" style={{ padding: '14px 18px', background: 'var(--bg-cream)' }}>
          <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--muted)', margin: 0 }}>
            <DoodleIcon name="book" size={14} /> {resultado.explanationAi}
          </p>
        </div>
      )}

      {/* Next button */}
      {resultado && (
        <button
          className="btn btn-primary"
          style={{ width: '100%', fontSize: 16, padding: '14px 20px' }}
          onClick={onNext}
        >
          {isLast ? 'Ver resultado' : 'Próxima pergunta'}
          <DoodleIcon name="play" size={16} />
        </button>
      )}
    </div>
  )
}
