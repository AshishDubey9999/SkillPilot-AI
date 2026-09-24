export interface Note {
  id: string
  title: string
  skill: string
  topic: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  pinned: boolean
}

export const skillOptions = [
  'DSA',
  'JavaScript',
  'React',
  'DBMS',
  'OS',
  'Computer Networks',
  'AI/ML',
  'Python',
  'Java',
  'Other',
]

export const topicOptions: Record<string, string[]> = {
  DSA: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Sorting', 'Searching', 'Dynamic Programming', 'Greedy'],
  JavaScript: ['ES6+', 'Async/Await', 'DOM', 'Promises', 'Closures', 'Prototypes', 'This Binding'],
  React: ['Components', 'Hooks', 'State Management', 'Props', 'Effects', 'Context API', 'Performance'],
  DBMS: ['SQL', 'Normalization', 'Transactions', 'Indexing', 'Queries', 'Relations'],
  OS: ['Processes', 'Threads', 'Memory Management', 'Scheduling', 'Synchronization'],
  'Computer Networks': ['OSI Model', 'TCP/IP', 'DNS', 'HTTP', 'Routing', 'Security'],
  'AI/ML': ['Supervised Learning', 'Neural Networks', 'Data Preprocessing', 'Model Evaluation'],
  Python: ['Basics', 'OOP', 'Libraries', 'File Handling'],
  Java: ['OOP', 'Collections', 'Threads', 'Exception Handling'],
  Other: ['General', 'Interview Prep', 'Project Ideas'],
}
