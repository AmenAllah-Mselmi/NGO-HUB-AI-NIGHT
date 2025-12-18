import supabase from '../../../utils/supabase'
import type { Candidate, EvaluationTemplate, Evaluation } from '../models/types'

export const recruitmentService = {
  // --- Candidates ---
  async getCandidates() {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as Candidate[]
  },

  async addCandidate(candidate: Omit<Candidate, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('candidates')
      .insert(candidate)
      .select()
      .single()
      
    if (error) throw error
    return data as Candidate
  },

  async updateCandidate(id: string, updates: Partial<Omit<Candidate, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('candidates')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
      
    if (error) throw error
    return data as Candidate
  },

  async updateCandidateStatus(id: string, status: Candidate['status']) {
    const { error } = await supabase
      .from('candidates')
      .update({ status })
      .eq('id', id)
      
    if (error) throw error
  },

  async deleteCandidate(id: string) {
    const { error } = await supabase
      .from('candidates')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // --- Templates ---
  async getTemplates() {
    const { data, error } = await supabase
      .from('evaluation_templates')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data as EvaluationTemplate[]
  },

  async getTemplateById(id: string) {
    const { data, error } = await supabase
      .from('evaluation_templates')
      .select('*')
      .eq('id', id)
      .single()
      
    if (error) throw error
    return data as EvaluationTemplate
  },

  async saveTemplate(template: Omit<EvaluationTemplate, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('evaluation_templates')
      .insert(template)
      .select()
      .single()
      
    if (error) throw error
    return data as EvaluationTemplate
  },
// The most robust version, guaranteeing data retrieval:
async updateTemplate(id: string, updates: Partial<Omit<EvaluationTemplate, 'id' | 'created_at'>>) {
  const { data, error } = await supabase
    .from('evaluation_templates')
    .update(updates)
    .eq('id', id)
    .select() // <-- ADD THIS BACK
    
  if (error) throw error
  
  if (data.length === 0) {
    // This now confirms either ID not found, OR no changes were made.
    throw new Error(`EvaluationTemplate with ID "${id}" not found.`);
  }

  return data[0] as EvaluationTemplate // Return the guaranteed updated object
},
  async deleteTemplate(id: string) {
    const { error } = await supabase
      .from('evaluation_templates')
      .delete()
      .eq('id', id)
      
    if (error) throw error
  },

  // --- Evaluations ---
  async saveEvaluation(evaluation: Omit<Evaluation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('evaluations')
      .insert(evaluation)
      .select()
      .single()
      
    if (error) throw error
    return data as Evaluation
  },

  async getEvaluationsByCandidate(candidateId: string) {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .eq('candidate_id', candidateId)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data as Evaluation[]
  },

  async getAllEvaluations() {
    const { data, error } = await supabase
      .from('evaluations')
      .select('*')
      .order('created_at', { ascending: false })
      
    if (error) throw error
    return data as Evaluation[]
  }
}
