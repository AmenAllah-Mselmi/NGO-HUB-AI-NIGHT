
import { FileUpload, FormSection } from '../../../../components'
import type { UseFileUploadReturn } from '../../hooks/useFileUpload'

interface RecapImagesSectionProps {
  fileUpload: UseFileUploadReturn
}

export default function RecapImagesSection({ fileUpload }: RecapImagesSectionProps) {
  const handleRemove = (index: number) => {
    if (index < fileUpload.urls.length) {
      // Remove from URLs
      fileUpload.setUrls(fileUpload.urls.filter((_, i) => i !== index))
    } else {
      // Remove from files
      const fileIndex = index - fileUpload.urls.length
      fileUpload.setFile(fileUpload.file.filter((_, i) => i !== fileIndex))
    }
  }

  return (
    <FormSection title="Recap Images">
      <div className="space-y-2">
        <p className="text-sm text-gray-600 mb-4">
          Upload multiple images to document this activity (photos from the event, formation, or meeting)
        </p>
        <FileUpload
          label="Activity Photos"
          accept="image"
          multiple={true}
          onFileSelect={(files) => fileUpload.setFile([...fileUpload.file, ...files])}
          onFileRemove={handleRemove}
          currentFiles={fileUpload.file}
          currentUrls={fileUpload.urls}
        />
      </div>
    </FormSection>
  )
}
