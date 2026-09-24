require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { MongoClient, ObjectId } = require('mongodb')
const { analyzeJob, analyzeResume, generateSkillGap, generateRoadmap, interviewQuestion, evaluateInterview, careerCoach, aiConfigured, model: aiModel } = require('./ai-service')
const pdfParse = require('pdf-parse')

const app = express()
app.set('trust proxy', 1)
const PORT = Number(process.env.PORT || 4000)
const JWT_SECRET = process.env.JWT_SECRET
const MONGODB_URI = process.env.MONGODB_URI
const DB_NAME = process.env.MONGODB_DB || 'skillpilot'

if (!JWT_SECRET) {
  console.error('Missing JWT_SECRET. Copy .env.example to .env and set a strong secret.')
  process.exit(1)
}
if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI. Copy .env.example to .env and add your MongoDB connection string.')
  process.exit(1)
}

app.use(cors({ origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map(s => s.trim()) : true, credentials: true }))
app.use(express.json({ limit: '12mb' }))
// Lightweight security hardening without adding runtime dependencies.
app.disable('x-powered-by')
app.use((_req,res,next)=>{ res.setHeader('X-Content-Type-Options','nosniff'); res.setHeader('X-Frame-Options','DENY'); res.setHeader('Referrer-Policy','strict-origin-when-cross-origin'); next() })
const rateBuckets = new Map()
function rateLimit(windowMs,max){ return (req,res,next)=>{ const key=`${req.ip}:${req.path}`; const now=Date.now(); const row=rateBuckets.get(key); if(!row || now-row.started>windowMs){ rateBuckets.set(key,{started:now,count:1}); return next() } if(row.count>=max) return res.status(429).json({message:'Too many requests. Please try again shortly.'}); row.count++; next() } }
const aiLimit=rateLimit(60_000,30); const authLimit=rateLimit(60_000,20)

let db
let client
async function connectDB() {
  client = new MongoClient(MONGODB_URI)
  await client.connect()
  db = client.db(DB_NAME)
  await db.collection('users').createIndex({ email: 1 }, { unique: true })
  await db.collection('dsaProgress').createIndex({ userId: 1, problemId: 1 }, { unique: true })
  await db.collection('skills').createIndex({ userId: 1 }, { unique: true })
  await db.collection('profiles').createIndex({ userId: 1 }, { unique: true })
  await db.collection('roadmapProgress').createIndex({ userId: 1, stepId: 1 }, { unique: true })
  await db.collection('notes').createIndex({ userId: 1, id: 1 }, { unique: true })
  await db.collection('projects').createIndex({ userId: 1, id: 1 }, { unique: true })
  await db.collection('resources').createIndex({ userId: 1, id: 1 }, { unique: true })
  await db.collection('resourceCompletions').createIndex({ userId: 1, resourceId: 1 }, { unique: true })
  await db.collection('aiAnalyses').createIndex({ userId: 1, createdAt: -1 })
  await db.collection('interviewSessions').createIndex({ userId: 1, id: 1 }, { unique: true })
  await db.collection('dashboardTasks').createIndex({ userId: 1, id: 1 }, { unique: true })
  console.log(`MongoDB connected: ${DB_NAME}`)
}

function publicUser(user) {
  return { id: user._id.toString(), fullName: user.fullName, email: user.email }
}
function signToken(user) { return jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' }) }
function auth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return res.status(401).json({ message: 'Authentication required.' })
  try {
    req.userId = jwt.verify(token, JWT_SECRET).sub
    next()
  } catch { return res.status(401).json({ message: 'Session expired. Please sign in again.' }) }
}

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'SkillPilot AI API' }))

app.post('/api/auth/register', authLimit, async (req, res) => {
  try {
    const { fullName, email, password } = req.body || {}
    if (!fullName?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ message: 'Name, valid email and password of at least 8 characters are required.' })
    const normalizedEmail = email.trim().toLowerCase()
    const passwordHash = await bcrypt.hash(password, 12)
    const result = await db.collection('users').insertOne({ fullName: fullName.trim(), email: normalizedEmail, passwordHash, createdAt: new Date(), updatedAt: new Date() })
    const user = await db.collection('users').findOne({ _id: result.insertedId })
    const token = signToken(user)
    res.status(201).json({ user: publicUser(user), token })
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ message: 'An account with this email already exists.' })
    console.error(error); res.status(500).json({ message: 'Unable to create account.' })
  }
})

