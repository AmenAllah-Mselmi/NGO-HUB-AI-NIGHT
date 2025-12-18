

import { DollarSign } from 'lucide-react'
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import { FormSection, FormCheckbox, FormInput } from '../../../../../components'
import type { ActivityFormValues } from '../../../schemas/activitySchema'

interface PaymentSectionProps {
  register: UseFormRegister<ActivityFormValues>
  errors: FieldErrors<ActivityFormValues>
  isPaid: boolean
}

export default function PaymentSection({ register, errors, isPaid }: PaymentSectionProps) {
  return (
    <FormSection title="Payment">
      <div className="space-y-4">
        <FormCheckbox
          id="is_paid"
          label="This is a paid activity"
          register={register('is_paid')}
        />

        {isPaid && (
          <div className="w-full sm:w-1/2 md:w-1/3">
            <FormInput
              id="price"
              label="Price *"
              type="number"
              step="0.01"
              placeholder="0.00"
              icon={<DollarSign className="h-5 w-5 text-gray-400" />}
              register={register('price')}
              error={errors.price}
            />
          </div>
        )}
      </div>
    </FormSection>
  )
}
