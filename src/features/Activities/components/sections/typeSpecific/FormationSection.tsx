import type { UseFormRegister } from 'react-hook-form'

import { User } from 'lucide-react'
import { FileUpload, FormInput, FormSection } from '../../../../../components'
import type { ActivityFormValues } from '../../../schemas/activitySchema'

interface FormationSectionProps {
  register: UseFormRegister<ActivityFormValues>
  courseAttachment: {
    file: File[]
    urls: string[]
    setFile: (files: File[]) => void
    clearFiles: () => void
  }
}

export default function FormationSection({ 
  register, 
  courseAttachment
}: FormationSectionProps) {
  return (
    <FormSection title="Formation Details">
      <div className="space-y-6">
        <FormInput
          id="trainer_name"
          label="Trainer Name (Optional)"
          placeholder="e.g., John Doe"
          icon={<User className="h-5 w-5 text-gray-400" />}
          register={register('trainer_name')}
        />
        <FileUpload
          label="Course Materials (Optional)"
          accept="document"
          onFileSelect={(files) => courseAttachment.setFile(files)}
          onFileRemove={courseAttachment.clearFiles}
          currentFiles={courseAttachment.file}
          currentUrls={courseAttachment.urls}
        />
      </div>
    </FormSection>
  )
}
