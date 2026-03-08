import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import { verifyAdmin } from '@/app/lib/admin'
import Job from '@/app/models/Job'

export async function GET(request: NextRequest) {
  const adminId = request.headers.get('x-admin-id')
  if (!(await verifyAdmin(adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''

    const query: Record<string, unknown> = {}

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { employerName: { $regex: search, $options: 'i' } },
      ]
    }

    if (status && status !== 'all') {
      query.status = status
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Admin jobs error:', error)
    return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 })
  }
}
