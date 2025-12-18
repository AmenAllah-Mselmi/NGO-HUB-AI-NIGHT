import { Loader2 } from 'lucide-react'

interface FormActionsProps {
  isEditMode: boolean
  loading: boolean
  uploading: boolean
  onCancel: () => void
}

export default function FormActions({ 
  isEditMode, 
  loading, 
  uploading, 
  onCancel 
}: FormActionsProps) {
  const isSubmitting = loading || uploading

  return (
    <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="w-full sm:w-auto bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full sm:w-auto inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-(--color-myPrimary) hover:bg-(--color-mySecondary) focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            {uploading ? 'Uploading...' : (isEditMode ? 'Updating...' : 'Creating...')}
          </>
        ) : (
          isEditMode ? 'Update Activity' : 'Create Activity'
        )}
      </button>
    </div>
  )
}
