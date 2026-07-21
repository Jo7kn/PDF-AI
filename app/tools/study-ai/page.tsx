'use client'

import { useState } from 'react'
import {
  GraduationCap,
  ClipboardList,
  CircleHelp,
  Target,
  Loader2,
  AlertCircle,
  RotateCcw,
  Check,
  X,
} from 'lucide-react'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { SaveButton } from '@/components/save-button'
import { runStudyFlashcards, runStudyQuiz, runStudyTutor, runStudyPlan } from '@/app/actions/study-ai'
import type { Flashcard, QuizQuestion } from '@/lib/nvidia/study'
import { useLocale } from '@/lib/i18n/locale-context'

type StudyMode = 'flashcards' | 'quiz' | 'tutor' | 'plan'

export default function StudyAiPage() {
  const { t } = useLocale()
  const [mode, setMode] = useState<StudyMode>('flashcards')
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null)
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null)
  const [answer, setAnswer] = useState<string | null>(null)
  const [plan, setPlan] = useState<string | null>(null)

  const MODES: Array<{ key: StudyMode; label: string; icon: typeof GraduationCap; placeholder: string }> = [
    { key: 'flashcards', label: t('studyAiPage.modeFlashcards'), icon: ClipboardList, placeholder: t('studyAiPage.placeholderFlashcards') },
    { key: 'quiz', label: t('studyAiPage.modeQuiz'), icon: CircleHelp, placeholder: t('studyAiPage.placeholderQuiz') },
    { key: 'tutor', label: t('studyAiPage.modeTutor'), icon: GraduationCap, placeholder: t('studyAiPage.placeholderTutor') },
    { key: 'plan', label: t('studyAiPage.modePlan'), icon: Target, placeholder: t('studyAiPage.placeholderPlan') },
  ]

  const activeMode = MODES.find((m) => m.key === mode)!

  const resetOutputs = () => {
    setFlashcards(null)
    setQuiz(null)
    setAnswer(null)
    setPlan(null)
    setError(null)
  }

  const handleRun = async () => {
    if (!input.trim() || loading) return
    setLoading(true)
    resetOutputs()

    if (mode === 'flashcards') {
      const result = await runStudyFlashcards(input)
      if ('error' in result) setError(result.error)
      else setFlashcards(result.flashcards || [])
    } else if (mode === 'quiz') {
      const result = await runStudyQuiz(input)
      if ('error' in result) setError(result.error)
      else setQuiz(result.questions || [])
    } else if (mode === 'tutor') {
      const result = await runStudyTutor(input)
      if ('error' in result) setError(result.error)
      else setAnswer(result.answer || null)
    } else {
      const result = await runStudyPlan(input)
      if ('error' in result) setError(result.error)
      else setPlan(result.plan || null)
    }

    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_28%),linear-gradient(135deg,_#020617_0%,_#111827_45%,_#1e1b4b_100%)] text-white">
      <AppHeader
        icon={GraduationCap}
        title="Study AI"
        subtitle={t('studyAiPage.subtitle')}
        gradient="from-amber-400 to-yellow-500"
      />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => { setMode(m.key); setInput(''); resetOutputs() }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out active:scale-[0.97] ${
                mode === m.key
                  ? 'border-amber-400/40 bg-amber-400/15 text-amber-200'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <m.icon className="h-4 w-4" />
              {m.label}
            </button>
          ))}
        </div>

        <section className="mb-6 rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={activeMode.placeholder}
            rows={4}
            className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-100 placeholder-slate-600 focus:border-amber-400/50 focus:outline-none"
          />

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            onClick={handleRun}
            disabled={loading || !input.trim()}
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3 font-semibold text-white transition-colors duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin-fast" />
                {t('common.processing')}
              </>
            ) : (
              <>
                <activeMode.icon className="h-4 w-4" />
                {activeMode.label}
              </>
            )}
          </button>
        </section>

        {flashcards && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <SaveButton
                tool="study-ai"
                title={`Study AI · ${t('studyAiPage.modeFlashcards')} (${input.slice(0, 40)})`}
                content={flashcards.map((c) => `${t('studyAiPage.question')}: ${c.question}\n${t('studyAiPage.answer')}: ${c.answer}`).join('\n\n')}
                metadata={{ action: 'flashcards', count: flashcards.length }}
              />
            </div>
            <FlashcardsView cards={flashcards} />
          </div>
        )}
        {quiz && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <SaveButton
                tool="study-ai"
                title={`Study AI · ${t('studyAiPage.modeQuiz')} (${input.slice(0, 40)})`}
                content={quiz
                  .map((q, i) => `${i + 1}. ${q.question}\n${q.options.map((o, j) => `   ${String.fromCharCode(65 + j)}. ${o}`).join('\n')}\n${t('studyAiPage.correctAnswer')}: ${q.options[q.correctIndex]}\n${q.explanation}`)
                  .join('\n\n')}
                metadata={{ action: 'quiz', count: quiz.length }}
              />
            </div>
            <QuizView questions={quiz} />
          </div>
        )}
        {answer && (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-3 flex justify-end">
              <SaveButton tool="study-ai" title={`Study AI · ${t('studyAiPage.modeTutor')} (${input.slice(0, 40)})`} content={answer} metadata={{ action: 'tutor' }} />
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{answer}</div>
          </section>
        )}
        {plan && (
          <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <div className="mb-3 flex justify-end">
              <SaveButton tool="study-ai" title={`Study AI · ${t('studyAiPage.modePlan')} (${input.slice(0, 40)})`} content={plan} metadata={{ action: 'plan' }} />
            </div>
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{plan}</div>
          </section>
        )}
      </main>

      <AppFooter />
    </div>
  )
}

