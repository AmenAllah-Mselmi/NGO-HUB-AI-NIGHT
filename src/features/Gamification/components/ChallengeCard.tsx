import { Target, Clock, CheckCircle2, Award } from 'lucide-react';
import type { MemberChallenge } from '../types';

interface ChallengeCardProps {
    memberChallenge: MemberChallenge;
    onComplete?: (id: string) => void;
}

export default function ChallengeCard({ memberChallenge, onComplete }: ChallengeCardProps) {
    const challenge = memberChallenge.challenge;
    if (!challenge) return null;

    const isCompleted = memberChallenge.status === 'completed';
    const progressPct = Math.min(
        100,
        Math.round((memberChallenge.progress / challenge.condition_count) * 100)
    );

    return (
        <div className={`relative bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${isCompleted ? 'border-emerald-200 bg-emerald-50/30' : 'border-gray-200'
            }`}>
            {/* Background Decorative Element */}
            <div className="absolute right-0 top-0 w-24 h-24 bg-gradient-to-br from-[var(--color-myPrimary)] to-[var(--color-mySecondary)] opacity-5 rounded-bl-full pointer-events-none" />

            <div className="flex gap-4">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${isCompleted
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-gradient-to-br from-indigo-50 to-blue-50 text-[var(--color-myPrimary)] border border-indigo-100'
                    }`}>
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 leading-tight">
                            {challenge.title}
                        </h3>
                        <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-black uppercase tracking-wider">
                            +{challenge.points_reward} PTS
                        </span>
                    </div>

                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                        {challenge.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                Progress
                            </span>
                            <span className="text-xs font-bold text-gray-700">
                                {memberChallenge.progress} / {challenge.condition_count}
                            </span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ${isCompleted
                                    ? 'bg-emerald-500'
                                    : 'bg-gradient-to-r from-[var(--color-myPrimary)] to-[var(--color-mySecondary)]'
                                    }`}
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    </div>

                    {/* Deadlines / Actions Footer */}
                    <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        {challenge.end_date && !isCompleted && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                <Clock className="w-3.5 h-3.5" />
                                Ends {new Date(challenge.end_date).toLocaleDateString()}
                            </div>
                        )}

                        {!isCompleted && onComplete && (
                            <button
                                onClick={() => onComplete(memberChallenge.id)}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-[var(--color-myPrimary)] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ml-auto shadow-sm"
                            >
                                <Award className="w-4 h-4" />
                                Mark Complete
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
