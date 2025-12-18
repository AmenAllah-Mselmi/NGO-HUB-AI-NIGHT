export interface Candidate {
  id: string
  fullname: string
  email: string
  phone: string
  status: 'pending' | 'evaluated' | 'accepted' | 'rejected'
  total_score?: number
  max_possible_score?: number
  created_at: string
}

export type QuestionType = 'numeric' | 'choice' | 'text' | 'checkbox' | 'rating'

export interface QuestionOption {
  label: string
  score: number
}

export interface Question {
  id: string
  text: string
  type: QuestionType
  maxScore: number
  // For 'choice' type
  options?: QuestionOption[]
}

export interface EvaluationTemplate {
  id: string
  title: string
  description?: string
  questions: Question[]
  created_at: string
}

export interface Evaluation {
  id: string
  candidate_id: string
  template_id: string
  template_title: string 
  scores: Record<string, number> // questionId -> score
  text_answers?: Record<string, string> // questionId -> text answer
  total_score: number
  max_possible_score: number
  remarks?: string
  created_by: string
  created_at: string
}