app.post('/api/auth/login', authLimit, async (req, res) => {
  try {
    const { email, password } = req.body || {}
    const user = await db.collection('users').findOne({ email: email?.trim().toLowerCase() })
    if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) return res.status(401).json({ message: 'Email or password is incorrect.' })
    res.json({ user: publicUser(user), token: signToken(user) })
  } catch (error) { console.error(error); res.status(500).json({ message: 'Unable to sign in.' }) }
})

app.get('/api/auth/me', auth, async (req, res) => {
  const user = await db.collection('users').findOne({ _id: new ObjectId(req.userId) })
  if (!user) return res.status(404).json({ message: 'User not found.' })
  res.json({ user: publicUser(user) })
})

app.post('/api/auth/logout', auth, (_req, res) => res.json({ ok: true }))

app.get('/api/ai/status', auth, (_req, res) => res.json({ configured: aiConfigured, model: aiModel }))

async function candidateContext(userId) {
  const [skillsDoc, profile] = await Promise.all([
    db.collection('skills').findOne({ userId: new ObjectId(userId) }),
    db.collection('profiles').findOne({ userId: new ObjectId(userId) })
  ])
  return { skills: skillsDoc?.skills || [], targetRole: profile?.targetRole || 'Software Developer' }
}

app.post('/api/ai/job-analyze', auth, aiLimit, async (req, res) => {
  try {
    const { jobDescription, targetRole, skills } = req.body || {}
    if (!jobDescription?.trim()) return res.status(400).json({ message: 'Job description is required.' })
    if (String(jobDescription).length > 50000) return res.status(400).json({ message: 'Job description is too long. Keep it under 50,000 characters.' })
    const context = await candidateContext(req.userId)
    const result = await analyzeJob({ jobDescription: jobDescription.trim(), targetRole: targetRole || context.targetRole, skills: skills || context.skills })
    await db.collection('aiAnalyses').insertOne({ userId: new ObjectId(req.userId), type: 'job', input: jobDescription.trim(), result, createdAt: new Date() })
    res.json({ result, ai: aiConfigured })
  } catch (error) { console.error(error); res.status(502).json({ message: error.message || 'Job analysis failed.' }) }
})

app.post('/api/ai/resume-analyze', auth, aiLimit, async (req, res) => {
  try {
    const { resumeText, targetRole, skills } = req.body || {}
    if (!resumeText?.trim()) return res.status(400).json({ message: 'Resume text is required.' })
    if (String(resumeText).length > 120000) return res.status(400).json({ message: 'Resume text is too long.' })
    const context = await candidateContext(req.userId)
    const result = await analyzeResume({ resumeText: resumeText.trim(), targetRole: targetRole || context.targetRole, skills: skills || context.skills })
    await db.collection('aiAnalyses').insertOne({ userId: new ObjectId(req.userId), type: 'resume', input: resumeText.trim(), result, createdAt: new Date() })
    res.json({ result, ai: aiConfigured })
  } catch (error) { console.error(error); res.status(502).json({ message: error.message || 'Resume analysis failed.' }) }
})

app.post('/api/ai/skill-gap', auth, aiLimit, async (req, res) => {
  try {
    const context = await candidateContext(req.userId)
    const result = await generateSkillGap({ targetRole: req.body?.targetRole || context.targetRole, skills: req.body?.skills || context.skills })
    await db.collection('aiAnalyses').insertOne({ userId: new ObjectId(req.userId), type: 'skill-gap', result, createdAt: new Date() })
    res.json({ result, ai: aiConfigured })
  } catch (error) { res.status(502).json({ message: error.message || 'Skill gap analysis failed.' }) }
})

app.post('/api/ai/roadmap', auth, aiLimit, async (req, res) => {
  try {
    const context = await candidateContext(req.userId)
    const result = await generateRoadmap({ targetRole: req.body?.targetRole || context.targetRole, skills: req.body?.skills || context.skills, gaps: req.body?.gaps || [] })
    await db.collection('aiAnalyses').insertOne({ userId: new ObjectId(req.userId), type: 'roadmap', result, createdAt: new Date() })
    res.json({ result, ai: aiConfigured })
  } catch (error) { res.status(502).json({ message: error.message || 'Roadmap generation failed.' }) }
})

