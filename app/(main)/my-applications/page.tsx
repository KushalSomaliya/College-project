'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatDate } from '@/app/lib/utils'
import { useRouter } from 'next/navigation'

interface Application {
  _id: string
  jobId: any // Can be string or populated object
  studentId: string
  studentName: string
  studentEmail: string
  studentUniversity?: string
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
    if (user && user.userType === 'student') {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/applications?studentId=${user?.id}`)
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

  // Only students can view their applications
  if (!user || user.userType !== 'student') {
    router.push('/dashboard')
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-[var(--foreground)]/60">Loading...</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--foreground)]">My Applications</h1>
        <p className="text-[var(--foreground)]/60 mt-1">
          Track the status of your job applications
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-4">
          <p className="text-sm text-[var(--foreground)]/60 mb-1">Total Applications</p>
          <p className="text-2xl font-bold text-[var(--foreground)]">{applications.length}</p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-4">
          <p className="text-sm text-[var(--foreground)]/60 mb-1">Pending Review</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{pendingCount}</p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-4">
          <p className="text-sm text-[var(--foreground)]/60 mb-1">Accepted</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{acceptedCount}</p>
        </div>
        <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-4">
          <p className="text-sm text-[var(--foreground)]/60 mb-1">Rejected</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{rejectedCount}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[var(--foreground)]/10">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-2 px-1 transition-colors ${
              activeTab === tab.value
                ? 'border-b-2 border-[var(--foreground)] text-[var(--foreground)] font-medium'
                : 'text-[var(--foreground)]/60 hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {sortedApplications.length === 0 ? (
          <div className="text-center py-12 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg">
            <p className="text-[var(--foreground)]/60">
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
              <div key={application._id} className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6">
                {/* Application Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[var(--foreground)] mb-1">
                      {job.title}
                    </h3>
                    <p className="text-sm text-[var(--foreground)]/60">
                      {job.company} • {job.employerName}
                    </p>
                    <p className="text-sm text-[var(--foreground)]/60 mt-1">
                      Applied {formatDate(application.appliedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-3 py-1 text-sm rounded-full ${
                      application.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : application.status === 'accepted'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                    <p className="text-lg font-semibold text-[var(--foreground)] mt-2">
                      ${application.proposedRate}
                    </p>
                  </div>
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-[var(--foreground)]/60">Category</p>
                    <p className="text-[var(--foreground)]">{job.category}</p>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)]/60">Budget</p>
                    <p className="text-[var(--foreground)]">${job.budget}</p>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)]/60">Duration</p>
                    <p className="text-[var(--foreground)]">{job.duration}</p>
                  </div>
                  <div>
                    <p className="text-[var(--foreground)]/60">Experience</p>
                    <p className="text-[var(--foreground)] capitalize">{job.experienceLevel}</p>
                  </div>
                </div>

                {/* Application Details */}
                <div className="border-t border-[var(--foreground)]/10 pt-4 space-y-3">
                  {application.experience && (
                    <div>
                      <h4 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Your Experience</h4>
                      <p className="text-sm text-[var(--foreground)]">{application.experience}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Your Cover Letter</h4>
                    <p className="text-sm text-[var(--foreground)]">{application.coverLetter}</p>
                  </div>

                  {/* Status-specific messages */}
                  {application.status === 'accepted' && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                      <p className="text-sm text-green-800 dark:text-green-300">
                        Congratulations! Your application has been accepted. The employer will contact you with next steps.
                      </p>
                    </div>
                  )}
                  
                  {application.status === 'rejected' && (
                    <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                      <p className="text-sm text-red-800 dark:text-red-300">
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