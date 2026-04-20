'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

interface JobItem {
  _id: string
  title: string
  description: string
  requirements: string
  company: string
  employerId: string
  employerName: string
  budget: number
  budgetType: string
  duration: string
  skills: string[]
  applicationsCount: number
  status: 'active' | 'closed' | 'completed' | 'draft'
  category: string
  experienceLevel: string
  locationType: string
  createdAt: string
}

export default function AdminJobsPage() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState<JobItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [editingJob, setEditingJob] = useState<JobItem | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchJobs = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterStatus !== 'all') params.set('status', filterStatus)

      const response = await fetch(`/api/admin/jobs?${params.toString()}`, {
        headers: { 'x-admin-id': user?.id || '' },
      })
      if (response.ok) {
        const data = await response.json()
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error)
    } finally {
      setLoading(false)
    }
  }, [search, filterStatus, user?.email])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSaveJob = async () => {
    if (!editingJob) return
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/jobs/${editingJob._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': user?.id || '',
        },
        body: JSON.stringify({
          title: editingJob.title,
          description: editingJob.description,
          budget: editingJob.budget,
          status: editingJob.status,
          category: editingJob.category,
          experienceLevel: editingJob.experienceLevel,
          locationType: editingJob.locationType,
          duration: editingJob.duration,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setJobs((prev) =>
          prev.map((j) => (j._id === data.job._id ? data.job : j))
        )
        setEditingJob(null)
      }
    } catch (error) {
      console.error('Failed to update job:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (jobId: string) => {
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: { 'x-admin-id': user?.id || '' },
      })
      if (response.ok) {
        setJobs((prev) => prev.filter((j) => j._id !== jobId))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete job:', error)
    }
  }

  const statusColors: Record<string, string> = {
    active: 'bg-[#dcfce7] text-[#166534]',
    closed: 'bg-[#f3f1ed] text-[#888]',
    completed: 'bg-[#dbeafe] text-[#1e40af]',
    draft: 'bg-[#f3f1ed] text-[#888]',
  }

  const inputClass =
    'w-full px-3 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl text-sm text-[#111] bg-white focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all'
  const selectClass =
    'w-full px-3 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl text-sm text-[#111] bg-white focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all'
  const labelClass = "block text-sm font-medium text-[#111] mb-1.5"

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div>
        <h1
          className="text-[1.75rem] font-extrabold text-[#111]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Jobs
        </h1>
        <p className="text-sm text-[#363636] mt-1 font-light">
          Manage all job listings across the platform
        </p>
      </div>

      {/* Search / Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#ede9e3] p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by title, company, or employer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={inputClass}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`${selectClass} sm:w-44`}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
            <option value="draft">Draft</option>
          </select>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-2xl border border-[#ede9e3] overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#bbb] font-light text-sm">
            Loading jobs...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f1ed]">
                  <th className="px-6 py-3.5 text-left text-[0.72rem] font-semibold text-[#c06f22] uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3.5 text-left text-[0.72rem] font-semibold text-[#c06f22] uppercase tracking-wider">
                    Employer
                  </th>
                  <th className="px-6 py-3.5 text-left text-[0.72rem] font-semibold text-[#c06f22] uppercase tracking-wider">
                    Pay
                  </th>
                  <th className="px-6 py-3.5 text-left text-[0.72rem] font-semibold text-[#c06f22] uppercase tracking-wider">
                    Apps
                  </th>
                  <th className="px-6 py-3.5 text-left text-[0.72rem] font-semibold text-[#c06f22] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-left text-[0.72rem] font-semibold text-[#c06f22] uppercase tracking-wider">
                    Posted
                  </th>
                  <th className="px-6 py-3.5 text-right text-[0.72rem] font-semibold text-[#c06f22] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f1ed]">
                {jobs.map((job) => (
                  <tr
                    key={job._id}
                    className="hover:bg-[#fafaf9] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-[#111]">
                        {job.title}
                      </p>
                      <p className="text-xs text-[#aaa] mt-0.5">
                        {job.category} &middot; {job.experienceLevel}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#111]">{job.employerName}</p>
                      <p className="text-xs text-[#aaa]">{job.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="text-sm font-bold text-[#111]"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {'\u20B9'}{job.budget.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#111]">
                      {job.applicationsCount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${statusColors[job.status] || 'bg-[#f3f1ed] text-[#888]'}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#aaa]">
                      {new Date(job.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <button
                          onClick={() => setEditingJob({ ...job })}
                          className="text-sm text-[#e85d2f] font-medium hover:underline transition-colors"
                        >
                          Edit
                        </button>
                        {deleteConfirm === job._id ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDelete(job._id)}
                              className="text-sm text-[#991b1b] font-medium hover:underline transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="text-sm text-[#aaa] font-medium hover:underline transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(job._id)}
                            className="text-sm text-[#991b1b] font-medium hover:underline transition-colors"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {jobs.length === 0 && (
              <div className="p-12 text-center text-[#bbb] font-light text-sm">
                No jobs found
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-[#aaa] font-light">
        Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-[#ede9e3] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="px-6 py-5 border-b border-[#ede9e3] flex justify-between items-center sticky top-0 bg-white rounded-t-3xl">
              <h3
                className="text-lg font-bold text-[#111]"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Edit Job
              </h3>
              <button
                onClick={() => setEditingJob(null)}
                className="text-[#bbb] hover:text-[#111] transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Title</label>
                <input
                  type="text"
                  value={editingJob.title}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, title: e.target.value })
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  value={editingJob.description}
                  onChange={(e) =>
                    setEditingJob({
                      ...editingJob,
                      description: e.target.value,
                    })
                  }
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    Budget ({'\u20B9'})
                  </label>
                  <input
                    type="number"
                    value={editingJob.budget}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        budget: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    type="text"
                    value={editingJob.duration}
                    onChange={(e) =>
                      setEditingJob({ ...editingJob, duration: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={editingJob.status}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        status: e.target.value as JobItem['status'],
                      })
                    }
                    className={selectClass}
                  >
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Experience</label>
                  <select
                    value={editingJob.experienceLevel}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        experienceLevel: e.target.value,
                      })
                    }
                    className={selectClass}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <select
                    value={editingJob.locationType}
                    onChange={(e) =>
                      setEditingJob({
                        ...editingJob,
                        locationType: e.target.value,
                      })
                    }
                    className={selectClass}
                  >
                    <option value="remote">Remote</option>
                    <option value="on-site">On-site</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <input
                  type="text"
                  value={editingJob.category}
                  onChange={(e) =>
                    setEditingJob({ ...editingJob, category: e.target.value })
                  }
                  className={inputClass}
                />
              </div>
            </div>

            <div className="px-6 py-5 border-t border-[#ede9e3] flex justify-end gap-3 sticky bottom-0 bg-white rounded-b-3xl">
              <button
                onClick={() => setEditingJob(null)}
                className="px-5 py-2.5 text-sm font-medium text-[#111] bg-white border border-[#ede9e3] rounded-full hover:bg-[#fafaf9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveJob}
                disabled={saving}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#e85d2f] rounded-full hover:bg-[#d4522a] transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-[#ede9e3] w-full max-w-sm shadow-xl p-6 text-center">
            <h3
              className="text-lg font-bold text-[#111] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Delete Job
            </h3>
            <p className="text-sm text-[#aaa] mb-6 font-light">
              Are you sure you want to delete this job? This action cannot be
              undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-5 py-2.5 text-sm font-medium text-[#111] bg-white border border-[#ede9e3] rounded-full hover:bg-[#fafaf9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-5 py-2.5 text-sm font-medium text-white bg-[#991b1b] rounded-full hover:bg-[#7f1d1d] transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
