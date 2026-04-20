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
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in')
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <div className="min-h-screen" style={{ background: '#f7f5f0' }}>
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-black/[0.07]" style={{ background: 'rgba(247, 205, 180, 0.46)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-[1100px] mx-auto px-8 h-16 flex justify-between items-center">

          {/* Left: Logo + Links */}
          <div className="flex items-center gap-10">
            <Link href="/dashboard" className="font-extrabold text-xl text-[#111] no-underline" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
              Skill<span className="text-[#e85d2f]">Orbit</span>
            </Link>
            <div className="hidden md:flex gap-7">
              {user.userType === 'employee' ? (
                <>
                  <Link href="/jobs" className="text-sm text-[#666] no-underline hover:text-[#111] transition-colors">Browse Jobs</Link>
                  <Link href="/my-applications" className="text-sm text-[#666] no-underline hover:text-[#111] transition-colors">My Applications</Link>
                </>
              ) : (
                <>
                  <Link href="/post-job" className="text-sm text-[#666] no-underline hover:text-[#111] transition-colors">Post Job</Link>
                  <Link href="/my-jobs" className="text-sm text-[#666] no-underline hover:text-[#111] transition-colors">My Jobs</Link>
                </>
              )}
            </div>
          </div>

          {/* Right: User + Logout */}
          <div className="flex items-center gap-5">
            <Link href="/profile" className="flex items-center gap-2.5 no-underline px-3 py-1.5 rounded-full border border-[#ede9e3] bg-white hover:shadow-md transition-shadow">
              <div className="w-[30px] h-[30px] rounded-full bg-[#e85d2f] flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0" style={{ fontFamily: "'Syne', sans-serif" }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <span className="text-[0.82rem] font-medium text-[#111] block">{user.name}</span>
                <span className="text-[0.7rem] text-[#aaa] font-light block">{user.userType === 'employee' ? 'Employee' : 'Employer'}</span>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="text-[0.82rem] text-[#bbb] bg-transparent border-none cursor-pointer hover:text-[#e85d2f] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-[1100px] mx-auto px-8 py-10">
        {children}
      </main>
    </div>
  )
}
