'use client'

import { useEffect, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Moon,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MySkillsPage } from '@/components/my-skills-page'
import { LearningRoadmapPage, ResourcesPage } from '@/components/learning-pages'
import { TargetRolePage } from '@/components/target-role-page'
import { NotesPage } from '@/components/notes-page'
import { ProjectsPage } from '@/components/projects-page'
import { AnalyticsPage } from '@/components/analytics-page'
import { InterviewSetup } from '@/components/interview-setup'
import { InterviewInterface } from '@/components/interview-interface'
import { InterviewResults } from '@/components/interview-results'
import { createInterviewSession, saveInterviewSession } from '@/services/interview-service'
import { InterviewConfig, InterviewSession } from '@/lib/interview-types'
import { DSAPage } from '@/components/dsa-page'
import { authService, AuthUser } from '@/services/auth-service'
import { getDSAStats, syncDSAProgress } from '@/services/dsa-service'
import { AIAnalyzerPage } from '@/components/ai-analyzer-page'
import { AICareerCoachPage } from '@/components/ai-career-coach-page'
import { ProfilePage } from '@/components/profile-page'
import { getDashboardData, updateDashboardTask, DashboardData } from '@/services/dashboard-service'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'My Profile', icon: Users },
  { label: 'My Skills', icon: Zap },
  { label: 'DSA Practice', icon: ClipboardCheck },
  { label: 'Target Role', icon: Target },
  { label: 'Learning Roadmap', icon: BookOpen },
  { label: 'Resources', icon: FolderKanban },
  { label: 'My Notes', icon: FileText },
  { label: 'Projects', icon: BriefcaseBusiness },
  { label: 'Progress & Analytics', icon: BarChart3 },
  { label: 'Job Analyzer', icon: Sparkles },
  { label: 'Resume Analyzer', icon: FileText },
  { label: 'AI Career Coach', icon: Sparkles },
  { label: 'Mock Interview', icon: Users },
]


