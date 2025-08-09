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
  userType: z.enum(['student', 'employer']),
  university: z.string().optional(),
  company: z.string().optional(),
  password: z.string().min(1, 'Password is required').min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
}).refine((data) => {
  if (data.userType === 'student' && (!data.university || data.university.trim() === '')) {
    return false
  }
  return true
}, {
  message: 'University is required for students',
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
    formState: { errors }
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      userType: 'student'
    }
  })

  const userType = watch('userType')

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (response.ok) {
        // Redirect to sign-in on successful signup
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
    <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-6 text-center">
        Create your account
      </h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Full Name
          </label>
          <input
            {...register('name')}
            type="text"
            id="name"
            className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            placeholder="John Doe"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Email Address
          </label>
          <input
            {...register('email')}
            type="email"
            id="email"
            className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            placeholder="john@example.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="userType" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            I am a
          </label>
          <select
            {...register('userType')}
            id="userType"
            className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
          >
            <option value="student">Student looking for work</option>
            <option value="employer">Employer hiring students</option>
          </select>
          {errors.userType && (
            <p className="mt-1 text-sm text-red-500">{errors.userType.message}</p>
          )}
        </div>

        {/* Dynamic field based on user type */}
        {userType === 'student' ? (
          <div>
            <label htmlFor="university" className="block text-sm font-medium text-[var(--foreground)] mb-1">
              University
            </label>
            <input
              {...register('university')}
              type="text"
              id="university"
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
              placeholder="University of Technology"
            />
            {errors.university && (
              <p className="mt-1 text-sm text-red-500">{errors.university.message}</p>
            )}
          </div>
        ) : (
          <div>
            <label htmlFor="company" className="block text-sm font-medium text-[var(--foreground)] mb-1">
              Company Name
            </label>
            <input
              {...register('company')}
              type="text"
              id="company"
              className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
              placeholder="Tech Startup Inc."
            />
            {errors.company && (
              <p className="mt-1 text-sm text-red-500">{errors.company.message}</p>
            )}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            id="password"
            className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-[var(--foreground)] mb-1">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            id="confirmPassword"
            className="w-full px-3 py-2 border border-[var(--foreground)]/20 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:border-transparent"
            placeholder="••••••••"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-500">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-[var(--foreground)]/50 focus:ring-offset-2 focus:ring-offset-[var(--background)] disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-[var(--foreground)]/60">
          Already have an account?{' '}
          <Link 
            href="/sign-in" 
            className="text-[var(--foreground)] hover:underline font-medium"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}