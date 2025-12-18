import { FormSection, FileUpload } from "../../../../components"
import type { UseFileUploadReturn } from "../../../Activities/hooks/useFileUpload"

interface CoverImageSectionProps {
 
  fileUpload: UseFileUploadReturn
}

export default function AvatarImageSection({  fileUpload }: CoverImageSectionProps) {
  // Meetings don't have cover images


  return (
    <FormSection title="Cover Image">
      <FileUpload
      isCircular={true}
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
