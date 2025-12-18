
import { useNavigate } from "react-router-dom";
import type { Team } from "../../types";
import { Users, Lock, Globe, ArrowRight, Trash2 } from "lucide-react";
import { useAuth } from "../../../Authentication/auth.context";
import { EXECUTIVE_LEVELS } from "../../../../utils/roles";
import { useDeleteTeam } from "../../hooks/useTeams";
import { toast } from "sonner";

interface TeamCardProps {
    team: Team;
}

export default function TeamCard({ team }: TeamCardProps) {
    const navigate = useNavigate();
    const { role } = useAuth();
    const deleteMutation = useDeleteTeam();
    const isGlobalAdmin = role?.toLowerCase() === 'admin';
    const hasExecutiveRole = EXECUTIVE_LEVELS.includes(role?.toLowerCase() || '');
    const canDelete = isGlobalAdmin || hasExecutiveRole;

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't navigate
        if (!confirm(`Are you sure you want to delete "${team.name}"?`)) return;
        try {
            await deleteMutation.mutateAsync(team.id);
            toast.success("Team deleted");
        } catch (error) {
            toast.error("Failed to delete team");
        }
    };

    return (
        <div 
            onClick={() => navigate(`/teams/${team.id}`)}
            className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer p-6 flex flex-col h-full relative"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${team.is_public ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {team.is_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                
                {canDelete && (
                    <button 
                        onClick={handleDelete}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Team"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            <h3 className="text-xl font-bold text-gray-900 group-hover:text-(--color-myPrimary) transition-colors mb-2">
                {team.name}
            </h3>
            
            <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-grow">
                {team.description || "No description provided."}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-4 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{team.member_count} Members</span>
                </div>
                <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span className="font-medium text-(--color-myPrimary)">View</span>
                    <ArrowRight className="w-4 h-4 text-(--color-myPrimary)" />
                </div>
            </div>
        </div>
    );
}
