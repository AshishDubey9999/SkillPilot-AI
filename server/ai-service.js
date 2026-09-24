const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

function extractJson(text) {
  const cleaned = String(text || '').replace(/```json/gi, '').replace(/```/g, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start < 0 || end < start) throw new Error('AI returned invalid JSON.')
  return JSON.parse(cleaned.slice(start, end + 1))
}

async function callGemini(system, prompt) {
  if (!GEMINI_API_KEY) throw new Error('AI is not configured. Add GEMINI_API_KEY to server/.env.')
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [{ role: 'user', parts: [{ text: prompt }] }], generationConfig: { temperature: 0.35, responseMimeType: 'application/json' } })
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data?.error?.message || 'Gemini request failed.')
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || ''
  return extractJson(text)
}

function localSkillsFromText(text) {
  const catalog = ['C++','Python','Java','JavaScript','TypeScript','HTML','CSS','React','React.js','Node.js','Express','MongoDB','SQL','MySQL','PostgreSQL','DSA','OOP','DBMS','Operating Systems','Computer Networks','Machine Learning','Deep Learning','NLP','Generative AI','Git','GitHub','Docker','Linux','System Design','Communication','Aptitude']
  const lower = String(text || '').toLowerCase()
  return [...new Set(catalog.filter(s => lower.includes(s.toLowerCase())))]
}

async function analyzeJob({ jobDescription, targetRole, skills }) {
  const system = 'You are a placement-focused career analysis assistant. Return only valid JSON matching the requested schema. Be evidence-based: only claim a skill is present in the job description when it is explicitly or clearly implied. Do not invent company requirements.'
  const prompt = `Analyze this job description for target role ${targetRole || 'not specified'}. Candidate skills: ${JSON.stringify(skills || [])}.\n\nJOB DESCRIPTION:\n${jobDescription}\n\nReturn JSON: {"role":"string","summary":"string","matchPercentage":number,"requiredSkills":[{"skill":"string","importance":"High|Medium|Low","evidence":"string"}],"strongSkills":["string"],"developingSkills":["string"],"missingSkills":[{"skill":"string","importance":"High|Medium|Low","why":"string"}],"actionPlan":[{"skill":"string","action":"string","priority":"High|Medium|Low"}],"keywords":["string"]}`
  if (GEMINI_API_KEY) return callGemini(system, prompt)
  const detected = localSkillsFromText(jobDescription)
  const have = new Set((skills || []).map(s => String(s).toLowerCase()))
  const missing = detected.filter(s => !have.has(s.toLowerCase()))
  return { role: targetRole || 'Not specified', summary: 'AI is not configured yet, so this is a local skill-match preview.', matchPercentage: detected.length ? Math.round(((detected.length - missing.length) / detected.length) * 100) : 0, requiredSkills: detected.map(skill => ({ skill, importance: 'Medium', evidence: 'Detected in job description' })), strongSkills: detected.filter(s => have.has(s.toLowerCase())), developingSkills: [], missingSkills: missing.map(skill => ({ skill, importance: 'Medium', why: 'Detected in the job description but not found in the saved skill profile.' })), actionPlan: missing.map(skill => ({ skill, action: `Practice ${skill} with a small placement-focused project or interview set.`, priority: 'Medium' })), keywords: detected }
}

async function analyzeResume({ resumeText, targetRole, skills }) {
  const system = 'You are a resume analysis assistant for software/AI placement candidates. Return only valid JSON. Do not invent experience, projects, metrics, employers, or skills that are not in the resume.'
  const prompt = `Analyze this resume for target role ${targetRole || 'not specified'}. Saved candidate skills: ${JSON.stringify(skills || [])}.\n\nRESUME:\n${resumeText}\n\nReturn JSON: {"summary":"string","roleAlignmentPercentage":number,"skillCoveragePercentage":number,"detectedSkills":["string"],"projects":[{"name":"string","technologies":["string"],"evidence":"string"}],"missingKeywords":["string"],"strengths":["string"],"improvements":["string"],"actionItems":["string"]}`
  if (GEMINI_API_KEY) return callGemini(system, prompt)
  const detected = localSkillsFromText(resumeText)
  const saved = new Set((skills || []).map(s => String(s).toLowerCase()))
  return { summary: 'AI is not configured yet, so this is a local resume scan preview.', roleAlignmentPercentage: targetRole ? Math.min(100, 40 + detected.length * 3) : 0, skillCoveragePercentage: detected.length ? Math.round((detected.filter(s => saved.has(s.toLowerCase())).length / detected.length) * 100) : 0, detectedSkills: detected, projects: [], missingKeywords: [], strengths: detected.slice(0, 6).map(s => `Resume mentions ${s}.`), improvements: ['Add measurable project outcomes where supported by your real work.', 'Align the resume wording with the target role without adding unsupported claims.'], actionItems: ['Review the detected skills and fill genuine gaps in your profile.'] }
}

