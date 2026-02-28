import { useState, useEffect } from 'react';
import { Briefcase, Plus, Pencil, X, Save, Building2, Calendar } from 'lucide-react';
import type { MemberExperience } from '../../types';
import { getMemberExperiences, createExperience, updateExperience, deleteExperience } from '../../services/smartProfiles.service';
import { toast } from 'sonner';

export default function CVAssociatif({ memberId, isOwner }: { memberId: string, isOwner: boolean }) {
    const [experiences, setExperiences] = useState<MemberExperience[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [organization, setOrganization] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);

    useEffect(() => {
        if (memberId) loadExperiences();
    }, [memberId]);

    const loadExperiences = async () => {
        try {
            setIsLoading(true);
            const data = await getMemberExperiences(memberId);
            setExperiences(data);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load CV Associatif");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setOrganization('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setIsCurrent(false);
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (exp: MemberExperience) => {
        setTitle(exp.title);
        setOrganization(exp.organization);
        setDescription(exp.description || '');
        setStartDate(exp.start_date ? exp.start_date.split('T')[0] : '');
        setEndDate(exp.end_date ? exp.end_date.split('T')[0] : '');
        setIsCurrent(exp.is_current);
        setEditingId(exp.id);
        setIsAdding(false);
    };

    const handleSave = async () => {
        if (!title || !organization) {
            toast.error("Title and Organization are required");
            return;
        }

        const payload = {
            title,
            organization,
            description,
            start_date: startDate || undefined,
            end_date: isCurrent ? undefined : (endDate || undefined),
            is_current: isCurrent
        };

        try {
            if (editingId) {
                await updateExperience(editingId, payload);
                toast.success("Experience updated");
            } else {
                await createExperience(memberId, payload);
                toast.success("Experience added");
            }
            resetForm();
            loadExperiences();
        } catch (err: any) {
            toast.error(err.message || "Failed to save experience");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this experience?")) return;
        try {
            await deleteExperience(id);
            toast.success("Experience deleted");
            loadExperiences();
        } catch (err: any) {
            toast.error("Failed to delete");
        }
    };

    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--color-myPrimary)] focus:ring-2 focus:ring-[var(--color-myPrimary)]/10 transition bg-gray-50 focus:bg-white";
    const labelCls = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5";

    // If loading and not Owner, just show a quick skeleton or spinner
    if (isLoading) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-6 flex justify-center">
                <span className="w-6 h-6 border-2 border-[var(--color-myPrimary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                        <Briefcase className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-sm">CV Associatif</h2>
                </div>
                {isOwner && !isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-xl transition"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                )}
            </div>

            <div className="p-5">
                {(isAdding || editingId) ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Role / Title *</label>
                                <input type="text" className={inputCls} placeholder="e.g. Volunteer Coordinator" value={title} onChange={e => setTitle(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Organization *</label>
                                <input type="text" className={inputCls} placeholder="e.g. Red Cross" value={organization} onChange={e => setOrganization(e.target.value)} />
                            </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className={labelCls}>Start Date</label>
                                <input type="date" className={inputCls} value={startDate} onChange={e => setStartDate(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>End Date</label>
                                <input type="date" className={inputCls} value={endDate} onChange={e => setEndDate(e.target.value)} disabled={isCurrent} />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="isCurrentCheckbox" checked={isCurrent} onChange={e => setIsCurrent(e.target.checked)} className="rounded text-[var(--color-myPrimary)]" />
                            <label htmlFor="isCurrentCheckbox" className="text-sm text-gray-700 font-medium">I currently work here</label>
                        </div>

                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea className={inputCls + " resize-none"} rows={3} placeholder="Describe your responsibilities and achievements..." value={description} onChange={e => setDescription(e.target.value)} />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2">
                            <button onClick={resetForm} className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:bg-gray-200 px-4 py-2 rounded-xl transition">
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                            <button onClick={handleSave} className="flex items-center gap-1.5 text-xs font-semibold text-white bg-[var(--color-myPrimary)] hover:opacity-90 px-4 py-2 rounded-xl transition">
                                <Save className="w-3.5 h-3.5" /> Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {experiences.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No associative experiences added yet.</p>
                        ) : (
                            experiences.map((exp, index) => (
                                <div key={exp.id} className="relative">
                                    {/* Timeline indicator line */}
                                    {index !== experiences.length - 1 && (
                                        <div className="absolute left-[15px] top-10 bottom-[-24px] w-0.5 bg-gray-100" />
                                    )}

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 z-10 text-indigo-600">
                                            <Building2 className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-4">
                                                <div>
                                                    <h3 className="text-sm font-bold text-gray-900 leading-tight">{exp.title}</h3>
                                                    <p className="text-xs font-semibold text-gray-600 mt-0.5">{exp.organization}</p>
                                                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-gray-500 font-medium">
                                                        <Calendar className="w-3 h-3" />
                                                        {exp.start_date ? new Date(exp.start_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Unknown start'}
                                                        {' - '}
                                                        {exp.is_current ? 'Present' : (exp.end_date ? new Date(exp.end_date).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Unknown end')}
                                                    </div>
                                                </div>
                                                {isOwner && (
                                                    <div className="flex items-center gap-1 opacity-0 hover:opacity-100 group-hover:opacity-100 lg:opacity-100 transition">
                                                        <button onClick={() => handleEdit(exp)} className="p-1.5 text-gray-400 hover:bg-gray-100 hover:text-indigo-600 rounded-lg transition"><Pencil className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => handleDelete(exp.id)} className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 rounded-lg transition"><X className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                )}
                                            </div>
                                            {exp.description && (
                                                <p className="text-xs text-gray-600 mt-2 whitespace-pre-wrap">{exp.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
