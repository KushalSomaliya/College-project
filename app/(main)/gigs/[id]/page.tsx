'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import { formatDate } from '@/app/lib/utils'
import Link from 'next/link'

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
  gigId: string
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

type TabType = 'all' | 'pending' | 'accepted' | 'rejected'

export default function GigDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const gigId = params.id as string
  
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [gig, setGig] = useState<Gig | null>(null)
  const [applicationsList, setApplicationsList] = useState<Application[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (user && gigId) {
      fetchData()
    }
  }, [user, gigId])

  const fetchData = async () => {
    try {
      // Fetch gig details
      const gigResponse = await fetch(`/api/gigs/${gigId}`)
      if (gigResponse.ok) {
        const gigData = await gigResponse.json()
        setGig(gigData.gig)
      }

      // Fetch applications for this gig
      const appsResponse = await fetch(`/api/applications?gigId=${gigId}`)
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
        <p className="text-[var(--foreground)]/60">Loading...</p>
      </div>
    )
  }
  
  if (!gig) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--foreground)]/60 mb-4">Gig not found</p>
        <Link href="/my-gigs" className="text-[var(--foreground)] hover:underline">
          Back to My Gigs
        </Link>
      </div>
    )
  }
  
  // Only employers who own the gig can view details
  if (user.userType !== 'employer' || gig.employerId !== user.id) {
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

  const handleCloseGig = async () => {
    setIsClosing(true)
    
    try {
      const response = await fetch(`/api/gigs/${gigId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'closed' }),
      })
      
      if (response.ok) {
        // Update local gig state
        if (gig) {
          setGig({ ...gig, status: 'closed' })
        }
        setSuccessMessage('Gig closed successfully')
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage(null)
        }, 3000)
      }
    } catch (error) {
      console.error('Error closing gig:', error)
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

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-4">
          <p className="text-green-800 dark:text-green-300">{successMessage}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/my-gigs" className="text-sm text-[var(--foreground)]/60 hover:text-[var(--foreground)] mb-2 inline-block">
            ← Back to My Gigs
          </Link>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">{gig.title}</h1>
          <p className="text-[var(--foreground)]/60 mt-1">Posted on {formatDate(gig.postedDate)}</p>
        </div>
        {gig.status === 'active' ? (
          <button
            onClick={() => setShowCloseConfirmation(true)}
            disabled={isClosing}
            className="px-4 py-2 border border-red-500/50 text-red-600 dark:text-red-400 rounded-md text-sm font-medium hover:bg-red-500/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClosing ? 'Closing...' : 'Close Gig'}
          </button>
        ) : (
          <span className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-300">
            Closed
          </span>
        )}
      </div>

      {/* Gig Details */}
      <div className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Gig Details</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Description</h3>
            <p className="text-[var(--foreground)]">{gig.description}</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Category</h3>
              <p className="text-[var(--foreground)]">{gig.category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Budget</h3>
              <p className="text-[var(--foreground)] font-semibold">${gig.budget}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Duration</h3>
              <p className="text-[var(--foreground)]">{gig.duration}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Experience Level</h3>
              <p className="text-[var(--foreground)] capitalize">{gig.experienceLevel}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Applications</h3>
              <p className="text-[var(--foreground)]">{applicationsList.length} total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Applications */}
      <div>
        <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
          Applications ({applicationsList.length})
        </h2>

        {gig.status === 'closed' && (
          <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
            <p className="text-sm text-yellow-800 dark:text-yellow-300">
              This gig is closed. You can no longer accept or reject applications.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-[var(--foreground)]/10">
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
          {filteredApplications.length === 0 ? (
            <div className="text-center py-8 bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg">
              <p className="text-[var(--foreground)]/60">
                {activeTab === 'all' 
                  ? 'No applications yet' 
                  : `No ${activeTab} applications`}
              </p>
            </div>
          ) : (
            filteredApplications.map((application) => (
              <div key={application._id} className="bg-[var(--background)] border border-[var(--foreground)]/10 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--foreground)]">
                      {application.studentName}
                    </h3>
                    <p className="text-sm text-[var(--foreground)]/60">
                      {application.studentEmail} • {application.studentUniversity}
                    </p>
                    <p className="text-sm text-[var(--foreground)]/60 mt-1">
                      Applied {formatDate(application.appliedDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-[var(--foreground)]">
                      ${application.proposedRate}
                    </p>
                    <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${
                      application.status === 'pending'
                        ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                        : application.status === 'accepted'
                        ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                    }`}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {application.experience && (
                    <div>
                      <h4 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Experience</h4>
                      <p className="text-sm text-[var(--foreground)]">{application.experience}</p>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium text-[var(--foreground)]/60 mb-1">Cover Letter</h4>
                    <p className="text-sm text-[var(--foreground)]">{application.coverLetter}</p>
                  </div>
                </div>

                {application.status === 'pending' && gig.status === 'active' && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--foreground)]/10">
                    <button 
                      onClick={() => handleStatusUpdate(application._id, 'accepted')}
                      disabled={processingId === application._id}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === application._id ? 'Processing...' : 'Accept Application'}
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(application._id, 'rejected')}
                      disabled={processingId === application._id}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--background)] border border-[var(--foreground)]/20 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-[var(--foreground)] mb-3">
              Close Gig
            </h3>
            <p className="text-[var(--foreground)]/80 mb-6">
              Are you sure you want to close this gig? This action cannot be undone and the gig will no longer accept applications.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCloseConfirmation(false)}
                className="px-4 py-2 border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-md font-medium hover:bg-[var(--foreground)]/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseGig}
                disabled={isClosing}
                className="px-4 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isClosing ? 'Closing...' : 'Yes, Close Gig'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}