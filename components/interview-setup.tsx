'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DifficultyLevel, InterviewConfig, InterviewType, QuestionNumber } from '@/lib/interview-types'
import { ChevronRight } from 'lucide-react'

interface InterviewSetupProps {
  onStart: (config: InterviewConfig) => void
}

export function InterviewSetup({ onStart }: InterviewSetupProps) {
  const [targetRole, setTargetRole] = useState('')
  const [interviewType, setInterviewType] = useState<InterviewType>('Technical')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Intermediate')
  const [numQuestions, setNumQuestions] = useState<QuestionNumber>(10)

  const handleStart = () => {
    if (!targetRole.trim()) {
      alert('Please enter a target role')
      return
    }

    const config: InterviewConfig = {
      targetRole: targetRole.trim(),
      interviewType,
      difficulty,
      numQuestions,
    }

    onStart(config)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-2 text-2xl font-bold tracking-tight">Set up your interview</h2>
        <p className="mb-8 text-sm text-slate-500">Configure your mock interview session. Questions will be dynamically generated based on your selections.</p>

        <div className="space-y-8">
          {/* Target Role */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">Target Role</label>
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g., Frontend Developer, Full Stack Engineer, DevOps Engineer"
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">Interview Type</label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(['Technical', 'HR', 'Behavioral', 'Mixed'] as InterviewType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setInterviewType(type)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                    interviewType === type
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">Difficulty Level</label>
            <div className="grid grid-cols-3 gap-3">
              {(['Beginner', 'Intermediate', 'Advanced'] as DifficultyLevel[]).map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                    difficulty === level
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Number of Questions */}
          <div>
            <label className="block text-sm font-semibold mb-3 text-slate-700 dark:text-slate-200">Number of Questions</label>
            <div className="grid grid-cols-3 gap-3">
              {([5, 10, 15] as QuestionNumber[]).map((num) => (
                <button
                  key={num}
                  onClick={() => setNumQuestions(num)}
                  className={`rounded-lg border-2 px-4 py-3 text-sm font-medium transition-all ${
                    numQuestions === num
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/15 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-indigo-50 p-4 dark:bg-indigo-500/10">
            <p className="text-xs leading-relaxed text-indigo-800 dark:text-indigo-300">
              <span className="font-semibold">Note:</span> Questions are dynamically generated based on your target role and interview type. Each answer will be evaluated on technical accuracy,
              relevance, completeness, and clarity. Your interview history is saved locally.
            </p>
          </div>

          {/* Start Button */}
          <Button onClick={handleStart} className="w-full rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
            Start Interview <ChevronRight data-icon="inline-end" size={16} />
          </Button>
        </div>
      </div>
    </div>
  )
}