async function generateSkillGap({ targetRole, skills }) {
  const system = 'You are a placement skill-gap analyst. Return only JSON. Use the supplied candidate profile and target role. Do not invent a candidate skill level; label unknowns as unknown.'
  const prompt = `Target role: ${targetRole}\nCandidate skills: ${JSON.stringify(skills || [])}\nReturn JSON: {"role":"string","overallMatchPercentage":number,"gaps":[{"skill":"string","currentLevel":"string","targetLevel":"string","priority":"High|Medium|Low","reason":"string","nextAction":"string"}],"strengths":["string"],"focusOrder":["string"]}`
  if (GEMINI_API_KEY) return callGemini(system, prompt)
  return { role: targetRole, overallMatchPercentage: 0, gaps: [], strengths: [], focusOrder: [] }
}

async function generateRoadmap({ targetRole, skills, gaps }) {
  const system = 'You are a practical software placement roadmap planner. Return only JSON. Create realistic ordered learning steps based on the target role and the candidate profile. Avoid unnecessary technologies.'
  const prompt = `Target role: ${targetRole}\nCandidate skills: ${JSON.stringify(skills || [])}\nKnown gaps: ${JSON.stringify(gaps || [])}\nReturn JSON: {"role":"string","estimatedWeeks":number,"steps":[{"id":"string","title":"string","skill":"string","description":"string","outcomes":["string"],"practiceTask":"string","estimatedHours":number,"priority":"High|Medium|Low"}]}`
  if (GEMINI_API_KEY) return callGemini(system, prompt)
  return { role: targetRole, estimatedWeeks: 8, steps: [] }
}

async function interviewQuestion({ config, skills, gaps, previousQuestions }) {
  const system = 'You are an adaptive technical/HR interviewer. Return only JSON. Never use a fixed question bank. Generate a new question using the candidate context and previous questions. Do not repeat previous questions.'
  const prompt = `Config: ${JSON.stringify(config)}\nCandidate skills: ${JSON.stringify(skills || [])}\nSkill gaps: ${JSON.stringify(gaps || [])}\nPrevious questions: ${JSON.stringify(previousQuestions || [])}\nReturn JSON: {"id":"string","questionNumber":number,"text":"string","category":"string","difficulty":"Beginner|Intermediate|Advanced","interviewType":"Technical|HR|Behavioral|Mixed","relevantSkills":["string"]}`
  if (GEMINI_API_KEY) return callGemini(system, prompt)
  return null
}

async function evaluateInterview({ question, answer, targetRole, relevantSkill, previousPerformance }) {
  const system = 'You are an interview evaluator. Evaluate only the candidate answer provided. Do not reward length alone. Distinguish correctness, relevance, completeness, and clarity. Return only JSON.'
  const prompt = `Target role: ${targetRole}\nQuestion: ${JSON.stringify(question)}\nRelevant skill: ${relevantSkill}\nPrevious performance: ${JSON.stringify(previousPerformance || [])}\nCandidate answer: ${answer}\nReturn JSON: {"overallScore":number,"criteria":{"technicalAccuracy":number,"relevance":number,"completeness":number,"clarity":number},"strengths":["string"],"improvements":["string"],"missingConcepts":["string"],"betterApproach":"string","followUpQuestion":"string","feedback":"string"}`
  if (GEMINI_API_KEY) return callGemini(system, prompt)
  return null
}


async function careerCoach({ targetRole, skills, gaps, recentActivity }) {
  const system = 'You are a practical placement career coach. Return only valid JSON. Give concise, actionable advice based only on the supplied candidate context. Do not invent achievements or skills.'
  const prompt = `Target role: ${targetRole}
Candidate skills: ${JSON.stringify(skills || [])}
Known gaps: ${JSON.stringify(gaps || [])}
Recent activity: ${JSON.stringify(recentActivity || [])}
Return JSON: {"headline":"string","todayActions":[{"title":"string","reason":"string","durationMinutes":number,"priority":"High|Medium|Low"}],"focusSkill":"string","coachNote":"string"}`
  if (GEMINI_API_KEY) return callGemini(system, prompt)
  const firstGap = gaps?.[0]?.skill || 'DSA'
  return { headline: 'Build consistency around your highest-priority gap.', todayActions: [{ title: `Practice ${firstGap}`, reason: 'It is currently the first available priority gap in your profile.', durationMinutes: 45, priority: 'High' }, { title: 'Complete one project task', reason: 'Keep project progress moving alongside interview preparation.', durationMinutes: 30, priority: 'Medium' }], focusSkill: firstGap, coachNote: 'Add GEMINI_API_KEY to enable personalized AI coaching.' }
}

module.exports = { analyzeJob, analyzeResume, generateSkillGap, generateRoadmap, interviewQuestion, evaluateInterview, careerCoach, aiConfigured: Boolean(GEMINI_API_KEY), model: GEMINI_MODEL }
