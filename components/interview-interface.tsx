'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { InterviewSession, InterviewQuestion, InterviewEvaluation } from '@/lib/interview-types'
import { generateInterviewQuestion, evaluateInterviewAnswer, saveInterviewSession } from '@/services/interview-service'
import { ChevronLeft, ChevronRight, Send, SkipForward } from 'lucide-react'

interface InterviewInterfaceProps {
  session: InterviewSession
  onComplete: (session: InterviewSession) => void
  onCancel: () => void
}

export function InterviewInterface({ session: initialSession, onComplete, onCancel }: InterviewInterfaceProps) {
  const [session, setSession] = useState(initialSession)
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [showEvaluation, setShowEvaluation] = useState(false)
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewEvaluation | null>(null)

  // Load next question if needed
  useEffect(() => {
    const loadNextQuestion = async () => {
      if (session.currentQuestionIndex >= session.config.numQuestions) {
        return
      }

      if (session.questions.length <= session.currentQuestionIndex) {
        const newQuestion = await generateInterviewQuestion(
          session.config,
          [],
          [],
          session.questions,
          session.currentQuestionIndex + 1
        )
        setSession((prev) => ({
          ...prev,
          questions: [...prev.questions, newQuestion],
        }))
      }
    }

    loadNextQuestion()
  }, [session.currentQuestionIndex, session.config, session.questions])

  const currentQuestion = session.questions[session.currentQuestionIndex]
  const isLastQuestion = session.currentQuestionIndex >= session.config.numQuestions - 1

  const handleSubmitAnswer = async () => {
    if (!currentQuestion || isEvaluating) return

    setIsEvaluating(true)

    // Add answer to session
    const answer = {
      questionId: currentQuestion.id,
      text: currentAnswer,
      submittedAt: new Date(),
      skipped: currentAnswer.trim().length === 0,
    }

    const updatedSession = {
      ...session,
      answers: [...session.answers, answer],
    }

    // Evaluate answer
    const evaluation = await evaluateInterviewAnswer(currentQuestion, currentAnswer, session.config.targetRole, currentQuestion.category)

    const finalSession = {
      ...updatedSession,
      evaluations: [...updatedSession.evaluations, evaluation],
    }

    setSession(finalSession)
    setCurrentEvaluation(evaluation)
    setShowEvaluation(true)
    setIsEvaluating(false)
  }

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      const completedSession = {
        ...session,
        currentQuestionIndex: session.config.numQuestions,
        isCompleted: true,
        completedAt: new Date(),
      }
      saveInterviewSession(completedSession)
      onComplete(completedSession)
    } else {
      setCurrentAnswer('')
      setShowEvaluation(false)
      setCurrentEvaluation(null)
      setSession((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1,
      }))
    }
  }

  if (!currentQuestion) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500">Loading question...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onCancel} className="rounded-lg border-slate-200 text-xs dark:border-slate-700">
            <ChevronLeft data-icon="inline-start" size={16} />
            Exit
          </Button>
          <div>
            <p className="text-xs font-semibold text-slate-500">Question {session.currentQuestionIndex + 1}</p>
            <p className="text-lg font-bold">of {session.config.numQuestions}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 mx-6">
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
            <div className="h-full bg-indigo-500 transition-all" style={{ width: `${((session.currentQuestionIndex + 1) / session.config.numQuestions) * 100}%` }} />
          </div>
        </div>

        {/* Interview Type Badge */}
        <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">{session.config.interviewType}</div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 mb-6">
        <div className="mb-4 flex items-start gap-3">
          <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
            Q{session.currentQuestionIndex + 1}
          </div>
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{currentQuestion.category}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                currentQuestion.difficulty === 'Beginner'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                  : currentQuestion.difficulty === 'Intermediate'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300'
                    : 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
              }`}>
                {currentQuestion.difficulty}
              </span>
            </div>
            <h3 className="text-lg font-semibold leading-relaxed">{currentQuestion.text}</h3>
          </div>
        </div>
      </div>

      {/* Answer Section */}
      {!showEvaluation ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label className="mb-4 block text-sm font-semibold text-slate-700 dark:text-slate-200">Your Answer</label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Share your answer here. You can provide a short response, detailed explanation, or examples..."
            rows={8}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
          <p className="mt-2 text-xs text-slate-400">{currentAnswer.length} characters</p>

          <div className="mt-6 flex gap-3">
            <Button
              onClick={handleSubmitAnswer}
              disabled={isEvaluating}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isEvaluating ? 'Evaluating...' : 'Submit Answer'} <Send data-icon="inline-end" size={16} />
            </Button>
            <Button
              onClick={() => {
                setCurrentAnswer('')
                handleNextQuestion()
              }}
              variant="outline"
              className="rounded-lg border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-700"
            >
              Skip <SkipForward data-icon="inline-end" size={16} />
            </Button>
          </div>
        </div>
      ) : currentEvaluation ? (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold">Evaluation Results</h3>
              <div className="text-center">
                <p className="text-xs font-semibold text-slate-500 uppercase">Overall Score</p>
                <p className="text-4xl font-bold text-indigo-600">{currentEvaluation.overallScore}</p>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Technical Accuracy</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentEvaluation.criteria.technicalAccuracy}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                  <div className="h-full bg-indigo-500" style={{ width: `${currentEvaluation.criteria.technicalAccuracy}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Relevance</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentEvaluation.criteria.relevance}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                  <div className="h-full bg-emerald-500" style={{ width: `${currentEvaluation.criteria.relevance}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Completeness</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentEvaluation.criteria.completeness}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                  <div className="h-full bg-amber-500" style={{ width: `${currentEvaluation.criteria.completeness}%` }} />
                </div>
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">Clarity</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{currentEvaluation.criteria.clarity}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                  <div className="h-full bg-sky-500" style={{ width: `${currentEvaluation.criteria.clarity}%` }} />
                </div>
              </div>
            </div>

            {/* Feedback */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-500/10">
              <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-300">{currentEvaluation.feedback}</p>
            </div>
          </div>

          {/* Strengths & Improvements */}
          <div className="grid gap-6 sm:grid-cols-2">
            {currentEvaluation.strengths.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h4 className="mb-3 font-semibold text-emerald-700 dark:text-emerald-300">What Went Well</h4>
                <ul className="space-y-2">
                  {currentEvaluation.strengths.map((strength, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-emerald-600">✓</span>
                      <span className="text-slate-700 dark:text-slate-300">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {currentEvaluation.improvements.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h4 className="mb-3 font-semibold text-amber-700 dark:text-amber-300">Could Be Improved</h4>
                <ul className="space-y-2">
                  {currentEvaluation.improvements.map((improvement, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="text-amber-600">→</span>
                      <span className="text-slate-700 dark:text-slate-300">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Better Approach */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <h4 className="mb-2 font-semibold">Better Approach</h4>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{currentEvaluation.betterApproach}</p>
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNextQuestion}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            {isLastQuestion ? 'View Results' : 'Next Question'} <ChevronRight data-icon="inline-end" size={16} />
          </Button>
        </div>
      ) : null}
    </div>
  )
}
