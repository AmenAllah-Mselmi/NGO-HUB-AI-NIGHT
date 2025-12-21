import { useState } from 'react'
import { z } from 'zod'
import { toast } from 'sonner'
import AuthForm from '../components/AuthForm'
import supabase from '../../../utils/supabase'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email format'),
})

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const result = forgotPasswordSchema.safeParse({ email })
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setSubmitted(true)
      toast.success('Password reset link sent to your email')
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <AuthForm 
        title='Check Your Email' 
        onSubmit={(e) => e.preventDefault()} 
        buttonText='Link Sent' 
        link='login' 
        text='Did not receive it?' 
        linkText='Try again'
      >
        <div className='text-center space-y-4'>
          <p className='text-gray-600 leading-relaxed font-medium'>
            We've sent a password reset link to <span className='font-bold text-gray-900'>{email}</span>.
          </p>
          <div className='p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-700 text-sm font-bold animate-pulse'>
            Please check your inbox and spam folder.
          </div>
        </div>
      </AuthForm>
    )
  }

  return (
    <AuthForm 
      title='Reset Password' 
      onSubmit={handleSubmit} 
      buttonText={loading ? 'Sending...' : 'Send Reset Link'} 
      link='login' 
      text='Remembered your password?' 
      linkText='Login'
    >
      <p className='text-sm text-gray-500 mb-2 ml-1 font-medium'>
        Enter your email address and we'll send you a link to reset your password.
      </p>
      <div>
        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 ml-1">Email Address</label>
        <input
          type='email'
          placeholder='name@company.com'
          className='w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all'
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (error) setError('')
          }}
          disabled={loading}
        />
        {error && (
          <p className='text-red-500 text-xs font-bold mt-1 ml-1'>{error}</p>
        )}
      </div>
    </AuthForm>
  )
}
