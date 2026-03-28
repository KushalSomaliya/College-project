'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatDate } from '@/app/lib/utils'
import Link from 'next/link'

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
  jobId: string
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

type TabType = 'all' | 'pending' | 'accepted' | 'rejected'

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const jobId = params.id as string

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [job, setJob] = useState<Job | null>(null)
  const [applicationsList, setApplicationsList] = useState<Application[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user && jobId) {
      fetchData()
    }
  }, [user, jobId])

  const fetchData = async () => {
    try {
      // Fetch job details
      const jobResponse = await fetch(`/api/jobs/${jobId}`)
      if (jobResponse.ok) {
        const jobData = await jobResponse.json()
        setJob(jobData.job)
      }

      // Fetch applications for this job
      const appsResponse = await fetch(`/api/applications?jobId=${jobId}`)
      if (appsResponse.ok) {
        const appsData = await appsResponse.json()
        setApplicationsList(appsData.applications)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[#bbb] font-light text-[0.95rem]">Loading...</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <p className="text-[#bbb] font-light mb-4">Job not found</p>
        <Link href="/my-jobs" className="text-[0.82rem] text-[#e85d2f] font-medium hover:underline">
          Back to My Jobs
        </Link>
      </div>
    )
  }

  // Only employers who own the job can view details
  if (user.userType !== 'employer' || job.employerId !== user.id) {
    router.push('/dashboard')
    return null
  }

  // Filter applications based on active tab
  const filteredApplications = activeTab === 'all'
    ? applicationsList
    : applicationsList.filter(app => app.status === activeTab)

  const pendingCount = applicationsList.filter(app => app.status === 'pending').length
  const acceptedCount = applicationsList.filter(app => app.status === 'accepted').length
  const rejectedCount = applicationsList.filter(app => app.status === 'rejected').length

  const handleStatusUpdate = async (applicationId: string, newStatus: 'accepted' | 'rejected') => {
    setProcessingId(applicationId)

    try {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh applications
        await fetchData()

        // Show success message
        const actionText = newStatus === 'accepted' ? 'accepted' : 'rejected'
        setSuccessMessage(`Application ${actionText} successfully`)

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Error updating application:', error)
    }

    setProcessingId(null)
  }

  const handleCloseJob = async () => {
    setIsClosing(true)

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'closed' }),
      })

      if (response.ok) {
        // Update local job state
        if (job) {
          setJob({ ...job, status: 'closed' })
        }
        setSuccessMessage('Job closed successfully')

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Error closing job:', error)
    }

    setIsClosing(false)
    setShowCloseConfirmation(false)
  }

  const tabs: { value: TabType; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: applicationsList.length },
    { value: 'pending', label: 'Pending', count: pendingCount },
    { value: 'accepted', label: 'Accepted', count: acceptedCount },
    { value: 'rejected', label: 'Rejected', count: rejectedCount },
  ]

  const syne: React.CSSProperties = { fontFamily: "'Syne', sans-serif" }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4">
          <p className="text-[#166534] text-[0.9rem] font-medium">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/my-jobs" className="text-[0.82rem] text-[#e85d2f] font-medium hover:underline mb-2 inline-block">
            &larr; Back to My Jobs
          </Link>
          <h1
            className="text-[1.65rem] font-extrabold text-[#111] tracking-tight"
            style={{ ...syne, letterSpacing: '-0.03em' }}
          >
            {job.title}
          </h1>
          <p className="text-[#aaa] text-[0.85rem] mt-1">Posted on {formatDate(job.postedDate)}</p>
        </div>
        {job.status === 'active' ? (
          <button
            onClick={() => setShowCloseConfirmation(true)}
            disabled={isClosing}
            className="px-5 py-2 border border-[#fee2e2] text-[#991b1b] rounded-full text-[0.82rem] font-medium hover:bg-[#fff5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClosing ? 'Closing...' : 'Close Job'}
          </button>
        ) : (
          <span className="px-4 py-1.5 text-[0.8rem] font-medium rounded-full bg-[#f3f0eb] text-[#888]">
            Closed
          </span>
        )}
      </div>

      {/* Job Details Card */}
      <div className="bg-white border border-[#ede9e3] rounded-2xl p-6">
        <h2
          className="text-[1.1rem] font-extrabold text-[#111] mb-5"
          style={{ ...syne, letterSpacing: '-0.02em' }}
        >
          Job Details
        </h2>

        <div className="space-y-5">
          <div>
            <h3 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1.5">Description</h3>
            <p className="text-[0.9rem] text-[#111] leading-relaxed">{job.description}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <h3 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1.5">Category</h3>
              <p className="text-[0.9rem] text-[#111]">{job.category}</p>
            </div>
            <div>
              <h3 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1.5">Budget</h3>
              <p className="text-[0.9rem] text-[#111] font-semibold">&#8377;{job.budget}</p>
            </div>
            <div>
              <h3 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1.5">Duration</h3>
              <p className="text-[0.9rem] text-[#111]">{job.duration}</p>
            </div>
            <div>
              <h3 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1.5">Experience Level</h3>
              <p className="text-[0.9rem] text-[#111] capitalize">{job.experienceLevel}</p>
            </div>
            <div>
              <h3 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1.5">Applications</h3>
              <p className="text-[0.9rem] text-[#111]">{applicationsList.length} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications Section */}
      <div>
        <h2
          className="text-[1.15rem] font-extrabold text-[#111] mb-4"
          style={{ ...syne, letterSpacing: '-0.02em' }}
        >
          Applications ({applicationsList.length})
        </h2>

        {job.status === 'closed' && (
          <div className="mb-4 px-4 py-3 bg-[#fef9c3] border border-[#fde68a] rounded-xl">
            <p className="text-[0.85rem] text-[#854d0e]">
              This job is closed. You can no longer accept or reject applications.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-5 mb-6 border-b border-[#ede9e3]">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`pb-2.5 px-1 text-[0.85rem] transition-colors ${
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
          {filteredApplications.length === 0 ? (
            <div className="text-center py-10 bg-white border border-[#ede9e3] rounded-2xl">
              <p className="text-[#bbb] font-light text-[0.9rem]">
                {activeTab === 'all'
                  ? 'No applications yet'
                  : `No ${activeTab} applications`}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application._id} className="bg-white border border-[#ede9e3] rounded-2xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3
                      className="text-[1rem] font-extrabold text-[#111]"
                      style={syne}
                    >
                      {application.employeeName}
                    </h3>
                    <p className="text-[0.82rem] text-[#aaa] mt-0.5">
                      {application.employeeEmail} &bull; {application.employeeUniversity}
                    </p>
                    <p className="text-[0.82rem] text-[#aaa] mt-0.5">
                      Applied {formatDate(application.appliedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className="text-[1.05rem] font-extrabold text-[#111]"
                      style={syne}
                    >
                      &#8377;{application.proposedRate}
                    </p>
                    <span className={`inline-block mt-1.5 px-3 py-1 text-[0.7rem] font-semibold rounded-full ${
                      application.status === 'pending'
                        ? 'bg-[#fef9c3] text-[#854d0e]'
                        : application.status === 'accepted'
                        ? 'bg-[#dcfce7] text-[#166534]'
                        : 'bg-[#fee2e2] text-[#991b1b]'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {application.experience && (
                    <div>
                      <h4 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1">Experience</h4>
                      <p className="text-[0.85rem] text-[#111] leading-relaxed">{application.experience}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-[0.75rem] font-semibold text-[#bbb] uppercase tracking-wider mb-1">Cover Letter</h4>
                    <p className="text-[0.85rem] text-[#111] leading-relaxed">{application.coverLetter}</p>
                  </div>
                </div>

                {application.status === 'pending' && job.status === 'active' && (
                  <div className="flex gap-2.5 mt-5 pt-4 border-t border-[#ede9e3]">
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'accepted')}
                      disabled={processingId === application._id}
                      className="px-5 py-2 bg-[#166534] text-white rounded-full text-[0.82rem] font-medium hover:bg-[#14532d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === application._id ? 'Processing...' : 'Accept Application'}
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(application._id, 'rejected')}
                      disabled={processingId === application._id}
                      className="px-5 py-2 border border-[#fee2e2] text-[#991b1b] rounded-full text-[0.82rem] font-medium hover:bg-[#fff5f5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === application._id ? 'Processing...' : 'Reject Application'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Close Confirmation Dialog */}
      {showCloseConfirmation && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-[#ede9e3] rounded-3xl p-7 max-w-md w-full shadow-xl">
            <h3
              className="text-[1.1rem] font-extrabold text-[#111] mb-3"
              style={{ ...syne, letterSpacing: '-0.02em' }}
            >
              Close Job
            </h3>
            <p className="text-[0.88rem] text-[#aaa] leading-relaxed mb-6">
              Are you sure you want to close this job? This action cannot be undone and the job will no longer accept applications.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseConfirmation(false)}
                className="px-5 py-2.5 border border-[#ede9e3] text-[#111] rounded-full text-[0.85rem] font-medium hover:bg-[#f7f5f0] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseJob}
                disabled={isClosing}
                className="px-5 py-2.5 bg-[#991b1b] text-white rounded-full text-[0.85rem] font-medium hover:bg-[#7f1d1d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosing ? 'Closing...' : 'Yes, Close Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
