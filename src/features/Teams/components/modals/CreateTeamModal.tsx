
import { useState } from "react";
import { createTeam } from "../../services/teams.service";
import { X, Globe, Lock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../../Authentication/auth.context";

interface CreateTeamModalProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export default function CreateTeamModal({ open, onClose, onCreated }: CreateTeamModalProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const { user } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim()) return;

        try {
            setLoading(true);
            // using auth context user
            if (!user) {
                toast.error("You must be logged in");
                return;
            }

            await createTeam({
                name,
                description,
                is_public: isPublic,
                created_by: user.id
            });
            
            toast.success("Team created successfully");
            onCreated();
            onClose();
            setName("");
            setDescription("");
            setIsPublic(false);
        } catch (error) {
            toast.error("Failed to create team");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">Create New Team</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team Name <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="e.g., Marketing Squad"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea 
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none h-24"
                            placeholder="What is this team about?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Privacy Setting</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setIsPublic(false)}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${!isPublic ? 'bg-red-700 border-red-700 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Lock className="w-5 h-5" />
                                <span>Private</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsPublic(true)}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-all ${isPublic ? 'bg-(--color-myAccent) border-(--color-myAccent) text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                <Globe className="w-5 h-5" />
                                <span>Public</span>
                            </button>
                        </div>
                         <p className="text-xs text-gray-500 mt-2 text-center">
                            {isPublic 
                                ? "Anyone connected can see and join this team." 
                                : "Only admins can add members to this team."}
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-(--color-myPrimary) text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Team'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
