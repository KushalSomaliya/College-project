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

  const getPageTitle = () => {
    if (pathname === '/admin' || pathname === '/admin/') return 'Dashboard'
    if (pathname.includes('/admin/users')) return 'User Management'
    if (pathname.includes('/admin/jobs')) return 'Job Management'
    return 'Admin'
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: '\u229E' },
    { label: 'Users', href: '/admin/users', icon: '\uD83D\uDC65' },
    { label: 'Jobs', href: '/admin/jobs', icon: '\uD83D\uDCBC' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#f7f5f0' }}>
      {/* SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 w-60 bg-[#111] flex flex-col z-50">
        <div className="px-6 pt-6 pb-5 border-b border-white/[0.07]">
          <div className="font-extrabold text-[1.15rem] text-white" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
            Skill<span className="text-[#e85d2f]">Orbit</span>
          </div>
          <div className="text-[0.72rem] text-white/30 font-normal mt-0.5 uppercase tracking-widest">Admin Panel</div>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm no-underline transition-all ${
                  isActive
                    ? 'bg-[#e85d2f] text-white font-semibold'
                    : 'text-white/45 hover:bg-white/[0.07] hover:text-white/80'
                }`}
              >
                <span className={`text-base ${isActive ? 'opacity-100' : 'opacity-50'}`}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 mb-1.5">
            <div className="w-[30px] h-[30px] rounded-full bg-[#e85d2f] flex items-center justify-center text-white text-xs font-extrabold flex-shrink-0" style={{ fontFamily: "'Syne', sans-serif" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-[0.82rem] font-medium text-white/80">{user.name}</div>
              <div className="text-[0.68rem] text-white/30 font-light">Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl bg-transparent border-none cursor-pointer text-sm text-white/35 hover:bg-white/[0.06] hover:text-white/70 transition-all text-left"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            <span>&#8617;</span> Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="ml-60 flex-1 flex flex-col">
        <header className="sticky top-0 z-40 border-b border-black/[0.07] px-8 py-4 flex justify-between items-center" style={{ background: 'rgba(247,245,240,0.9)', backdropFilter: 'blur(12px)' }}>
          <div className="font-extrabold text-[1.05rem] text-[#111]" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>
            {getPageTitle()}
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[0.82rem] text-[#888] font-light">{user.name}</span>
            <div className="w-[30px] h-[30px] rounded-full bg-[#e85d2f] flex items-center justify-center text-white text-xs font-extrabold" style={{ fontFamily: "'Syne', sans-serif" }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  )
}