export function Dashboard({ user, onLogout }: { user?: AuthUser; onLogout?: () => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dark, setDark] = useState(false)
  const [active, setActive] = useState('Dashboard')
  const [interviewSession, setInterviewSession] = useState<InterviewSession | null>(null)
  const [interviewCompleted, setInterviewCompleted] = useState(false)
  const [dsaStats, setDsaStats] = useState(() => user ? getDSAStats(user.id) : null)
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  useEffect(() => {
    if (!user) return
    void syncDSAProgress(user.id).then(() => setDsaStats(getDSAStats(user.id))).catch(() => setDsaStats(getDSAStats(user.id)))
    void getDashboardData(user.id).then(setDashboard).catch(() => setDashboard(null))
    const refresh = () => { setDsaStats(getDSAStats(user.id)); void getDashboardData(user.id).then(setDashboard).catch(() => {}) }
    window.addEventListener('dsa-progress-updated', refresh)
    window.addEventListener('skillsprint-dashboard-updated', refresh)
    return () => { window.removeEventListener('dsa-progress-updated', refresh); window.removeEventListener('skillsprint-dashboard-updated', refresh) }
  }, [user])
  const dashboardTasks = dashboard?.tasks ?? []
  const taskDone = dashboardTasks.filter(t => t.done).length
  const learningItems = (dashboard?.skills ?? []).filter((s:any) => Number(s.progress) < 80).sort((a:any,b:any)=>a.progress-b.progress).slice(0,5).map((s:any,i:number)=>({skill:s.name,topic:`${s.currentLevel} → ${s.targetLevel}`,progress:Number(s.progress),tone:['violet','amber','sky','emerald','rose'][i]}))
  const focusGap = dashboard?.gaps?.[0]
  const weeklyMax = Math.max(1, ...(dashboard?.weekly ?? []).map(d=>d.count))

  return (
    <div className={dark ? 'dark min-h-screen bg-background' : 'min-h-screen bg-background'}>
      <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.08),_transparent_32%),#f7f8fc] text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        {sidebarOpen && <button aria-label="Close menu" className="fixed inset-0 z-30 bg-slate-950/30 lg:hidden" onClick={() => setSidebarOpen(false)} />}
        <aside className={`fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col border-r border-slate-200 bg-white px-4 py-5 transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="mb-8 flex items-center justify-between px-2">
            <div className="flex items-center gap-2.5">
              <div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-sm"><Sparkles size={18} /></div>
              <div><p className="text-sm font-bold tracking-tight">SkillPilot AI</p><p className="text-[10px] font-medium text-slate-400">PLACEMENT TRACKER</p></div>
            </div>
            <button aria-label="Close sidebar" className="text-slate-400 lg:hidden" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
          </div>
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">Workspace</p>
          <nav className="flex flex-1 flex-col gap-1">
            {navItems.map(({ label, icon: Icon }) => <button key={label} onClick={() => { setActive(label); setSidebarOpen(false) }} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-colors ${active === label ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'}`}><Icon size={17} strokeWidth={active === label ? 2.2 : 1.8} />{label}</button>)}
          </nav>
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"><CircleHelp size={17} />Help center</button>
            <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"><Settings size={17} />Settings</button>
            <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800"><div className="grid size-8 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{user?.fullName?.split(' ').map(x=>x[0]).slice(0,2).join('') ?? 'U'}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.fullName ?? 'User'}</p><p className="truncate text-[10px] text-slate-400">{user?.email ?? 'Placement Candidate'}</p></div><button aria-label="Toggle theme" onClick={() => setDark(!dark)} className="text-slate-400 hover:text-indigo-600">{dark ? <Sun size={15} /> : <Moon size={15} />}</button><button onClick={() => { authService.signOutUser(); onLogout?.() }} className="ml-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-slate-500 hover:bg-rose-50 hover:text-rose-600" title="Sign out">Logout</button></div>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/85 px-5 shadow-[0_1px_20px_rgba(15,23,42,0.04)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:px-8"><div className="flex items-center gap-3"><button aria-label="Open menu" className="text-slate-500 lg:hidden" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><div><h1 className="text-lg font-bold tracking-tight sm:text-xl">Hello, {user?.fullName?.split(' ')[0] ?? 'there'} <span className="text-base">👋</span></h1><p className="hidden text-xs text-slate-500 sm:block">Let&apos;s make progress toward your placement goal.</p></div></div><div className="flex items-center gap-2 sm:gap-4"><div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400 md:flex dark:border-slate-700 dark:bg-slate-800"><Search size={15} /><span>Search anything...</span><kbd className="ml-8 rounded bg-white px-1.5 py-0.5 text-[10px] text-slate-400 dark:bg-slate-700">⌘ K</kbd></div><button aria-label="Search" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 md:hidden"><Search size={18} /></button><button aria-label="Notifications" className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><Bell size={18} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-indigo-500" /></button><div className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-bold text-white shadow-sm">{user?.fullName?.split(' ').map(x=>x[0]).slice(0,2).join('') ?? 'U'}</div></div></header>

          {active === 'My Profile' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><ProfilePage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /></div>
          ) : active === 'My Skills' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><MySkillsPage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /></div>
          ) : active === 'DSA Practice' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><DSAPage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /></div>
          ) : active === 'Target Role' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><TargetRolePage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /></div>
          ) : active === 'Learning Roadmap' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><LearningRoadmapPage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /></div>
          ) : active === 'Resources' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><ResourcesPage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /> </div>
          ) : active === 'My Notes' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><NotesPage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /></div>
          ) : active === 'Projects' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><ProjectsPage user={user ?? { id: 'guest', fullName: 'Guest', email: '' }} /></div>
          ) : active === 'Progress & Analytics' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><AnalyticsPage /></div>
          ) : active === 'Job Analyzer' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><AIAnalyzerPage user={user!} mode="job" /></div>
          ) : active === 'Resume Analyzer' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><AIAnalyzerPage user={user!} mode="resume" /></div>
          ) : active === 'AI Career Coach' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><AICareerCoachPage user={user!} /></div>
          ) : active === 'Mock Interview' ? (
            <div className="mx-auto max-w-[1500px] p-5 sm:p-8">
              {interviewCompleted && interviewSession ? (
                <InterviewResults
                  session={interviewSession}
                  onBackToDashboard={() => {
                    setInterviewSession(null)
                    setInterviewCompleted(false)
                    setActive('Dashboard')
                  }}
                />
              ) : interviewSession ? (
                <InterviewInterface
                  session={interviewSession}
                  onComplete={(completedSession) => {
                    setInterviewSession(completedSession)
                    setInterviewCompleted(true)
                  }}
                  onCancel={() => {
                    setInterviewSession(null)
                    setInterviewCompleted(false)
                    setActive('Dashboard')
                  }}
                />
              ) : (
                <InterviewSetup
                  onStart={async (config: InterviewConfig) => {
                    const newSession = await createInterviewSession(config)
                    saveInterviewSession(newSession)
                    setInterviewSession(newSession)
                  }}
                />
              )}
            </div>
          ) : (
          <div className="mx-auto max-w-[1500px] p-5 sm:p-8"><div className="mb-7 flex flex-wrap items-end justify-between gap-3"><div><div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"><Activity size={12} /> On track this week</div><h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Your placement dashboard</h2><p className="mt-1 text-sm text-slate-500">Keep the momentum going. You&apos;re closer than you think.</p></div><Button variant="outline" className="rounded-xl border-slate-200 bg-white text-xs font-semibold shadow-sm dark:border-slate-700 dark:bg-slate-900"><Plus data-icon="inline-start" />Add a goal</Button></div>

            <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-sm font-semibold">Placement readiness</p><p className="mt-1 text-xs text-slate-400">Your overall preparation score</p></div><button aria-label="More options" className="text-slate-400"><MoreHorizontal size={19} /></button></div><div className="flex flex-col items-center gap-6 sm:flex-row sm:gap-10"><div className="relative grid size-40 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(#6366f1 0 ${dashboard?.readiness ?? 0}%, #e9eaf3 ${dashboard?.readiness ?? 0}% 100%)` }}><div className="grid size-[124px] place-items-center rounded-full bg-white dark:bg-slate-900"><div className="text-center"><p className="text-4xl font-bold tracking-tight">{dashboard?.readiness ?? 0}<span className="text-xl">%</span></p><p className="text-[11px] font-medium text-slate-400">Overall score</p></div></div></div><div className="grid w-full grid-cols-2 gap-x-7 gap-y-5 sm:grid-cols-2"><Metric label="Technical skills" value={`${dashboard?.technical ?? 0}%`} color="bg-indigo-500" /> <Metric label="Projects" value={`${dashboard?.projects ?? 0}%`} color="bg-emerald-500" /> <Metric label="DSA" value={`${dashboard?.dsa ?? dsaStats?.progress ?? 0}%`} color="bg-amber-400" /> <Metric label="Interview" value={`${dashboard?.interview ?? 0}%`} color="bg-rose-400" /></div></div></section>
              <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-sm"><div className="relative z-10"><div className="mb-5 flex items-center gap-2 text-indigo-100"><div className="grid size-8 place-items-center rounded-lg bg-white/15"><Sparkles size={16} /></div><span className="text-xs font-semibold uppercase tracking-wider">Recommended next step</span></div><h3 className="max-w-[230px] text-2xl font-bold tracking-tight">Continue {focusGap?.skill ?? learningItems[0]?.skill ?? 'your next skill'}</h3><p className="mt-2 max-w-[290px] text-sm leading-relaxed text-indigo-100">{focusGap ? `${focusGap.skill} is currently one of your biggest skill gaps for ${dashboard?.targetRole ?? 'your selected role'}.` : 'Update your skills to get a personalized next step.'}</p><Button className="mt-6 rounded-xl border-0 bg-white text-indigo-700 hover:bg-indigo-50">Continue learning <ChevronRight data-icon="inline-end" /></Button></div><div className="absolute -bottom-12 -right-8 size-44 rounded-full border-[24px] border-white/10" /><div className="absolute -right-16 -top-16 size-48 rounded-full border-[32px] border-white/5" /></section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1.25fr_1fr]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Current learning</h3><p className="mt-1 text-xs text-slate-400">Pick up where you left off</p></div><button className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">View roadmap</button></div><div className="flex flex-col gap-4">{learningItems.map((item) => <div key={item.skill} className="group flex items-center gap-3"><div className={`grid size-9 shrink-0 place-items-center rounded-xl text-[11px] font-bold ${item.tone === 'violet' ? 'bg-violet-50 text-violet-600' : item.tone === 'amber' ? 'bg-amber-50 text-amber-600' : item.tone === 'sky' ? 'bg-sky-50 text-sky-600' : item.tone === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>{item.skill.slice(0, 2)}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><p className="truncate text-xs font-semibold">{item.skill} <span className="font-normal text-slate-400">— {item.topic}</span></p><span className="shrink-0 text-[11px] font-semibold text-slate-500">{item.progress}%</span></div><div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className={`h-full rounded-full ${item.tone === 'violet' ? 'bg-violet-500' : item.tone === 'amber' ? 'bg-amber-400' : item.tone === 'sky' ? 'bg-sky-500' : item.tone === 'emerald' ? 'bg-emerald-500' : 'bg-rose-400'}`} style={{ width: `${item.progress}%` }} /></div></div><button aria-label={`Continue ${item.skill}`} className="grid size-7 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-400 opacity-0 transition-opacity hover:border-indigo-200 hover:text-indigo-600 group-hover:opacity-100 dark:border-slate-700"><Play size={12} fill="currentColor" /></button></div>)}</div></section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Today&apos;s tasks</h3><p className="mt-1 text-xs text-slate-400">{taskDone} of {dashboardTasks.length} completed</p></div><div className="grid size-9 place-items-center rounded-full border-4 border-indigo-100 text-[10px] font-bold text-indigo-600" style={{ background: `conic-gradient(#6366f1 ${(taskDone / Math.max(1, dashboardTasks.length)) * 100}%, #eef0f6 0)` }}>{Math.round((taskDone / Math.max(1, dashboardTasks.length)) * 100)}%</div></div><div className="flex flex-col gap-3">{dashboardTasks.map((task) => <label key={task.id} className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"><input type="checkbox" checked={task.done} onChange={async () => { const next=!task.done; setDashboard(d => d ? {...d,tasks:d.tasks.map(t=>t.id===task.id?{...t,done:next}:t)} : d); if(user) { await updateDashboardTask(user.id,task.id,next); window.dispatchEvent(new Event('skillsprint-dashboard-updated')) } }} className="size-4 accent-indigo-600" /><span className={`min-w-0 flex-1 text-xs ${task.done ? 'text-slate-400 line-through' : 'font-medium text-slate-700 dark:text-slate-200'}`}>{task.label}<span className="mt-0.5 block text-[10px] text-slate-400 no-underline">{task.meta}</span></span><ChevronRight size={14} className="text-slate-300" /></label>)}</div></section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Skill gaps</h3><p className="mt-1 text-xs text-slate-400">Focus areas for your target role</p></div><Target size={17} className="text-indigo-500" /></div><div className="grid gap-3 sm:grid-cols-2">{(dashboard?.gaps ?? []).map((gap) => <div key={gap.skill} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800"><div className="flex items-center gap-2"><div className="grid size-7 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{gap.icon}</div><div><p className="text-xs font-semibold">{gap.skill}</p><p className="text-[10px] text-slate-400">{gap.from} <ChevronRight className="inline" size={10} /> {gap.to}</p></div></div><div className="mt-3 h-1 rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${gap.progress}%` }} /></div><button className="mt-2 text-[10px] font-semibold text-indigo-600">Improve skill <ChevronRight className="inline" size={11} /></button></div>)}</div></section>
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="mb-4 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Weekly progress</h3><p className="mt-1 text-xs text-slate-400">Learning activity this week</p></div><button className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800">This week⌄</button></div><div className="flex h-[145px] items-end justify-between gap-2 border-b border-slate-100 pb-0 pt-4 dark:border-slate-800">{(dashboard?.weekly ?? []).map((day, i) => <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><div className={`w-full max-w-7 rounded-t-md ${i === 5 ? 'bg-indigo-500' : 'bg-indigo-100 dark:bg-indigo-500/25'}`} style={{ height: `${Math.max(8, (day.count / weeklyMax) * 100)}%` }} /><span className="mb-[-20px] text-[10px] text-slate-400">{day.label}</span></div>)}</div><div className="mt-6 flex items-center gap-2 text-[10px] text-slate-400"><span className="size-2 rounded-full bg-indigo-500" /> {(dashboard?.weekly ?? []).reduce((sum,d)=>sum+d.count,0)} activity events this week <span className="ml-auto font-semibold text-indigo-500">Live from your activity</span></div></section>
            </div>

            <section className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:bg-slate-900 sm:p-6"><div className="mb-5 flex items-center justify-between"><div><h3 className="text-sm font-semibold">Recent activity</h3><p className="mt-1 text-xs text-slate-400">Your latest wins and milestones</p></div><button className="text-xs font-semibold text-indigo-600">View all activity</button></div><div className="grid gap-4 md:grid-cols-4">{(dashboard?.recentActivity ?? []).slice(0,4).map((item, i) => <div key={`${item.text}-${item.date}`} className="flex items-start gap-3"><div className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${i === 0 ? 'bg-violet-50 text-violet-600' : i === 1 ? 'bg-amber-50 text-amber-600' : i === 2 ? 'bg-sky-50 text-sky-600' : 'bg-emerald-50 text-emerald-600'}`}><ClipboardCheck size={15} /></div><div><p className="text-xs font-medium leading-relaxed">{item.text}</p><p className="mt-1 text-[10px] text-slate-400">{formatRelative(item.date)}</p></div></div>)}</div></section>
          </div>
          )}
          <footer className="border-t border-slate-200/80 bg-white/70 px-5 py-5 text-center dark:border-slate-800 dark:bg-slate-900/70 sm:px-8">
            <p className="text-xs text-slate-400">SkillPilot AI <span className="mx-1">•</span> AI-Powered Placement &amp; Career Platform</p>
            <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-300">Built by Ashish Dubey</p>
          </footer>
        </main>
      </div>
    </div>
  )
}

function formatRelative(iso: string) { const diff = Math.max(0, Date.now() - new Date(iso).getTime()); const days = Math.floor(diff / 86400000); if (days === 0) return 'Today'; if (days === 1) return 'Yesterday'; return `${days} days ago` }

function Metric({ label, value, color }: { label: string; value: string; color: string }) { return <div><div className="mb-1.5 flex items-center gap-2"><span className={`size-2 rounded-full ${color}`} /><span className="text-xs text-slate-500">{label}</span></div><p className="text-lg font-bold tracking-tight">{value}</p></div> }
