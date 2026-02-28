import { useEffect } from 'react';
import { Trophy, Star, Target, ShieldCheck, Zap } from 'lucide-react';
import Navbar from '../../../Global_Components/navBar';
import { useAuth } from '../../Authentication/auth.context';
import { useQuery } from '@tanstack/react-query';
import { getMemberChallenges, getMemberRewards, getActiveChallenges, enrollInChallenge, completeChallenge, checkAutoChallenges } from '../services/gamification.service';
import { calculateLevel, getLevelName } from '../types';
import Leaderboard from '../components/Leaderboard';
import ChallengeCard from '../components/ChallengeCard';
import { useMyProfile } from '../../Members/hooks/useMyProfile';
import { getOrGenerateDailyChallenge, enrollInDailyChallenge } from '../services/aiChallengeGenerator';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function GamificationHub() {
    const { user } = useAuth();
    const { profile } = useMyProfile();
    const queryClient = useQueryClient();

    const { data: challenges = [] } = useQuery({
        queryKey: ['member-challenges', user?.id],
        queryFn: () => getMemberChallenges(user!.id),
        enabled: !!user?.id,
    });

    const { data: rewards = [] } = useQuery({
        queryKey: ['member-rewards', user?.id],
        queryFn: () => getMemberRewards(user!.id),
        enabled: !!user?.id,
    });

    const { data: allChallenges = [] } = useQuery({
        queryKey: ['active-challenges'],
        queryFn: getActiveChallenges,
    });

    // Handle Daily AI Challenge Generation & Enrollment + Auto-challenge scanning
    useEffect(() => {
        if (!user?.id) return;

        async function initializeGamification() {
            try {
                // 1. Run Automated Challenge Scan (Profile, Clubs, Teams etc.)
                await checkAutoChallenges(user!.id);
                queryClient.invalidateQueries({ queryKey: ['member-challenges'] });
                queryClient.invalidateQueries({ queryKey: ['my-profile'] });

                // 2. Handle Daily Mission
                const challenge = await getOrGenerateDailyChallenge();
                if (challenge) {
                    const enrolled = await enrollInDailyChallenge(user!.id, challenge.id);
                    if (enrolled) {
                        queryClient.invalidateQueries({ queryKey: ['member-challenges'] });
                    }
                }
            } catch (err) {
                console.error("Initialization failed:", err);
            }
        }

        initializeGamification();
    }, [user?.id, queryClient]);

    const handleCompleteChallenge = async (memberChallengeId: string) => {
        try {
            await completeChallenge(memberChallengeId);
            toast.success("Challenge Completed! Points added.");
            // Invalidate queries to refresh challenges, rewards, and leaderboard
            queryClient.invalidateQueries({ queryKey: ['member-challenges'] });
            queryClient.invalidateQueries({ queryKey: ['my-profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        } catch (error: any) {
            toast.error(error.message || "Failed to complete challenge");
        }
    };

    const handleEnrollChallenge = async (challengeId: string) => {
        try {
            if (!user?.id) return;
            await enrollInChallenge(user.id, challengeId);
            toast.success("Enrolled in Challenge!");
            queryClient.invalidateQueries({ queryKey: ['member-challenges'] });
        } catch (error: any) {
            toast.error(error.message || "Failed to enroll");
        }
    };

    const points = profile?.points ?? 0;
    const level = calculateLevel(points);
    const levelName = getLevelName(level);

    // Progress to next level
    const nextLevelPoints = [100, 250, 500, 1000, 99999][level - 1] || 100;
    const currentLevelBase = [0, 100, 250, 500, 1000][level - 1] || 0;
    const progressToNext = Math.min(
        100,
        Math.round(((points - currentLevelBase) / (nextLevelPoints - currentLevelBase)) * 100)
    );

    const enrolledChallengeIds = challenges.map(c => c.challenge_id);
    const availableChallenges = allChallenges.filter(c => !enrolledChallengeIds.includes(c.id));

    return (
        <div className="min-h-screen bg-[#f0f2f5]">
            <Navbar />
            <main className="md:ms-64 pt-16 md:pt-6 pb-24 md:pb-6">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                    {/* Header & Level Info */}
                    <div className="flex flex-col md:flex-row gap-6 mb-8">
                        <div className="flex-1 bg-gradient-to-br from-indigo-600 to-[var(--color-myPrimary)] rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute right-0 top-0 opacity-10">
                                <Trophy className="w-48 h-48 -mr-10 -mt-10" />
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                        <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl font-bold">Level {level}</h1>
                                        <p className="text-indigo-100 font-medium uppercase tracking-widest text-xs">
                                            {levelName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-end gap-2 mb-2">
                                    <span className="text-4xl font-black">{points}</span>
                                    <span className="text-sm font-semibold text-indigo-100 mb-1">PTS</span>
                                </div>

                                <div className="space-y-2 max-w-md mt-6">
                                    <div className="flex justify-between text-xs font-semibold text-indigo-100">
                                        <span>Current Progress</span>
                                        <span>{nextLevelPoints} PTS to Level {level + 1}</span>
                                    </div>
                                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${progressToNext}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-4 md:w-72">
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                                    <Target className="w-5 h-5 text-emerald-500" />
                                </div>
                                <p className="text-2xl font-black text-gray-900">{challenges.filter(c => c.status === 'completed').length}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Challenges Done</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center">
                                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center mb-3">
                                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                                </div>
                                <p className="text-2xl font-black text-gray-900">{rewards.length}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Badges Earned</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Left Column (Challenges & Badges) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Active Challenges */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <Zap className="w-5 h-5 text-indigo-500" />
                                    <h2 className="text-lg font-bold text-gray-900">Your Active Challenges</h2>
                                </div>

                                {challenges.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-8 text-center">
                                        <Target className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                                        <p className="text-sm font-semibold text-gray-900">No active challenges</p>
                                        <p className="text-xs text-gray-500 mt-1">Check back later for new objectives and tasks!</p>
                                    </div>
                                ) : (
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {challenges.filter(c => c.status === 'active').map((mc) => (
                                            <ChallengeCard key={mc.id} memberChallenge={mc} onComplete={handleCompleteChallenge} />
                                        ))}
                                        {/* Render completed at the end */}
                                        {challenges.filter(c => c.status === 'completed').map((mc) => (
                                            <ChallengeCard key={mc.id} memberChallenge={mc} />
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Available Static Challenges */}
                            {availableChallenges.length > 0 && (
                                <section className="mt-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Target className="w-5 h-5 text-emerald-500" />
                                        <h2 className="text-lg font-bold text-gray-900">Available Challenges</h2>
                                    </div>
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        {availableChallenges.map((c) => (
                                            <div key={c.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-sm font-bold text-gray-900 leading-tight pr-2">{c.title}</h3>
                                                        <span className="shrink-0 px-2 py-1 rounded-xl bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest border border-orange-100">+{c.points_reward} PTS</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mb-4 line-clamp-2">{c.description}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleEnrollChallenge(c.id)}
                                                    className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-xs text-center font-bold hover:opacity-90 transition"
                                                >
                                                    Enroll Now
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Earned Badges */}
                            <section>
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                                    <h2 className="text-lg font-bold text-gray-900">Earned Badges</h2>
                                </div>

                                {rewards.length === 0 ? (
                                    <div className="bg-white rounded-2xl border border-gray-200 border-dashed p-8 text-center">
                                        <p className="text-sm font-semibold text-gray-900">No badges earned yet</p>
                                        <p className="text-xs text-gray-500 mt-1">Keep participating in the platform to unlock special badges.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {rewards.map((mr) => (
                                            <div key={mr.id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center flex flex-col items-center">
                                                <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center text-3xl mb-3 shadow-inner">
                                                    {mr.reward?.icon_url || '🏅'}
                                                </div>
                                                <p className="text-sm font-bold text-gray-900 leading-tight mb-1">{mr.reward?.name}</p>
                                                <p className="text-[10px] text-gray-500 leading-tight line-clamp-2">{mr.reward?.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                        </div>

                        {/* Right Column (Leaderboard) */}
                        <div className="lg:col-span-1">
                            <Leaderboard />
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
