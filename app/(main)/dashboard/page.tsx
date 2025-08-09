'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { StudentDashboard } from '@/app/components/dashboard/StudentDashboard'
import { EmployerDashboard } from '@/app/components/dashboard/EmployerDashboard'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  useEffect(() => {
    if (searchParams.get('applied') === 'true') {
      setShowSuccessMessage(true)
      // Clear the message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--foreground)]/60">Loading...</p>
      </div>
    )
  }

  return (
    <>
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <p className="text-green-800 dark:text-green-300">
            Application submitted successfully! The employer will review your application and get back to you.
          </p>
        </div>
      )}
      
      {user.userType === 'student' ? (
        <StudentDashboard user={user} />
      ) : (
        <EmployerDashboard user={user} />
      )}
    </>
  )
}