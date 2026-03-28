'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { EmployeeDashboard } from '@/app/components/dashboard/EmployeeDashboard'
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
      const timer = setTimeout(() => setShowSuccessMessage(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#bbb] text-sm font-light">
        Loading your dashboard...
      </div>
    )
  }

  return (
    <>
      {showSuccessMessage && (
        <div
          className="flex items-center gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4 mb-8"
          style={{ animation: 'fadeUp 0.4s ease both' }}
        >
          <span>&#9989;</span>
          <p className="text-sm text-[#166534] m-0">Application submitted! The employer will review it and get back to you.</p>
        </div>
      )}

      {user.userType === 'employee' ? (
        <EmployeeDashboard user={user} />
      ) : (
        <EmployerDashboard user={user} />
      )}
    </>
  )
}
