'use client'

import { useEffect, useMemo, useState } from 'react'
import { BarChart3, Flame, Target, TrendingUp } from 'lucide-react'
import { authService } from '@/services/auth-service'
import { getDSAStats } from '@/services/dsa-service'
import { getDashboardData, DashboardData } from '@/services/dashboard-service'

export function AnalyticsPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [dsa, setDsa] = useState<any>({progress:0,solved:0,attempted:0,remaining:0,streak:0,patternStats:[]})
  useEffect(() => {
    const user = authService.getCurrentUser(); if (!user) return
    void getDashboardData(user.id).then(setData).catch(()=>{})
    setDsa(getDSAStats(user.id))
    const refresh = () => { void getDashboardData(user.id).then(setData).catch(()=>{}); setDsa(getDSAStats(user.id)) }
    window.addEventListener('dsa-progress-updated', refresh); window.addEventListener('skillsprint-dashboard-updated', refresh)
    return () => { window.removeEventListener('dsa-progress-updated', refresh); window.removeEventListener('skillsprint-dashboard-updated', refresh) }
  }, [])
  const skillRows = useMemo(() => (data?.skills ?? []).slice().sort((a:any,b:any)=>b.progress-a.progress).slice(0,8), [data])
  const weeklyMax = Math.max(1, ...(data?.weekly ?? []).map(d=>d.count))
  const focus = data?.gaps?.[0]
  const metrics = [['Placement Readiness',data?.readiness ?? 0],['Technical Skills',data?.technical ?? 0],['Project Progress',data?.projects ?? 0],['Interview Score',data?.interview ?? 0]]
  return <div className="space-y-6">
    <div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"><BarChart3 size={12}/> Live insights</div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Progress & Analytics</h2><p className="mt-1 text-sm text-slate-500">Real progress from your skills, DSA, projects, learning activity and interviews.</p></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(([label,value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex items-center justify-between"><p className="text-xs font-semibold text-slate-500">{label}</p><TrendingUp size={16} className="text-indigo-500"/></div><p className="mt-3 text-3xl font-bold">{value}%</p><div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{width:`${value}%`}}/></div></div>)}</div>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold">Skill progress</h3><p className="mt-1 text-xs text-slate-500">Your highest and lowest current skill levels.</p><div className="mt-5 grid gap-4">{skillRows.map((skill:any)=><div key={skill.id}><div className="mb-1.5 flex justify-between text-xs"><span className="font-medium">{skill.name}</span><span className="font-semibold text-indigo-600">{skill.progress}%</span></div><div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{width:`${skill.progress}%`}}/></div></div>)}</div></section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><h3 className="font-semibold">Weekly activity</h3><p className="mt-1 text-xs text-slate-500">Events recorded from your actual learning activity.</p><div className="mt-6 flex h-40 items-end gap-2">{(data?.weekly ?? []).map(day=><div key={day.date} className="flex flex-1 flex-col items-center gap-2"><div className="w-full rounded-t-md bg-indigo-500 transition-all" style={{height:`${Math.max(8,(day.count/weeklyMax)*100)}%`}}/><span className="text-[10px] text-slate-400">{day.label}</span></div>)}</div></section>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[['Resources Completed',data?.resourcesCompleted ?? 0],['Roadmap Steps',data?.roadmapCompleted ?? 0],['Notes Created',data?.notesCount ?? 0],['Projects Completed',data?.completedProjects ?? 0],['Projects In Progress',data?.inProgressProjects ?? 0],['Learning Streak',`${dsa.streak} days`],['Problems Solved',data?.dsaSolved ?? dsa.solved]].map(([label,value])=><div key={String(label)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"><p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p></div>)}</div>
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">DSA Analytics</h3><p className="mt-1 text-xs text-slate-500">Live data from your DSA Practice progress.</p></div><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">{dsa.progress}% complete</span></div><div className="mt-5 grid gap-3 sm:grid-cols-4">{[['Solved',dsa.solved],['Attempted',dsa.attempted],['Remaining',dsa.remaining],['Streak',`${dsa.streak} days`]].map(([label,value])=><div key={String(label)} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>)}</div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{dsa.patternStats.slice(0,6).map((p:any)=><div key={p.id}><div className="mb-1 flex justify-between text-[11px]"><span>{p.name}</span><span className="font-semibold text-indigo-600">{p.progress}%</span></div><div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{width:`${p.progress}%`}}/></div></div>)}</div></section>
    <section className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-sm"><div className="flex items-start gap-3"><div className="grid size-9 place-items-center rounded-xl bg-white/15"><Target size={18}/></div><div><h3 className="font-bold">Current focus</h3><p className="mt-1 text-sm text-indigo-100">{focus ? `${focus.skill}: ${focus.progress}% progress toward ${focus.to}.` : 'Update your skills to generate personalized focus areas.'}</p><p className="mt-2 text-xs text-indigo-200">Target role: {data?.targetRole ?? 'Software Developer'}</p></div><div className="ml-auto flex items-center gap-1 text-sm"><Flame size={16}/> {dsa.streak} day streak</div></div></section>
  </div>
}
