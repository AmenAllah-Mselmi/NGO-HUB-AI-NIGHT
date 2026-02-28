import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, Medal, MapPin, Globe } from 'lucide-react';
import { getLeaderboard } from '../services/gamification.service';
import { calculateLevel, getLevelName } from '../types';
import { useAuth } from '../../Authentication/auth.context';

export default function Leaderboard() {
    const { user } = useAuth();
    const [scope, setScope] = useState<'local' | 'national'>('national');

    const { data: leaderboard = [], isLoading } = useQuery({
        queryKey: ['leaderboard', scope],
        queryFn: async () => {
            // If local, we would filter by user's organization. For now, fetch all or filter depending on real data structure.
            // To properly filter by local org, we'd need the current user's org ID. Assumed undefined = national.
            const orgId = scope === 'local' ? undefined : undefined;
            return getLeaderboard(50, orgId);
        }
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
            {/* Header */}
            <div className="p-5 border-b border-gray-100 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200">
                            <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900">Leaderboard</h2>
                            <p className="text-xs text-orange-600 font-medium">Top contributors</p>
                        </div>
                    </div>
                </div>

                {/* Toggle */}
                <div className="flex p-1 bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-sm">
                    <button
                        onClick={() => setScope('local')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${scope === 'local'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <MapPin className="w-4 h-4" />
                        Local
                    </button>
                    <button
                        onClick={() => setScope('national')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${scope === 'national'
                                ? 'bg-white text-gray-900 shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Globe className="w-4 h-4" />
                        National
                    </button>
                </div>
            </div >

            {/* List */}
            < div className="flex-1 overflow-y-auto p-2 space-y-1" >
                {
                    isLoading ? (
                        <div className="flex justify-center py-8" >
                            <span className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-10 text-gray-400 text-sm">
                            No ranking data available yet.
                        </div>
                    ) : (
                        leaderboard.map((entry) => {
                            const isMe = entry.id === user?.id;
                            const level = calculateLevel(entry.points);
                            const levelName = getLevelName(level);

                            return (
                                <div
                                    key={entry.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl transition ${isMe ? 'bg-orange-50 border border-orange-100' : 'hover:bg-gray-50 border border-transparent'
                                        }`}
                                >
                                    {/* Rank Badge */}
                                    <div className="shrink-0 w-8 flex justify-center">
                                        {entry.rank === 1 ? (
                                            <Medal className="w-6 h-6 text-yellow-500" />
                                        ) : entry.rank === 2 ? (
                                            <Medal className="w-6 h-6 text-gray-400" />
                                        ) : entry.rank === 3 ? (
                                            <Medal className="w-6 h-6 text-amber-700" />
                                        ) : (
                                            <span className="text-sm font-bold text-gray-400">#{entry.rank}</span>
                                        )}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                        {entry.avatar_url ? (
                                            <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                                                {entry.fullname?.charAt(0) || '?'}
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-gray-900 truncate">
                                                {entry.fullname || 'Anonymous'}
                                            </p>
                                            {isMe && (
                                                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-orange-100 text-orange-700">
                                                    You
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            Lvl {level} • {levelName}
                                        </p>
                                    </div>

                                    {/* Points */}
                                    <div className="text-right">
                                        <p className="text-sm font-black text-[var(--color-myPrimary)]">
                                            {entry.points}
                                        </p>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                            pts
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
            </div>
        </div>
    );
}
