
import { FileUpload, FormSection } from '../../../../components'
import type { UseFileUploadReturn } from '../../hooks/useFileUpload'

interface CoverImageSectionProps {
  activityType: string
  fileUpload: UseFileUploadReturn
}

export default function CoverImageSection({ activityType, fileUpload }: CoverImageSectionProps) {
  // Meetings don't have cover images
  if (activityType === 'meeting') return null

  return (
    <FormSection title="Cover Image">
      <FileUpload
        label="Activity Image (Optional)"
        accept="image"
        onFileSelect={(files) => fileUpload.setFile(files)}
        onFileRemove={fileUpload.clearFiles}
        currentFiles={fileUpload.file}
        currentUrls={fileUpload.urls}
      />
    </FormSection>
  )
}
