import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Application from '@/app/models/Application'
import Job from '@/app/models/Job'
import User from '@/app/models/User'

// GET applications (by job, by student, or all)
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')
    const studentId = searchParams.get('studentId')

    let query: any = {}

    if (jobId) {
      query.jobId = jobId
    }

    if (studentId) {
      query.studentId = studentId
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
    const { jobId, studentId, coverLetter, proposedRate, experience } = body

    // Check if student has already applied
    const existingApplication = await Application.findOne({ jobId, studentId })
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this job' },
        { status: 400 }
      )
    }

    // Get student details
    const student = await User.findById(studentId)
    if (!student || student.userType !== 'student') {
      return NextResponse.json(
        { error: 'Invalid student' },
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
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      studentUniversity: student.university,
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
