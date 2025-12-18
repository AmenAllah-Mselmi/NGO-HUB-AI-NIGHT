import { Plus, Trash2, Clock } from 'lucide-react'
import { calculateTotalTime, createAgendaItem, type AgendaItem } from '../../../models/MeetingAgenda'

interface MeetingAgendaProps {
  agenda: AgendaItem[]
  onChange: (agenda: AgendaItem[]) => void
  disabled?: boolean
}

export default function MeetingAgenda({ agenda, onChange, disabled = false }: MeetingAgendaProps) {
  const handleAddItem = () => {
    onChange([...agenda, createAgendaItem()])
  }

  const handleRemoveItem = (id: string) => {
    onChange(agenda.filter(item => item.id !== id))
  }

  const handleUpdateItem = (id: string, field: 'title' | 'estimatedTime', value: string | number) => {
    onChange(
      agenda.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const totalMinutes = calculateTotalTime(agenda)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Meeting Agenda
        </label>
        {totalMinutes > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            Total: {hours > 0 ? `${hours}h ` : ''}{minutes}min
          </div>
        )}
      </div>

      <div className="space-y-3">
        {agenda.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <p className="text-sm text-gray-500">No agenda items yet</p>
            <p className="text-xs text-gray-400 mt-1">Click "Add Agenda Item" to start</p>
          </div>
        ) : (
          agenda.map((item, index) => (
            <div key={item.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                {index + 1}
              </div>
              
              <div className="flex-1 space-y-3">
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                  placeholder="Agenda item title..."
                  disabled={disabled}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <input
                    type="number"
                    value={item.estimatedTime}
                    onChange={(e) => handleUpdateItem(item.id, 'estimatedTime', parseInt(e.target.value) || 0)}
                    min="0"
                    placeholder="0"
                    disabled={disabled}
                    className="w-24 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveItem(item.id)}
                disabled={disabled}
                className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Remove agenda item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 text-gray-700 rounded-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="h-5 w-5" />
        Add Agenda Item
      </button>
    </div>
  )
}
