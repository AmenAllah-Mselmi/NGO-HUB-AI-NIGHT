import { type ReactNode } from 'react'
import { type UseFormRegisterReturn } from 'react-hook-form'

interface FormSelectProps {
  id: string
  label: string
  icon?: ReactNode
  options: { value: string; label: string }[]
  register: UseFormRegisterReturn
  disabled?: boolean
}

export default function FormSelect({ id, label, icon, options, register, disabled = false }: FormSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="mt-1 relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
        )}
        <select
          id={id}
          {...register}
          disabled={disabled}
          className={`block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm border ${icon ? 'pl-10 pr-3 py-2' : 'pl-3 pr-3 py-2'} ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

