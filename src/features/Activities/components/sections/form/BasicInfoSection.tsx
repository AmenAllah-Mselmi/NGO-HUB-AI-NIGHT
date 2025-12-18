
import type { UseFormRegister, FieldErrors } from 'react-hook-form'
import {  Type } from 'lucide-react'
import { FormInput, FormSection, FormSelect } from '../../../../../components'
import type { ActivityFormValues } from '../../../schemas/activitySchema'

interface BasicInfoSectionProps {
  register: UseFormRegister<ActivityFormValues>
  errors: FieldErrors<ActivityFormValues>
  isEditMode?: boolean
}

export default function BasicInfoSection({ register, errors, isEditMode = false }: BasicInfoSectionProps) {
  return (
    <FormSection title="Basic Information">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="col-span-2">
          <FormInput
            id="name"
            label="Activity Name *"
            placeholder="e.g., Annual General Meeting"
            register={register('name')}
            error={errors.name}
          />
        </div>

        <div className="col-span-2">
          <FormInput
            id="description"
            label="Description (Optional)"
            placeholder="Describe the activity..."
            register={register('description')}
            isTextarea
          />
        </div>

        <FormSelect
          id="type"
          label={isEditMode ? "Type (Cannot be changed)" : "Type *"}
          icon={<Type className="h-5 w-5 text-gray-400" />}
          options={[
            { value: 'event', label: 'Event' },
            { value: 'formation', label: 'Formation' },
            { value: 'meeting', label: 'Meeting' }
          ]}
          register={register('type')}
          disabled={isEditMode}
        />

        <FormInput
          id="activity_points"
          label="Points *"
          type="number"
          register={register('activity_points')}
          error={errors.activity_points}
        />
      </div>
    </FormSection>
  )
}

