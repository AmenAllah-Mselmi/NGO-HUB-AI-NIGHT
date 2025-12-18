import { Trash2, Plus, Star } from 'lucide-react'
import type { Question } from '../models/types'

interface QuestionEditorProps {
    question: Question
    index: number
    onUpdate: (id: string, field: keyof Question, value: any) => void
    onRemove: (id: string) => void
}

export default function QuestionEditor({ question, index, onUpdate, onRemove }: QuestionEditorProps) {
    return (
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 group">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center border border-gray-200 font-bold text-gray-500">
                    {index + 1}
                </div>
                
                <div className="flex-1 space-y-3">
                    <div>
                        <input
                            type="text"
                            value={question.text}
                            onChange={(e) => onUpdate(question.id, 'text', e.target.value)}
                            className="w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 border"
                            placeholder="Enter question text..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Type</label>
                            <select
                                value={question.type || 'numeric'}
                                onChange={(e) => {
                                    const newType = e.target.value
                                    onUpdate(question.id, 'type', newType)
                                    // Auto-set max score for rating
                                    if (newType === 'rating') {
                                        onUpdate(question.id, 'maxScore', 5)
                                    }
                                }}
                                className="w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2 text-sm border"
                            >
                                <option value="numeric">Manual Score Input</option>
                                <option value="text">Text Input</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="choice">Multiple Choice</option>
                                <option value="rating">Star Rating (1-5)</option>
                            </select>
                        </div>
                        
                        {question.type !== 'choice' && (
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">Max Score</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={question.maxScore}
                                        onChange={(e) => onUpdate(question.id, 'maxScore', parseInt(e.target.value) || 0)}
                                        className={`w-full bg-white rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-1 px-2 text-sm border ${question.type === 'rating' ? 'bg-gray-100 text-gray-500' : ''}`}
                                        min="1"
                                        disabled={question.type === 'rating'}
                                    />
                                    {question.type === 'rating' && (
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-400">
                                            <Star className="w-4 h-4 fill-current" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {(question.type === 'choice' || question.type === 'checkbox') && (
                        <div className="bg-white p-3 rounded border border-gray-200 space-y-2">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Options</label>
                            {question.options?.map((opt, optIdx) => (
                                <div key={optIdx} className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={opt.label}
                                        onChange={(e) => {
                                            const newOpts = [...(question.options || [])]
                                            newOpts[optIdx].label = e.target.value
                                            onUpdate(question.id, 'options', newOpts)
                                        }}
                                        placeholder="Option Label"
                                        className="flex-1 text-sm border-gray-300 rounded border p-1"
                                    />
                                    <input
                                        type="number"
                                        value={opt.score}
                                        onChange={(e) => {
                                            const newOpts = [...(question.options || [])]
                                            newOpts[optIdx].score = parseInt(e.target.value) || 0
                                            
                                            if (question.type === 'choice') {
                                                const max = Math.max(...newOpts.map(o => o.score))
                                                onUpdate(question.id, 'maxScore', max)
                                            } else {
                                                const sum = newOpts.reduce((acc, curr) => acc + (curr.score > 0 ? curr.score : 0), 0)
                                                onUpdate(question.id, 'maxScore', sum)
                                            }
                                            onUpdate(question.id, 'options', newOpts)
                                        }}
                                        placeholder="Pts"
                                        className="w-16 text-sm border-gray-300 rounded border p-1"
                                    />
                                    <button
                                        onClick={() => {
                                            const newOpts = question.options?.filter((_, i) => i !== optIdx)
                                            onUpdate(question.id, 'options', newOpts)
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    const newOpts = [...(question.options || []), { label: '', score: 0 }]
                                    onUpdate(question.id, 'options', newOpts)
                                }}
                                className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
                            >
                                <Plus className="w-3 h-3" /> Add Option
                            </button>
                        </div>
                    )}
                    {question.type === 'text' && (
                        <div className="text-sm text-gray-500 italic p-3 bg-gray-50 border border-gray-200 rounded">
                            Text input will be shown to the evaluator (0 points by default).
                        </div>
                    )} 
                    {question.type === 'rating' && (
                        <div className="text-sm text-gray-500 italic p-3 bg-gray-50 border border-gray-200 rounded flex items-center gap-2">
                             Evaluator will select 1-5 stars.
                        </div>
                    )} 
                </div>

                <button
                    onClick={() => onRemove(question.id)}
                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Question"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    )
}
