import { useState, useEffect } from 'react';
import { FolderGit2, Plus, Pencil, X, Save, ExternalLink } from 'lucide-react';
import type { MemberProject } from '../../types';
import { getMemberProjects, createProject, updateProject, deleteProject } from '../../services/smartProfiles.service';
import { toast } from 'sonner';

export default function ProjectPortfolio({ memberId, isOwner }: { memberId: string, isOwner: boolean }) {
    const [projects, setProjects] = useState<MemberProject[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [url, setUrl] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [completionDate, setCompletionDate] = useState('');

    useEffect(() => {
        if (memberId) loadProjects();
    }, [memberId]);

    const loadProjects = async () => {
        try {
            setIsLoading(true);
            const data = await getMemberProjects(memberId);
            setProjects(data);
        } catch (err: any) {
            console.error(err);
            toast.error("Failed to load Portfolio");
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setUrl('');
        setImageUrl('');
        setCompletionDate('');
        setEditingId(null);
        setIsAdding(false);
    };

    const handleEdit = (proj: MemberProject) => {
        setTitle(proj.title);
        setDescription(proj.description || '');
        setUrl(proj.url || '');
        setImageUrl(proj.image_url || '');
        setCompletionDate(proj.completion_date ? proj.completion_date.split('T')[0] : '');
        setEditingId(proj.id);
        setIsAdding(false);
    };

    const handleSave = async () => {
        if (!title) {
            toast.error("Project Title is required");
            return;
        }

        const payload = {
            title,
            description,
            url: url || undefined,
            image_url: imageUrl || undefined,
            completion_date: completionDate || undefined
        };

        try {
            if (editingId) {
                await updateProject(editingId, payload);
                toast.success("Project updated");
            } else {
                await createProject(memberId, payload);
                toast.success("Project added");
            }
            resetForm();
            loadProjects();
        } catch (err: any) {
            toast.error(err.message || "Failed to save project");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await deleteProject(id);
            toast.success("Project deleted");
            loadProjects();
        } catch (err: any) {
            toast.error("Failed to delete project");
        }
    };

    const inputCls = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[var(--color-myPrimary)] focus:ring-2 focus:ring-[var(--color-myPrimary)]/10 transition bg-gray-50 focus:bg-white";
    const labelCls = "block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5";

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
                    <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                        <FolderGit2 className="w-4 h-4 text-orange-600" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-sm">Portfolio de Projets</h2>
                </div>
                {isOwner && !isAdding && !editingId && (
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-orange-600 hover:bg-orange-50 px-3 py-1.5 rounded-xl transition"
                    >
                        <Plus className="w-3.5 h-3.5" /> Add Project
                    </button>
                )}
            </div>

            <div className="p-5">
                {(isAdding || editingId) ? (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-4">
                        <div>
                            <label className={labelCls}>Project Title *</label>
                            <input type="text" className={inputCls} placeholder="e.g. Annual Charity Gala" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelCls}>Project URL (Optional)</label>
                                <input type="url" className={inputCls} placeholder="https://..." value={url} onChange={e => setUrl(e.target.value)} />
                            </div>
                            <div>
                                <label className={labelCls}>Completion Date</label>
                                <input type="date" className={inputCls} value={completionDate} onChange={e => setCompletionDate(e.target.value)} />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Image URL (Optional)</label>
                            <input type="url" className={inputCls} placeholder="https://..." value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
                        </div>

                        <div>
                            <label className={labelCls}>Description</label>
                            <textarea className={inputCls + " resize-none"} rows={4} placeholder="What was this project about?" value={description} onChange={e => setDescription(e.target.value)} />
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
                    <div>
                        {projects.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No projects added to the portfolio yet.</p>
                        ) : (
                            <div className="grid sm:grid-cols-2 gap-4">
                                {projects.map((proj) => (
                                    <div key={proj.id} className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition">
                                        {/* Action buttons overlay for owner */}
                                        {isOwner && (
                                            <div className="absolute top-2 right-2 flex items-center gap-1 z-10 opacity-0 group-hover:opacity-100 transition">
                                                <button onClick={() => handleEdit(proj)} className="p-1.5 bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-orange-600 rounded-lg transition"><Pencil className="w-3.5 h-3.5" /></button>
                                                <button onClick={() => handleDelete(proj.id)} className="p-1.5 bg-white shadow-sm border border-gray-200 text-gray-600 hover:text-red-500 rounded-lg transition"><X className="w-3.5 h-3.5" /></button>
                                            </div>
                                        )}

                                        {proj.image_url ? (
                                            <div className="h-32 w-full bg-gray-100 border-b border-gray-200">
                                                <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="h-32 w-full bg-gradient-to-br from-orange-50 to-amber-50 border-b border-gray-200 flex items-center justify-center">
                                                <FolderGit2 className="w-10 h-10 text-orange-200" />
                                            </div>
                                        )}

                                        <div className="p-4">
                                            <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{proj.title}</h3>
                                            {proj.completion_date && (
                                                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-0.5">
                                                    {new Date(proj.completion_date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                                </p>
                                            )}
                                            {proj.description && (
                                                <p className="text-xs text-gray-600 mt-2 line-clamp-3">{proj.description}</p>
                                            )}

                                            {proj.url && (
                                                <a href={proj.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-myPrimary)] mt-3 hover:underline">
                                                    View Project <ExternalLink className="w-3 h-3" />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
