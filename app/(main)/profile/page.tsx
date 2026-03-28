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
        <div className="flex items-center gap-3 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl px-5 py-4">
          <svg className="w-5 h-5 text-[#16a34a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm text-[#166534] m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>{successMessage}</p>
        </div>
      )}

      {/* Profile Header Card */}
      <div className="bg-white border border-[#ede9e3] rounded-2xl p-8">
        <div className="mb-8">
          {/* Top row: Avatar + Info + Action button */}
          <div className="flex items-center gap-5">
            {/* Avatar circle */}
            <div className="w-[72px] h-[72px] rounded-full bg-[#e85d2f] flex items-center justify-center shadow-[0_4px_16px_rgba(232,93,47,0.2)] flex-shrink-0">
              <span
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-white text-[1.75rem] font-extrabold leading-none"
              >
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h1
                style={{ fontFamily: "'Syne', sans-serif" }}
                className="text-[1.5rem] font-extrabold text-[#111] m-0 leading-tight truncate"
              >
                {user.name}
              </h1>
              <p className="text-[#aaa] mt-1 text-sm m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {user.email}
              </p>
              <span
                className={`inline-block mt-2 px-3.5 py-1 text-xs font-semibold rounded-full tracking-wide ${
                  user.userType === 'employee'
                    ? 'bg-[#fff7f4] text-[#e85d2f] border border-[#fdd5c7]'
                    : 'bg-[#f5f3ff] text-[#7c3aed] border border-[#ddd6fe]'
                }`}
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {user.userType === 'employee' ? 'Employee' : 'Employer'}
              </span>
            </div>
            {!isEditing && (
              <button
                onClick={handleEdit}
                className="px-5 py-2.5 bg-[#111] text-white rounded-full text-sm font-semibold hover:bg-[#333] transition-colors cursor-pointer flex-shrink-0"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Edit form fields (shown below the header when editing) */}
          {isEditing && (
            <div className="mt-6 bg-[#f7f5f0] rounded-xl p-5 space-y-4">
              <div>
                <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              {user.userType === 'employee' ? (
                <>
                  <div>
                    <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      University
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                  </div>
                  <div>
                    <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Skills
                    </label>
                    <input
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      placeholder="e.g., React, Node.js, TypeScript"
                      className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all placeholder:text-[#ccc]"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    />
                    <p className="mt-1.5 text-[0.78rem] text-[#aaa] m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Separate skills with commas
                    </p>
                  </div>
                </>
              ) : (
                <div>
                  <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Company
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 border-[1.5px] border-[#e5e2db] rounded-xl bg-white text-[#111] text-sm focus:outline-none focus:border-[#e85d2f] focus:shadow-[0_0_0_3px_rgba(232,93,47,0.1)] transition-all"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                </div>
              )}

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#e85d2f] text-white rounded-full text-sm font-semibold hover:bg-[#d14e23] transition-colors disabled:opacity-50 cursor-pointer"
                  style={{ fontFamily: "'Syne', sans-serif", boxShadow: '0 4px 16px rgba(232,93,47,0.3)' }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-5 py-2.5 border-[1.5px] border-[#e5e2db] text-[#111] rounded-full text-sm font-semibold bg-white hover:bg-[#f7f5f0] transition-colors cursor-pointer"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Details section */}
        <div className="border-t border-[#ede9e3] pt-7">
          <h2
            className="text-[0.75rem] font-semibold text-[#aaa] uppercase tracking-wider mb-5 m-0"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {user.userType === 'employee' ? 'Employee Details' : 'Employer Details'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {user.userType === 'employee' ? (
              <>
                {/* University */}
                <div>
                  <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    University
                  </label>
                  <p className="text-[#111] text-sm m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {user.university || 'Not specified'}
                  </p>
                </div>

                {/* Rating */}
                <div>
                  <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Rating
                  </label>
                  <div className="flex items-center gap-2.5">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg
                          key={star}
                          className={`w-5 h-5 ${
                            star <= Math.round(user.rating || 0) ? 'text-amber-400' : 'text-[#ede9e3]'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[#111] text-sm font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {user.rating ? user.rating.toFixed(1) : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Stats: Completed Jobs & Member Since */}
                <div className="bg-[#f7f5f0] rounded-xl px-5 py-4">
                  <h3 className="text-[0.75rem] font-semibold text-[#aaa] uppercase tracking-wider mb-1 m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Completed Jobs
                  </h3>
                  <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-[1.75rem] font-extrabold text-[#111] m-0 leading-tight">
                    {user.completedJobs || 0}
                  </p>
                </div>

                <div className="bg-[#f7f5f0] rounded-xl px-5 py-4">
                  <h3 className="text-[0.75rem] font-semibold text-[#aaa] uppercase tracking-wider mb-1 m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Member Since
                  </h3>
                  <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-[1.75rem] font-extrabold text-[#111] m-0 leading-tight">
                    {memberSince}
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Company */}
                <div>
                  <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Company
                  </label>
                  <p className="text-[#111] text-sm m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {user.company || 'Not specified'}
                  </p>
                </div>

                {/* Verified */}
                <div>
                  <label className="text-[0.82rem] font-medium text-[#444] mb-1.5 block" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Verification Status
                  </label>
                  <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full ${
                    user.verified
                      ? 'bg-[#f0fdf4] text-[#166534] border border-[#bbf7d0]'
                      : 'bg-[#fffbeb] text-[#92400e] border border-[#fde68a]'
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

                {/* Stats: Total Hired & Member Since */}
                <div className="bg-[#f7f5f0] rounded-xl px-5 py-4">
                  <h3 className="text-[0.75rem] font-semibold text-[#aaa] uppercase tracking-wider mb-1 m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Total Hired
                  </h3>
                  <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-[1.75rem] font-extrabold text-[#111] m-0 leading-tight">
                    {user.totalHired || 0}
                  </p>
                </div>

                <div className="bg-[#f7f5f0] rounded-xl px-5 py-4">
                  <h3 className="text-[0.75rem] font-semibold text-[#aaa] uppercase tracking-wider mb-1 m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Member Since
                  </h3>
                  <p style={{ fontFamily: "'Syne', sans-serif" }} className="text-[1.75rem] font-extrabold text-[#111] m-0 leading-tight">
                    {memberSince}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Skills Section (Employee only) */}
      {user.userType === 'employee' && (
        <div className="bg-white border border-[#ede9e3] rounded-2xl p-6">
          <h2
            style={{ fontFamily: "'Syne', sans-serif" }}
            className="text-[1.1rem] font-extrabold text-[#111] mb-4 m-0"
          >
            Skills
          </h2>
          {user.skills && user.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3.5 py-1.5 bg-[#fff7f4] text-[#e85d2f] text-sm font-medium rounded-full border border-[#fdd5c7]"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-[#bbb] text-sm font-light m-0" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              No skills added yet
            </p>
          )}
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white border border-[#ede9e3] rounded-2xl p-6">
        <h2
          style={{ fontFamily: "'Syne', sans-serif" }}
          className="text-[1.1rem] font-extrabold text-[#111] mb-5 m-0"
        >
          Account Information
        </h2>
        <div className="space-y-0">
          <div className="flex justify-between items-center py-3.5 border-b border-[#ede9e3]">
            <span className="text-[0.82rem] font-medium text-[#444]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Email
            </span>
            <span className="text-sm text-[#111]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {user.email}
            </span>
          </div>
          <div className="flex justify-between items-center py-3.5 border-b border-[#ede9e3]">
            <span className="text-[0.82rem] font-medium text-[#444]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Account Type
            </span>
            <span className="text-sm text-[#111] capitalize" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {user.userType}
            </span>
          </div>
          <div className="flex justify-between items-center py-3.5">
            <span className="text-[0.82rem] font-medium text-[#444]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Member Since
            </span>
            <span className="text-sm text-[#111]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {memberSince}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
