export interface Skill {
  id: string
  name: string
  category: string
  progress: number
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  targetLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  lastUpdated: string
}

export const skillCategories = [
  'Programming',
  'Web Development',
  'AI / ML',
  'CS Fundamentals',
  'Databases',
  'Tools',
  'Soft Skills',
]

export const initialSkills: Skill[] = [
  // Programming
  { id: 'cpp', name: 'C++', category: 'Programming', progress: 45, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '2 days ago' },
  { id: 'python', name: 'Python', category: 'Programming', progress: 65, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '1 day ago' },
  { id: 'java', name: 'Java', category: 'Programming', progress: 55, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '3 days ago' },
  { id: 'javascript', name: 'JavaScript', category: 'Programming', progress: 55, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '1 day ago' },

  // Web Development
  { id: 'html', name: 'HTML', category: 'Web Development', progress: 80, currentLevel: 'Advanced', targetLevel: 'Advanced', lastUpdated: '5 days ago' },
  { id: 'css', name: 'CSS', category: 'Web Development', progress: 75, currentLevel: 'Advanced', targetLevel: 'Advanced', lastUpdated: '4 days ago' },
  { id: 'reactjs', name: 'React.js', category: 'Web Development', progress: 30, currentLevel: 'Beginner', targetLevel: 'Advanced', lastUpdated: '1 day ago' },
  { id: 'nodejs', name: 'Node.js', category: 'Web Development', progress: 22, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '5 days ago' },
  { id: 'expressjs', name: 'Express.js', category: 'Web Development', progress: 18, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '6 days ago' },

  // AI / ML
  { id: 'ml', name: 'Machine Learning', category: 'AI / ML', progress: 45, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '2 days ago' },
  { id: 'dl', name: 'Deep Learning', category: 'AI / ML', progress: 35, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '3 days ago' },
  { id: 'nlp', name: 'NLP', category: 'AI / ML', progress: 28, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '4 days ago' },
  { id: 'cv', name: 'Computer Vision', category: 'AI / ML', progress: 25, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '5 days ago' },
  { id: 'genai', name: 'Generative AI', category: 'AI / ML', progress: 40, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '1 day ago' },

  // CS Fundamentals
  { id: 'dsa', name: 'DSA', category: 'CS Fundamentals', progress: 54, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '1 day ago' },
  { id: 'oop', name: 'OOP', category: 'CS Fundamentals', progress: 70, currentLevel: 'Advanced', targetLevel: 'Advanced', lastUpdated: '3 days ago' },
  { id: 'dbms', name: 'DBMS', category: 'CS Fundamentals', progress: 70, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '2 days ago' },
  { id: 'os', name: 'Operating Systems', category: 'CS Fundamentals', progress: 50, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '4 days ago' },
  { id: 'cn', name: 'Computer Networks', category: 'CS Fundamentals', progress: 48, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '5 days ago' },
  { id: 'co', name: 'Computer Organization', category: 'CS Fundamentals', progress: 42, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '6 days ago' },

  // Databases
  { id: 'sql', name: 'SQL', category: 'Databases', progress: 61, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '2 days ago' },
  { id: 'mysql', name: 'MySQL', category: 'Databases', progress: 58, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '3 days ago' },
  { id: 'mongodb', name: 'MongoDB', category: 'Databases', progress: 35, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '4 days ago' },
  { id: 'postgresql', name: 'PostgreSQL', category: 'Databases', progress: 40, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '5 days ago' },

  // Tools
  { id: 'git', name: 'Git', category: 'Tools', progress: 85, currentLevel: 'Advanced', targetLevel: 'Advanced', lastUpdated: '1 day ago' },
  { id: 'github', name: 'GitHub', category: 'Tools', progress: 82, currentLevel: 'Advanced', targetLevel: 'Advanced', lastUpdated: '2 days ago' },
  { id: 'linux', name: 'Linux', category: 'Tools', progress: 65, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '3 days ago' },
  { id: 'docker', name: 'Docker', category: 'Tools', progress: 32, currentLevel: 'Beginner', targetLevel: 'Intermediate', lastUpdated: '5 days ago' },

  // Soft Skills
  { id: 'communication', name: 'Communication', category: 'Soft Skills', progress: 75, currentLevel: 'Advanced', targetLevel: 'Advanced', lastUpdated: '2 days ago' },
  { id: 'ps', name: 'Problem Solving', category: 'Soft Skills', progress: 68, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '1 day ago' },
  { id: 'aptitude', name: 'Aptitude', category: 'Soft Skills', progress: 50, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '3 days ago' },
  { id: 'interview', name: 'Interview Skills', category: 'Soft Skills', progress: 55, currentLevel: 'Intermediate', targetLevel: 'Advanced', lastUpdated: '2 days ago' },
]