function FlashcardsView({ cards }: { cards: Flashcard[] }) {
  const { t } = useLocale()
  const [flipped, setFlipped] = useState<Set<number>>(new Set())

  const toggle = (i: number) => {
    setFlipped((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map((card, i) => (
        <button
          key={i}
          onClick={() => toggle(i)}
          className="min-h-[9rem] rounded-2xl border border-white/10 bg-slate-900/80 p-5 text-left shadow-xl shadow-black/20 transition-colors duration-150 ease-out hover:border-amber-400/30"
        >
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-amber-300">
            {flipped.has(i) ? t('studyAiPage.answer') : t('studyAiPage.question')} · {i + 1}/{cards.length}
          </p>
          <p className="text-sm text-slate-100">{flipped.has(i) ? card.answer : card.question}</p>
        </button>
      ))}
    </div>
  )
}

function QuizView({ questions }: { questions: QuizQuestion[] }) {
  const { t } = useLocale()
  const [selected, setSelected] = useState<Record<number, number>>({})

  const select = (qIndex: number, optIndex: number) => {
    if (selected[qIndex] !== undefined) return
    setSelected((prev) => ({ ...prev, [qIndex]: optIndex }))
  }

  const answered = Object.keys(selected).length
  const correct = questions.reduce((sum, q, i) => sum + (selected[i] === q.correctIndex ? 1 : 0), 0)

  return (
    <div className="space-y-4">
      {answered === questions.length && questions.length > 0 && (
        <div className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-200">
          {t('studyAiPage.score')}: {correct}/{questions.length}
        </div>
      )}
      {questions.map((q, qi) => {
        const userAnswer = selected[qi]
        const isAnswered = userAnswer !== undefined
        return (
          <div key={qi} className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 shadow-xl shadow-black/20">
            <p className="mb-4 font-medium text-white">{qi + 1}. {q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => {
                const isCorrect = oi === q.correctIndex
                const isSelected = oi === userAnswer
                let style = 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                if (isAnswered && isCorrect) style = 'border-emerald-400/40 bg-emerald-400/15 text-emerald-200'
                else if (isAnswered && isSelected && !isCorrect) style = 'border-red-400/40 bg-red-400/15 text-red-200'

                return (
                  <button
                    key={oi}
                    onClick={() => select(qi, oi)}
                    disabled={isAnswered}
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-colors duration-150 ease-out ${style} disabled:cursor-default`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <Check className="h-4 w-4 flex-shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <X className="h-4 w-4 flex-shrink-0" />}
                  </button>
                )
              })}
            </div>
            {isAnswered && (
              <p className="mt-3 text-sm text-slate-400">
                <RotateCcw className="mr-1 inline h-3.5 w-3.5" />
                {q.explanation}
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
