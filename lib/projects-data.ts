export interface Project {
  id: string
  name: string
  description: string
  type: 'Web Development' | 'AI/ML' | 'Data Science' | 'Full Stack' | 'Utility' | 'Other'
  technologies: string[]
  relatedSkills: string[]
  progress: number
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold'
  startDate: string
  expectedCompletion: string
  githubUrl: string
  liveDemoUrl: string
  createdAt: string
  updatedAt: string
}

export const projectTypes = ['Web Development', 'AI/ML', 'Data Science', 'Full Stack', 'Utility', 'Other'] as const

export const techStack = [
  'JavaScript',
  'React',
  'Node.js',
  'Express',
  'MongoDB',
  'PostgreSQL',
  'Python',
  'Flask',
  'Django',
  'Machine Learning',
  'TensorFlow',
  'PyTorch',
  'HTML/CSS',
  'Tailwind CSS',
  'Next.js',
  'TypeScript',
  'Git',
  'Docker',
  'AWS',
  'Firebase',
]

export const skillsList = [
  'DSA',
  'JavaScript',
  'React',
  'Node.js',
  'Python',
  'DBMS',
  'SQL',
  'MongoDB',
  'REST API',
  'Machine Learning',
  'Docker',
  'Git',
  'TypeScript',
]
