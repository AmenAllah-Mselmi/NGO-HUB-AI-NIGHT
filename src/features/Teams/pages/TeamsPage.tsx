
import { useState } from "react";
import TeamCard from "../components/cards/TeamCard";
import CreateTeamModal from "../components/modals/CreateTeamModal";
import Navbar from "../../../Global_Components/navBar";
import { Plus, Search, Users } from "lucide-react";
import { useAuth } from "../../Authentication/auth.context";
import { useTeams } from "../hooks/useTeams";
import { EXECUTIVE_LEVELS } from "../../../utils/roles";

export default function TeamsPage() {
    const { user, role } = useAuth();
    const { data: teams = [], isLoading: loading, refetch } = useTeams(user?.id);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const hasCreatePermission = EXECUTIVE_LEVELS.includes(role?.toLowerCase() || '');

    const filteredTeams = teams.filter(team => 
        team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (team.description && team.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
                <main className="md:ml-64 pt-16 md:pt-6">

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="w-8 h-8 text-(--color-myPrimary)" />
                            Teams & Squads
                        </h1>
                        <p className="text-gray-500 mt-2">Collaborate, manage tasks, and achieve goals together.</p>
                    </div>
                    
                    <div className="flex gap-4 w-full md:w-auto">
                         <div className="relative flex-grow md:flex-grow-0">
                            <input 
                                type="text" 
                                placeholder="Search teams..." 
                                className="w-full md:w-64 pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                        </div>
                        {hasCreatePermission && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="flex items-center gap-2 px-6 py-2 bg-(--color-myPrimary) text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                                >
                                <Plus className="w-5 h-5" />
                                Create Team
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-64 bg-gray-200 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredTeams.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredTeams.map(team => (
                            <TeamCard key={team.id} team={team} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-medium text-gray-900 mb-2">No teams found</h3>
                        <p className="text-gray-500 max-w-sm mx-auto mb-6">
                            {searchQuery ? "Try adjusting your search terms." : "Get started by creating the first team for your organization."}
                        </p>
                        {hasCreatePermission && !searchQuery && (
                            <button 
                                onClick={() => setIsCreateModalOpen(true)}
                                className="text-(--color-myPrimary) font-medium hover:underline"
                                >
                                Create a Team Now
                            </button>
                        )}
                    </div>
                )}
            </div>

            <CreateTeamModal 
                open={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)}
                onCreated={() => refetch()}
            />
                </main>
        </div>
    );
}
