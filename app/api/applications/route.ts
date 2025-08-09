import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Application from '@/app/models/Application'
import Gig from '@/app/models/Gig'
import User from '@/app/models/User'

// GET applications (by gig, by student, or all)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    
    const { searchParams } = new URL(request.url)
    const gigId = searchParams.get('gigId')
    const studentId = searchParams.get('studentId')
    
    let query: any = {}
    
    if (gigId) {
      query.gigId = gigId
    }
    
    if (studentId) {
      query.studentId = studentId
    }
    
    const applications = await Application.find(query)
      .sort({ createdAt: -1 })
      .populate('gigId')
    
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
    const { gigId, studentId, coverLetter, proposedRate, experience } = body
    
    // Check if student has already applied
    const existingApplication = await Application.findOne({ gigId, studentId })
    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied to this gig' },
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
    
    // Check if gig exists and is active
    const gig = await Gig.findById(gigId)
    if (!gig || gig.status !== 'active') {
      return NextResponse.json(
        { error: 'Gig not available for applications' },
        { status: 400 }
      )
    }
    
    // Create application
    const application = await Application.create({
      gigId,
      studentId,
      studentName: student.name,
      studentEmail: student.email,
      studentUniversity: student.university,
      coverLetter,
      proposedRate,
      experience,
      appliedDate: new Date(),
    })
    
    // Update gig application count
    await Gig.findByIdAndUpdate(gigId, { 
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