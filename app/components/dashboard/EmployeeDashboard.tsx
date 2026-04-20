import { useState, useEffect } from 'react'
import { User } from '@/app/contexts/AuthContext'
import Link from 'next/link'

interface EmployeeDashboardProps {
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
  employeeId: string
  employeeName: string
  employeeEmail: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: string
  proposedRate: number
}

export function EmployeeDashboard({ user }: EmployeeDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([])
  const [recentJobs, setRecentGigs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const appsResponse = await fetch(`/api/applications?employeeId=${user.id}`)
      let fetchedApplications: Application[] = []
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        fetchedApplications = appsData.applications
        setApplications(fetchedApplications)
      }
      const jobsResponse = await fetch('/api/jobs?status=active')
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        const allJobs = jobsData.jobs
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

  const activeApplications = applications.filter(app => app.status === 'pending').length
  const totalEarnings = applications
    .filter(app => app.status === 'accepted')
    .reduce((sum, app) => sum + app.proposedRate, 0)

  const recentApplications = applications
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5)

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#fef9c3] text-[#854d0e]'
      case 'accepted': return 'bg-[#dcfce7] text-[#166534]'
      case 'rejected': return 'bg-[#fee2e2] text-[#991b1b]'
      default: return 'bg-[#f3f4f6] text-[#374151]'
    }
  }

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-[1.75rem] font-extrabold text-[#111] mb-1" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
          Hey, <span className="text-[#e85d2f]">{user.name}</span> &#128075;
        </h1>
        <p className="text-sm text-[#999] font-light">Here&apos;s what&apos;s happening with your freelance journey</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#757575] uppercase tracking-wider mb-2">Active Applications</div>
          <div className="text-[1.75rem] font-extrabold text-[#e85d2f] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>{activeApplications}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">Awaiting response</div>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#757575] uppercase tracking-wider mb-2">Completed Jobs</div>
          <div className="text-[1.75rem] font-extrabold text-[#111] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>{user.completedJobs || 0}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">All time</div>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#757575] uppercase tracking-wider mb-2">Total Earnings</div>
          <div className="text-[1.75rem] font-extrabold text-[#111] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>&#8377;{totalEarnings.toLocaleString()}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">From accepted jobs</div>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#757575] uppercase tracking-wider mb-2">Rating</div>
          <div className="text-[1.75rem] font-extrabold text-[#111] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>{user.rating || '\u2014'}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">Client reviews</div>
        </div>
      </div>

      {/* New Opportunities */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[1.1rem] font-extrabold text-[#111]" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>New Opportunities</h2>
        <Link href="/jobs" className="text-[0.82rem] text-[#e85d2f] no-underline font-medium hover:underline">Browse all &rarr;</Link>
      </div>

      {recentJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {recentJobs.map((job) => (
            <div key={job._id} className="bg-white border border-[#ede9e3] rounded-2xl p-5 flex flex-col gap-2.5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
              <div className="text-[0.95rem] font-bold text-[#111]" style={{ fontFamily: "'Syne', sans-serif" }}>{job.title}</div>
              <div className="text-[0.82rem] text-[#aaa] font-light leading-relaxed line-clamp-2 flex-1">{job.description}</div>
              <div className="flex justify-between items-center text-[0.82rem]">
                <span className="font-bold text-[#111]" style={{ fontFamily: "'Syne', sans-serif" }}>&#8377;{job.budget}</span>
                <span className="text-[#bbb] font-light">{job.duration}</span>
              </div>
              <Link
                href={`/jobs/${job._id}/apply`}
                className="block text-center bg-[#111] text-white py-2.5 rounded-full text-[0.82rem] font-medium no-underline hover:bg-[#333] transition-colors"
              >
                Quick Apply
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-12 text-center text-[#bbb] text-sm font-light mb-8">
          No new opportunities at the moment.{' '}
          <Link href="/jobs" className="text-[#e85d2f] no-underline font-medium">Browse all jobs</Link>
        </div>
      )}

      {/* Recent Applications */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[1.1rem] font-extrabold text-[#111]" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>Recent Applications</h2>
      </div>

      {applications.length > 0 ? (
        <div className="flex flex-col gap-3 mb-8">
          {recentApplications.map((application) => {
            const job = typeof application.jobId === 'object' ? application.jobId : null
            if (!job) return null
            return (
              <div key={application._id} className="bg-white border border-[#ede9e3] rounded-[14px] px-5 py-4 flex justify-between items-center gap-4">
                <div>
                  <div className="text-[0.9rem] font-bold text-[#111] mb-0.5" style={{ fontFamily: "'Syne', sans-serif" }}>{job.title}</div>
                  <div className="text-xs text-[#727272] font-light">{job.company} &middot; Applied {new Date(application.appliedDate).toLocaleDateString('en-GB')}</div>
                </div>
                <span className={`text-[0.72rem] font-semibold px-3 py-1 rounded-full whitespace-nowrap ${getBadgeClass(application.status)}`}>
                  {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </span>
              </div>
            )
          }).filter(Boolean)}
        </div>
      ) : (
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-12 text-center text-[#bbb] text-sm font-light mb-8">
          You haven&apos;t applied to any jobs yet.
        </div>
      )}
    </div>
  )
}
