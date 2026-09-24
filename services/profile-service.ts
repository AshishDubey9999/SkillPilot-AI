import { apiRequest, isApiEnabled } from './api-client'
import { authService } from './auth-service'

export type ProfileData = {
  education: string; college: string; graduationYear: string; github: string; linkedin: string; phone: string; bio: string
}
const key=(id:string)=>`skillsprint.profile.${id}`
const fallback:ProfileData={education:'B.Tech CSE (AI/ML)',college:'',graduationYear:'2027',github:'',linkedin:'',phone:'',bio:''}
export async function getProfile(userId:string):Promise<ProfileData>{
  if(isApiEnabled() && authService.getCurrentUser()?.token){ const r=await apiRequest<{profile:ProfileData}>('/profile',{headers:{Authorization:`Bearer ${authService.getCurrentUser()!.token}`}}); localStorage.setItem(key(userId),JSON.stringify(r.profile)); return r.profile }
  try{return {...fallback,...JSON.parse(localStorage.getItem(key(userId))||'{}')}}catch{return fallback}
}
export async function saveProfile(userId:string, profile:ProfileData){
  if(isApiEnabled() && authService.getCurrentUser()?.token) await apiRequest('/profile',{method:'PUT',headers:{Authorization:`Bearer ${authService.getCurrentUser()!.token}`},body:JSON.stringify(profile)})
  localStorage.setItem(key(userId),JSON.stringify(profile)); window.dispatchEvent(new Event('skillsprint-dashboard-updated')); return profile
}
