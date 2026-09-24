import { dsaPatterns } from '@/lib/dsa-data'
import { apiRequest, isApiEnabled } from './api-client'
import { authService } from './auth-service'

export type DSAStatus = 'not-started' | 'attempted' | 'solved' | 'revision'

export type DSAProgressRecord = {
  status: DSAStatus
  attempts: number
  notes: string
  lastAttempted?: string
  completedAt?: string
}

const key = (userId: string) => `skillsprint.dsa.${userId}`

let remoteCache: Record<string, Record<string, DSAProgressRecord>> = {}
export async function syncDSAProgress(userId: string) {
  if (!isApiEnabled() || typeof window === 'undefined') return getDSAProgress(userId)
  const token = authService.getCurrentUser()?.token
  if (!token) return getDSAProgress(userId)
  const result = await apiRequest<{ progress: Record<string, DSAProgressRecord> }>('/dsa/progress', { headers: { Authorization: `Bearer ${token}` } })
  remoteCache[userId] = result.progress
  localStorage.setItem(key(userId), JSON.stringify(result.progress))
  window.dispatchEvent(new Event('dsa-progress-updated'))
  return result.progress
}

export function getDSAProgress(userId: string): Record<string, DSAProgressRecord> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem(key(userId)) || '{}') } catch { return {} }
}

export function updateDSAProgress(userId: string, problemId: string, status: DSAStatus, notes?: string) {
  const current = getDSAProgress(userId)
  const old = current[problemId] || { status: 'not-started', attempts: 0, notes: '' }
  const now = new Date().toISOString()
  const next = {
    ...current,
    [problemId]: {
      ...old,
      status,
      attempts: old.attempts + 1,
      notes: notes ?? old.notes,
      lastAttempted: now,
      ...(status === 'solved' ? { completedAt: now } : {}),
    },
  }
  localStorage.setItem(key(userId), JSON.stringify(next))
  markActivity(userId, now)
  window.dispatchEvent(new Event('dsa-progress-updated'))
  if (isApiEnabled()) { const token = authService.getCurrentUser()?.token; if (token) void apiRequest(`/dsa/problems/${encodeURIComponent(problemId)}/progress`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ status, notes: notes ?? old.notes }) }).catch(() => {}) }
  return next
}

export function saveDSANotes(userId: string, problemId: string, notes: string) {
  const current = getDSAProgress(userId)
  current[problemId] = { ...(current[problemId] || { status: 'not-started', attempts: 0 }), notes }
  localStorage.setItem(key(userId), JSON.stringify(current))
  markActivity(userId)
  window.dispatchEvent(new Event('dsa-progress-updated'))
  if (isApiEnabled()) { const token = authService.getCurrentUser()?.token; if (token) void apiRequest(`/dsa/problems/${encodeURIComponent(problemId)}/notes`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ notes }) }).catch(() => {}) }
  return current
}

function markActivity(userId: string, iso = new Date().toISOString()) {
  const activityKey = `skillsprint.activity.${userId}`
  const dates: string[] = JSON.parse(localStorage.getItem(activityKey) || '[]')
  const day = iso.slice(0, 10)
  if (!dates.includes(day)) dates.push(day)
  localStorage.setItem(activityKey, JSON.stringify(dates))
  // Keep the legacy analytics key in sync for the existing dashboard.
  localStorage.setItem('activityDates', JSON.stringify(dates))
}

export function getDSAStats(userId: string) {
  const progress = getDSAProgress(userId)
  const problems = dsaPatterns.flatMap((pattern) => pattern.problems)
  const solved = problems.filter((p) => progress[p.id]?.status === 'solved').length
  const attempted = problems.filter((p) => {
    const status = progress[p.id]?.status
    return status === 'attempted' || status === 'solved' || status === 'revision'
  }).length
  const completed = problems.filter((p) => progress[p.id]?.status === 'solved')
  const byDifficulty = {
    Easy: completed.filter((p) => p.difficulty === 'Easy').length,
    Medium: completed.filter((p) => p.difficulty === 'Medium').length,
    Hard: completed.filter((p) => p.difficulty === 'Hard').length,
  }
  const patternStats = dsaPatterns.map((pattern) => {
    const solvedCount = pattern.problems.filter((p) => progress[p.id]?.status === 'solved').length
    return { ...pattern, solvedCount, progress: Math.round((solvedCount / pattern.problems.length) * 100) }
  })
  const dates: string[] = JSON.parse(localStorage.getItem(`skillsprint.activity.${userId}`) || '[]')
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 366; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    if (dates.includes(date.toISOString().slice(0, 10))) streak++
    else break
  }
  return { total: problems.length, solved, attempted, remaining: problems.length - solved, progress: problems.length ? Math.round((solved / problems.length) * 100) : 0, byDifficulty, patternStats, streak }
}
