import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import { verifyAdmin } from '@/app/lib/admin'
import User from '@/app/models/User'
import Job from '@/app/models/Job'
import Application from '@/app/models/Application'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = request.headers.get('x-admin-id')
  if (!(await verifyAdmin(adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    await connectDB()
    const { id } = await params
    const body = await request.json()

    const user = await User.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminId = request.headers.get('x-admin-id')
  if (!(await verifyAdmin(adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    await connectDB()
    const { id } = await params

    const user = await User.findById(id)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user's jobs and applications
    await Promise.all([
      Job.deleteMany({ employerId: id }),
      Application.deleteMany({ employeeId: id }),
      User.findByIdAndDelete(id),
    ])

    return NextResponse.json({ message: 'User and related data deleted' })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
