import { Zap, Target, Star, Trophy } from 'lucide-react';

export default function ImpactIndicator({ points = 0, jps = 0, hours = 0, challenges = 0 }: { points: number, jps: number, hours: number, challenges: number }) {
    // A sleek visually striking component that aggregates their total impact
    return (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-purple-600" />
                </div>
                <h2 className="font-bold text-gray-900 text-sm">Indicateur d'Impact Personnel</h2>
            </div>

            <div className="p-5">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center">
                        <Trophy className="w-8 h-8 text-indigo-500 mb-2" />
                        <span className="text-2xl font-black text-indigo-900">{points}</span>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Total Points</span>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-100 flex flex-col items-center justify-center text-center">
                        <Star className="w-8 h-8 text-amber-500 mb-2" />
                        <span className="text-2xl font-black text-amber-900">{Number(jps).toFixed(0)}</span>
                        <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-1">JPS Score</span>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border border-emerald-100 flex flex-col items-center justify-center text-center">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black text-emerald-900">{hours}</span>
                            <span className="text-xs font-bold text-emerald-600">hr</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">Volunteering</span>
                    </div>

                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-4 rounded-2xl border border-rose-100 flex flex-col items-center justify-center text-center">
                        <Target className="w-8 h-8 text-rose-500 mb-2" />
                        <span className="text-2xl font-black text-rose-900">{challenges}</span>
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest mt-1">Challenges</span>
                    </div>

                </div>
            </div>
        </div>
    );
}
