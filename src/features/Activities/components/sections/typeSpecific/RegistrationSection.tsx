import type { UseFormRegister } from 'react-hook-form'
import { FormInput, FormSection } from '../../../../../components'
import type { ActivityFormValues } from '../../../schemas/activitySchema'

interface RegistrationSectionProps {
  register: UseFormRegister<ActivityFormValues>
}

export default function RegistrationSection({ register }: RegistrationSectionProps) {
  return (
    <FormSection title="Registration">
      <FormInput
        id="registration_deadline"
        label="Registration Deadline (Optional)"
        type="datetime-local"
        register={register('registration_deadline')}
      />
    </FormSection>
  )
}
