'use client'

import { Edit2, TrendingUp } from 'lucide-react'
import { Skill } from '@/lib/skills-data'

const levelColors = {
  Beginner: { bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300' },
  Intermediate: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300' },
  Advanced: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
  Expert: { bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-300' },
}

const statusColors = {
  'Strong': 'text-emerald-600 dark:text-emerald-400',
  'On Track': 'text-indigo-600 dark:text-indigo-400',
  'Needs Improvement': 'text-rose-600 dark:text-rose-400',
}

export function SkillCard({ skill, onEdit }: { skill: Skill; onEdit: (skill: Skill) => void }) {
  const getStatus = () => {
    if (skill.progress >= 80) return 'Strong'
    if (skill.progress >= 50) return 'On Track'
    return 'Needs Improvement'
  }

  const getProgressBarColor = () => {
    const status = getStatus()
    if (status === 'Strong') return 'bg-emerald-500'
    if (status === 'On Track') return 'bg-indigo-500'
    return 'bg-rose-500'
  }

  const status = getStatus()
  const currentLevelColor = levelColors[skill.currentLevel]
  const targetLevelColor = levelColors[skill.targetLevel]

  return (
    <div className="group rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 sm:p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{skill.name}</h3>
          <p className="mt-1 text-xs text-slate-500">{skill.category}</p>
        </div>
        <button
          onClick={() => onEdit(skill)}
          className="ml-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-400 opacity-0 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 group-hover:opacity-100 dark:border-slate-700 dark:hover:border-indigo-600 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-400"
          aria-label="Edit skill"
        >
          <Edit2 size={14} />
        </button>
      </div>

      <div className="mb-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Progress</span>
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{skill.progress}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className={`h-full rounded-full transition-all ${getProgressBarColor()}`}
            style={{ width: `${skill.progress}%` }}
          />
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className={`rounded-lg ${currentLevelColor.bg} px-2.5 py-1.5`}>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Current</p>
          <p className={`text-xs font-semibold ${currentLevelColor.text}`}>{skill.currentLevel}</p>
        </div>
        <div className={`rounded-lg ${targetLevelColor.bg} px-2.5 py-1.5`}>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Target</p>
          <p className={`text-xs font-semibold ${targetLevelColor.text}`}>{skill.targetLevel}</p>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1.5">
        <TrendingUp size={13} className={statusColors[status]} />
        <span className={`text-[11px] font-semibold ${statusColors[status]}`}>{status}</span>
      </div>

      <p className="text-[10px] text-slate-400">Updated {skill.lastUpdated}</p>
    </div>
  )
}
