import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Job from '@/app/models/Job'
import User from '@/app/models/User'

// GET all jobs or jobs by employer
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const employerId = searchParams.get('employerId')
    const status = searchParams.get('status')

    let query: any = {}

    if (employerId) {
      query.employerId = employerId
    }

    if (status) {
      query.status = status
    }

    const jobs = await Job.find(query).sort({ createdAt: -1 })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error('Get jobs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// POST create new job
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { employerId, ...jobData } = body

    // Get employer details
    const employer = await User.findById(employerId)
    if (!employer || employer.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Invalid employer' },
        { status: 400 }
      )
    }

    // Create job with employer info
    const job = await Job.create({
      ...jobData,
      employerId,
      employerName: employer.name,
      company: employer.company,
      postedDate: new Date(),
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
}
