'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required').min(2, 'Name must be at least 2 characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  userType: z.enum(['employee', 'employer']),
  university: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
}).refine((data) => {
  if (data.userType === 'employee' && (!data.university || data.university.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'University is required for employees',
  path: ['university']
}).refine((data) => {
  if (data.userType === 'employer' && (!data.company || data.company.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'Company name is required for employers',
  path: ['company']
})

type SignUpFormData = z.infer<typeof signUpSchema>

export default function SignUpPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userType: 'employee'
    }
  })

  const userType = watch('userType')

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (response.ok) {
        router.push('/sign-in?registered=true')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to create account')
      }
    } catch (error) {
      console.error('Signup error:', error)
      alert('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="w-full border border-white rounded-3xl p-10"
      style={{
        background: 'rgba(247, 205, 180, 0.46)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
        animation: 'fadeUp 0.5s ease both',
        maxWidth: 960,
      }}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-block bg-white border border-white text-[#e85d2f] text-xs font-semibold px-3 py-1 rounded-full mb-4 uppercase tracking-wider" style={{ maxWidth: 920 }}>
          Join Skill Orbit
        </div>
        <h2 className="text-[1.75rem] font-extrabold text-[#111] tracking-tight" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
          Create your account
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* User Type Toggle */}
        <div className="grid grid-cols-2 gap-2.5 mb-4">
          <div
            className={`py-2.5 border-[1.5px] rounded-xl text-center cursor-pointer transition-all text-[0.82rem] font-bold ${
              userType === 'employee'
                ? 'border-[#e85d2f] bg-[#fff7f4] text-[#e85d2f]'
                : 'border-[#e5e2db] bg-white text-[#888]'
            }`}
            style={{ fontFamily: "'Syne', sans-serif" }}
            onClick={() => setValue('userType', 'employee')}
          >
            &#127891; Employee
          </div>
          <div
            className={`py-2.5 border-[1.5px] rounded-xl text-center cursor-pointer transition-all text-[0.82rem] font-bold ${
              userType === 'employer'
                ? 'border-[#e85d2f] bg-[#fff7f4] text-[#e85d2f]'
                : 'border-[#e5e2db] bg-white text-[#888]'
            }`}
            style={{ fontFamily: "'Syne', sans-serif" }}
            onClick={() => setValue('userType', 'employer')}
          >
            &#127970; Employer
          </div>
          <input type="hidden" {...register('userType')} />
        </div>

        {/* Name */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">Full Name</label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            placeholder="Name Surname"
          />
          {errors.name && <p className="text-xs text-[#e85d2f] mt-1">{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">Email Address</label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            placeholder="SkillOrbit@example.com"
          />
          {errors.email && <p className="text-xs text-[#e85d2f] mt-1">{errors.email.message}</p>}
        </div>

        {/* University / Company */}
        {userType === 'employee' ? (
          <div className="mb-4">
            <label htmlFor="university" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">University</label>
            <input
              {...register('university')}
              type="text"
              id="university"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              placeholder="e.g. SVIT, GTU..."
            />
            {errors.university && <p className="text-xs text-[#e85d2f] mt-1">{errors.university.message}</p>}
          </div>
        ) : (
          <div className="mb-4">
            <label htmlFor="company" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">Company Name</label>
            <input
              {...register('company')}
              type="text"
              id="company"
              className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
              placeholder="e.g. Tech Startup Inc."
            />
            {errors.company && <p className="text-xs text-[#e85d2f] mt-1">{errors.company.message}</p>}
          </div>
        )}

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">Password</label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            placeholder="Min. 8 characters"
          />
          {errors.password && <p className="text-xs text-[#e85d2f] mt-1">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label htmlFor="confirmPassword" className="block text-[0.82rem] font-medium text-[#444] mb-1.5">Confirm Password</label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm outline-none transition-all focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)]"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-xs text-[#e85d2f] mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-[#e85d2f] text-white border-none rounded-full text-[0.95rem] font-bold cursor-pointer mt-2 transition-all hover:-translate-y-0.5 disabled:opacity-55 disabled:cursor-not-allowed"
          style={{
            fontFamily: "'Syne', sans-serif",
            boxShadow: '0 4px 16px rgba(232,93,47,0.3)',
          }}
        >
          {isLoading ? 'Creating account...' : 'Create Account \u2192'}
        </button>
      </form>

      <div className="text-center mt-6 text-sm text-[#999] font-light">
        Already have an account?{' '}
        <Link href="/sign-in" className="text-[#e85d2f] font-medium no-underline hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  )
}
