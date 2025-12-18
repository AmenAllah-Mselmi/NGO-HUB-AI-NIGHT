import React, { useEffect, useState } from 'react';
import { objectivesService } from '../../services/objectivesService';
import type { UserObjectifInfos } from '../../types/objectives';

interface UserObjectivesListProps {
  userId: string;
}

const UserObjectivesList: React.FC<UserObjectivesListProps> = ({ userId }) => {
  const [objectives, setObjectives] = useState<UserObjectifInfos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchObjectives = async () => {
    try {
      setLoading(true);
      const data = await objectivesService.getUserObjectives(userId);
      setObjectives(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load objectives');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchObjectives();
    }
  }, [userId]);

  if (loading) return <div className="p-4 text-center text-slate-500">Loading objectives...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;

  if (objectives.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
        <p className="text-slate-500 dark:text-slate-400">No objectives assigned yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">My Objectives</h2>
      <div className="grid grid-cols-1 gap-4">
        {objectives.map((item) => {
          const { goal, progress, percentage } = calculateProgress(item);
          const isCompleted = item.userObjectif?.isCompleted || percentage >= 100;


          return (
            <div 
              key={item.objectif.id}
              className={`relative overflow-hidden p-5 rounded-xl border transition-all ${
                isCompleted 
                  ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800' 
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:shadow-md'
              }`}
            >
              {/* Progress Background Bar (optional visual flair) */}
              <div 
                className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-500" 
                style={{ width: `${percentage}%` }}
              />

              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {item.objectif.groupObjectif}
                    </span>
                    {item.objectif.difficulty && (
                      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        item.objectif.difficulty === 'Basic' ? 'bg-green-100 text-green-700' :
                        item.objectif.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        item.objectif.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {item.objectif.difficulty}
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-lg">
                    {item.objectif.objectifActionType} <span className="text-blue-600 dark:text-blue-400">{item.objectif.feature}</span>
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">{item.objectif.points}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">Points</span>
                </div>
              </div>

              {/* Progress Section */}
              <div className="mt-4">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400 mb-1">
                  <span>Progress</span>
                  <span className="font-medium">{progress} / {goal}</span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      isCompleted ? 'bg-green-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Badge */}
              {isCompleted && (
                <div className="absolute top-4 right-16 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold rounded-full flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                  COMPLETED
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Helper to calculate progress safely
const calculateProgress = (info: UserObjectifInfos) => {
  const goal = info.objectif.target || 1; // Default to 1 if no target
  const progress = info.userObjectif?.currentProgress || 0;
  const percentage = Math.min(100, Math.round((progress / goal) * 100));
  
  return { goal, progress, percentage };
};

export default UserObjectivesList;
