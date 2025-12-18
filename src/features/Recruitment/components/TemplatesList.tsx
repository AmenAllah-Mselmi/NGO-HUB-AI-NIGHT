import { FileText, Plus, Pencil, Trash2, Calendar } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { recruitmentService } from '../services/recruitmentService'
import { toast } from 'sonner'
import type { EvaluationTemplate } from '../models/types'

interface TemplatesListProps {
    templates: EvaluationTemplate[]
    onDelete: (id: string) => void
}

export default function TemplatesList({ templates, onDelete }: TemplatesListProps) {
    const navigate = useNavigate()

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this template?')) return
        try {
            await recruitmentService.deleteTemplate(id)
            onDelete(id)
            toast.success('Template deleted')
        } catch (error) {
            console.error(error)
            toast.error('Failed to delete template')
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Link
                    to="/recruitment/templates/new"
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Create Template
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                    <div key={template.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group relative">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full uppercase font-medium tracking-wide">
                                {template.questions?.length || 0} Questions
                            </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.title}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 h-10">
                            {template.description || 'No description provided.'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                             <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(template.created_at).toLocaleDateString()}
                             </span>
                             <div className="flex gap-2">
                                <button
                                    onClick={() => navigate(`/recruitment/templates/${template.id}/edit`)}
                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                    title="Edit Template"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                    title="Delete Template"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                             </div>
                        </div>
                    </div>
                ))}
                
                {templates.length === 0 && (
                    <div className="col-span-full text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                        <div className="flex justify-center mb-4">
                            <div className="p-4 bg-gray-50 rounded-full">
                                <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No templates yet</h3>
                        <p className="text-gray-500 mt-1">Create your first evaluation template to get started.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
