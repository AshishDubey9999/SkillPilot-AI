import { apiRequest, isApiEnabled } from './api-client'

export type AuthUser = { id: string; fullName: string; email: string; token?: string }
type StoredUser = AuthUser & { passwordHash: string }
const USERS_KEY = 'skillsprint.users'
const SESSION_KEY = 'skillsprint.session'

function readUsers(): StoredUser[] { if (typeof window === 'undefined') return []; try { return JSON.parse(window.localStorage.getItem(USERS_KEY) ?? '[]') } catch { return [] } }
async function hashPassword(password: string) { const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password)); return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2,'0')).join('') }
function saveSession(user: AuthUser, remember = true) { const storage = remember ? window.localStorage : window.sessionStorage; storage.setItem(SESSION_KEY, JSON.stringify(user)) }

export async function registerUser(fullName: string, email: string, password: string): Promise<AuthUser> {
  if (isApiEnabled()) { const result = await apiRequest<{user: AuthUser; token: string}>('/auth/register', { method: 'POST', body: JSON.stringify({ fullName, email, password }) }); const user = { ...result.user, token: result.token }; saveSession(user, true); return user }
  const normalizedEmail = email.trim().toLowerCase(), users = readUsers(); if (users.some(u => u.email === normalizedEmail)) throw new Error('An account with this email already exists.')
  const user: StoredUser = { id: crypto.randomUUID(), fullName: fullName.trim(), email: normalizedEmail, passwordHash: await hashPassword(password) }; window.localStorage.setItem(USERS_KEY, JSON.stringify([...users, user])); const { passwordHash: _, ...publicUser } = user; saveSession(publicUser, true); return publicUser
}

export async function signInUser(email: string, password: string, remember: boolean): Promise<AuthUser> {
  if (isApiEnabled()) { const result = await apiRequest<{user: AuthUser; token: string}>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }); const user = { ...result.user, token: result.token }; saveSession(user, remember); return user }
  const user = readUsers().find(candidate => candidate.email === email.trim().toLowerCase()); if (!user || user.passwordHash !== await hashPassword(password)) throw new Error('Email or password is incorrect.'); const { passwordHash: _, ...publicUser } = user; saveSession(publicUser, remember); return publicUser
}

export function getCurrentUser(): AuthUser | null { if (typeof window === 'undefined') return null; try { const raw = window.localStorage.getItem(SESSION_KEY) ?? window.sessionStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null } catch { return null } }
export function signOutUser() { window.localStorage.removeItem(SESSION_KEY); window.sessionStorage.removeItem(SESSION_KEY) }
export function requestPasswordReset(email: string) { return Boolean(email.trim()) }
export const authService = { registerUser, signInUser, getCurrentUser, signOutUser, requestPasswordReset }
