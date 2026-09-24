import { apiRequest, isApiEnabled } from './api-client'
import { authService } from './auth-service'
import { Skill, initialSkills } from '@/lib/skills-data'

const skillsKey = (userId: string) => `skillsprint.skills.${userId}`
const roleKey = (userId: string) => `skillsprint.role.${userId}`
const roadmapKey = (userId: string) => `skillsprint.roadmap.${userId}`

function token() { return authService.getCurrentUser()?.token }
function localSkills(userId: string): Skill[] { try { return JSON.parse(localStorage.getItem(skillsKey(userId)) || JSON.stringify(initialSkills)) } catch { return initialSkills } }

export async function getUserSkills(userId: string): Promise<Skill[]> {
  if (isApiEnabled() && token()) {
    const result = await apiRequest<{ skills: Skill[] }>('/skills', { headers: { Authorization: `Bearer ${token()}` } })
    localStorage.setItem(skillsKey(userId), JSON.stringify(result.skills))
    return result.skills
  }
  const skills = localSkills(userId); localStorage.setItem(skillsKey(userId), JSON.stringify(skills)); return skills
}

export async function saveUserSkill(userId: string, skill: Skill): Promise<Skill> {
  if (isApiEnabled() && token()) {
    const result = await apiRequest<{ skill: Skill }>('/skills', { method: 'POST', headers: { Authorization: `Bearer ${token()}` }, body: JSON.stringify(skill) })
    await getUserSkills(userId); return result.skill
  }
  const next = [...localSkills(userId).filter(s => s.id !== skill.id), skill]; localStorage.setItem(skillsKey(userId), JSON.stringify(next)); return skill
}

export async function deleteUserSkill(userId: string, skillId: string) {
  if (isApiEnabled() && token()) await apiRequest(`/skills/${encodeURIComponent(skillId)}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token()}` } })
  const next = localSkills(userId).filter(s => s.id !== skillId); localStorage.setItem(skillsKey(userId), JSON.stringify(next)); return next
}

export async function getTargetRole(userId: string): Promise<string> {
  if (isApiEnabled() && token()) { const result = await apiRequest<{ targetRole: string | null }>('/profile/target-role', { headers: { Authorization: `Bearer ${token()}` } }); if (result.targetRole) localStorage.setItem(roleKey(userId), result.targetRole); return result.targetRole || 'Software Developer' }
  return localStorage.getItem(roleKey(userId)) || 'Software Developer'
}

export async function saveTargetRole(userId: string, targetRole: string) {
  if (isApiEnabled() && token()) await apiRequest('/profile/target-role', { method: 'PUT', headers: { Authorization: `Bearer ${token()}` }, body: JSON.stringify({ targetRole }) })
  localStorage.setItem(roleKey(userId), targetRole); return targetRole
}

export type RoadmapProgress = Record<string, 'Not Started' | 'In Progress' | 'Completed' | 'Locked'>
export async function getRoadmapProgress(userId: string): Promise<RoadmapProgress> {
  if (isApiEnabled() && token()) { const result = await apiRequest<{ progress: RoadmapProgress }>('/roadmap/progress', { headers: { Authorization: `Bearer ${token()}` } }); localStorage.setItem(roadmapKey(userId), JSON.stringify(result.progress)); return result.progress }
  try { return JSON.parse(localStorage.getItem(roadmapKey(userId)) || '{}') } catch { return {} }
}
export async function saveRoadmapProgress(userId: string, stepId: string, status: RoadmapProgress[string]) {
  if (isApiEnabled() && token()) await apiRequest(`/roadmap/progress/${encodeURIComponent(stepId)}`, { method: 'PUT', headers: { Authorization: `Bearer ${token()}` }, body: JSON.stringify({ status }) })
  const current: RoadmapProgress = await getRoadmapProgress(userId); const next = { ...current, [stepId]: status }; localStorage.setItem(roadmapKey(userId), JSON.stringify(next)); return next
}
