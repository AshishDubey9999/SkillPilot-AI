'use client'

import { useState, useEffect } from 'react'
import { Filter, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SkillCard } from '@/components/skill-card'
import { EditSkillModal } from '@/components/edit-skill-modal'
import { Skill, skillCategories } from '@/lib/skills-data'
import { getUserSkills, saveUserSkill } from '@/services/user-data-service'
import { AuthUser } from '@/services/auth-service'

export function MySkillsPage({ user }: { user: AuthUser }) {
  const [skills, setSkills] = useState<Skill[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let active = true
    void getUserSkills(user.id).then((data) => { if (active) setSkills(data) }).catch(() => { if (active) setSkills([]) })
    return () => { active = false }
  }, [user.id])

  const filteredSkills = selectedCategory === 'All' ? skills : skills.filter((s) => s.category === selectedCategory)

  const stats = {
    total: skills.length,
    strong: skills.filter((s) => s.progress >= 80).length,
    needsImprovement: skills.filter((s) => s.progress < 50).length,
    overall: Math.round(skills.reduce((sum, s) => sum + s.progress, 0) / skills.length),
  }

  const handleEditSkill = (skill: Skill) => {
    setEditingSkill(skill)
    setIsModalOpen(true)
  }

  const handleSaveSkill = (updatedSkill: Skill) => {
    setSkills((current) => current.map((s) => (s.id === updatedSkill.id ? updatedSkill : s)))
    void saveUserSkill(user.id, updatedSkill).catch(() => {})
    setIsModalOpen(false)
    setEditingSkill(null)
  }

  const handleAddSkill = () => {
    // This will open the modal for adding a new skill
    setEditingSkill(null)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400">
          <span className="size-2 rounded-full bg-indigo-500" />
          Skill Development
        </div>
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">My Skills</h2>
        <p className="mt-1 text-sm text-slate-500">Track your technical skills and identify areas that need improvement.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Overall Skill Progress</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stats.overall}%</p>
          <p className="mt-1 text-[10px] text-slate-400">Based on all skills</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Skills</p>
          <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{stats.total}</p>
          <p className="mt-1 text-[10px] text-slate-400">Being tracked</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Strong Skills</p>
          <p className="mt-2 text-3xl font-bold text-emerald-600 dark:text-emerald-400">{stats.strong}</p>
          <p className="mt-1 text-[10px] text-slate-400">80% or above</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Needs Improvement</p>
          <p className="mt-2 text-3xl font-bold text-rose-600 dark:text-rose-400">{stats.needsImprovement}</p>
          <p className="mt-1 text-[10px] text-slate-400">Below 50%</p>
        </div>
      </div>

      {/* Filter & Action Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCategory === 'All'
                ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                : 'border border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
            }`}
          >
            All
          </button>
          {skillCategories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                  : 'border border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <Button
          onClick={handleAddSkill}
          className="rounded-xl bg-indigo-600 text-xs font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          <Plus size={14} />
          Add Skill
        </Button>
      </div>

      {/* Skills Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredSkills.map((skill) => (
          <SkillCard key={skill.id} skill={skill} onEdit={handleEditSkill} />
        ))}
      </div>

      {/* Empty State */}
      {filteredSkills.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-800 dark:bg-slate-900">
          <Filter size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No skills in this category yet.</p>
          <Button
            onClick={() => setSelectedCategory('All')}
            variant="outline"
            className="mt-4 rounded-lg border-slate-200 text-xs dark:border-slate-700"
          >
            View all skills
          </Button>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && (
        <EditSkillModal
          skill={editingSkill}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingSkill(null)
          }}
          onSave={handleSaveSkill}
        />
      )}
    </div>
  )
}
