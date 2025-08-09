import { useState, useEffect } from 'react'
import { User } from '@/app/contexts/AuthContext'
import { StatsCard } from './StatsCard'
import { formatDate } from '@/app/lib/utils'
import Link from 'next/link'

interface EmployerDashboardProps {
  user: User
}

interface Gig {
  _id: string
  title: string
  description: string
  company: string
  employerId: string
  employerName: string
  budget: number
  duration: string
  applicationsCount: number
  postedDate: string
  status: 'active' | 'closed' | 'completed'
  category: string
  experienceLevel: string
}

interface Application {
  _id: string
  gigId: any
  studentId: string
  studentName: string
  studentEmail: string
  studentUniversity?: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: string
  proposedRate: number
}

export function EmployerDashboard({ user }: EmployerDashboardProps) {
  const [myGigs, setMyGigs] = useState<Gig[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch employer's gigs
      const gigsResponse = await fetch(`/api/gigs?employerId=${user.id}`)
      if (gigsResponse.ok) {
        const gigsData = await gigsResponse.json()
        setMyGigs(gigsData.gigs)
      }

      // Fetch all applications
      const appsResponse = await fetch('/api/applications')
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplications(appsData.applications)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate employer stats
  const activeGigs = myGigs.filter(gig => gig.status === 'active').length
  const totalApplications = myGigs.reduce((sum, gig) => sum + gig.applicationsCount, 0)
  const totalSpent = myGigs.filter(gig => gig.status === 'completed').reduce((sum, gig) => sum + gig.budget, 0)

  // Get recent applications for review (only for this employer's active gigs)
  const myActiveGigIds = myGigs
    .filter(gig => gig.status === 'active')
    .map(gig => gig._id)
  const recentApplications = applications
    .filter(app => {
      const gigId = typeof app.gigId === 'string' ? app.gigId : app.gigId?._id
      return app.status === 'pending' && myActiveGigIds.includes(gigId)
    })
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--foreground)]/60">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">
            Welcome back, {user.name}!
          </h1>
          <p className="text-[var(--foreground)]/60 mt-1">
            Manage your gigs and find talented students
          </p>
        </div>
        <Link
          href="/post-gig"
          className="px-4 py-2 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 transition-opacity"
        >
          Post New Gig
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Active Gigs"
          value={activeGigs}
          description="Currently hiring"
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Total Applications"
          value={totalApplications}
          description="Across all gigs"
          trend={{ value: 25, isPositive: true }}
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Students Hired"
          value={user.totalHired || 0}
          trend={{ value: 10, isPositive: true }}
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Total Spent"
          value={`$${totalSpent.toLocaleString()}`}
          description="On completed gigs"
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          }
        />
      </div>

      {/* Active Gigs */}
      <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4">Your Active Gigs</h3>
        <div className="space-y-4">
          {myGigs.filter(gig => gig.status === 'active').map((gig) => (
            <div key={gig._id} className="border-b border-[var(--foreground)]/10 pb-4 last:border-0">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-[var(--foreground)]">{gig.title}</h4>
                <span className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded-full">
                  Active
                </span>
              </div>
              <p className="text-sm text-[var(--foreground)]/60 mb-3">{gig.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="text-[var(--foreground)]/60">
                    <strong className="text-[var(--foreground)]">{gig.applicationsCount}</strong> applications
                  </span>
                  <span className="text-[var(--foreground)]/60">
                    Budget: <strong className="text-[var(--foreground)]">${gig.budget}</strong>
                  </span>
                </div>
                <Link href={`/gigs/${gig._id}`} className="text-[var(--foreground)] hover:underline">
                  View Details →
                </Link>
              </div>
            </div>
          ))}
          {myGigs.filter(gig => gig.status === 'active').length === 0 && (
            <p className="text-[var(--foreground)]/60 text-sm">No active gigs. Post a new gig to get started!</p>
          )}
        </div>
      </div>

      {/* Recent Applications */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Recent Applications to Review</h2>
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--foreground)]/10">
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)]/60 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)]/60 uppercase tracking-wider">
                  Gig
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)]/60 uppercase tracking-wider">
                  Proposed Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)]/60 uppercase tracking-wider">
                  Applied
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[var(--foreground)]/60 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--foreground)]/10">
              {recentApplications.map((app) => {
                const gigId = typeof app.gigId === 'string' ? app.gigId : app.gigId?._id
                const gig = typeof app.gigId === 'object' ? app.gigId : myGigs.find(g => g._id === gigId)
                return (
                  <tr key={app._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-[var(--foreground)]">{app.studentName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--foreground)]/80">{gig?.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--foreground)]">${app.proposedRate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-[var(--foreground)]/60">
                        {formatDate(app.appliedDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link 
                        href={`/gigs/${gigId}`} 
                        className="text-sm text-[var(--foreground)] hover:underline"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {recentApplications.length === 0 && (
            <div className="px-6 py-8 text-center text-[var(--foreground)]/60">
              No pending applications to review
            </div>
          )}
        </div>
      </div>
    </div>
  )
}