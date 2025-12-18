import { type ReactNode } from 'react'

interface FormSectionProps {
  title: string
  children: ReactNode
}

export default function FormSection({ title, children }: FormSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">{title}</h2>
      {children}
    </div>
  )
}
