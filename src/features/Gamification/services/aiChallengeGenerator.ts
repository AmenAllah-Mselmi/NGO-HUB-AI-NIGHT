import supabase from '../../../utils/supabase';

/**
 * Array of possible daily challenge ideas to simulate an AI generation
 * In a production app, you might call OpenAI/Anthropic API here
 */
const AI_CHALLENGE_IDEAS = [
    { title: "Eco Warrior", description: "Use public transport or carpool today instead of driving alone.", points_reward: 25 },
    { title: "Knowledge Seeker", description: "Read an article or watch a video about a global NGO initiative.", points_reward: 15 },
    { title: "Community Builder", description: "Leave an encouraging comment on 3 posts in the Community Feed.", points_reward: 20 },
    { title: "Hydration Station", description: "Drink 2 liters of water today to stay healthy and active!", points_reward: 10 },
    { title: "Local Philanthropist", description: "Donate old clothes or books to a local charity.", points_reward: 50 },
    { title: "Digital Activist", description: "Share an upcoming NGO event on your personal social media.", points_reward: 30 },
    { title: "Mindful Minutes", description: "Spend 10 minutes meditating or planning your weekly goals.", points_reward: 15 }
];

export async function getOrGenerateDailyChallenge() {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 1. Check if a daily challenge already exists for today
    const { data: existingChallenges, error: fetchErr } = await supabase
        .from('challenges')
        .select('*')
        .eq('condition_type', 'daily_ai')
        .gte('start_date', todayStart.toISOString())
        .lte('end_date', todayEnd.toISOString())
        .limit(1);

    if (fetchErr) {
        console.error("Error fetching daily challenge:", fetchErr.message);
        return null;
    }

    // If one already exists, return it
    if (existingChallenges && existingChallenges.length > 0) {
        return existingChallenges[0];
    }

    // 2. No challenge exists for today. The "AI" generates one.
    const randomIdea = AI_CHALLENGE_IDEAS[Math.floor(Math.random() * AI_CHALLENGE_IDEAS.length)];

    const newChallenge = {
        title: `Daily Mission: ${randomIdea.title}`,
        description: randomIdea.description,
        points_reward: randomIdea.points_reward,
        condition_type: 'daily_ai',
        condition_count: 1,
        start_date: todayStart.toISOString(),
        end_date: todayEnd.toISOString()
    };

    // 3. Insert it so everyone sees the same challenge today
    const { data: insertedChallenge, error: insertErr } = await supabase
        .from('challenges')
        .insert([newChallenge])
        .select()
        .single();

    if (insertErr) {
        console.error("Error inserting AI daily challenge:", insertErr.message);
        return null;
    }

    return insertedChallenge;
}

/**
 * Ensures the member is enrolled in today's challenge
 */
export async function enrollInDailyChallenge(memberId: string, challengeId: string) {
    // Check if already enrolled
    const { data: existing } = await supabase
        .from('member_challenges')
        .select('id, status')
        .eq('member_id', memberId)
        .eq('challenge_id', challengeId)
        .single();

    if (existing) return existing; // Already enrolled

    // Insert enrollment
    const { data, error } = await supabase
        .from('member_challenges')
        .insert({ member_id: memberId, challenge_id: challengeId, progress: 0, status: 'active' })
        .select()
        .single();

    if (error) {
        console.error("Enrollment error:", error.message);
        return null;
    }
    return data;
}


