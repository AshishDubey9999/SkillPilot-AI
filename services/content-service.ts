import { apiRequest, isApiEnabled } from './api-client'
import { authService } from './auth-service'
import type { Note } from '@/lib/notes-data'
import type { Project } from '@/lib/projects-data'

function token(){ return authService.getCurrentUser()?.token }
function key(userId:string,type:string){ return `skillsprint.${type}.${userId}` }
function read<T>(k:string,fallback:T):T{ try{return JSON.parse(localStorage.getItem(k)||'null') ?? fallback}catch{return fallback} }
function write(k:string,v:unknown){ localStorage.setItem(k,JSON.stringify(v)) }

export async function getNotes(userId:string):Promise<Note[]>{
  if(isApiEnabled()&&token()){ const r=await apiRequest<{notes:Note[]}>('/notes',{headers:{Authorization:`Bearer ${token()}`}}); write(key(userId,'notes'),r.notes); return r.notes }
  return read(key(userId,'notes'),[])
}
export async function saveNote(userId:string,note:Note){
  if(isApiEnabled()&&token()) await apiRequest('/notes',{method:'POST',headers:{Authorization:`Bearer ${token()}`},body:JSON.stringify(note)})
  const all=read<Note[]>(key(userId,'notes'),[]); write(key(userId,'notes'),[...all.filter(n=>n.id!==note.id),note]); return note
}
export async function deleteNote(userId:string,id:string){
  if(isApiEnabled()&&token()) await apiRequest(`/notes/${encodeURIComponent(id)}`,{method:'DELETE',headers:{Authorization:`Bearer ${token()}`}})
  const all=read<Note[]>(key(userId,'notes'),[]).filter(n=>n.id!==id); write(key(userId,'notes'),all)
}

export async function getProjects(userId:string):Promise<Project[]>{
  if(isApiEnabled()&&token()){ const r=await apiRequest<{projects:Project[]}>('/projects',{headers:{Authorization:`Bearer ${token()}`}}); write(key(userId,'projects'),r.projects); return r.projects }
  return read(key(userId,'projects'),[])
}
export async function saveProject(userId:string,project:Project){
  if(isApiEnabled()&&token()) await apiRequest('/projects',{method:'POST',headers:{Authorization:`Bearer ${token()}`},body:JSON.stringify(project)})
  const all=read<Project[]>(key(userId,'projects'),[]); write(key(userId,'projects'),[...all.filter(p=>p.id!==project.id),project]); return project
}
export async function deleteProject(userId:string,id:string){
  if(isApiEnabled()&&token()) await apiRequest(`/projects/${encodeURIComponent(id)}`,{method:'DELETE',headers:{Authorization:`Bearer ${token()}`}})
  write(key(userId,'projects'),read<Project[]>(key(userId,'projects'),[]).filter(p=>p.id!==id))
}

export type Resource={id:string;title:string;skill:string;topic:string;type:string;difficulty:string;duration:string;description:string;url:string;completed?:boolean}
export async function getResources(userId:string){
  if(isApiEnabled()&&token()){ const r=await apiRequest<{resources:Resource[];completed:Record<string,boolean>}>('/resources',{headers:{Authorization:`Bearer ${token()}`}}); write(key(userId,'resources'),r.resources); write(key(userId,'resource-completion'),r.completed); return r }
  return {resources:read<Resource[]>(key(userId,'resources'),[]),completed:read<Record<string,boolean>>(key(userId,'resource-completion'),{})}
}
export async function saveResource(userId:string,resource:Resource){
  if(isApiEnabled()&&token()) await apiRequest('/resources',{method:'POST',headers:{Authorization:`Bearer ${token()}`},body:JSON.stringify(resource)})
  const all=read<Resource[]>(key(userId,'resources'),[]); write(key(userId,'resources'),[...all.filter(r=>r.id!==resource.id),resource]); return resource
}
export async function setResourceCompletion(userId:string,id:string,completed:boolean){
  if(isApiEnabled()&&token()) await apiRequest(`/resources/${encodeURIComponent(id)}/completion`,{method:'PUT',headers:{Authorization:`Bearer ${token()}`},body:JSON.stringify({completed})})
  const all=read<Record<string,boolean>>(key(userId,'resource-completion'),{}); all[id]=completed; write(key(userId,'resource-completion'),all); return all
}
