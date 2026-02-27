import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.context'
import AuthForm from '../components/AuthForm'
import { useTranslation } from 'react-i18next'
import GoogleSignInBadge from '../components/GoogleSignInBadge'

export default function Login() {
  const { signIn } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    try {
      const { error } = await signIn(form)
      if (error) {
        setErrors({ email: error.message || t('auth.invalidCredentials', 'Invalid login credentials') })
        return
      }
      navigate('/')
    } catch {
      setErrors({ email: t('auth.unexpectedError', 'An unexpected error occurred') })
    }
  }

  return (
    <AuthForm title='Welcome Back' onSubmit={handleSubmit} buttonText='Login' link='register' text="Don't have an account?" linkText='Create one'>
      {/* Email */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
        <input
          name='email'
          type="email"
          placeholder='name@company.com'
          className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all'
          onChange={handleChange}
        />
        {errors.email && (
          <p className='text-red-500 text-xs font-bold mt-1 ml-1'>{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1 ml-1">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Password</label>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-xs font-bold text-(--color-myPrimary) hover:underline"
          >
            Forgot Password?
          </button>
        </div>
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

      {/* OR Divider */}
      <div className='flex items-center my-6 gap-3'>
        <div className='flex-1 h-px bg-gray-100' />
        <span className='text-gray-300 text-[10px] font-black tracking-widest'>OR</span>
        <div className='flex-1 h-px bg-gray-100' />
      </div>

      {/* Google Login */}
      <div className="flex justify-center">
        <GoogleSignInBadge />
      </div>
    </AuthForm>
  )
}
