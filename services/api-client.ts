const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '')

export function isApiEnabled() { return Boolean(API_URL) }

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (!API_URL) throw new Error('API is not configured. Set NEXT_PUBLIC_API_URL in .env.local.')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(options.headers || {}) },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Request failed.')
  return data as T
}
