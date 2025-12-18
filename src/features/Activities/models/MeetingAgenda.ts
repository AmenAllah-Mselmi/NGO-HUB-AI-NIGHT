// Meeting Agenda Types
export interface AgendaItem {
  id: string
  title: string
  estimatedTime: number // in minutes
}

export interface MeetingAgenda {
  items: AgendaItem[]
}

// Helper functions
export const createAgendaItem = (title: string = '', estimatedTime: number = 0): AgendaItem => ({
  id: crypto.randomUUID(),
  title,
  estimatedTime
})

export const serializeAgenda = (agenda: AgendaItem[]): string => {
  return JSON.stringify(agenda)
}

export const parseAgenda = (agendaString: string | null | undefined): AgendaItem[] => {
  if (!agendaString) return []
  
  try {
    const parsed = JSON.parse(agendaString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const calculateTotalTime = (agenda: AgendaItem[]): number => {
  return agenda.reduce((total, item) => total + item.estimatedTime, 0)
}
