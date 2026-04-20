'use client'

import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/sign-in')
    }
  }, [user, isLoading, router])

  if (isLoading || !user || user.role !== 'admin') {
    return null
  }

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    {
      label: 'Dashboard',
      href: '/admin',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
        </svg>
      ),
    },
    {
      label: 'Users',
      href: '/admin/users',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
        </svg>
      ),
    },
    {
      label: 'Jobs',
      href: '/admin/jobs',
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
        </svg>
      ),
    },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: 'rgba(247, 205, 180, 0.46)' }}>
      {/* SIDEBAR */}
      <aside className="fixed top-0 left-0 bottom-0 w-[200px] bg-[#1a1a1a] flex flex-col z-50">
        <div className="px-5 pt-[1.4rem] pb-[1.1rem] border-b border-white/[0.06]">
          <div className="font-extrabold text-[1.1rem] text-white" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
            Skill<span className="text-[#e85d2f]">Orbit</span>
          </div>
          <div className="text-[0.65rem] font-medium mt-[0.15rem] uppercase tracking-[0.1em]" style={{ color: 'rgba(255, 255, 255, 0.04)' }}>Admin Panel</div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-[0.2rem]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-[0.65rem] px-3.5 py-[0.65rem] rounded-lg text-[0.85rem] no-underline transition-all ${
                  isActive
                    ? 'bg-[#e85d2f] text-white font-semibold [&_svg]:opacity-100'
                    : 'text-white/40 hover:bg-white/[0.99] hover:text-white/75 [&_svg]:opacity-60 hover:[&_svg]:opacity-90'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-[0.85rem] border-t border-white/[0.06]">
          <div className="flex items-center gap-[0.6rem] px-3.5 py-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-[#e85d2f] flex items-center justify-center text-white text-[0.7rem] font-extrabold flex-shrink-0" style={{ fontFamily: "'Syne', sans-serif" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[0.8rem] font-medium text-white">{user.name}</div>
              <div className="text-[0.65rem] text-white font-light">Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-[0.65rem] w-full px-3.5 py-[0.6rem] rounded-lg bg-transparent border-none cursor-pointer text-[0.82rem] hover:bg-white/[0.05] transition-all"
            style={{ fontFamily: "'DM Sans', sans-serif", color: 'rgb(207, 35, 35)' }}
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-[15px] h-[15px] opacity-50 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-[200px] flex-1 flex flex-col min-h-screen">
        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
