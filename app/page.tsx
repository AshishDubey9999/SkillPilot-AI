'use client'

import { useEffect, useState } from 'react'
import { AuthScreen } from '@/components/auth-screen'
import { Dashboard } from '@/components/dashboard'
import { authService, AuthUser } from '@/services/auth-service'

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(authService.getCurrentUser())
    setReady(true)
  }, [])

  if (!ready) return <div className="grid min-h-screen place-items-center bg-[#f7f8fc] text-sm text-slate-400">Loading SkillPilot AI...</div>
  return user ? <Dashboard user={user} onLogout={() => setUser(null)} /> : <AuthScreen onAuthenticated={setUser} />
}
