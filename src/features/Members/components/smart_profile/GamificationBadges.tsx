import { ShieldCheck, Award } from 'lucide-react';
import type { MemberReward } from '../../../Gamification/types';

export default function GamificationBadges({ rewards }: { rewards: MemberReward[] }) {
    const badges = rewards.filter((r) => r.reward?.reward_type === 'badge');
    const titles = rewards.filter((r) => r.reward?.reward_type === 'title');

    if (rewards.length === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                        <Award className="w-4 h-4 text-amber-600" />
                    </div>
                    <h2 className="font-bold text-gray-900 text-sm">Badges & Certifications</h2>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-400 italic">No badges or titles earned yet. Complete challenges to earn rewards!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                    <Award className="w-4 h-4 text-amber-600" />
                </div>
                <h2 className="font-bold text-gray-900 text-sm">Badges & Certifications</h2>
            </div>

            <div className="p-5 space-y-6">
                {/* TITLES */}
                {titles.length > 0 && (
                    <div>
                        <h3 className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Earned Titles</h3>
                        <div className="flex flex-wrap gap-2">
                            {titles.map((r) => (
                                <span key={r.id} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-900 text-white shadow-md shadow-gray-200 border border-gray-800">
                                    {r.reward?.icon_url ? (
                                        <img src={r.reward.icon_url} alt="Icon" className="w-4 h-4" />
                                    ) : (
                                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                                    )}
                                    {r.reward?.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* BADGES */}
                {badges.length > 0 && (
                    <div>
                        <h3 className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Earned Badges</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {badges.map((r) => (
                                <div key={r.id} className="flex flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-white rounded-2xl border border-amber-100 text-center hover:shadow-md transition">
                                    {r.reward?.icon_url ? (
                                        <img src={r.reward.icon_url} alt={r.reward?.name} className="w-12 h-12 object-contain mb-3 drop-shadow-md" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-500 flex items-center justify-center mb-3">
                                            <Award className="w-6 h-6" />
                                        </div>
                                    )}
                                    <p className="text-sm font-bold text-gray-900 leading-tight">{r.reward?.name}</p>
                                    {r.reward?.description && (
                                        <p className="text-[10px] font-medium text-gray-500 mt-1 line-clamp-2">{r.reward.description}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
