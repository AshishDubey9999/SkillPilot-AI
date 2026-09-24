'use client'

import { FormEvent, useState } from 'react'
import { ArrowRight, Check, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { authService, AuthUser } from '@/services/auth-service'

type AuthMode = 'signin' | 'register'

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<AuthMode>('signin')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [pending, setPending] = useState(false)

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode)
    setError('')
    setNotice('')
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (mode === 'register' && !fullName.trim()) return setError('Please enter your full name.')
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email address.')
    if (!password) return setError('Please enter your password.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (mode === 'register' && password !== confirmPassword) return setError('Passwords do not match.')
    setPending(true)
    try {
      const user = mode === 'register' ? await authService.registerUser(fullName, email, password) : await authService.signInUser(email, password, remember)
      onAuthenticated(user)
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  function forgotPassword() {
    if (!email.trim()) return setError('Enter your email first and we’ll send reset instructions.')
    setNotice('If an account exists for this email, reset instructions will be sent shortly.')
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.05fr_0.95fr]">
        <section className="hidden flex-col justify-between bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-800 p-10 text-white lg:flex xl:p-16">
          <div className="flex items-center gap-2.5"><div className="grid size-10 place-items-center rounded-xl bg-white/15"><Sparkles size={19} /></div><div><p className="text-sm font-bold tracking-tight">SkillPilot AI</p><p className="text-[10px] font-medium tracking-[0.18em] text-indigo-100">PLACEMENT TRACKER</p></div></div>
          <div className="max-w-lg"><p className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-100">Your next opportunity starts here</p><h1 className="text-5xl font-bold leading-[1.08] tracking-tight xl:text-6xl">Build skills.<br />Show progress.<br /><span className="text-indigo-200">Get placed.</span></h1><p className="mt-7 max-w-md text-base leading-7 text-indigo-100">A focused workspace to turn your learning momentum into placement readiness.</p><div className="mt-10 flex flex-col gap-4 text-sm text-indigo-50"><p className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white/15"><Check size={14} /></span>Track every skill and milestone</p><p className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white/15"><Check size={14} /></span>Practice with guided mock interviews</p><p className="flex items-center gap-3"><span className="grid size-6 place-items-center rounded-full bg-white/15"><Check size={14} /></span>Stay ready for your target role</p></div></div>
          <p className="text-xs text-indigo-200">Designed for consistent, measurable progress.</p>
        </section>
        <section className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-[430px]">
          <div className="mb-8 flex items-center gap-2.5 lg:hidden"><div className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white"><Sparkles size={17} /></div><div><p className="text-sm font-bold">SkillPilot AI</p><p className="text-[10px] font-medium tracking-wider text-slate-400">PLACEMENT TRACKER</p></div></div>
          <div className="mb-8"><h2 className="text-3xl font-bold tracking-tight">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</h2><p className="mt-2 text-sm text-slate-500">{mode === 'signin' ? 'Sign in to continue your placement journey.' : 'Start building your placement readiness today.'}</p></div>
          <div className="mb-7 grid grid-cols-2 rounded-xl bg-slate-100 p-1"><button onClick={() => switchMode('signin')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === 'signin' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>Sign In</button><button onClick={() => switchMode('register')} className={`rounded-lg py-2.5 text-sm font-semibold transition ${mode === 'register' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>Register</button></div>
          <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
            {mode === 'register' && <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">Full Name<div className="relative"><UserRound className="absolute left-3 top-3 text-slate-400" size={17} /><input value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Ashish Sharma" /></div></label>}
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">Email address<div className="relative"><Mail className="absolute left-3 top-3 text-slate-400" size={17} /><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="you@example.com" /></div></label>
            <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">Password<div className="relative"><LockKeyhole className="absolute left-3 top-3 text-slate-400" size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-10 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="At least 8 characters" /><button type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-400">{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {mode === 'register' && <label className="flex flex-col gap-2 text-xs font-semibold text-slate-700">Confirm Password<div className="relative"><LockKeyhole className="absolute left-3 top-3 text-slate-400" size={17} /><input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100" placeholder="Re-enter your password" /></div></label>}
            {mode === 'signin' && <div className="flex items-center justify-between text-xs"><label className="flex items-center gap-2 text-slate-500"><input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="size-4 accent-indigo-600" />Remember me</label><button type="button" onClick={forgotPassword} className="font-semibold text-indigo-600">Forgot password?</button></div>}
            {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">{error}</p>}{notice && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2.5 text-xs font-medium text-emerald-700">{notice}</p>}
            <Button type="submit" disabled={pending} className="mt-1 h-11 rounded-xl bg-indigo-600 text-sm font-semibold shadow-sm hover:bg-indigo-700">{pending ? 'Please wait...' : mode === 'signin' ? 'Sign in to SkillPilot AI' : 'Create account'}<ArrowRight data-icon="inline-end" /></Button>
          </form>
          <div className="mt-7 flex items-center justify-center gap-2 text-[11px] text-slate-400"><ShieldCheck size={14} /> Your account data stays private and secure</div>
        </div></section>
      </div>
      <footer className="border-t border-slate-200 bg-white px-5 py-4 text-center lg:hidden">
        <p className="text-xs font-semibold text-slate-500">Built by Ashish Dubey</p>
      </footer>
    </main>
  )
}
