import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Application from '@/app/models/Application'
import Job from '@/app/models/Job'
import User from '@/app/models/User'

// GET applications (by job, by employee, or all)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const employeeId = searchParams.get('employeeId')

    let query: any = {}

    if (jobId) {
      query.jobId = jobId
    }

    if (employeeId) {
      query.employeeId = employeeId
    }

    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .populate('jobId')

    return NextResponse.json({ applications })
  } catch (error) {
    console.error('Get applications error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    )
  }
}

// POST create new application
export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const body = await request.json()
    const { jobId, employeeId, coverLetter, proposedRate, experience } = body

    // Check if employee has already applied
    const existingApplication = await Application.findOne({ jobId, employeeId })
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Get employee details
    const employee = await User.findById(employeeId)
    if (!employee || employee.userType !== 'employee') {
      return NextResponse.json(
        { error: 'Invalid employee' },
        { status: 400 }
      )
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId)
    if (!job || job.status !== 'active') {
      return NextResponse.json(
        { error: 'Job not available for applications' },
        { status: 400 }
      )
    }

    // Create application
    const application = await Application.create({
      jobId,
      employeeId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      employeeUniversity: employee.university,
      coverLetter,
      proposedRate,
      experience,
      appliedDate: new Date(),
    })

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    })

    return NextResponse.json({ application }, { status: 201 })
  } catch (error) {
    console.error('Create application error:', error)
    return NextResponse.json(
      { error: 'Failed to create application' },
      { status: 500 }
    )
  }
}
