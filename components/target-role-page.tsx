'use client'

import { useEffect, useMemo, useState } from 'react'
import { Check, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AuthUser } from '@/services/auth-service'
import { getTargetRole, getUserSkills, saveTargetRole } from '@/services/user-data-service'
import { Skill } from '@/lib/skills-data'

const roles: Record<string, string[]> = {
  'Software Developer': ['C++','DSA','OOP','DBMS','Operating Systems','Computer Networks','Git','Projects','Interview Skills'],
  'Frontend Developer': ['HTML','CSS','JavaScript','React.js','Git','Projects','Interview Skills'],
  'Backend Developer': ['JavaScript','Node.js','Express.js','SQL','MongoDB','Git','Projects','Interview Skills'],
  'Full Stack Developer': ['HTML','CSS','JavaScript','React.js','Node.js','Express.js','MongoDB','Git','Projects'],
  'AI/ML Engineer': ['Python','Machine Learning','Deep Learning','NLP','SQL','Git','Projects','Interview Skills'],
  'Data Analyst': ['Python','SQL','Statistics','Excel','Data Visualization','Projects','Interview Skills'],
  'Data Scientist': ['Python','Statistics','Machine Learning','SQL','Deep Learning','Projects','Interview Skills'],
}

export function TargetRolePage({ user }: { user: AuthUser }) {
  const [role, setRole] = useState('Software Developer')
  const [skills, setSkills] = useState<Skill[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void Promise.all([getTargetRole(user.id), getUserSkills(user.id)]).then(([r,s]) => { setRole(r); setSkills(s) })
  }, [user.id])

  const required = roles[role] || roles['Software Developer']
  const details = useMemo(() => required.map(name => {
    const skill = skills.find(s => s.name.toLowerCase() === name.toLowerCase())
    return { name, progress: skill?.progress ?? 0, found: Boolean(skill) }
  }), [required, skills])
  const match = Math.round(details.reduce((sum,s) => sum + s.progress,0) / Math.max(details.length,1))

  const choose = async (next: string) => {
    setRole(next); setSaving(true)
    try { await saveTargetRole(user.id, next); window.dispatchEvent(new Event('target-role-updated')) } finally { setSaving(false) }
  }

  return <section className="space-y-6">
    <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"><Target size={12}/> Career Direction</div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Target Role</h2><p className="mt-1 text-sm text-slate-500">Choose the role you are preparing for. Your skill gaps and roadmap use this selection.</p></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Object.keys(roles).map(r => <button key={r} onClick={() => choose(r)} className={`rounded-2xl border p-4 text-left transition ${role===r?'border-indigo-300 bg-indigo-50 shadow-sm dark:border-indigo-500/50 dark:bg-indigo-500/10':'border-slate-200 bg-white hover:border-indigo-200 dark:border-slate-800 dark:bg-slate-900'}`}><div className="flex items-start justify-between gap-2"><div><p className="font-semibold">{r}</p><p className="mt-1 text-xs text-slate-500">{roles[r].length} core skills</p></div>{role===r&&<Check size={18} className="text-indigo-600"/>}</div></button>)}</div>
    <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs font-semibold text-slate-500">Current target role</p><h3 className="mt-2 text-2xl font-bold">{role}</h3><div className="mt-6 flex items-center gap-4"><div className="grid size-24 place-items-center rounded-full" style={{background:`conic-gradient(#6366f1 ${match}%, #eef0f6 ${match}% 100%)`}}><div className="grid size-18 place-items-center rounded-full bg-white text-xl font-bold dark:bg-slate-900">{match}%</div></div><div><p className="font-semibold">Skill match</p><p className="mt-1 text-xs leading-relaxed text-slate-500">Calculated from your saved skills and their current progress.</p></div></div>{saving&&<p className="mt-4 text-xs text-indigo-600">Saving target role…</p>}</section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><div><h3 className="font-semibold">Required skills & gaps</h3><p className="mt-1 text-xs text-slate-500">Live comparison with your profile.</p></div><TrendingUp size={18} className="text-indigo-500"/></div><div className="mt-5 space-y-4">{details.map(s=><div key={s.name}><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">{s.name}</span><span className="font-semibold text-indigo-600">{s.progress}%</span></div><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{width:`${s.progress}%`}}/></div><p className="mt-1 text-[10px] text-slate-400">{s.found ? (s.progress >= 70 ? 'Strong' : s.progress >= 40 ? 'Developing' : 'Needs improvement') : 'Not added to My Skills yet'}</p></div>)}</div></section>
    </div>
  </section>
}
