import { generateAIInterviewQuestion, evaluateAIInterviewAnswer, saveInterviewSessionRemote } from '@/services/ai-service'
import { isApiEnabled } from '@/services/api-client'

import {
  InterviewConfig,
  InterviewQuestion,
  InterviewAnswer,
  InterviewEvaluation,
  InterviewSession,
  InterviewSummary,
  DifficultyLevel,
  InterviewType,
  SkillGap,
} from '@/lib/interview-types'

// Mock skill gaps - in real app, would come from user profile
const mockSkillGaps: SkillGap[] = [
  { skill: 'React', currentLevel: 'Beginner', targetLevel: 'Intermediate' },
  { skill: 'System Design', currentLevel: 'Beginner', targetLevel: 'Intermediate' },
  { skill: 'DSA', currentLevel: 'Intermediate', targetLevel: 'Advanced' },
  { skill: 'Communication', currentLevel: 'Intermediate', targetLevel: 'Advanced' },
]

// Mock question bank for generating contextual questions
const questionTemplates: Record<InterviewType, Record<DifficultyLevel, string[]>> = {
  Technical: {
    Beginner: [
      'Explain how {skill} works and describe a simple use case.',
      'What are the key concepts in {skill}? How would you explain them to a junior developer?',
      'Describe a basic implementation of {skill}. What are its main components?',
      'How does {skill} handle {aspect}? Can you walk through an example?',
      'What are the advantages of using {skill}? When would you choose it?',
    ],
    Intermediate: [
      'Walk through the architecture of a {skill} system for handling {scenario}.',
      'How would you optimize {skill} for {constraint}? What tradeoffs would you consider?',
      'Describe potential issues with {skill} in {context} and how you would solve them.',
      'Compare {skill} with {alternative}. When would you use each?',
      'Design a solution using {skill} that handles {requirement}.',
    ],
    Advanced: [
      'Design a scalable {skill} system that handles {scale}. Explain your architectural decisions.',
      'How would you debug and optimize a complex {skill} issue affecting {impact}?',
      'Walk through a challenging problem you solved with {skill}. What made it difficult?',
      'Describe the advanced patterns and best practices in {skill} at scale.',
      'How would you approach building a production-grade {skill} system?',
    ],
  },
  HR: {
    Beginner: [
      'Tell me about yourself and your background in {skill}.',
      'Why are you interested in a role involving {skill}?',
      'Describe a time when you learned something new quickly. How did you approach it?',
      'What motivates you as a developer?',
      'How do you handle receiving feedback or criticism?',
    ],
    Intermediate: [
      'Tell me about a challenging project you worked on with {skill}. How did you overcome obstacles?',
      'Describe a time you had to work with a difficult team member. How did you handle it?',
      'What are your long-term career goals? How does this role align with them?',
      'Give an example of when you took initiative and led a project or initiative.',
      'How do you stay updated with new technologies and trends?',
    ],
    Advanced: [
      'Tell me about your most significant technical achievement and the impact it had.',
      'Describe a time when you had to make a difficult decision. Walk me through your thought process.',
      'How have you grown as an engineer? What challenges helped you develop?',
      'Tell me about a time when you had to influence others or drive change.',
      'What leadership qualities do you believe are most important in tech?',
    ],
  },
  Behavioral: {
    Beginner: [
      'Describe a situation where you had to learn {skill} from scratch. How did you do it?',
      'Tell me about a time you made a mistake. How did you handle it?',
      'Describe a project where you worked on a team. What was your role?',
      'When have you had to adapt to change? How did you cope?',
      'Tell me about a goal you set and achieved.',
    ],
    Intermediate: [
      'Tell me about a conflict you had with a team member or stakeholder. How did you resolve it?',
      'Describe a situation where you had to prioritize multiple tasks. How did you decide?',
      'Tell me about a time you had to deliver something under time pressure.',
      'Describe a situation where your initial approach didn\'t work. How did you adapt?',
      'When have you had to communicate complex technical ideas to non-technical people?',
    ],
    Advanced: [
      'Tell me about a major project failure. What did you learn and how did you apply it?',
      'Describe a time when you had to advocate for something unpopular. How did you approach it?',
      'Tell me about your biggest accomplishment and what made it challenging.',
      'Describe a situation where you had to mentor or help grow another team member.',
      'When have you had to make a decision with incomplete information? Walk me through it.',
    ],
  },
  Mixed: {
    Beginner: [
      'Tell me about your experience with {skill}. How would you explain it to someone?',
      'What attracted you to learning {skill}? Describe a project where you used it.',
      'How do you approach learning new technical skills?',
      'Tell me about a time you collaborated with others on a {skill} project.',
      'What challenges have you faced with {skill} and how did you overcome them?',
    ],
    Intermediate: [
      'Walk through a technical problem you solved using {skill}. What was your approach?',
      'Describe your most complex project involving {skill}. What made it challenging?',
      'Tell me about a time you had to make architectural decisions with {skill}.',
      'How do you stay current with {skill}? Give an example of something you learned recently.',
      'Describe a disagreement about {skill} implementation. How did you resolve it?',
    ],
    Advanced: [
      'Design a system using {skill} that solves {businessProblem}. Walk through your decisions.',
      'Tell me about leading or influencing technical decisions around {skill}.',
      'Describe your evolution with {skill}. How have your views and approaches changed?',
      'What cutting-edge aspects of {skill} are you exploring? Why do they interest you?',
      'How would you approach mentoring a team in modern {skill} practices?',
    ],
  },
}

