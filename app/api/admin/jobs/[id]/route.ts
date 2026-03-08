import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import { verifyAdmin } from '@/app/lib/admin'
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

    const job = await Job.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error('Admin update job error:', error)
    return NextResponse.json({ error: 'Failed to update job' }, { status: 500 })
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

    const job = await Job.findById(id)
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Delete job and its applications
    await Promise.all([
      Application.deleteMany({ jobId: id }),
      Job.findByIdAndDelete(id),
    ])

    return NextResponse.json({ message: 'Job and related applications deleted' })
  } catch (error) {
    console.error('Admin delete job error:', error)
    return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 })
  }
}
