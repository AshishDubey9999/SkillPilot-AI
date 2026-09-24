import { apiRequest, isApiEnabled } from './api-client'
import { authService } from './auth-service'

export type DashboardTask = { id:string; label:string; meta:string; done:boolean }
export type DashboardData = {
  targetRole:string; readiness:number; technical:number; projects:number; dsa:number; interview:number
  skills:any[]; projectCount:number; completedProjects:number; inProgressProjects:number; notesCount:number
  resourcesCompleted:number; roadmapCompleted:number; dsaSolved:number; dsaAttempted:number
  weekly:{date:string;label:string;count:number}[]; recentActivity:{date:string;text:string;type:string}[]
  gaps:{skill:string;from:string;to:string;progress:number;icon:string}[]; tasks:DashboardTask[]
}

const localKey=(userId:string)=>`skillsprint.dashboard.${userId}`
function token(){return authService.getCurrentUser()?.token}

export async function getDashboardData(userId:string):Promise<DashboardData|null>{
  if(isApiEnabled()&&token()){
    const data=await apiRequest<DashboardData>('/dashboard',{headers:{Authorization:`Bearer ${token()}`}})
    localStorage.setItem(localKey(userId),JSON.stringify(data)); return data
  }
  try{return JSON.parse(localStorage.getItem(localKey(userId))||'null')}catch{return null}
}

export async function updateDashboardTask(userId:string,taskId:string,done:boolean){
  if(isApiEnabled()&&token()) await apiRequest(`/dashboard/tasks/${encodeURIComponent(taskId)}`,{method:'PUT',headers:{Authorization:`Bearer ${token()}`},body:JSON.stringify({done})})
  const cached=await getDashboardData(userId)
  if(cached){cached.tasks=cached.tasks.map(t=>t.id===taskId?{...t,done}:t);localStorage.setItem(localKey(userId),JSON.stringify(cached))}
}
