import { useState } from 'react'
import { z } from 'zod'
import { useAuth } from '../auth.context'
import AuthForm from '../components/AuthForm'
import { useNavigate } from 'react-router-dom'

// ---------------------
// ZOD VALIDATION SCHEMA
// ---------------------
const registerSchema = z.object({
  fullname: z.string().min(3, 'Full name is required'),
  phone: z.string().min(6, 'Phone number is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  device_id: z.string(),
})

export default function Register() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullname: '',
    phone: '',
    email: '',
    password: '',
    device_id: navigator.userAgent,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })

    // Clear field error when user updates value
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate with Zod
    const result = registerSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const fieldKey = issue.path[0]
        if (typeof fieldKey === 'string') {
          fieldErrors[fieldKey] = issue.message
        }
      })
      setErrors(fieldErrors)
      return
    }

    // If valid -> call signUp
    try {
      // Clear previous errors before signup
      setErrors({})
      
      const response = await signUp(form)
      
      // Check if signUp returned an error
      if (response?.error) {
        console.error('SignUp error:', response.error)
        setErrors({ 
          general: response.error.message || 'Failed to create account. Please try again.' 
        })
        return
      }

      // Navigate to pending validation page on success
      navigate('/pending-validation')
    } catch (err: any) {
      // Handle unexpected errors
      console.error('Unexpected error:', err)
      setErrors({ general: err.message || 'Something went wrong' })
    }
  }

  return (
    <AuthForm
      title='Create Account'
      onSubmit={handleSubmit}
      buttonText='Register'
      link='login'
      linkText='Login '
      text='Already have an account?'
    >
      {/* General Error Message */}
      {errors.general && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-2xl mb-4'>
          <p className='text-sm'>{errors.general}</p>
        </div>
      )}

      {/* Full Name */}
      <input
        name='fullname'
        placeholder='Full name'
        className='border p-3 w-full rounded-2xl mb-3'
        onChange={handleChange}
      />
      {errors.fullname && (
        <p className='text-red-500 text-sm mb-2'>{errors.fullname}</p>
      )}

      {/* Phone */}
      <input
        name='phone'
        placeholder='Phone'
        className='border p-3 w-full rounded-2xl mb-3'
        onChange={handleChange}
      />
      {errors.phone && (
        <p className='text-red-500 text-sm mb-2'>{errors.phone}</p>
      )}

      {/* Email */}
      <input
        name='email'
        placeholder='Email'
        className='border p-3 w-full rounded-2xl mb-3'
        onChange={handleChange}
      />
      {errors.email && (
        <p className='text-red-500 text-sm mb-2'>{errors.email}</p>
      )}

      {/* Password */}
      <input
        type='password'
        name='password'
        placeholder='Password'
        className='border p-3 w-full rounded-2xl mb-3'
        onChange={handleChange}
      />

      {errors.password && (
        <p className='text-red-500 text-sm mb-2'>{errors.password}</p>
      )}

    </AuthForm>
  )
}