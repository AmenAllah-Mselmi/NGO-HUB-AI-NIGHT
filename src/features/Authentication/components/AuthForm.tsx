import React from 'react'
import logo from '../../../assets/logo.png';
import { Link } from 'react-router-dom';
type AuthFormProps = {
  title: string
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  children: React.ReactNode
  link:string
  linkText:string
  buttonText: string
    text?:string
}

export default function AuthForm({
  title,
  onSubmit,
  children,
  buttonText,
    link,
    text,
    linkText,
}: AuthFormProps) {
  return (
    <div className='min-h-screen flex items-center justify-center '>
      <img src={logo} alt='Logo' className='h-100 w-auto p-6 m-20 justify-center  ' />
      <form
        onSubmit={onSubmit}
        className='max-w-md mx-auto mt-20 p-6 border rounded-2xl shadow font-stretch-normal'
      >
        <h1 className='text-2xl font-bold mb-4'>{title}</h1>
        <div className='space-y-2'>{children}</div>
        <button
          type='submit'
          className='mt-4 w-full bg-(--color-myPrimary) text-white py-3 rounded-3xl hover:bg-(--color-myPrimary) transition'
        >
          {buttonText}
        </button>
        <p className='text-sm text-center mt-3'>
        {text}  {' '}
          <Link to={`/${link}`} className='text-(--color-myPrimary) underline'>
            {linkText}
          </Link>
        </p>
      </form>
    </div>
  )
}
