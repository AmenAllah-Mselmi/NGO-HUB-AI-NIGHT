import supabase from '../../../utils/supabase'

// Types
export interface Objective {
  id: string
  title: string
  description: string | null
  feature: string | null
  group_objectif: string | null
  action_type: string | null
  cible: string[] | null
  target_count: number
  points: number
  difficulty: 'easy' | 'medium' | 'hard' | 'expert' | null
  privacy: 'public' | 'private'
  is_active: boolean
  start_date: string | null
  end_date: string | null
  created_at: string
}

export interface MemberObjective {
  id: string
  member_id: string
  objective_id: string
  current_count: number
  is_completed: boolean
  completed_at: string | null
  points_earned: number
  started_at: string
  objective?: Objective
}

export interface PointsHistoryEntry {
  id: string
  member_id: string
  points: number
  source_type: 'activity' | 'objective' | 'bonus' | 'manual'
  source_id: string | null
  description: string | null
  created_at: string
}

export interface PointsStats {
  total: number
  thisWeek: number
  thisMonth: number
  thisYear: number
  weeklyData: { week: string; points: number }[]
  monthlyData: { month: string; points: number }[]
}

// Service
export const objectivesService = {
  // ============ OBJECTIVES ============
  
  async getObjectives(activeOnly = true): Promise<Objective[]> {
    let query = supabase.from('objectives').select('*').order('created_at', { ascending: false })
    if (activeOnly) query = query.eq('is_active', true)
    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async getObjectiveById(id: string): Promise<Objective | null> {
    const { data, error } = await supabase.from('objectives').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async createObjective(objective: Partial<Objective>): Promise<Objective> {
    const { data, error } = await supabase.from('objectives').insert(objective).select().single()
    if (error) throw error
    return data
  },

  async updateObjective(id: string, updates: Partial<Objective>): Promise<Objective> {
    const { data, error } = await supabase.from('objectives').update(updates).eq('id', id).select().single()
    if (error) throw error
    return data
  },

  async deleteObjective(id: string): Promise<void> {
    const { error } = await supabase.from('objectives').delete().eq('id', id)
    if (error) throw error
  },

  // ============ MEMBER OBJECTIVES ============

  async getMemberObjectives(memberId: string): Promise<MemberObjective[]> {
    const { data, error } = await supabase
      .from('member_objectives')
      .select('*, objective:objectives(*)')
      .eq('member_id', memberId)
      .order('started_at', { ascending: false })
    if (error) throw error
    return data || []
  },

  async assignObjective(memberId: string, objectiveId: string): Promise<MemberObjective> {
    const { data, error } = await supabase
      .from('member_objectives')
      .insert({ member_id: memberId, objective_id: objectiveId })
      .select('*, objective:objectives(*)')
      .single()
    if (error) throw error
    return data
  },

  async updateProgress(memberObjectiveId: string, increment: number = 1): Promise<MemberObjective> {
    // Get current progress
    const { data: current } = await supabase
      .from('member_objectives')
      .select('*, objective:objectives(*)')
      .eq('id', memberObjectiveId)
      .single()
    
    if (!current) throw new Error('Not found')

    const newCount = current.current_count + increment
    const isCompleted = newCount >= (current.objective?.target_count || 1)
    
    const updates: any = { current_count: newCount }
    if (isCompleted && !current.is_completed) {
      updates.is_completed = true
      updates.completed_at = new Date().toISOString()
      updates.points_earned = current.objective?.points || 0

      // Award points to member
      await supabase.from('profiles').update({ 
        points: supabase.rpc('increment_points', { amount: current.objective?.points || 0 }) 
      }).eq('id', current.member_id)

      // Log to points history
      await this.logPoints(current.member_id, current.objective?.points || 0, 'objective', current.objective_id, `Completed: ${current.objective?.title}`)
    }

    const { data, error } = await supabase
      .from('member_objectives')
      .update(updates)
      .eq('id', memberObjectiveId)
      .select('*, objective:objectives(*)')
      .single()
    
    if (error) throw error
    return data
  },

  // ============ POINTS HISTORY ============

  async logPoints(memberId: string, points: number, sourceType: string, sourceId?: string, description?: string): Promise<void> {
    await supabase.from('points_history').insert({
      member_id: memberId,
      points,
      source_type: sourceType,
      source_id: sourceId || null,
      description: description || null
    })
  },

  async getPointsHistory(memberId: string, limit = 50): Promise<PointsHistoryEntry[]> {
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (error) throw error
    return data || []
  },

  async getPointsStats(memberId: string): Promise<PointsStats> {
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Fetch all history for this year
    const { data, error } = await supabase
      .from('points_history')
      .select('*')
      .eq('member_id', memberId)
      .gte('created_at', startOfYear.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error
    const history = data || []

    // Calculate stats
    let total = 0, thisWeek = 0, thisMonth = 0, thisYear = 0
    const weeklyMap = new Map<string, number>()
    const monthlyMap = new Map<string, number>()

    history.forEach(entry => {
      const date = new Date(entry.created_at)
      thisYear += entry.points
      total += entry.points

      if (date >= startOfMonth) thisMonth += entry.points
      if (date >= startOfWeek) thisWeek += entry.points

      // Weekly aggregation
      const weekKey = `W${getWeekNumber(date)}`
      weeklyMap.set(weekKey, (weeklyMap.get(weekKey) || 0) + entry.points)

      // Monthly aggregation
      const monthKey = date.toLocaleString('default', { month: 'short' })
      monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + entry.points)
    })

    return {
      total,
      thisWeek,
      thisMonth,
      thisYear,
      weeklyData: Array.from(weeklyMap.entries()).map(([week, points]) => ({ week, points })),
      monthlyData: Array.from(monthlyMap.entries()).map(([month, points]) => ({ month, points }))
    }
  }
}

// Helper
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}