app.get('/api/ai/history', auth, async (req, res) => {
  const rows = await db.collection('aiAnalyses').find({ userId: new ObjectId(req.userId) }).sort({ createdAt: -1 }).limit(30).toArray()
  res.json({ history: rows.map(({ _id, userId, input, ...row }) => row) })
})


app.post('/api/ai/career-coach', auth, aiLimit, async (req,res) => {
  try {
    const context = await candidateContext(req.userId)
    const result = await careerCoach({ targetRole: req.body?.targetRole || context.targetRole, skills: req.body?.skills || context.skills, gaps: req.body?.gaps || [], recentActivity: req.body?.recentActivity || [] })
    await db.collection('aiAnalyses').insertOne({ userId:new ObjectId(req.userId), type:'career-coach', result, createdAt:new Date() })
    res.json({ result, ai: aiConfigured })
  } catch (error) { res.status(502).json({ message:error.message || 'Career coach failed.' }) }
})

app.post('/api/ai/resume-upload', auth, aiLimit, async (req,res) => {
  try {
    const { fileBase64, fileName } = req.body || {}
    if (!fileBase64 || typeof fileBase64 !== 'string') return res.status(400).json({ message:'Resume file is required.' })
    if (!/\.(pdf|txt|md)$/i.test(String(fileName || ''))) return res.status(400).json({ message:'Only PDF, TXT and Markdown resumes are supported.' })
    if (fileBase64.length > 10_000_000) return res.status(413).json({ message:'Resume file is too large. Keep it under about 7 MB.' })
    const buffer = Buffer.from(fileBase64, 'base64')
    let resumeText = ''
    if (/\.pdf$/i.test(fileName)) {
      const parsed = await pdfParse(buffer)
      resumeText = parsed.text || ''
    } else {
      resumeText = buffer.toString('utf8')
    }
    if (!resumeText.trim()) return res.status(422).json({ message:'Could not extract readable text from this resume.' })
    res.json({ resumeText: resumeText.slice(0, 120000), fileName:String(fileName) })
  } catch (error) { console.error(error); res.status(422).json({ message:'Could not extract text from the uploaded resume.' }) }
})

app.post('/api/ai/interview/question', auth, aiLimit, async (req, res) => {
  try {
    const context = await candidateContext(req.userId)
    const result = await interviewQuestion({ config: req.body?.config, skills: req.body?.skills || context.skills, gaps: req.body?.gaps || [], previousQuestions: req.body?.previousQuestions || [] })
    if (!result) return res.status(503).json({ message: 'AI interview generation requires GEMINI_API_KEY.' })
    res.json({ result, ai: true })
  } catch (error) { res.status(502).json({ message: error.message || 'Interview question generation failed.' }) }
})

app.post('/api/ai/interview/evaluate', auth, aiLimit, async (req, res) => {
  try {
    const { question, answer, targetRole, relevantSkill, previousPerformance } = req.body || {}
    if (!question || typeof answer !== 'string') return res.status(400).json({ message: 'Question and answer are required.' })
    const result = await evaluateInterview({ question, answer, targetRole, relevantSkill, previousPerformance })
    if (!result) return res.status(503).json({ message: 'AI interview evaluation requires GEMINI_API_KEY.' })
    res.json({ result, ai: true })
  } catch (error) { res.status(502).json({ message: error.message || 'Interview evaluation failed.' }) }
})

app.post('/api/ai/interview/session', auth, async (req, res) => {
  const session = req.body?.session
  if (!session?.id) return res.status(400).json({ message: 'Session is required.' })
  await db.collection('interviewSessions').updateOne({ userId: new ObjectId(req.userId), id: session.id }, { $set: { ...session, userId: new ObjectId(req.userId), updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } }, { upsert: true })
  res.json({ ok: true })
})

app.get('/api/ai/interview/history', auth, async (req, res) => {
  const rows = await db.collection('interviewSessions').find({ userId: new ObjectId(req.userId) }).sort({ updatedAt: -1 }).limit(20).toArray()
  res.json({ sessions: rows.map(({ _id, userId, ...session }) => session) })
})