/**
 * Generate an interview question based on config and context
 * This function is abstracted to enable future AI integration
 * @param config Interview configuration
 * @param currentSkills User's current skills
 * @param skillGaps Gaps between current and target skills
 * @param previousQuestions Questions already asked
 * @param questionNumber Current question number
 * @returns Generated interview question
 */
export async function generateInterviewQuestion(
  config: InterviewConfig,
  currentSkills: string[],
  skillGaps: SkillGap[],
  previousQuestions: InterviewQuestion[],
  questionNumber: number
): Promise<InterviewQuestion> {
  if (isApiEnabled()) {
    try {
      const response = await generateAIInterviewQuestion({ config, currentSkills, skillGaps, previousQuestions })
      return response.result as InterviewQuestion
    } catch (error) {
      console.warn('AI question generation unavailable; using local fallback.', error)
    }
  }

  // Local fallback when the AI backend is unavailable.

  // Select a skill gap or relevant skill
  const targetSkill = skillGaps[questionNumber % skillGaps.length]?.skill || currentSkills[0] || 'software development'

  // Get template for this difficulty
  const templates = questionTemplates[config.interviewType][config.difficulty]
  const template = templates[questionNumber % templates.length]

  // Fill in template variables (in real implementation, AI would generate unique questions)
  let questionText = template
    .replace('{skill}', targetSkill)
    .replace('{aspect}', ['state management', 'performance', 'security', 'scalability'][questionNumber % 4])
    .replace('{scenario}', ['high traffic', 'distributed system', 'real-time updates'][questionNumber % 3])
    .replace('{constraint}', ['memory usage', 'response time', 'maintainability'][questionNumber % 3])
    .replace('{context}', ['production', 'at scale', 'with legacy code'][questionNumber % 3])
    .replace('{requirement}', ['100k concurrent users', 'sub-100ms latency', 'offline support'][questionNumber % 3])
    .replace('{scale}', ['millions of users', 'terabytes of data', 'global distribution'][questionNumber % 3])
    .replace('{impact}', ['user experience', 'system performance', 'business metrics'][questionNumber % 3])
    .replace('{alternative}', ['REST vs GraphQL', 'SQL vs NoSQL', 'sync vs async'][questionNumber % 3])
    .replace('{businessProblem}', ['customer retention', 'real-time collaboration', 'content delivery'][questionNumber % 3])

  return {
    id: `q-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    questionNumber,
    text: questionText,
    category: targetSkill,
    difficulty: config.difficulty,
    interviewType: config.interviewType,
    relevantSkills: [targetSkill],
  }
}

/**
 * Evaluate an interview answer based on config and question
 * This function is abstracted to enable future AI integration
 * @param question The interview question
 * @param answer User's answer
 * @param targetRole Target role for the position
 * @param relevantSkill The skill being assessed
 * @returns Evaluation with score and feedback
 */
export async function evaluateInterviewAnswer(
  question: InterviewQuestion,
  answer: string,
  targetRole: string,
  relevantSkill: string
): Promise<InterviewEvaluation> {
  if (isApiEnabled()) {
    try {
      const response = await evaluateAIInterviewAnswer({ question, answer, targetRole, relevantSkill })
      return { answerId: `a-${Date.now()}`, questionId: question.id, ...response.result } as InterviewEvaluation
    } catch (error) {
      console.warn('AI evaluation unavailable; using local fallback.', error)
    }
  }

  // Local fallback when the AI backend is unavailable.

  const answerLength = answer.trim().length
  const hasExamples = /example|for instance|like|such as|e\.g\.|like when/i.test(answer)
  const hasDetails = answerLength > 150
  const isSkipped = answer.trim().length === 0

  // Adaptive scoring based on answer quality indicators
  let technicalAccuracy = 50
  let relevance = 50
  let completeness = 50
  let clarity = 50

  if (!isSkipped) {
    technicalAccuracy = Math.min(95, 40 + (answerLength > 300 ? 30 : answerLength > 150 ? 20 : 10))
    relevance = Math.min(95, 40 + (hasDetails ? 30 : hasExamples ? 20 : 10))
    completeness = Math.min(95, 35 + (hasDetails ? 35 : hasExamples ? 25 : 15))
    clarity = Math.min(95, 45 + (answerLength > 200 && answerLength < 1000 ? 30 : answerLength > 500 ? 10 : 20))
  }

  const overallScore = Math.round((technicalAccuracy + relevance + completeness + clarity) / 4)

  return {
    answerId: `a-${Date.now()}`,
    questionId: question.id,
    overallScore: isSkipped ? 0 : overallScore,
    criteria: {
      technicalAccuracy,
      relevance,
      completeness,
      clarity,
    },
    strengths:
      isSkipped || answerLength < 50
        ? []
        : [
            hasDetails && 'Provided sufficient detail',
            hasExamples && 'Included practical examples',
            answerLength > 200 && 'Comprehensive response',
          ].filter(Boolean) as string[],
    improvements:
      isSkipped || answerLength < 50
        ? ['Provide a more detailed response', 'Include examples or specific scenarios']
        : [
            answerLength < 150 && 'Could provide more depth',
            !hasExamples && 'Consider including concrete examples',
            answerLength > 1000 && 'Could be more concise',
          ].filter(Boolean) as string[],
    missingConcepts:
      question.interviewType === 'Technical'
        ? ['Edge cases', 'Performance considerations', 'Error handling']
        : ['Specific metrics', 'Timeline', 'Team dynamics'],
    betterApproach:
      question.difficulty === 'Advanced'
        ? `Consider discussing the tradeoffs and scalability implications more thoroughly. A stronger approach would address ${relevantSkill} in the context of production systems.`
        : `Think about the practical implications and real-world scenarios when working with ${relevantSkill}.`,
    followUpQuestion:
      overallScore > 70
        ? `How would you handle edge cases or scale this ${relevantSkill} solution?`
        : `Can you walk through a specific example of how you've used ${relevantSkill}?`,
    feedback: isSkipped ? 'Question was skipped. Try to provide an answer even if you\'re not completely sure.' : `Your response shows good understanding of ${relevantSkill}. ${hasDetails ? 'The details provided are helpful.' : 'Adding more specific examples would strengthen your answer.'}`,
  }
}

