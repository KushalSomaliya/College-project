'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'

interface UserItem {
  _id: string
  name: string
  email: string
  userType: 'employee' | 'employer'
  university?: string
  company?: string
  skills?: string[]
  rating?: number
  completedJobs?: number
  verified?: boolean
  totalHired?: number
  createdAt: string
}

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterType !== 'all') params.set('userType', filterType)

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: { 'x-admin-id': user?.id || '' },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }, [search, filterType, user?.email])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleVerify = async (userId: string, currentVerified: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-id': user?.id || '',
        },
        body: JSON.stringify({ verified: !currentVerified }),
      })
      if (response.ok) {
        setUsers((prev) =>
          prev.map((u) =>
            u._id === userId ? { ...u, verified: !currentVerified } : u
          )
        )
      }
    } catch (error) {
      console.error('Failed to update verification:', error)
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'x-admin-id': user?.id || '' },
      })
      if (response.ok) {
        setUsers((prev) => prev.filter((u) => u._id !== userId))
        setDeleteConfirm(null)
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  return (
    <div className="space-y-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <h1
        className="text-[1.75rem] font-extrabold text-[#111]"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        Users
      </h1>

      {/* Search / Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#ede9e3] p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl text-sm text-[#111] placeholder:text-[#aaa] focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl text-sm text-[#111] bg-white focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all"
          >
            <option value="all">All Types</option>
            <option value="employee">Employees</option>
            <option value="employer">Employers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#ede9e3] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-[#bbb] font-light">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f1ed]">
                  <th className="px-6 py-3 text-left text-[0.72rem] font-semibold text-[#bbb] uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-[0.72rem] font-semibold text-[#bbb] uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-[0.72rem] font-semibold text-[#bbb] uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-[0.72rem] font-semibold text-[#bbb] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[0.72rem] font-semibold text-[#bbb] uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-[0.72rem] font-semibold text-[#bbb] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f3f1ed]">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-[#fafaf9] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#fff7f4] flex items-center justify-center flex-shrink-0">
                          <span className="text-[#e85d2f] font-medium text-sm">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#111]">{u.name}</p>
                          <p className="text-xs text-[#aaa]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${
                        u.userType === 'employee'
                          ? 'bg-[#fff7f4] text-[#e85d2f] border-[#fdd5c7]'
                          : 'bg-[#f0fdf4] text-[#166534] border-[#bbf7d0]'
                      }`}>
                        {u.userType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#111]/70">
                      {u.userType === 'employee' ? (
                        <span>{u.university || 'N/A'}</span>
                      ) : (
                        <span>{u.company || 'N/A'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {u.userType === 'employer' ? (
                        u.verified ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-[#dcfce7] text-[#166534]">
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-[#fff7f4] text-[#e85d2f] border border-[#fdd5c7]">
                            Unverified
                          </span>
                        )
                      ) : (
                        <span className="text-xs text-[#bbb]">&mdash;</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-[#111]/50">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {u.userType === 'employer' && (
                          <button
                            onClick={() => handleVerify(u._id, !!u.verified)}
                            className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-colors ${
                              u.verified
                                ? 'bg-transparent border border-[#fecaca] text-[#991b1b] hover:bg-[#fef2f2]'
                                : 'bg-[#166534] text-white hover:bg-[#15803d]'
                            }`}
                          >
                            {u.verified ? 'Unverify' : 'Verify'}
                          </button>
                        )}
                        {deleteConfirm === u._id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDelete(u._id)}
                              className="px-3.5 py-1.5 text-xs font-medium rounded-full bg-[#991b1b] text-white hover:bg-[#7f1d1d] transition-colors"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-3.5 py-1.5 text-xs font-medium rounded-full border border-[#ede9e3] text-[#111]/60 hover:bg-[#fafaf9] transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(u._id)}
                            className="text-xs font-medium text-[#991b1b] hover:underline transition-colors"
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
            {users.length === 0 && (
              <div className="p-8 text-center text-[#bbb] font-light">No users found</div>
            )}
          </div>
        )}
      </div>

      <div className="text-sm text-[#aaa]">
        Showing {users.length} user{users.length !== 1 ? 's' : ''}
      </div>

      {/* Delete Confirmation Dialog Overlay */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-[#ede9e3] shadow-xl p-6 max-w-sm w-full mx-4">
            <h3
              className="text-lg font-bold text-[#111] mb-2"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Delete user?
            </h3>
            <p className="text-sm text-[#111]/60 mb-6">
              This action cannot be undone. The user and all their data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium rounded-full border border-[#ede9e3] text-[#111]/70 hover:bg-[#fafaf9] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-sm font-medium rounded-full bg-[#991b1b] text-white hover:bg-[#7f1d1d] transition-colors"
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
