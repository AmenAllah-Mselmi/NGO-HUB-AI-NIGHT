import supabase from '../../../utils/supabase';
import type { Challenge, MemberChallenge, MemberReward, LeaderboardEntry } from '../types';

/**
 * Fetch Top Users by Points (Leaderboard)
 * @param limit Number of users to fetch
 * @param organizationId Filter by organization (for 'Local' leaderboard)
 */
export async function getLeaderboard(limit = 50, organizationId?: string): Promise<LeaderboardEntry[]> {
    let query = supabase
        .from('profiles')
        .select('id, fullname, avatar_url, points, organization_id')
        .order('points', { ascending: false })
        .limit(limit);

    if (organizationId) {
        query = query.eq('organization_id', organizationId);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching leaderboard:', error.message);
        throw new Error(error.message);
    }

    // Inject rank
    return (data || []).map((user, index) => ({
        ...user,
        points: user.points ?? 0,
        rank: index + 1
    }));
}

/**
 * Fetch All Active Challenges available for everyone
 */
export async function getActiveChallenges(): Promise<Challenge[]> {
    const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

/**
 * Fetch a member's progress on challenges
 */
export async function getMemberChallenges(memberId: string): Promise<MemberChallenge[]> {
    const { data, error } = await supabase
        .from('member_challenges')
        .select(`*, challenge:challenges(*)`)
        .eq('member_id', memberId);

    if (error) throw new Error(error.message);
    return data || [];
}

/**
 * Enroll a user into a challenge manually
 */
export async function enrollInChallenge(memberId: string, challengeId: string): Promise<void> {
    const { error } = await supabase
        .from('member_challenges')
        .insert({ member_id: memberId, challenge_id: challengeId, progress: 0, status: 'active' });

    if (error) throw new Error(error.message);
}

/**
 * Fetch member's earned rewards/badges
 */
export async function getMemberRewards(memberId: string): Promise<MemberReward[]> {
    const { data, error } = await supabase
        .from('member_rewards')
        .select(`*, reward:virtual_rewards(*)`)
        .eq('member_id', memberId)
        .order('earned_at', { ascending: false });

    if (error) throw new Error(error.message);
    return data || [];
}

/**
 * Mark a challenge as completed and trigger the SQL points award
 */
export async function completeChallenge(memberChallengeId: string): Promise<void> {
    const { error } = await supabase
        .from('member_challenges')
        .update({ status: 'completed', progress: 1, completed_at: new Date().toISOString() })
        .eq('id', memberChallengeId)
        .eq('status', 'active');

    if (error) throw new Error(error.message);
}

/**
 * Scan user state, auto-enroll in static challenges, and auto-complete matching goals.
 */
export async function checkAutoChallenges(memberId: string): Promise<void> {
    try {
        // 1. Get all challenges to identify static ones
        const { data: allC } = await supabase.from('challenges').select('*');
        if (!allC) return;

        // 2. Fetch user's current challenge status
        const { data: memberC } = await supabase.from('member_challenges').select('*').eq('member_id', memberId);

        // 3. Auto-enroll in missing static challenges
        const enrolledIds = memberC?.map(mc => mc.challenge_id) || [];
        const staticToEnroll = allC.filter(c =>
            ['signup', 'profile_complete', 'join_club', 'join_team', 'complete_tasks'].includes(c.condition_type) &&
            !enrolledIds.includes(c.id)
        );

        for (const c of staticToEnroll) {
            await enrollInChallenge(memberId, c.id);
        }

        // 4. Fetch user's active challenges (now including newly enrolled)
        const { data: activeMC } = await supabase
            .from('member_challenges')
            .select(`*, challenge:challenges(*)`)
            .eq('member_id', memberId)
            .eq('status', 'active');

        if (!activeMC || activeMC.length === 0) return;

        // 5. Fetch user state for verification
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', memberId).single();
        const { count: clubCount } = await supabase.from('club_members').select('*', { count: 'exact', head: true }).eq('member_id', memberId);
        const { count: teamCount } = await supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('member_id', memberId);
        const { count: taskCount } = await supabase.from('task_assignments').select('*', { count: 'exact', head: true }).eq('member_id', memberId).eq('status', 'completed');

        // 6. Evaluate each active challenge
        for (const mc of activeMC) {
            const cond = (mc as any).challenge?.condition_type;
            const target = (mc as any).challenge?.condition_count || 1;
            let met = false;

            switch (cond) {
                case 'profile_complete':
                    met = !!(profile?.fullname && profile?.bio && profile?.avatar_url);
                    break;
                case 'join_club':
                    met = (clubCount || 0) >= target;
                    break;
                case 'join_team':
                    met = (teamCount || 0) >= target;
                    break;
                case 'complete_tasks':
                    met = (taskCount || 0) >= target;
                    break;
                case 'signup':
                    met = true; // Always true if they are logged in and looking at it
                    break;
            }

            if (met) {
                await completeChallenge(mc.id);
            }
        }
    } catch (err) {
        console.error("Auto-challenge scan failed:", err);
    }
}
