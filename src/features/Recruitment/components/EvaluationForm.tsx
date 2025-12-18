import { Star } from 'lucide-react'
import type { Question } from '../models/types'

interface EvaluationFormProps {
    questions: Question[]
    scores: Record<string, number>
    textAnswers: Record<string, string>
    onScoreChange: (questionId: string, score: number, max: number) => void
    onTextAnswerChange: (questionId: string, text: string) => void
}

export default function EvaluationForm({ questions, scores, textAnswers, onScoreChange, onTextAnswerChange }: EvaluationFormProps) {
    
    return (
        <div className="space-y-6">
            {questions.map((q, idx) => (
                <div key={q.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900 flex gap-2">
                            <span className="text-gray-500">{idx + 1}.</span>
                            {q.text}
                        </span>
                        <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            Max: {q.maxScore}
                        </span>
                    </div>
                    <div className="mt-2">
                        {q.type === 'choice' && q.options ? (
                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => (
                                    <label key={optIdx} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                                        <input
                                            type="radio"
                                            name={`question-${q.id}`}
                                            checked={scores[q.id] === opt.score}
                                            onChange={() => onScoreChange(q.id, opt.score, q.maxScore)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <div className="flex-1 flex justify-between">
                                            <span>{opt.label}</span>
                                            <span className="text-gray-500 text-sm">{opt.score} pts</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : q.type === 'checkbox' && q.options ? (
                            <div className="space-y-2">
                                {(() => {
                                    // Parse selected options from textAnswers (stored as JSON string)
                                    let selectedLabels: string[] = [];
                                    try {
                                        const stored = textAnswers[q.id];
                                        if (stored) selectedLabels = JSON.parse(stored);
                                    } catch (e) {
                                        // fallback or empty
                                    }

                                    return q.options.map((opt, optIdx) => {
                                        const isChecked = selectedLabels.includes(opt.label);
                                        
                                        return (
                                            <label key={optIdx} className="flex items-center gap-3 p-2 bg-white rounded border border-gray-200 cursor-pointer hover:bg-blue-50 transition-colors">
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                        const newChecked = e.target.checked;
                                                        let newSelectedLabels = [...selectedLabels];
                                                        
                                                        if (newChecked) {
                                                            newSelectedLabels.push(opt.label);
                                                        } else {
                                                            newSelectedLabels = newSelectedLabels.filter(l => l !== opt.label);
                                                        }

                                                        // Calculate new score based on ALL selected options
                                                        // We re-calculate from scratch to ensure consistency
                                                        const newScore = q.options?.reduce((sum, o) => {
                                                            return newSelectedLabels.includes(o.label) ? sum + o.score : sum;
                                                        }, 0) || 0;

                                                        onScoreChange(q.id, newScore, q.maxScore);
                                                        onTextAnswerChange(q.id, JSON.stringify(newSelectedLabels));
                                                    }}
                                                    className="text-blue-600 focus:ring-blue-500 rounded"
                                                />
                                                <div className="flex-1 flex justify-between">
                                                    <span>{opt.label}</span>
                                                    <span className="text-gray-500 text-sm">{opt.score} pts</span>
                                                </div>
                                            </label>
                                        );
                                    });
                                })()}
                                <div className="text-xs text-gray-400 text-right">
                                    Current: {scores[q.id] || 0} pts
                                </div>
                            </div>
                        ) : q.type === 'text' ? (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Candidate Answer / Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={textAnswers[q.id] || ''}
                                        onChange={(e) => onTextAnswerChange(q.id, e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-2 text-sm"
                                        placeholder="Record candidate's answer here..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                                        Score (Max: {q.maxScore})
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={q.maxScore}
                                        value={scores[q.id] === undefined ? '' : scores[q.id]}
                                        onChange={(e) => onScoreChange(q.id, parseInt(e.target.value) || 0, q.maxScore)}
                                        className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-1"
                                        placeholder="Score"
                                    />
                                </div>
                            </div>
                        ) : q.type === 'rating' ? (
                            <div className="flex items-center gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => onScoreChange(q.id, star, 5)}
                                        className={`p-1 transition-colors ${
                                            (scores[q.id] || 0) >= star 
                                            ? 'text-yellow-400' 
                                            : 'text-gray-300 hover:text-yellow-200'
                                        }`}
                                    >
                                        <Star className="w-8 h-8 fill-current" />
                                    </button>
                                ))}
                                <span className="text-sm font-medium text-gray-600 ml-2">
                                    {scores[q.id] || 0} / 5
                                </span>
                            </div>
                        ) : (
                            <input
                                type="number"
                                min="0"
                                max={q.maxScore}
                                value={scores[q.id] === undefined ? '' : scores[q.id]}
                                onChange={(e) => onScoreChange(q.id, parseInt(e.target.value) || 0, q.maxScore)}
                                className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 border p-1"
                                placeholder="Score"
                            />
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
