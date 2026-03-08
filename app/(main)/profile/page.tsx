'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Edit form state
  const [name, setName] = useState(user?.name || '')
  const [university, setUniversity] = useState(user?.university || '')
  const [company, setCompany] = useState(user?.company || '')
  const [skillsInput, setSkillsInput] = useState(user?.skills?.join(', ') || '')

  if (!user) {
    router.push('/sign-in')
    return null
  }

  const handleEdit = () => {
    setName(user.name)
    setUniversity(user.university || '')
    setCompany(user.company || '')
    setSkillsInput(user.skills?.join(', ') || '')
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)

    const updates: Record<string, unknown> = { name }

    if (user.userType === 'employee') {
      updates.university = university
      updates.skills = skillsInput
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0)
    } else {
      updates.company = company
    }

    try {
      const response = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        // Update local auth state
        updateUser({
          name: data.user.name,
          university: data.user.university,
          company: data.user.company,
          skills: data.user.skills,
        })
        setIsEditing(false)
        setSuccessMessage('Profile updated successfully')
        setTimeout(() => setSuccessMessage(null), 3000)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      alert('An error occurred. Please try again.')
    }

    setIsSaving(false)
  }

  const memberSince = user.id
    ? new Date(parseInt(user.id.substring(0, 8), 16) * 1000).toLocaleDateString('en-IN', {
        month: 'long',
        year: 'numeric',
      })
    : 'N/A'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-[var(--background)] border border-gray-200 rounded-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center">
              <span className="text-primary text-3xl font-bold">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-2xl font-bold text-[var(--foreground)] border border-gray-300 rounded-md px-3 py-1 bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              ) : (
                <h1 className="text-2xl font-bold text-[var(--foreground)]">{user.name}</h1>
              )}
              <p className="text-gray-500 mt-1">{user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full ${
                user.userType === 'employee'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-purple-100 text-purple-800'
              }`}>
                {user.userType === 'employee' ? 'Employee' : 'Employer'}
              </span>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={handleEdit}
              className="px-4 py-2 border border-gray-300 text-[var(--foreground)] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 text-[var(--foreground)] rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
            {user.userType === 'employee' ? 'Employee Details' : 'Employer Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {user.userType === 'employee' ? (
              <>
                {/* University */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">University</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="text-[var(--foreground)]">{user.university || 'Not specified'}</p>
                  )}
                </div>

                {/* Rating */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rating</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(user.rating || 0) ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[var(--foreground)] font-medium">
                      {user.rating ? user.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Completed Jobs */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Completed Jobs</h3>
                  <p className="text-[var(--foreground)] text-lg font-semibold">{user.completedJobs || 0}</p>
                </div>

                {/* Member Since */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                  <p className="text-[var(--foreground)]">{memberSince}</p>
                </div>
              </>
            ) : (
              <>
                {/* Company */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Company</h3>
                  {isEditing ? (
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  ) : (
                    <p className="text-[var(--foreground)]">{user.company || 'Not specified'}</p>
                  )}
                </div>

                {/* Verified */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Verification Status</h3>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full ${
                    user.verified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {user.verified ? (
                      <>
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Verified
                      </>
                    ) : 'Pending Verification'}
                  </span>
                </div>

                {/* Total Hired */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Hired</h3>
                  <p className="text-[var(--foreground)] text-lg font-semibold">{user.totalHired || 0}</p>
                </div>

                {/* Member Since */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Member Since</h3>
                  <p className="text-[var(--foreground)]">{memberSince}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section (Employee only) */}
      {user.userType === 'employee' && (
        <div className="bg-[var(--background)] border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Skills</h2>
          {isEditing ? (
            <div>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="e.g., React, Node.js, TypeScript"
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <p className="mt-1 text-sm text-gray-500">Separate skills with commas</p>
            </div>
          ) : user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-light text-primary text-sm font-medium rounded-full"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No skills added yet</p>
          )}
        </div>
      )}

      {/* Account Info */}
      <div className="bg-[var(--background)] border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">Account Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm text-[var(--foreground)]">{user.email}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-sm text-gray-500">Account Type</span>
            <span className="text-sm text-[var(--foreground)] capitalize">{user.userType}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Member Since</span>
            <span className="text-sm text-[var(--foreground)]">{memberSince}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
