import { Calendar} from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { FormInput, FormSection } from '../../../../../components'
import type { ActivityFormValues } from '../../../schemas/activitySchema'

interface DateTimeSectionProps {
  register: UseFormRegister<ActivityFormValues>
  errors: FieldErrors<ActivityFormValues>
}

export default function DateTimeSection({ register, errors }: DateTimeSectionProps) {
  return (
    <FormSection title="Date & Time">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <FormInput
          id="activity_begin_date"
          label="Start Date & Time *"
          type="datetime-local"
          icon={<Calendar className="h-5 w-5 text-gray-400" />}
          register={register('activity_begin_date')}
          error={errors.activity_begin_date}
        />

        <FormInput
          id="activity_end_date"
          label="End Date & Time *"
          type="datetime-local"
          icon={<Calendar className="h-5 w-5 text-gray-400" />}
          register={register('activity_end_date')}
          error={errors.activity_end_date}
        />
      </div>
    </FormSection>
  )
}
