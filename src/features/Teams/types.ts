
import type { Task } from "../Tasks/types";
import type { Member } from "../Members/types";

export interface Team {
    id: string;
    name: string;
    description?: string;
    is_public: boolean;
    created_by: string;
    activity_id?: string;
    created_at: string;
    
    // UI/Joined helpers
    member_count?: number; 
    members?: TeamMember[];
    is_member?: boolean; // Current user is member?
    my_role?: 'member' | 'admin' | 'lead';
}

export interface TeamMember {
    id: string;
    team_id: string;
    member_id: string;
    role: 'member' | 'admin' | 'lead';
    joined_at: string;
    
    // Joined profile
    member?: Member; 
}

// Helper to extend Task with team info if needed
export type TeamTask = Task & {
    team_id?: string;
}
