import { useState, useEffect } from "react";
import {  getCategories, getProfileCategories, removeProfileCategory, addProfileCategory, createCategory, type Category } from "../../services/members.service";


interface MemberInfoProps {
    memberId: string;
    description?: string;
    onDescriptionUpdate: (description: string) => void;
    readOnly?: boolean;
}

export default function MemberInfo({ memberId, description, onDescriptionUpdate, readOnly = false }: MemberInfoProps) {
    const [localDescription, setLocalDescription] = useState(description || "");
    const [availableCategories, setAvailableCategories] = useState<Category[]>([]);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    
    // Create category state
    const [showCreateInput, setShowCreateInput] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState<string | null>(null);

    // Fetch all categories and profile's current categories on mount
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [allCategories, profileCategories] = await Promise.all([
                    getCategories(),
                    getProfileCategories(memberId)
                ]);
                
                setAvailableCategories(allCategories);
                setSelectedCategoryIds(new Set(profileCategories.map(c => c.id)));
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [memberId]);

    const handleCategoryToggle = async (category: Category) => {
        if (readOnly) return;
        const isSelected = selectedCategoryIds.has(category.id);
        
        try {
            if (isSelected) {
                // Remove category from profile
                await removeProfileCategory(memberId, category.id);
                setSelectedCategoryIds(prev => {
                    const next = new Set(prev);
                    next.delete(category.id);
                    return next;
                });
            } else {
                // Add category to profile
                await addProfileCategory(memberId, category.id);
                setSelectedCategoryIds(prev => new Set(prev).add(category.id));
            }
        } catch (error) {
            console.error('Error toggling category:', error);
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            setCreateError("Category name cannot be empty");
            return;
        }
        
        setCreating(true);
        setCreateError(null);
        
        try {
            const newCategory = await createCategory(newCategoryName);
            if (newCategory) {
                // Add to available categories list
                setAvailableCategories(prev => [...prev, newCategory].sort((a, b) => a.name.localeCompare(b.name)));
                // Reset form
                setNewCategoryName("");
                setShowCreateInput(false);
            }
        } catch (error: any) {
            if (error.message === 'Category already exists') {
                setCreateError("A category with this name already exists");
            } else {
                setCreateError("Failed to create category");
            }
        } finally {
            setCreating(false);
        }
    };

    const handleCancelCreate = () => {
        setShowCreateInput(false);
        setNewCategoryName("");
        setCreateError(null);
    };

    const handleDescriptionBlur = () => {
        if (localDescription !== description) {
            onDescriptionUpdate(localDescription);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Info</h3>
            
            <div className="space-y-6">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Preferred Categories
                        </label>
                        {!showCreateInput && !readOnly && (
                            <button
                                onClick={() => setShowCreateInput(true)}
                                className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Category
                            </button>
                        )}
                    </div>

                    {/* Create Category Input */}
                    {showCreateInput && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newCategoryName}
                                    onChange={(e) => {
                                        setNewCategoryName(e.target.value);
                                        setCreateError(null);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateCategory();
                                        if (e.key === 'Escape') handleCancelCreate();
                                    }}
                                    placeholder="Enter category name..."
                                    className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    autoFocus
                                    disabled={creating}
                                />
                                <button
                                    onClick={handleCreateCategory}
                                    disabled={creating || !newCategoryName.trim()}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {creating ? "..." : "Create"}
                                </button>
                                <button
                                    onClick={handleCancelCreate}
                                    disabled={creating}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                            {createError && (
                                <p className="mt-2 text-xs text-red-600">{createError}</p>
                            )}
                        </div>
                    )}

                    {loading ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {availableCategories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryToggle(cat)}
                                    disabled={readOnly}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                                        selectedCategoryIds.has(cat.id)
                                            ? 'bg-(--color-mySecondary) text-white border-white-600'
                                            : `bg-white text-gray-600 border-gray-300 ${!readOnly ? 'hover:bg-gray-50' : ''}`
                                    } ${readOnly ? 'cursor-default' : ''}`}
                                >
                                    {cat.name}
                                </button>
                            ))}
                            {availableCategories.length === 0 && (
                                <span className="text-sm text-gray-500">No categories available. Create one!</span>
                            )}
                        </div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description / Notes
                    </label>
                    <textarea
                        rows={4}
                        className={`w-full border rounded-md p-3 text-sm focus:ring-blue-500 focus:border-blue-500 ${readOnly ? 'bg-gray-50 cursor-default' : ''}`}
                        placeholder={readOnly ? "No description provided." : "Add member description..."}
                        value={localDescription}
                        onChange={(e) => setLocalDescription(e.target.value)}
                        onBlur={handleDescriptionBlur}
                        readOnly={readOnly}
                    />
                </div>
            </div>
        </div>
    );
}


