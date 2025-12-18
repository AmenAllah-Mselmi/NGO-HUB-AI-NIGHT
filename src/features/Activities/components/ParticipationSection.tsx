import { Plus, Trash2, User, ChevronUp, Clock, MessageSquare, Edit2, Check, X } from 'lucide-react'
import { useParticipation, type Participant } from '../hooks/useParticipation'
import MemberSelector from './MemberSelector'
import StarRating from './StarRating'
import LoadingSpinner from './LoadingSpinner'

interface ParticipationSectionProps {
  activityId: string
  activityPoints: number
}

export default function ParticipationSection({ activityId, activityPoints }: ParticipationSectionProps) {
  const {
    participants, members, loading, submitting, showForm, excludeIds,
    selectedMember, memberSearch, rate, notes,
    editingId, editRate, editNotes,
    setMemberSearch, setRate, setNotes, setEditRate, setEditNotes,
    toggleForm, handleAdd, handleDelete, handleSelectMember, handleClearSelection,
    startEdit, cancelEdit, saveEdit
  } = useParticipation({ activityId, activityPoints })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Header count={participants.length} points={activityPoints} showForm={showForm} onToggle={toggleForm} />
      
      {showForm && (
        <AddForm
          members={members}
          excludeIds={excludeIds}
          selectedMember={selectedMember}
          memberSearch={memberSearch}
          rate={rate}
          notes={notes}
          submitting={submitting}
          onSearchChange={setMemberSearch}
          onSelectMember={handleSelectMember}
          onClearSelection={handleClearSelection}
          onRateChange={setRate}
          onNotesChange={setNotes}
          onSubmit={handleAdd}
        />
      )}

      <ParticipantsList
        participants={participants}
        loading={loading}
        editingId={editingId}
        editRate={editRate}
        editNotes={editNotes}
        onEditRateChange={setEditRate}
        onEditNotesChange={setEditNotes}
        onStartEdit={startEdit}
        onCancelEdit={cancelEdit}
        onSaveEdit={saveEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}

// ============ SUB-COMPONENTS ============

function Header({ count, points, showForm, onToggle }: {
  count: number; points: number; showForm: boolean; onToggle: () => void
}) {
  return (
    <div className="p-4 sm:p-6 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Participants <span className="text-sm font-normal text-gray-500">({count})</span>
          </h3>
          {points > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Each gets <span className="font-bold text-(--color-mySecondary)">{points} points</span>
            </p>
          )}
        </div>
        <button type="button" onClick={onToggle} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-(--color-myPrimary) text-white text-sm font-medium rounded-lg transition-colors">
          {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Hide' : 'Add Participant'}
        </button>
      </div>
    </div>
  )
}

function AddForm({ members, excludeIds, selectedMember, memberSearch, rate, notes, submitting, onSearchChange, onSelectMember, onClearSelection, onRateChange, onNotesChange, onSubmit }: {
  members: { id: string; fullname: string }[]
  excludeIds: string[]
  selectedMember: string
  memberSearch: string
  rate: number
  notes: string
  submitting: boolean
  onSearchChange: (v: string) => void
  onSelectMember: (id: string) => void
  onClearSelection: () => void
  onRateChange: (v: number) => void
  onNotesChange: (v: string) => void
  onSubmit: (e: React.FormEvent) => void
}) {
  return (
    <form onSubmit={onSubmit} className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MemberSelector
          members={members}
          selectedMember={selectedMember}
          memberSearch={memberSearch}
          excludeIds={excludeIds}
          onSearchChange={onSearchChange}
          onSelectMember={onSelectMember}
          onClearSelection={onClearSelection}
        />
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Rate (Optional)</label>
          <StarRating value={rate} onChange={onRateChange} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
        <input type="text" value={notes} onChange={e => onNotesChange(e.target.value)} placeholder="e.g., Great participation..." className="w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5 px-3 border" />
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={submitting || !selectedMember} className="px-6 py-2.5 bg-(--color-mySecondary) text-white font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors min-w-[140px] justify-center">
          {submitting ? <><LoadingSpinner size="sm" /> Adding...</> : <><Plus className="w-4 h-4" /> Add</>}
        </button>
      </div>
    </form>
  )
}

function ParticipantsList({ participants, loading, editingId, editRate, editNotes, onEditRateChange, onEditNotesChange, onStartEdit, onCancelEdit, onSaveEdit, onDelete }: {
  participants: Participant[]
  loading: boolean
  editingId: string | null
  editRate: number
  editNotes: string
  onEditRateChange: (v: number) => void
  onEditNotesChange: (v: string) => void
  onStartEdit: (p: Participant) => void
  onCancelEdit: () => void
  onSaveEdit: (id: string) => void
  onDelete: (p: Participant) => void
}) {
  const formatDate = (d: string) => new Date(d).toLocaleDateString()

  if (loading) return <div className="p-8 text-center text-gray-500"><div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2" />Loading...</div>
  if (participants.length === 0) return <div className="p-8 text-center text-gray-500"><User className="w-10 h-10 mx-auto mb-2 text-gray-300" /><p>No participants yet</p></div>

  return (
    <div className="divide-y divide-gray-100">
      {participants.map(p => (
        <div key={p.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
          {editingId === p.id ? (
            <EditRow p={p} rate={editRate} notes={editNotes} onRateChange={onEditRateChange} onNotesChange={onEditNotesChange} onSave={() => onSaveEdit(p.id)} onCancel={onCancelEdit} />
          ) : (
            <ViewRow p={p} formatDate={formatDate} onEdit={() => onStartEdit(p)} onDelete={() => onDelete(p)} />
          )}
        </div>
      ))}
    </div>
  )
}

function ViewRow({ p, formatDate, onEdit, onDelete }: { p: Participant; formatDate: (d: string) => string; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{p.member?.fullname || 'Unknown'}</span>
          {p.rate && <StarRating value={p.rate} size="sm" disabled />}
          {p.is_temp && <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Temp</span>}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(p.registered_at)}</span>
          {p.notes && <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p.notes}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onEdit} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
        <button onClick={onDelete} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
      </div>
    </div>
  )
}

function EditRow({ p, rate, notes, onRateChange, onNotesChange, onSave, onCancel }: { p: Participant; rate: number; notes: string; onRateChange: (v: number) => void; onNotesChange: (v: string) => void; onSave: () => void; onCancel: () => void }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">{p.member?.fullname}</span>
        <div className="flex gap-2">
          <button onClick={onSave} className="p-1 text-green-600 hover:bg-green-50 rounded"><Check className="w-4 h-4" /></button>
          <button onClick={onCancel} className="p-1 text-gray-400 hover:bg-gray-100 rounded"><X className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="block text-xs text-gray-500 mb-1">Rate</label><StarRating value={rate} onChange={onRateChange} /></div>
        <div><label className="block text-xs text-gray-500 mb-1">Notes</label><input type="text" value={notes} onChange={e => onNotesChange(e.target.value)} className="w-full rounded border-gray-300 text-sm py-1.5 px-2 border" placeholder="Notes..." /></div>
      </div>
    </div>
  )
}
