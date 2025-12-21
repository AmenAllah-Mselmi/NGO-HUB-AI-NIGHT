import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import AuthForm from '../components/AuthForm'
import supabase from '../../../utils/supabase'

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export default function ResetPassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    // Supabase handles the recovery token via URL hash automatically.
    // We just need to ensure the user is "logged in" via that token.
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        toast.error('Invalid or expired reset link')
        navigate('/login')
      }
    }
    checkSession()
  }, [navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = resetPasswordSchema.safeParse(form)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0] as string] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({
        password: form.password
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Password updated successfully!')
      navigate('/login')
    } catch (err: any) {
      toast.error(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm 
      title='New Password' 
      onSubmit={handleSubmit} 
      buttonText={loading ? 'Updating...' : 'Update Password'} 
      link='login' 
      text='Back to' 
      linkText='Login'
    >
      <p className='text-sm text-gray-500 mb-4 ml-1 font-medium'>
        Please enter your new password below.
      </p>
      
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">New Password</label>
        <input
          type='password'
          name='password'
          placeholder='••••••••'
          className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all'
          onChange={handleChange}
        />
        {errors.password && (
          <p className='text-red-500 text-xs font-bold mt-1 ml-1'>{errors.password}</p>
        )}
      </div>

      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Confirm Password</label>
        <input
          type='password'
          name='confirmPassword'
          placeholder='••••••••'
          className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all'
          onChange={handleChange}
        />
        {errors.confirmPassword && (
          <p className='text-red-500 text-xs font-bold mt-1 ml-1'>{errors.confirmPassword}</p>
        )}
      </div>
    </AuthForm>
  )
}
