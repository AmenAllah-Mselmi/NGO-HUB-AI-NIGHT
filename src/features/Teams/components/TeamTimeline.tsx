import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Plus, Pencil, Trash2, Milestone } from 'lucide-react';
import type { TeamMilestone } from '../types';
import { getTeamMilestones, createTeamMilestone, updateTeamMilestone, deleteTeamMilestone } from '../services/teams.service';
import { toast } from 'sonner';

interface TeamTimelineProps {
    teamId: string;
    canManage: boolean;
}

export default function TeamTimeline({ teamId, canManage }: TeamTimelineProps) {
    const [milestones, setMilestones] = useState<TeamMilestone[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal State
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed'>('pending');

    useEffect(() => {
        if (teamId) loadMilestones();
    }, [teamId]);

    const loadMilestones = async () => {
        try {
            setIsLoading(true);
            const data = await getTeamMilestones(teamId);
            setMilestones(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load timeline");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDueDate('');
        setStatus('pending');
        setEditingId(null);
        setIsFormOpen(false);
    };

    const handleEdit = (m: TeamMilestone) => {
        setTitle(m.title);
        setDescription(m.description || '');
        setDueDate(m.due_date ? m.due_date.split('T')[0] : '');
        setStatus(m.status);
        setEditingId(m.id);
        setIsFormOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title) return toast.error("Title is required");

        const payload = {
            team_id: teamId,
            title,
            description: description || undefined,
            due_date: dueDate ? new Date(dueDate).toISOString() : undefined,
            status
        };

        try {
            if (editingId) {
                await updateTeamMilestone(editingId, payload);
                toast.success("Milestone updated");
            } else {
                await createTeamMilestone(payload);
                toast.success("Milestone added to timeline");
            }
            resetForm();
            loadMilestones();
        } catch (error) {
            toast.error("Failed to save milestone");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this milestone?")) return;
        try {
            await deleteTeamMilestone(id);
            toast.success("Milestone deleted");
            loadMilestones();
        } catch (error) {
            toast.error("Failed to delete milestone");
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 flex justify-center">
                <span className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black flex items-center gap-2">
                    <Milestone className="w-6 h-6 text-emerald-500" />
                    Timeline & Milestones
                </h2>
                {canManage && !isFormOpen && (
                    <button
                        onClick={() => setIsFormOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-widest rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Add Milestone
                    </button>
                )}
            </div>

            {isFormOpen && (
                <form onSubmit={handleSave} className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-8 max-w-2xl">
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Title *</label>
                            <input autoFocus required type="text" className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-emerald-500" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Target Date</label>
                            <input type="date" className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-emerald-500" value={dueDate} onChange={e => setDueDate(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Status</label>
                            <select className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-emerald-500" value={status} onChange={e => setStatus(e.target.value as any)}>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Description</label>
                            <textarea rows={2} className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-emerald-500 resize-none" value={description} onChange={e => setDescription(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={resetForm} className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg">Save Milestone</button>
                    </div>
                </form>
            )}

            {milestones.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                    <CalendarIcon className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-900">No milestones set</p>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto mt-1">Add key project deliverables or events to track the team team's long-term progress.</p>
                </div>
            ) : (
                <div className="relative border-l-2 border-gray-100 ml-3 md:ml-6 space-y-8 pb-4">
                    {milestones.map((m, idx) => {
                        const isExpired = m.due_date && m.status !== 'completed' && new Date(m.due_date) < new Date(new Date().setHours(0, 0, 0, 0));

                        let dotColor = "bg-gray-300 border-white";
                        if (m.status === 'completed') dotColor = "bg-emerald-500 border-white";
                        else if (m.status === 'in_progress') dotColor = "bg-blue-500 border-white";
                        else if (isExpired) dotColor = "bg-red-500 border-white";

                        return (
                            <div key={m.id} className="relative pl-6 md:pl-8 group">
                                {/* Timeline Dot */}
                                <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${dotColor} shadow-sm z-10 transition-transform group-hover:scale-125`} />

                                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-colors shadow-sm relative">
                                    {canManage && (
                                        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleEdit(m)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                                            <button onClick={() => handleDelete(m.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${m.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                m.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-200 text-gray-600'
                                            }`}>
                                            {m.status.replace('_', ' ')}
                                        </span>
                                        {m.due_date && (
                                            <span className={`text-[11px] font-bold flex items-center gap-1 ${isExpired ? 'text-red-600' : 'text-gray-500'}`}>
                                                {isExpired ? <Clock className="w-3 h-3" /> : <CalendarIcon className="w-3 h-3" />}
                                                {new Date(m.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        )}
                                        {isExpired && <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest shadow-sm">Overdue</span>}
                                    </div>

                                    <h3 className="text-base font-bold text-gray-900 leading-tight mb-1">{m.title}</h3>
                                    {m.description && <p className="text-sm text-gray-600 line-clamp-2">{m.description}</p>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
