import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import { verifyAdmin } from '@/app/lib/admin'
import User from '@/app/models/User'
import Job from '@/app/models/Job'
import Application from '@/app/models/Application'

export async function GET(request: NextRequest) {
  const adminId = request.headers.get('x-admin-id')
  if (!(await verifyAdmin(adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    await connectDB()

    const [
      totalUsers,
      totalEmployees,
      totalEmployers,
      verifiedEmployers,
      totalJobs,
      activeJobs,
      completedJobs,
      totalApplications,
      pendingApplications,
      recentUsers,
      recentJobs,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'admin' } }),
      User.countDocuments({ userType: 'employee', role: { $ne: 'admin' } }),
      User.countDocuments({ userType: 'employer', role: { $ne: 'admin' } }),
      User.countDocuments({ userType: 'employer', verified: true, role: { $ne: 'admin' } }),
      Job.countDocuments(),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'completed' }),
      Application.countDocuments(),
      Application.countDocuments({ status: 'pending' }),
      User.find({ role: { $ne: 'admin' } }).sort({ createdAt: -1 }).limit(5).select('-password'),
      Job.find().sort({ createdAt: -1 }).limit(5),
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalEmployees,
        totalEmployers,
        verifiedEmployers,
        totalJobs,
        activeJobs,
        completedJobs,
        totalApplications,
        pendingApplications,
      },
      recentUsers,
      recentJobs,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
