export interface Participation {
  id: string
  activity_id: string
  member_id: string
  status: 'present' | 'excused' | 'absent'
  remarks?: string
  evaluation?: number
  created_at: string
  member?: {
    fullname: string
  }
}

export interface CreateParticipationDTO {
  activity_id: string
  member_id: string
  status: 'present' | 'excused' | 'absent'
  remarks?: string
  evaluation?: number
}
