// Interview data types and interfaces
export type InterviewType = 'Technical' | 'HR' | 'Behavioral' | 'Mixed'
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced'
export type QuestionNumber = 5 | 10 | 15

export interface InterviewConfig {
  targetRole: string
  interviewType: InterviewType
  difficulty: DifficultyLevel
  numQuestions: QuestionNumber
}

export interface InterviewQuestion {
  id: string
  questionNumber: number
  text: string
  category: string // e.g., "React", "System Design", "Communication"
  difficulty: DifficultyLevel
  interviewType: InterviewType
  relevantSkills: string[]
  expectedKeyPoints?: string[] // For reference, not for evaluation
}

export interface InterviewAnswer {
  questionId: string
  text: string
  submittedAt: Date
  skipped: boolean
}

export interface EvaluationCriteria {
  technicalAccuracy: number // 0-100
  relevance: number // 0-100
  completeness: number // 0-100
  clarity: number // 0-100
}

export interface InterviewEvaluation {
  answerId: string
  questionId: string
  overallScore: number // 0-100
  criteria: EvaluationCriteria
  strengths: string[]
  improvements: string[]
  missingConcepts: string[]
  betterApproach: string
  followUpQuestion?: string
  feedback: string
}

export interface InterviewSession {
  id: string
  config: InterviewConfig
  startedAt: Date
  completedAt?: Date
  questions: InterviewQuestion[]
  answers: InterviewAnswer[]
  evaluations: InterviewEvaluation[]
  currentQuestionIndex: number
  isCompleted: boolean
}

export interface InterviewSummary {
  sessionId: string
  config: InterviewConfig
  overallPerformance: number
  technicalPerformance: number
  communicationClarity: number
  strongAreas: string[]
  weakAreas: string[]
  topicsToRevise: string[]
  recommendedResources: RecommendedResource[]
  completedAt: Date
  totalTimeMinutes: number
}

export interface RecommendedResource {
  title: string
  type: 'article' | 'video' | 'practice' | 'course'
  topic: string
  url?: string
}

export interface SkillGap {
  skill: string
  currentLevel: DifficultyLevel
  targetLevel: DifficultyLevel
}
