import { useState } from 'react'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.context'
import AuthForm from '../components/AuthForm'
import supabase from '../../../utils/supabase'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export default function Login() {
  const { signIn, googleSignIn } = useAuth()

  const [form, setForm] = useState({
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })

    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }
const navigate = useNavigate()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const result = loginSchema.safeParse(form)
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
  try {
      // Clear previous errors before signin
      setErrors({})
      const { data, error } = await signIn(form)
      
      if (error) {
        setErrors({ email: error.message || 'Invalid login credentials' })
        return
      }

      if (data?.user) {
        // Fetch profile to check validation status
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_validated')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else if (profile && !profile.is_validated) {
          // If not validated, steer to rh advisor page
          navigate('/pending-validation')
          return
        }
      }

      navigate("/")
    } catch (error) {
      console.error('Error during login:', error)
      setErrors({ email: 'An unexpected error occurred' })
    }
  }

  return (
    <AuthForm title='Welcome Back' onSubmit={handleSubmit} buttonText='Login' link='register' text='Don t Have an account?' linkText='Create one'>
      {/* Email */}
      <input
        name='email'
        placeholder='Email'
        className='border p-3 w-full rounded mb-1'
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
        className='border p-3 w-full rounded mb-1'
        onChange={handleChange}
      />
      {errors.password && (
        <p className='text-red-500 text-sm mb-2'>{errors.password}</p>
      )}

      {/* OR Divider */}
      <div className='flex items-center my-4 gap-2'>
        <div className='flex-1 h-px bg-gray-300' />
        <span className='text-gray-500 text-sm'>OR</span>
        <div className='flex-1 h-px bg-gray-300' />
      </div>

      {/* GOOGLE LOGIN BUTTON */}
      <button
        type='button'
        onClick={googleSignIn}
        className='w-full py-3 border rounded flex justify-center gap-2 hover:bg-gray-100'
      >
        <img
          src='https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg'
          className='w-5 h-5'
        />
        Continue with Google
      </button>

      {/* Register link */}
    
    </AuthForm>
  )
}
