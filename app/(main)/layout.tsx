'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/sign-in')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Navigation */}
      <nav className="border-b border-[var(--foreground)]/10 bg-[var(--background)]/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-[var(--foreground)]">
                Skill Orbit
              </Link>
              
              <div className="hidden md:flex space-x-6">
                {user.userType === 'student' ? (
                  <>
                    <Link href="/jobs" className="text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors">
                      Browse Jobs
                    </Link>
                    <Link href="/my-applications" className="text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors">
                      My Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/post-job" className="text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors">
                      Post Job
                    </Link>
                    <Link href="/my-jobs" className="text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors">
                      My Jobs
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-[var(--foreground)]">{user.name}</p>
                <p className="text-xs text-[var(--foreground)]/60">{user.userType === 'student' ? 'Student' : 'Employer'}</p>
              </div>
              
              <div className="w-10 h-10 rounded-full bg-[var(--foreground)]/10 flex items-center justify-center">
                <span className="text-[var(--foreground)] font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              
              <button
                onClick={handleLogout}
                className="text-sm text-[var(--foreground)]/80 hover:text-[var(--foreground)] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}