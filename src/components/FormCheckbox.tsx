import { type UseFormRegisterReturn } from 'react-hook-form'

interface FormCheckboxProps {
  id: string
  label: string
  register: UseFormRegisterReturn
}

export default function FormCheckbox({ id, label, register }: FormCheckboxProps) {
  return (
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        {...register}
        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
      />
      <label htmlFor={id} className="ml-2 block text-sm text-gray-900">
        {label}
      </label>
    </div>
  )
}
