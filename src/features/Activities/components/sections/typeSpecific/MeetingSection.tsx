
import { FormSection, FileUpload } from '../../../../../components'
import type { AgendaItem } from '../../../models/MeetingAgenda'
import MeetingAgendaComponent from './MeetingAgenda'

interface MeetingSectionProps {
  agenda: AgendaItem[]
  onAgendaChange: (agenda: AgendaItem[]) => void
  pvAttachment: {
    file: File[]
    urls: string[]
    setFile: (files: File[]) => void
    clearFiles: () => void
  }
  disabled?: boolean
}

export default function MeetingSection({ 
  agenda, 
  onAgendaChange, 
  pvAttachment,
  disabled = false 
}: MeetingSectionProps) {
  return (
    <FormSection title="Meeting Details">
      <div className="space-y-6">
        <MeetingAgendaComponent
          agenda={agenda}
          onChange={onAgendaChange}
          disabled={disabled}
        />
        <FileUpload
          label="PV Attachments (Optional)"
          accept="document"
          onFileSelect={(files) => pvAttachment.setFile(files)}
          onFileRemove={pvAttachment.clearFiles}
          currentFiles={pvAttachment.file}
          currentUrls={pvAttachment.urls}
        />
      </div>
    </FormSection>
  )
}
