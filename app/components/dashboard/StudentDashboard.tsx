import { useState, useEffect } from 'react'
import { User } from '@/app/contexts/AuthContext'
import { StatsCard } from './StatsCard'
import Link from 'next/link'

interface StudentDashboardProps {
  user: User
}

interface Job {
  _id: string
  title: string
  description: string
  company: string
  budget: number
  duration: string
  category: string
}

interface Application {
  _id: string
  jobId: any
  studentId: string
  studentName: string
  studentEmail: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: string
  proposedRate: number
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [recentJobs, setRecentGigs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Fetch student's applications first
      const appsResponse = await fetch(`/api/applications?studentId=${user.id}`)
      let fetchedApplications: Application[] = []
      
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        fetchedApplications = appsData.applications
        setApplications(fetchedApplications)
      }

      // Fetch recent active jobs
      const jobsResponse = await fetch('/api/jobs?status=active')
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        const allJobs = jobsData.jobs
        
        // Filter out jobs the student has already applied to
        const appliedJobIds = fetchedApplications.map(app => 
          typeof app.jobId === 'string' ? app.jobId : app.jobId?._id
        )
        const availableJobs = allJobs.filter((job: Job) => 
          !appliedJobIds.includes(job._id)
        ).slice(0, 3)
        
        setRecentGigs(availableJobs)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const activeApplications = applications.filter(app => app.status === 'pending').length
  const acceptedJobs = applications.filter(app => app.status === 'accepted').length
  const totalEarnings = applications
    .filter(app => app.status === 'accepted')
    .reduce((sum, app) => sum + app.proposedRate, 0)

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Welcome back, {user.name}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening with your freelance journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard
          title="Active Applications"
          value={activeApplications}
          description="Awaiting response"
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Completed Jobs"
          value={user.completedJobs || 0}
          trend={{ value: 15, isPositive: true }}
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          }
        />
        
        <StatsCard
          title="Total Earnings"
          value={`$${totalEarnings.toLocaleString()}`}
          trend={{ value: 8, isPositive: true }}
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatsCard
          title="Rating"
          value={user.rating || 'N/A'}
          description="Based on client reviews"
          icon={
            <svg className="w-6 h-6 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
        />
      </div>


      {/* Quick Apply Section */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">New Opportunities</h2>
        {recentJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentJobs.map((job) => (
              <div key={job._id} className="bg-[var(--background)] border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                <h3 className="font-medium text-[var(--foreground)] mb-2">{job.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{job.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[var(--foreground)]">${job.budget}</span>
                  <span className="text-sm text-gray-500">{job.duration}</span>
                </div>
                <Link 
                  href={`/jobs/${job._id}/apply`}
                  className="w-full block text-center py-2 px-4 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors"
                >
                  Quick Apply
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--background)] border border-gray-200 rounded-lg p-8 text-center">
            <p className="text-gray-500 mb-4">No new opportunities at the moment</p>
            <Link href="/jobs" className="text-primary hover:underline font-medium">
              Browse All Jobs
            </Link>
          </div>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">Your Recent Applications</h2>
        <div className="space-y-3">
          {applications
            .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
            .slice(0, 5)
            .map((application) => {
              // Handle populated jobId
              const job = typeof application.jobId === 'object' ? application.jobId : null
              if (!job) return null
              
              return (
                <div key={application._id} className="bg-[var(--background)] border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-[var(--foreground)]">{job.title}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {job.company} • Applied {new Date(application.appliedDate).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      application.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : application.status === 'accepted'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>
              )
            })
            .filter(Boolean)
          }
          {applications.length === 0 && (
            <div className="bg-[var(--background)] border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">You haven't applied to any jobs yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}