/**
 * Generate interview summary from completed session
 * @param session Completed interview session
 * @returns Interview summary and analytics
 */
export async function generateInterviewSummary(session: InterviewSession): Promise<InterviewSummary> {
  // PLACEHOLDER: This function will eventually call the AI backend for advanced analysis

  const evaluations = session.evaluations
  const avgScore = evaluations.length > 0 ? Math.round(evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length) : 0
  const avgTechnical = evaluations.length > 0 ? Math.round(evaluations.reduce((sum, e) => sum + e.criteria.technicalAccuracy, 0) / evaluations.length) : 0
  const avgClarity = evaluations.length > 0 ? Math.round(evaluations.reduce((sum, e) => sum + e.criteria.clarity, 0) / evaluations.length) : 0

  // Extract strong and weak areas from evaluations
  const allStrengths = evaluations.flatMap((e) => e.strengths)
  const allImprovements = evaluations.flatMap((e) => e.improvements)
  const strengthCounts = new Map<string, number>()
  const improvementCounts = new Map<string, number>()

  allStrengths.forEach((s) => strengthCounts.set(s, (strengthCounts.get(s) || 0) + 1))
  allImprovements.forEach((i) => improvementCounts.set(i, (improvementCounts.get(i) || 0) + 1))

  const strongAreas = Array.from(strengthCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area)

  const weakAreas = Array.from(improvementCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([area]) => area)

  const topicsToRevise = evaluations
    .flatMap((e) => e.missingConcepts)
    .filter((v, i, a) => a.indexOf(v) === i)
    .slice(0, 5)

  const startTime = session.startedAt
  const endTime = session.completedAt || new Date()
  const totalTimeMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000)

  return {
    sessionId: session.id,
    config: session.config,
    overallPerformance: avgScore,
    technicalPerformance: avgTechnical,
    communicationClarity: avgClarity,
    strongAreas,
    weakAreas,
    topicsToRevise,
    recommendedResources: getRecommendedResources(session.config.targetRole, topicsToRevise),
    completedAt: endTime,
    totalTimeMinutes,
  }
}

