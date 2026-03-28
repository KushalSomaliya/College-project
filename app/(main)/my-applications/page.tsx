'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatDate } from '@/app/lib/utils'
import { useRouter } from 'next/navigation'

interface Application {
  _id: string
  jobId: any // Can be string or populated object
  employeeId: string
  employeeName: string
  employeeEmail: string
  employeeUniversity?: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: string
  coverLetter: string
  proposedRate: number
  experience?: string
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
  category: string
  experienceLevel: string
}

type TabType = 'all' | 'pending' | 'accepted' | 'rejected'

export default function MyApplicationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && user.userType === 'employee') {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications?employeeId=${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications)
      }
    } catch (error) {
      console.error('Error fetching applications:', error)
    } finally {
      setLoading(false)
    }
  }

  // Only employees can view their applications
  if (!user || user.userType !== 'employee') {
    router.push('/dashboard')
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#bbb] font-light" style={{ fontFamily: "'DM Sans', sans-serif" }}>Loading...</p>
      </div>
    )
  }

  // Filter applications based on active tab
  const filteredApplications = activeTab === 'all'
    ? applications
    : applications.filter(app => app.status === activeTab)

  const pendingCount = applications.filter(app => app.status === 'pending').length
  const acceptedCount = applications.filter(app => app.status === 'accepted').length
  const rejectedCount = applications.filter(app => app.status === 'rejected').length

  const tabs: { value: TabType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: applications.length },
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'accepted', label: 'Accepted', count: acceptedCount },
    { value: 'rejected', label: 'Rejected', count: rejectedCount },
  ]

  // Sort applications by date (newest first)
  const sortedApplications = filteredApplications.sort((a, b) =>
    new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime()
  )

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div>
        <h1
          className="text-[1.75rem] font-extrabold text-[#111]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          My Applications
        </h1>
        <p className="text-[#aaa] font-light mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-4">
          <p className="text-[0.75rem] text-[#aaa] uppercase tracking-wide mb-1">Total Applications</p>
          <p
            className="text-[1.75rem] font-extrabold text-[#111]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {applications.length}
          </p>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-4">
          <p className="text-[0.75rem] text-[#aaa] uppercase tracking-wide mb-1">Pending Review</p>
          <p
            className="text-[1.75rem] font-extrabold text-[#854d0e]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {pendingCount}
          </p>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-4">
          <p className="text-[0.75rem] text-[#aaa] uppercase tracking-wide mb-1">Accepted</p>
          <p
            className="text-[1.75rem] font-extrabold text-[#166534]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {acceptedCount}
          </p>
        </div>
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-4">
          <p className="text-[0.75rem] text-[#aaa] uppercase tracking-wide mb-1">Rejected</p>
          <p
            className="text-[1.75rem] font-extrabold text-[#991b1b]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {rejectedCount}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#ede9e3]">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 px-1 transition-colors ${
              activeTab === tab.value
                ? 'border-b-2 border-[#e85d2f] text-[#e85d2f] font-medium'
                : 'text-[#aaa] hover:text-[#111]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {sortedApplications.length === 0 ? (
          <div className="text-center py-12 bg-white border border-[#ede9e3] rounded-2xl">
            <p className="text-[#bbb] font-light">
              {activeTab === 'all'
                ? "You haven't applied to any jobs yet"
                : `No ${activeTab} applications`}
            </p>
          </div>
        ) : (
          sortedApplications.map((application) => {
            // Handle populated jobId
            const job = typeof application.jobId === 'object' ? application.jobId : null
            if (!job) return null

            return (
              <div key={application._id} className="bg-white border border-[#ede9e3] rounded-2xl p-6">
                {/* Application Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3
                      className="text-lg font-semibold text-[#111] mb-1"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {job.title}
                    </h3>
                    <p className="text-sm text-[#bbb] font-light">
                      {job.company} &bull; {job.employerName}
                    </p>
                    <p className="text-sm text-[#bbb] font-light mt-1">
                      Applied {formatDate(application.appliedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${
                      application.status === 'pending'
                        ? 'bg-[#fef9c3] text-[#854d0e]'
                        : application.status === 'accepted'
                        ? 'bg-[#dcfce7] text-[#166534]'
                        : 'bg-[#fee2e2] text-[#991b1b]'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <p
                      className="text-lg font-bold text-[#111] mt-2"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      &#8377;{application.proposedRate}
                    </p>
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-[0.75rem] text-[#bbb] uppercase tracking-wide">Category</p>
                    <p className="text-[#111]">{job.category}</p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-[#bbb] uppercase tracking-wide">Budget</p>
                    <p className="text-[#111]">&#8377;{job.budget}</p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-[#bbb] uppercase tracking-wide">Duration</p>
                    <p className="text-[#111]">{job.duration}</p>
                  </div>
                  <div>
                    <p className="text-[0.75rem] text-[#bbb] uppercase tracking-wide">Experience</p>
                    <p className="text-[#111] capitalize">{job.experienceLevel}</p>
                  </div>
                </div>

                {/* Application Details */}
                <div className="border-t border-[#f3f1ed] pt-4 space-y-3">
                  {application.experience && (
                    <div>
                      <h4 className="text-sm font-medium text-[#aaa] mb-1">Your Experience</h4>
                      <p className="text-sm text-[#111]">{application.experience}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-[#aaa] mb-1">Your Cover Letter</h4>
                    <p className="text-sm text-[#111]">{application.coverLetter}</p>
                  </div>

                  {/* Status-specific messages */}
                  {application.status === 'accepted' && (
                    <div className="mt-4 p-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl">
                      <p className="text-sm text-[#166534]">
                        Congratulations! Your application has been accepted. The employer will contact you with next steps.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-[#fff5f5] border border-[#fecaca] rounded-xl">
                      <p className="text-sm text-[#991b1b]">
                        Unfortunately, your application was not selected for this job. Keep applying to other opportunities!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
