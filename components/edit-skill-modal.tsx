'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skill, skillCategories } from '@/lib/skills-data'

const levelOptions = ['Beginner', 'Intermediate', 'Advanced', 'Expert'] as const

export function EditSkillModal({
  skill,
  isOpen,
  onClose,
  onSave,
}: {
  skill: Skill | null
  isOpen: boolean
  onClose: () => void
  onSave: (skill: Skill) => void
}) {
  const [formData, setFormData] = useState<Skill | null>(null)

  useEffect(() => {
    if (skill) {
      setFormData(skill)
    } else {
      setFormData({
        id: `skill-${Date.now()}`,
        name: '',
        category: skillCategories[0],
        progress: 0,
        currentLevel: 'Beginner',
        targetLevel: 'Intermediate',
        lastUpdated: 'now',
      })
    }
  }, [skill, isOpen])

  if (!isOpen || !formData) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name.trim()) {
      onSave({
        ...formData,
        lastUpdated: 'today',
      })
    }
  }

  const handleChange = (field: keyof Skill, value: any) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {skill ? 'Edit Skill' : 'Add New Skill'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Skill Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Skill Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g., React.js"
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {skillCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Progress */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Progress: {formData.progress}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => handleChange('progress', parseInt(e.target.value))}
              className="mt-2 w-full"
            />
            <div className="mt-1 flex justify-between text-[10px] text-slate-400">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Current Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Current Level
            </label>
            <select
              value={formData.currentLevel}
              onChange={(e) => handleChange('currentLevel', e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Target Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Target Level
            </label>
            <select
              value={formData.targetLevel}
              onChange={(e) => handleChange('targetLevel', e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 border-t border-slate-200 pt-5 dark:border-slate-800">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-lg border-slate-200 text-xs font-semibold dark:border-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 rounded-lg bg-indigo-600 text-xs font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Save Skill
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}