// ---------- User profile / learning data ----------
const DEFAULT_SKILLS = [
  { id:'cpp', name:'C++', category:'Programming', progress:45, currentLevel:'Beginner', targetLevel:'Intermediate', lastUpdated:'today' },
  { id:'python', name:'Python', category:'Programming', progress:65, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'javascript', name:'JavaScript', category:'Programming', progress:55, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'html', name:'HTML', category:'Web Development', progress:80, currentLevel:'Advanced', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'css', name:'CSS', category:'Web Development', progress:75, currentLevel:'Advanced', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'reactjs', name:'React.js', category:'Web Development', progress:30, currentLevel:'Beginner', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'nodejs', name:'Node.js', category:'Web Development', progress:22, currentLevel:'Beginner', targetLevel:'Intermediate', lastUpdated:'today' },
  { id:'ml', name:'Machine Learning', category:'AI / ML', progress:45, currentLevel:'Beginner', targetLevel:'Intermediate', lastUpdated:'today' },
  { id:'dsa', name:'DSA', category:'CS Fundamentals', progress:54, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'oop', name:'OOP', category:'CS Fundamentals', progress:70, currentLevel:'Advanced', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'dbms', name:'DBMS', category:'CS Fundamentals', progress:70, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'os', name:'Operating Systems', category:'CS Fundamentals', progress:50, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'cn', name:'Computer Networks', category:'CS Fundamentals', progress:48, currentLevel:'Beginner', targetLevel:'Intermediate', lastUpdated:'today' },
  { id:'sql', name:'SQL', category:'Databases', progress:61, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'mongodb', name:'MongoDB', category:'Databases', progress:35, currentLevel:'Beginner', targetLevel:'Intermediate', lastUpdated:'today' },
  { id:'git', name:'Git', category:'Tools', progress:85, currentLevel:'Advanced', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'github', name:'GitHub', category:'Tools', progress:82, currentLevel:'Advanced', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'communication', name:'Communication', category:'Soft Skills', progress:75, currentLevel:'Advanced', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'aptitude', name:'Aptitude', category:'Soft Skills', progress:50, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
  { id:'interview', name:'Interview Skills', category:'Soft Skills', progress:55, currentLevel:'Intermediate', targetLevel:'Advanced', lastUpdated:'today' },
]

// ---------- Dashboard aggregation ----------
app.get('/api/dashboard', auth, async (req,res) => {
  const userId = new ObjectId(req.userId)
  const [skillsDoc, profile, projects, notes, resources, completions, roadmap, dsaRows, interviews, aiRows, taskRows] = await Promise.all([
    db.collection('skills').findOne({userId}),
    db.collection('profiles').findOne({userId}),
    db.collection('projects').find({userId}).sort({updatedAt:-1}).toArray(),
    db.collection('notes').find({userId}).sort({updatedAt:-1}).toArray(),
    db.collection('resources').find({userId}).toArray(),
    db.collection('resourceCompletions').find({userId}).toArray(),
    db.collection('roadmapProgress').find({userId}).toArray(),
    db.collection('dsaProgress').find({userId}).toArray(),
    db.collection('interviewSessions').find({userId}).sort({createdAt:-1}).limit(20).toArray(),
    db.collection('aiAnalyses').find({userId}).sort({createdAt:-1}).limit(10).toArray(),
    db.collection('dashboardTasks').find({userId}).sort({createdAt:1}).toArray(),
  ])
  const skillList = Array.isArray(skillsDoc?.skills) ? skillsDoc.skills : []
  const dsaSolved = dsaRows.filter(r => r.status === 'solved').length
  const dsaAttempted = dsaRows.filter(r => ['attempted','solved','revision'].includes(r.status)).length
  const projectProgress = projects.length ? Math.round(projects.reduce((a,p)=>a+(Number(p.progress)||0),0)/projects.length) : 0
  const skillAvg = skillList.length ? Math.round(skillList.reduce((a,s)=>a+(Number(s.progress)||0),0)/skillList.length) : 0
  const interviewScore = interviews.length ? Math.round(interviews.reduce((a,s)=>a+(Number(s.averageScore)||0),0)/interviews.length) : 0
  const readiness = Math.round((skillAvg + projectProgress + Math.min(100,dsaSolved*3) + interviewScore) / 4)
  const completedResources = completions.filter(r=>r.completed).length
  const completedRoadmap = roadmap.filter(r=>r.status === 'Completed').length
  const activities = []
  const pushActivity = (date, text, type='activity') => { if(date) activities.push({date:new Date(date),text,type}) }
  notes.forEach(n=>pushActivity(n.updatedAt||n.createdAt,'Updated a personal note','note'))
  projects.forEach(pr=>pushActivity(pr.updatedAt||pr.createdAt, pr.status === 'Completed' ? `Completed project: ${pr.name}` : `Updated project: ${pr.name}`,'project'))
  completions.filter(r=>r.completed).forEach(r=>pushActivity(r.updatedAt,'Completed a learning resource','resource'))
  roadmap.filter(r=>r.status==='Completed').forEach(r=>pushActivity(r.updatedAt,'Completed a roadmap step','roadmap'))
  dsaRows.filter(r=>r.status==='solved').forEach(r=>pushActivity(r.completedAt||r.lastAttempted,'Solved a DSA problem','dsa'))
  interviews.forEach(i=>pushActivity(i.createdAt,`Completed ${i.type || 'mock'} interview`,'interview'))
  aiRows.forEach(a=>pushActivity(a.createdAt,`Used AI ${a.type || 'analysis'}`,'ai'))
  activities.sort((a,b)=>b.date-a.date)
  const today = new Date(); today.setHours(0,0,0,0)
  const weekly = Array.from({length:7},(_,idx)=>{ const d=new Date(today); d.setDate(today.getDate()-(6-idx)); const key=d.toISOString().slice(0,10); return {date:key,label:d.toLocaleDateString('en-US',{weekday:'short'}).slice(0,1),count:activities.filter(a=>a.date.toISOString().slice(0,10)===key).length} })
  const gaps = skillList.filter(s=>Number(s.progress)<Number(s.targetLevel==='Expert'?85:s.targetLevel==='Advanced'?70:s.targetLevel==='Intermediate'?50:30)).sort((a,b)=>a.progress-b.progress).slice(0,4).map(s=>({skill:s.name,from:s.currentLevel,to:s.targetLevel,progress:s.progress,icon:s.name.slice(0,2).toUpperCase()}))
  let tasks = taskRows.map(({_id,userId,...t})=>t)
  if (!tasks.length) {
    const candidates = [
      dsaSolved < 3 ? {id:'dsa-3',label:'Solve 3 DSA problems',meta:'DSA Practice'} : null,
      completedResources < 1 ? {id:'resource-1',label:'Complete one learning resource',meta:'Resource Library'} : null,
      gaps[0] ? {id:'gap-1',label:`Improve ${gaps[0].skill}`,meta:'Skill gap focus'} : null,
      projects.some(p=>p.status==='In Progress') ? {id:'project-1',label:'Update an in-progress project',meta:'Projects'} : null,
      {id:'interview-1',label:'Practice one mock interview',meta:'Mock Interview'}
    ].filter(Boolean).slice(0,4)
    tasks = candidates
    await Promise.all(tasks.map(t=>db.collection('dashboardTasks').updateOne({userId,id:t.id},{$set:{...t,userId,done:false,createdAt:new Date()}},{upsert:true})))
  }
  tasks = tasks.map(t=>({...t,done:Boolean(t.done)}))
  res.json({
    targetRole: profile?.targetRole || 'Software Developer',
    readiness, technical: skillAvg, projects: projectProgress, dsa: dsaRows.length ? Math.min(100,Math.round((dsaSolved/Math.max(1,dsaRows.length))*100)) : 0, interview: interviewScore,
    skills: skillList, projectCount: projects.length, completedProjects: projects.filter(p=>p.status==='Completed').length,
    inProgressProjects: projects.filter(p=>p.status==='In Progress').length, notesCount: notes.length, resourcesCompleted: completedResources, roadmapCompleted: completedRoadmap,
    dsaSolved, dsaAttempted, weekly, recentActivity: activities.slice(0,8).map(a=>({...a,date:a.date.toISOString()})), gaps, tasks
  })
})
app.put('/api/dashboard/tasks/:taskId', auth, async (req,res)=>{
  const userId=new ObjectId(req.userId); const done=Boolean(req.body?.done)
  await db.collection('dashboardTasks').updateOne({userId,id:req.params.taskId},{$set:{done,updatedAt:new Date()},$setOnInsert:{userId,id:req.params.taskId,createdAt:new Date()}},{upsert:true})
  res.json({ok:true,done})
})

app.get('/api/skills', auth, async (req,res) => {
  let profile = await db.collection('skills').findOne({ userId:new ObjectId(req.userId) })
  if (!profile) { await db.collection('skills').insertOne({ userId:new ObjectId(req.userId), skills:DEFAULT_SKILLS, createdAt:new Date(), updatedAt:new Date() }); profile = { skills:DEFAULT_SKILLS } }
  res.json({ skills: profile.skills || [] })
})
app.post('/api/skills', auth, async (req,res) => {
  const skill = req.body?.skill || req.body
  if (!skill?.id || !skill?.name) return res.status(400).json({message:'Skill id and name are required.'})
  const now=new Date(), userId=new ObjectId(req.userId)
  await db.collection('skills').updateOne({userId}, {$set:{updatedAt:now}, $setOnInsert:{createdAt:now}, $pull:{skills:{id:skill.id}}}, {upsert:true})
  await db.collection('skills').updateOne({userId}, {$push:{skills:{...skill, lastUpdated:skill.lastUpdated || 'today'}}})
  res.json({skill})
})
app.delete('/api/skills/:skillId', auth, async (req,res) => {
  await db.collection('skills').updateOne({userId:new ObjectId(req.userId)}, {$pull:{skills:{id:req.params.skillId}}, $set:{updatedAt:new Date()}})
  res.json({ok:true})
})
app.get('/api/profile', auth, async (req,res) => {
  const profile=await db.collection('profiles').findOne({userId:new ObjectId(req.userId)})
  res.json({profile:{education:profile?.education||'B.Tech CSE (AI/ML)',college:profile?.college||'',graduationYear:profile?.graduationYear||'2027',github:profile?.github||'',linkedin:profile?.linkedin||'',phone:profile?.phone||'',bio:profile?.bio||''}})
})
app.put('/api/profile', auth, async (req,res) => {
  const body=req.body||{}; const profile={education:String(body.education||'').slice(0,120),college:String(body.college||'').slice(0,160),graduationYear:String(body.graduationYear||'').slice(0,10),github:String(body.github||'').slice(0,200),linkedin:String(body.linkedin||'').slice(0,200),phone:String(body.phone||'').slice(0,30),bio:String(body.bio||'').slice(0,500)}
  await db.collection('profiles').updateOne({userId:new ObjectId(req.userId)},{$set:{...profile,updatedAt:new Date()},$setOnInsert:{createdAt:new Date()}},{upsert:true}); res.json({profile})
})
app.get('/api/profile/target-role', auth, async (req,res) => {
  const profile=await db.collection('profiles').findOne({userId:new ObjectId(req.userId)})
  res.json({targetRole:profile?.targetRole || null})
})
app.put('/api/profile/target-role', auth, async (req,res) => {
  const targetRole=String(req.body?.targetRole || '').trim()
  if (!targetRole) return res.status(400).json({message:'Target role is required.'})
  await db.collection('profiles').updateOne({userId:new ObjectId(req.userId)}, {$set:{targetRole,updatedAt:new Date()},$setOnInsert:{createdAt:new Date()}},{upsert:true})
  res.json({targetRole})
})
app.get('/api/roadmap/progress', auth, async (req,res) => {
  const rows=await db.collection('roadmapProgress').find({userId:new ObjectId(req.userId)}).toArray()
  res.json({progress:Object.fromEntries(rows.map(r=>[r.stepId,r.status]))})
})
app.put('/api/roadmap/progress/:stepId', auth, async (req,res) => {
  const allowed=['Not Started','In Progress','Completed','Locked']
  const status=req.body?.status
  if(!allowed.includes(status)) return res.status(400).json({message:'Invalid roadmap status.'})
  await db.collection('roadmapProgress').updateOne({userId:new ObjectId(req.userId),stepId:req.params.stepId},{$set:{status,updatedAt:new Date()},$setOnInsert:{createdAt:new Date()}},{upsert:true})
  res.json({ok:true})
})


app.get('/api/dsa/progress', auth, async (req, res) => {
  const rows = await db.collection('dsaProgress').find({ userId: new ObjectId(req.userId) }).toArray()
  const progress = Object.fromEntries(rows.map(row => [row.problemId, { status: row.status, attempts: row.attempts || 0, notes: row.notes || '', lastAttempted: row.lastAttempted?.toISOString?.() || row.lastAttempted, completedAt: row.completedAt?.toISOString?.() || row.completedAt }]))
  res.json({ progress })
})

app.put('/api/dsa/problems/:problemId/progress', auth, async (req, res) => {
  const { problemId } = req.params
  const { status, notes } = req.body || {}
  const allowed = ['not-started','attempted','solved','revision']
  if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid DSA status.' })
  const now = new Date()
  const existing = await db.collection('dsaProgress').findOne({ userId: new ObjectId(req.userId), problemId })
  const update = { status, attempts: (existing?.attempts || 0) + 1, notes: typeof notes === 'string' ? notes : (existing?.notes || ''), lastAttempted: now, updatedAt: now }
  if (status === 'solved') update.completedAt = now
  await db.collection('dsaProgress').updateOne({ userId: new ObjectId(req.userId), problemId }, { $set: update, $setOnInsert: { userId: new ObjectId(req.userId), problemId, createdAt: now } }, { upsert: true })
  res.json({ ok: true })
})

app.put('/api/dsa/problems/:problemId/notes', auth, async (req, res) => {
  const { problemId } = req.params
  const notes = typeof req.body?.notes === 'string' ? req.body.notes : ''
  const now = new Date()
  await db.collection('dsaProgress').updateOne({ userId: new ObjectId(req.userId), problemId }, { $set: { notes, updatedAt: now }, $setOnInsert: { userId: new ObjectId(req.userId), problemId, status: 'not-started', attempts: 0, createdAt: now } }, { upsert: true })
  res.json({ ok: true })
})


// ---------- Notes / Projects / Resources ----------
function uid(value) { return String(value || '') }

app.get('/api/notes', auth, async (req,res) => {
  const rows = await db.collection('notes').find({userId:new ObjectId(req.userId)}).sort({updatedAt:-1}).toArray()
  res.json({notes: rows.map(({_id,userId,...note})=>note)})
})
app.post('/api/notes', auth, async (req,res) => {
  const note=req.body?.note || req.body
  if(!note?.id || !note?.title) return res.status(400).json({message:'Note id and title are required.'})
  const now=new Date(); const userId=new ObjectId(req.userId)
  const clean={...note,id:uid(note.id),updatedAt:note.updatedAt || now.toISOString(),createdAt:note.createdAt || now.toISOString(),pinned:Boolean(note.pinned),tags:Array.isArray(note.tags)?note.tags:[]}
  await db.collection('notes').updateOne({userId,id:clean.id},{$set:{...clean,userId,updatedAt:now},$setOnInsert:{createdAt:now}},{upsert:true})
  res.json({note:clean})
})
app.delete('/api/notes/:noteId', auth, async (req,res)=>{ await db.collection('notes').deleteOne({userId:new ObjectId(req.userId),id:req.params.noteId}); res.json({ok:true}) })

app.get('/api/projects', auth, async (req,res) => {
  const rows=await db.collection('projects').find({userId:new ObjectId(req.userId)}).sort({updatedAt:-1}).toArray()
  res.json({projects:rows.map(({_id,userId,...project})=>project)})
})
app.post('/api/projects', auth, async (req,res) => {
  const project=req.body?.project || req.body
  if(!project?.id || !project?.name) return res.status(400).json({message:'Project id and name are required.'})
  const now=new Date(); const userId=new ObjectId(req.userId)
  const clean={...project,id:uid(project.id),technologies:Array.isArray(project.technologies)?project.technologies:[],relatedSkills:Array.isArray(project.relatedSkills)?project.relatedSkills:[],updatedAt:project.updatedAt || now.toISOString(),createdAt:project.createdAt || now.toISOString()}
  await db.collection('projects').updateOne({userId,id:clean.id},{$set:{...clean,userId,updatedAt:now},$setOnInsert:{createdAt:now}},{upsert:true})
  res.json({project:clean})
})
app.delete('/api/projects/:projectId', auth, async (req,res)=>{ await db.collection('projects').deleteOne({userId:new ObjectId(req.userId),id:req.params.projectId}); res.json({ok:true}) })

const DEFAULT_RESOURCES = [
 {id:'js-es6',title:'JavaScript ES6 Complete Guide',skill:'JavaScript',topic:'Modern JavaScript',type:'Documentation',difficulty:'Beginner',duration:'45 min',description:'A practical guide to modern syntax, modules, promises, and async JavaScript.',url:'https://developer.mozilla.org/en-US/docs/Web/JavaScript'},
 {id:'arrays',title:'Arrays & Strings Practice',skill:'DSA',topic:'Arrays and Strings',type:'Coding Practice',difficulty:'Intermediate',duration:'60 min',description:'Sharpen your problem-solving with a curated set of array and string patterns.',url:'https://leetcode.com/problemset/'},
 {id:'sql-interviews',title:'SQL Interview Questions',skill:'DBMS',topic:'SQL',type:'Interview Questions',difficulty:'Intermediate',duration:'40 min',description:'Review joins, aggregation, subqueries, and common database interview prompts.',url:'https://www.interviewquery.com/questions'},
 {id:'react-props',title:'React Components & Props',skill:'React.js',topic:'React fundamentals',type:'Videos',difficulty:'Beginner',duration:'55 min',description:'Learn to compose reusable components and pass data cleanly through props.',url:'https://react.dev/learn'},
 {id:'python-ml',title:'Python for Machine Learning',skill:'Python',topic:'Python',type:'Notes',difficulty:'Beginner',duration:'75 min',description:'Refresh the Python concepts most useful for data and machine learning work.',url:'https://docs.python.org/3/tutorial/'},
 {id:'mock-quiz',title:'CS Fundamentals Quiz',skill:'Operating Systems',topic:'OS fundamentals',type:'Quizzes',difficulty:'Intermediate',duration:'25 min',description:'Test your understanding of processes, memory, and scheduling.',url:'https://www.geeksforgeeks.org/operating-systems-gq/'},
 {id:'portfolio',title:'Build a Placement Portfolio',skill:'Projects',topic:'Portfolio project',type:'Projects',difficulty:'Advanced',duration:'4 hours',description:'Create a polished project that makes your skills easy for recruiters to evaluate.',url:'https://github.com/'},
]
app.get('/api/resources', auth, async (req,res) => {
  const userId=new ObjectId(req.userId)
  const custom=await db.collection('resources').find({userId}).toArray()
  const completions=await db.collection('resourceCompletions').find({userId}).toArray()
  const customMap=new Map(custom.map(({_id,userId,...r})=>[r.id,r]))
  const resources=[...DEFAULT_RESOURCES.filter(r=>!customMap.has(r.id)),...customMap.values()]
  res.json({resources,completed:Object.fromEntries(completions.map(r=>[r.resourceId,Boolean(r.completed)]))})
})
app.post('/api/resources', auth, async (req,res) => {
  const resource=req.body?.resource || req.body
  if(!resource?.id || !resource?.title) return res.status(400).json({message:'Resource id and title are required.'})
  const now=new Date(); const userId=new ObjectId(req.userId)
  const clean={...resource,id:uid(resource.id),createdAt:resource.createdAt||now.toISOString(),updatedAt:now.toISOString()}
  await db.collection('resources').updateOne({userId,id:clean.id},{$set:{...clean,userId,updatedAt:now},$setOnInsert:{createdAt:now}},{upsert:true})
  res.json({resource:clean})
})
app.put('/api/resources/:resourceId/completion', auth, async (req,res) => {
  const completed=Boolean(req.body?.completed); const now=new Date(); const userId=new ObjectId(req.userId)
  await db.collection('resourceCompletions').updateOne({userId,resourceId:req.params.resourceId},{$set:{completed,updatedAt:now},$setOnInsert:{userId,resourceId:req.params.resourceId,createdAt:now}},{upsert:true})
  res.json({ok:true,completed})
})

app.use((_req,res) => res.status(404).json({ message:'API route not found.' }))
app.use((error,_req,res,_next) => { console.error(error); if (res.headersSent) return; res.status(500).json({ message:'Internal server error.' }) })

const server = app.listen(PORT, '0.0.0.0', async () => {
  try { await connectDB(); console.log(`SkillPilot AI API running on http://localhost:${PORT}`) }
  catch (error) { console.error('MongoDB connection failed:', error.message); process.exit(1) }
})
process.on('SIGINT', async () => { await client?.close(); server.close(() => process.exit(0)) })
