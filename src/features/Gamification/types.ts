export interface Challenge {
    id: string;
    title: string;
    description: string;
    points_reward: number;
    condition_type: string;
    condition_count: number;
    start_date: string | null;
    end_date: string | null;
    created_at: string;
}

export interface MemberChallenge {
    id: string;
    member_id: string;
    challenge_id: string;
    progress: number;
    status: 'active' | 'completed';
    completed_at: string | null;
    created_at: string;
    challenge?: Challenge; // Joined data
}

export interface VirtualReward {
    id: string;
    name: string;
    description: string;
    icon_url: string;
    reward_type: 'badge' | 'banner' | 'title';
    created_at: string;
}

export interface MemberReward {
    id: string;
    member_id: string;
    reward_id: string;
    earned_at: string;
    reward?: VirtualReward; // Joined data
}

export interface LeaderboardEntry {
    id: string;
    fullname: string;
    avatar_url: string | null;
    points: number;
    rank: number;
    organization_id?: string;
}

// Calculated Level based on Points
export function calculateLevel(points: number): number {
    if (points < 100) return 1;
    if (points < 250) return 2;
    if (points < 500) return 3;
    if (points < 1000) return 4;
    return 5;
}

export function getLevelName(level: number): string {
    switch (level) {
        case 1: return "Initiate";
        case 2: return "Contributor";
        case 3: return "Champion";
        case 4: return "Veteran";
        case 5: return "Legend";
        default: return "Novice";
    }
}
