
import {  MapPin } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { FormCheckbox, FormInput, FormSection } from '../../../../../components'
import type { ActivityFormValues } from '../../../schemas/activitySchema'

interface LocationSectionProps {
  register: UseFormRegister<ActivityFormValues>
  errors: FieldErrors<ActivityFormValues>
  isOnline: boolean
}

export default function LocationSection({ register, errors, isOnline }: LocationSectionProps) {
  return (
    <FormSection title="Location & Details">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <FormCheckbox
            id="is_online"
            label="Online Activity"
            register={register('is_online')}
          />
          <FormCheckbox
            id="is_public"
            label="Public"
            register={register('is_public')}
          />
        </div>

          {isOnline && (
            <FormInput
            id="online_link"
            label="Online Link (Optional)"
            type="url"
            placeholder="https://meet.google.com/abc-defg-hij or https://zoom.us/j/123456789"
            register={register('online_link')}
            error={errors.online_link}
          />
        )}

        {!isOnline && (
          <FormInput
            id="activity_address"
            label="Address *"
            placeholder="123 Main St, City"
            icon={<MapPin className="h-5 w-5 text-gray-400" />}
            register={register('activity_address')}
          />
        )}
      </div>
    </FormSection>
  )
}
