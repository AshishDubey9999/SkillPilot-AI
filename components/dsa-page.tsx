'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, CheckCircle2, Circle, ExternalLink, Flame, Search, Target, Trophy, X } from 'lucide-react'
import { dsaPatterns, DSAProblem } from '@/lib/dsa-data'
import { getDSAProgress, getDSAStats, saveDSANotes, updateDSAProgress, DSAStatus } from '@/services/dsa-service'
import { AuthUser } from '@/services/auth-service'

const difficultyTone: Record<string,string> = {
  Easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Medium: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Hard: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
}

export function DSAPage({ user }: { user: AuthUser }) {
  const [version, setVersion] = useState(0)
  const [patternId, setPatternId] = useState<string | null>(null)
  const [selected, setSelected] = useState<DSAProblem | null>(null)
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('All')
  const [status, setStatus] = useState('All')
  const stats = useMemo(() => getDSAStats(user.id), [user.id, version])
  const progress = useMemo(() => getDSAProgress(user.id), [user.id, version])
  const activePattern = dsaPatterns.find(p => p.id === patternId)

  const filteredProblems = useMemo(() => {
    const source = activePattern ? activePattern.problems : dsaPatterns.flatMap(p => p.problems)
    return source.filter(problem => {
      const matchesQuery = problem.title.toLowerCase().includes(query.toLowerCase())
      const matchesDifficulty = difficulty === 'All' || problem.difficulty === difficulty
      const currentStatus = progress[problem.id]?.status || 'not-started'
      const matchesStatus = status === 'All' || currentStatus === status
      return matchesQuery && matchesDifficulty && matchesStatus
    })
  }, [activePattern, query, difficulty, status, progress])

  const openProblem = (problem: DSAProblem) => setSelected(problem)
  const saveStatus = (problemId: string, next: DSAStatus) => {
    updateDSAProgress(user.id, problemId, next)
    setVersion(v => v + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"><Target size={12}/> Interview DSA</div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">DSA Practice</h2>
          <p className="mt-1 text-sm text-slate-500">Master interview-focused patterns with progress that stays connected to your account.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300"><Flame size={15}/> {stats.streak} day streak</div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['Overall Progress', `${stats.progress}%`],
          ['Solved', `${stats.solved}`],
          ['Attempted', `${stats.attempted}`],
          ['Remaining', `${stats.remaining}`],
          ['Patterns', `${stats.patternStats.filter(p => p.progress === 100).length}/${dsaPatterns.length}`],
        ].map(([label,value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold">{value}</p>
          </div>
        ))}
      </div>

      {!patternId ? (
        <>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-3 text-slate-400"/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search DSA problems..." className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"/></div>
              <select value={difficulty} onChange={e=>setDifficulty(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-800"><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select>
              <select value={status} onChange={e=>setStatus(e.target.value)} className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs dark:border-slate-700 dark:bg-slate-800"><option value="All">All status</option><option value="not-started">Not started</option><option value="attempted">Attempted</option><option value="solved">Solved</option><option value="revision">Need revision</option></select>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {stats.patternStats.map(pattern => (
                <button key={pattern.id} onClick={()=>setPatternId(pattern.id)} className="rounded-2xl border border-slate-100 p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:hover:border-indigo-500/40">
                  <div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{pattern.name}</p><p className="mt-1 text-xs text-slate-400">{pattern.description}</p></div><span className="text-xs font-bold text-indigo-600">{pattern.progress}%</span></div>
                  <div className="mt-4 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{width:`${pattern.progress}%`}}/></div>
                  <p className="mt-2 text-[10px] text-slate-400">{pattern.solvedCount} / {pattern.problems.length} solved</p>
                </button>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between"><div><h3 className="font-semibold">Problem Library</h3><p className="mt-1 text-xs text-slate-400">{filteredProblems.length} matching problems</p></div></div>
            <ProblemList problems={filteredProblems} progress={progress} onOpen={openProblem} />
          </section>
        </>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <button onClick={()=>setPatternId(null)} className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-indigo-600"><ArrowLeft size={14}/> All patterns</button>
          <div className="mb-5"><h3 className="text-xl font-bold">{activePattern?.name}</h3><p className="mt-1 text-sm text-slate-500">{activePattern?.description}</p></div>
          <ProblemList problems={filteredProblems} progress={progress} onOpen={openProblem}/>
        </section>
      )}

      {selected && <ProblemModal problem={selected} record={progress[selected.id]} onClose={()=>setSelected(null)} onSave={(next, notes)=>{ if(notes !== undefined) saveDSANotes(user.id, selected.id, notes); saveStatus(selected.id,next); setSelected(null)}}/>}
    </div>
  )
}

function ProblemList({ problems, progress, onOpen }: { problems: DSAProblem[], progress: Record<string, any>, onOpen: (p:DSAProblem)=>void }) {
  if (!problems.length) return <div className="rounded-xl bg-slate-50 p-8 text-center text-sm text-slate-400 dark:bg-slate-800/50">No problems match your filters.</div>
  return <div className="divide-y divide-slate-100 dark:divide-slate-800">{problems.map(problem => {
    const record = progress[problem.id]
    const current = record?.status || 'not-started'
    return <button key={problem.id} onClick={()=>onOpen(problem)} className="flex w-full items-center gap-3 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/40">
      <div className="shrink-0">{current === 'solved' ? <CheckCircle2 size={18} className="text-emerald-500"/> : <Circle size={18} className="text-slate-300"/>}</div>
      <div className="min-w-0 flex-1"><p className={`truncate text-xs font-semibold ${current==='solved'?'text-slate-400 line-through':''}`}>{problem.title}</p><p className="text-[10px] text-slate-400">{dsaPatterns.find(p=>p.id===problem.patternId)?.name}</p></div>
      <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${difficultyTone[problem.difficulty]}`}>{problem.difficulty}</span>
      <span className="hidden w-24 text-[10px] text-slate-400 sm:block">{current.replace('-', ' ')}</span>
    </button>
  })}</div>
}

function ProblemModal({ problem, record, onClose, onSave }: { problem: DSAProblem, record?: any, onClose:()=>void, onSave:(status:DSAStatus, notes?:string)=>void }) {
  const [nextStatus, setNextStatus] = useState<DSAStatus>(record?.status || 'attempted')
  const [notes, setNotes] = useState(record?.notes || '')
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${difficultyTone[problem.difficulty]}`}>{problem.difficulty}</span><span className="text-[10px] text-slate-400">{dsaPatterns.find(p=>p.id===problem.patternId)?.name}</span></div><h3 className="text-xl font-bold">{problem.title}</h3></div><button onClick={onClose} className="text-slate-400"><X size={18}/></button></div>
      <div className="mt-5 flex flex-wrap gap-2">{problem.links.map((url,i)=><a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Open Problem {problem.links.length>1?i+1:''}<ExternalLink size={13}/></a>)}</div>
      <div className="mt-6"><p className="mb-2 text-xs font-semibold">My Progress</p><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(['attempted','solved','revision','not-started'] as DSAStatus[]).map(s=><button key={s} onClick={()=>setNextStatus(s)} className={`rounded-xl border px-3 py-2 text-[11px] font-semibold capitalize ${nextStatus===s?'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300':'border-slate-200 text-slate-500 dark:border-slate-700'}`}>{s.replace('-', ' ')}</button>)}</div></div>
      <div className="mt-5"><p className="mb-2 text-xs font-semibold">My Notes</p><textarea value={notes} onChange={e=>setNotes(e.target.value)} rows={7} placeholder="Approach, mistake, complexity, revision points..." className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-800"/></div>
      <div className="mt-5 flex justify-end gap-2"><button onClick={onClose} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold dark:border-slate-700">Cancel</button><button onClick={()=>onSave(nextStatus,notes)} className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Save Progress</button></div>
    </div>
  </div>
}