/**
 * Get recommended resources based on topics to revise
 */
function getRecommendedResources(targetRole: string, topics: string[]) {
  const resources = [
    {
      title: 'System Design Primer',
      type: 'article' as const,
      topic: 'System Design',
    },
    {
      title: 'JavaScript Deep Dive',
      type: 'video' as const,
      topic: 'JavaScript',
    },
    {
      title: 'React Best Practices',
      type: 'course' as const,
      topic: 'React',
    },
    {
      title: 'Communication Skills for Developers',
      type: 'article' as const,
      topic: 'Communication',
    },
    {
      title: 'DSA Practice Problems',
      type: 'practice' as const,
      topic: 'DSA',
    },
  ]

  return resources.filter((r) => topics.some((t) => r.topic.toLowerCase().includes(t.toLowerCase())) || Math.random() > 0.5).slice(0, 3)
}

/**
 * Create a new interview session
 */
export async function createInterviewSession(config: InterviewConfig): Promise<InterviewSession> {
  const session: InterviewSession = {
    id: `session-${Date.now()}`,
    config,
    startedAt: new Date(),
    questions: [],
    answers: [],
    evaluations: [],
    currentQuestionIndex: 0,
    isCompleted: false,
  }

  // Generate first question
  const firstQuestion = await generateInterviewQuestion(config, [], mockSkillGaps, [], 1)
  session.questions.push(firstQuestion)

  return session
}

/**
 * Load interview history from localStorage
 */
export function loadInterviewHistory(): InterviewSession[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem('interview_history')
  return stored ? JSON.parse(stored) : []
}

/**
 * Save interview session to localStorage
 */
export function saveInterviewSession(session: InterviewSession): void {
  if (typeof window === 'undefined') return
  const history = loadInterviewHistory()
  const existingIndex = history.findIndex((s) => s.id === session.id)

  if (existingIndex >= 0) {
    history[existingIndex] = session
  } else {
    history.push(session)
  }

  localStorage.setItem('interview_history', JSON.stringify(history))
  if (isApiEnabled()) void saveInterviewSessionRemote(session).catch(() => undefined)
}
