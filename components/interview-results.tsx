'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { InterviewSession, InterviewSummary } from '@/lib/interview-types'
import { generateInterviewSummary } from '@/services/interview-service'
import { Download, ArrowLeft, TrendingUp } from 'lucide-react'

interface InterviewResultsProps {
  session: InterviewSession
  onBackToDashboard: () => void
}

export function InterviewResults({ session, onBackToDashboard }: InterviewResultsProps) {
  const [summary, setSummary] = useState<InterviewSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateSummary = async () => {
      const result = await generateInterviewSummary(session)
      setSummary(result)
      setIsLoading(false)
    }

    generateSummary()
  }, [session])

  if (isLoading || !summary) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <p className="text-slate-500">Analyzing your interview...</p>
      </div>
    )
  }

  const performanceColor =
    summary.overallPerformance >= 70 ? 'text-emerald-600' : summary.overallPerformance >= 50 ? 'text-amber-600' : 'text-rose-600'
  const performanceBg =
    summary.overallPerformance >= 70 ? 'bg-emerald-50' : summary.overallPerformance >= 50 ? 'bg-amber-50' : 'bg-rose-50'

  return (
    <div className="mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Button variant="outline" onClick={onBackToDashboard} className="mb-6 rounded-lg border-slate-200 text-xs dark:border-slate-700">
          <ArrowLeft data-icon="inline-start" size={16} />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold tracking-tight">Interview Complete!</h1>
        <p className="mt-2 text-slate-500">Here's your comprehensive feedback and analysis</p>
      </div>

      {/* Overall Performance */}
      <div className={`rounded-2xl border border-slate-200 ${performanceBg} p-8 shadow-sm dark:border-slate-800 mb-6`}>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-sm font-semibold uppercase tracking-wider ${performanceColor}`}>Overall Performance</p>
            <p className="mt-2 text-5xl font-bold tracking-tight text-slate-900 dark:text-white">{summary.overallPerformance}%</p>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              {summary.overallPerformance >= 70
                ? "Excellent work! You demonstrated strong understanding and communication skills."
                : summary.overallPerformance >= 50
                  ? "Good effort! There's room for improvement in specific areas. Review the feedback below."
                  : 'Keep practicing! Focus on the recommended topics to strengthen your interview skills.'}
            </p>
          </div>
          <TrendingUp size={40} className={performanceColor} />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Technical Performance</p>
          <div className="mt-3 flex items-end gap-4">
            <div className="text-4xl font-bold text-indigo-600">{summary.technicalPerformance}%</div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                <div className="h-full bg-indigo-500" style={{ width: `${summary.technicalPerformance}%` }} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Communication & Clarity</p>
          <div className="mt-3 flex items-end gap-4">
            <div className="text-4xl font-bold text-sky-600">{summary.communicationClarity}%</div>
            <div className="flex-1">
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-800">
                <div className="h-full bg-sky-500" style={{ width: `${summary.communicationClarity}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interview Session Info */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-4 font-semibold">Interview Session</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">Target Role</p>
            <p className="mt-1 font-semibold">{summary.config.targetRole}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Interview Type</p>
            <p className="mt-1 font-semibold">{summary.config.interviewType}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Duration</p>
            <p className="mt-1 font-semibold">{summary.totalTimeMinutes} minutes</p>
          </div>
        </div>
      </div>

      {/* Strong Areas */}
      {summary.strongAreas.length > 0 && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <h3 className="mb-4 font-semibold text-emerald-900 dark:text-emerald-300">Your Strengths</h3>
          <ul className="space-y-2">
            {summary.strongAreas.map((area, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-lg text-emerald-600">✓</span>
                <span className="text-emerald-900 dark:text-emerald-200">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weak Areas */}
      {summary.weakAreas.length > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-500/20 dark:bg-amber-500/10">
          <h3 className="mb-4 font-semibold text-amber-900 dark:text-amber-300">Areas for Improvement</h3>
          <ul className="space-y-2">
            {summary.weakAreas.map((area, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="text-lg text-amber-600">→</span>
                <span className="text-amber-900 dark:text-amber-200">{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Topics to Revise */}
      {summary.topicsToRevise.length > 0 && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 font-semibold">Topics to Revise</h3>
          <div className="flex flex-wrap gap-2">
            {summary.topicsToRevise.map((topic, i) => (
              <span key={i} className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                {topic}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Resources */}
      {summary.recommendedResources.length > 0 && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 font-semibold">Recommended Resources</h3>
          <div className="space-y-3">
            {summary.recommendedResources.map((resource, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                <div>
                  <p className="text-sm font-semibold">{resource.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {resource.type.charAt(0).toUpperCase() + resource.type.slice(1)} • {resource.topic}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg border-slate-200 text-xs dark:border-slate-700">
                  Learn
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={onBackToDashboard} className="flex-1 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700">
          Start Another Interview
        </Button>
        <Button variant="outline" className="rounded-lg border-slate-200 px-4 py-3 text-sm font-semibold dark:border-slate-700">
          <Download data-icon="inline-start" size={16} />
          Download Report
        </Button>
      </div>
    </div>
  )
}
