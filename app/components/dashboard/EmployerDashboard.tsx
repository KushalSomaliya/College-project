import { useState, useEffect } from 'react'
import { User } from '@/app/contexts/AuthContext'
import { formatDate } from '@/app/lib/utils'
import Link from 'next/link'

interface EmployerDashboardProps {
  user: User
}

interface Job {
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
  jobId: any
  employeeId: string
  employeeName: string
  employeeEmail: string
  employeeUniversity?: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: string
  proposedRate: number
}

export function EmployerDashboard({ user }: EmployerDashboardProps) {
  const [myJobs, setMyJobs] = useState<Job[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const jobsResponse = await fetch(`/api/jobs?employerId=${user.id}`)
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        setMyJobs(jobsData.jobs)
      }
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

  const activeJobsList = myJobs.filter(job => job.status === 'active')
  const activeJobsCount = activeJobsList.length
  const totalApplications = myJobs.reduce((sum, job) => sum + job.applicationsCount, 0)
  const totalSpent = myJobs.filter(job => job.status === 'completed').reduce((sum, job) => sum + job.budget, 0)

  const myActiveJobIds = activeJobsList.map(job => job._id)
  const recentApplications = applications
    .filter(app => {
      const jobId = typeof app.jobId === 'string' ? app.jobId : app.jobId?._id
      return app.status === 'pending' && myActiveJobIds.includes(jobId)
    })
    .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#bbb] text-sm font-light">
        Loading your dashboard...
      </div>
    )
  }

  return (
    <div>
      {/* Welcome */}
      <div className="flex justify-between items-start mb-8 gap-4 flex-wrap">
        <div>
          <h1 className="text-[1.75rem] font-extrabold text-[#111] mb-1" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
            Hey, <span className="text-[#e85d2f]">{user.name}</span> &#128075;
          </h1>
          <p className="text-sm text-[#999] font-light">Manage your jobs and find talented employees</p>
        </div>
        <Link
          href="/post-job"
          className="bg-[#e85d2f] text-white px-6 py-3 rounded-full font-bold text-sm no-underline whitespace-nowrap hover:-translate-y-0.5 transition-transform"
          style={{ fontFamily: "'Syne', sans-serif", boxShadow: '0 4px 16px rgba(232,93,47,0.3)' }}
        >
          + Post New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#494949] uppercase tracking-wider mb-2">Active Jobs</div>
          <div className="text-[1.75rem] font-extrabold text-[#e85d2f] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>{activeJobsCount}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">Currently hiring</div>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#494949] uppercase tracking-wider mb-2">Total Applications</div>
          <div className="text-[1.75rem] font-extrabold text-[#111] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>{totalApplications}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">Across all jobs</div>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#494949] uppercase tracking-wider mb-2">Employees Hired</div>
          <div className="text-[1.75rem] font-extrabold text-[#111] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>{user.totalHired || 0}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">All time</div>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all">
          <div className="text-[0.75rem] font-semibold text-[#494949] uppercase tracking-wider mb-2">Total Spent</div>
          <div className="text-[1.75rem] font-extrabold text-[#111] leading-none" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>&#8377;{totalSpent.toLocaleString()}</div>
          <div className="text-xs text-[#bbb] font-light mt-1">Completed jobs</div>
        </div>
      </div>

      {/* Active Jobs */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[1.1rem] font-extrabold text-[#111]" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>Your Active Jobs</h2>
      </div>

      {activeJobsList.length > 0 ? (
        <div className="bg-white border border-[#ede9e3] rounded-2xl overflow-hidden mb-8">
          {activeJobsList.map((job, i) => (
            <div key={job._id} className={`px-6 py-5 ${i < activeJobsList.length - 1 ? 'border-b border-[#f3f1ed]' : ''}`}>
              <div className="flex justify-between items-start gap-4 mb-1.5">
                <div className="text-[0.95rem] font-bold text-[#111]" style={{ fontFamily: "'Syne', sans-serif" }}>{job.title}</div>
                <span className="text-[0.72rem] font-semibold bg-[#dcfce7] text-[#166534] px-2.5 py-0.5 rounded-full whitespace-nowrap">Active</span>
              </div>
              <p className="text-[0.82rem] text-[#aaa] font-light leading-relaxed mb-3">{job.description}</p>
              <div className="flex justify-between items-center">
                <div className="flex gap-6">
                  <span className="text-[0.82rem] text-[#585858] font-light"><b className="text-[#111] font-semibold">{job.applicationsCount}</b> applications</span>
                  <span className="text-[0.82rem] text-[#585858] font-light">Pay: <b className="text-[#111] font-semibold">&#8377;{job.budget}</b></span>
                </div>
                <Link href={`/jobs/${job._id}`} className="text-[0.82rem] text-[#e85d2f] no-underline font-medium hover:underline">View Details &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-12 text-center text-[#bbb] text-sm font-light mb-8">
          No active jobs yet. Post one to get started!
        </div>
      )}

      {/* Applications to Review */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-[1.1rem] font-extrabold text-[#111]" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.02em' }}>Applications to Review</h2>
      </div>

      <div className="bg-white border border-[#ede9e3] rounded-2xl overflow-hidden mb-8">
        {recentApplications.length > 0 ? (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#f3f1ed]">
                <th className="px-5 py-3.5 text-left text-[0.72rem] font-semibold text-[#de9000] uppercase tracking-wider">Employee</th>
                <th className="px-5 py-3.5 text-left text-[0.72rem] font-semibold text-[#de9000] uppercase tracking-wider">Job</th>
                <th className="px-5 py-3.5 text-left text-[0.72rem] font-semibold text-[#de9000] uppercase tracking-wider">Pay</th>
                <th className="px-5 py-3.5 text-left text-[0.72rem] font-semibold text-[#de9000] uppercase tracking-wider">Applied</th>
                <th className="px-5 py-3.5 text-left text-[0.72rem] font-semibold text-[#de9000] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentApplications.map((app) => {
                const jobId = typeof app.jobId === 'string' ? app.jobId : app.jobId?._id
                const job = typeof app.jobId === 'object' ? app.jobId : myJobs.find(g => g._id === jobId)
                return (
                  <tr key={app._id} className="border-b border-[#f3f1ed] last:border-b-0 hover:bg-[#fafaf9] transition-colors">
                    <td className="px-5 py-4"><div className="text-sm font-bold text-[#111]" style={{ fontFamily: "'Syne', sans-serif" }}>{app.employeeName}</div></td>
                    <td className="px-5 py-4"><div className="text-sm text-[#666] font-light">{job?.title}</div></td>
                    <td className="px-5 py-4"><div className="text-sm font-bold text-[#111]" style={{ fontFamily: "'Syne', sans-serif" }}>&#8377;{app.proposedRate}</div></td>
                    <td className="px-5 py-4"><div className="text-[0.82rem] text-[#bbb] font-light">{formatDate(app.appliedDate)}</div></td>
                    <td className="px-5 py-4"><Link href={`/jobs/${jobId}`} className="text-[0.82rem] text-[#e85d2f] no-underline font-medium hover:underline">Review &rarr;</Link></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center text-[#bbb] text-sm font-light">
            No pending applications to review.
          </div>
        )}
      </div>
    </div>
  )
}
