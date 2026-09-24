import { apiRequest } from './api-client'
import { authService } from './auth-service'

const authHeaders = (): HeadersInit => {
  const token = authService.getCurrentUser()?.token
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export type JobAnalysis = { role:string; summary:string; matchPercentage:number; requiredSkills:{skill:string;importance:string;evidence:string}[]; strongSkills:string[]; developingSkills:string[]; missingSkills:{skill:string;importance:string;why:string}[]; actionPlan:{skill:string;action:string;priority:string}[]; keywords:string[] }
export type ResumeAnalysis = { summary:string; roleAlignmentPercentage:number; skillCoveragePercentage:number; detectedSkills:string[]; projects:{name:string;technologies:string[];evidence:string}[]; missingKeywords:string[]; strengths:string[]; improvements:string[]; actionItems:string[] }
export async function analyzeJob(jobDescription:string,targetRole?:string,skills?:unknown[]) { return apiRequest<{result:JobAnalysis;ai:boolean}>('/ai/job-analyze',{method:'POST',headers:authHeaders(),body:JSON.stringify({jobDescription,targetRole,skills})}) }
export async function analyzeResume(resumeText:string,targetRole?:string,skills?:unknown[]) { return apiRequest<{result:ResumeAnalysis;ai:boolean}>('/ai/resume-analyze',{method:'POST',headers:authHeaders(),body:JSON.stringify({resumeText,targetRole,skills})}) }
export async function generateSkillGap(targetRole?:string,skills?:unknown[]) { return apiRequest<{result:any;ai:boolean}>('/ai/skill-gap',{method:'POST',headers:authHeaders(),body:JSON.stringify({targetRole,skills})}) }
export async function generateRoadmap(targetRole:string,skills?:unknown[],gaps?:unknown[]) { return apiRequest<{result:any;ai:boolean}>('/ai/roadmap',{method:'POST',headers:authHeaders(),body:JSON.stringify({targetRole,skills,gaps})}) }
export async function generateAIInterviewQuestion(payload:unknown) { return apiRequest<{result:any;ai:boolean}>('/ai/interview/question',{method:'POST',headers:{...authHeaders()},body:JSON.stringify(payload)}) }
export async function evaluateAIInterviewAnswer(payload:unknown) { return apiRequest<{result:any;ai:boolean}>('/ai/interview/evaluate',{method:'POST',headers:{...authHeaders()},body:JSON.stringify(payload)}) }
export async function saveInterviewSessionRemote(session:unknown) { return apiRequest<{ok:boolean}>('/ai/interview/session',{method:'POST',headers:authHeaders(),body:JSON.stringify({session})}) }

export async function uploadResume(file:File){ const data=await file.arrayBuffer(); let binary=''; const bytes=new Uint8Array(data); const chunk=0x8000; for(let i=0;i<bytes.length;i+=chunk) binary+=String.fromCharCode(...bytes.subarray(i,i+chunk)); const fileBase64=btoa(binary); return apiRequest<{resumeText:string;fileName:string}>('/ai/resume-upload',{method:'POST',headers:authHeaders(),body:JSON.stringify({fileBase64,fileName:file.name})}) }
