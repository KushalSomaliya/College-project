import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Gig from '@/app/models/Gig'
import User from '@/app/models/User'

// GET all gigs or gigs by employer
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
    
    const gigs = await Gig.find(query).sort({ createdAt: -1 })
    
    return NextResponse.json({ gigs })
  } catch (error) {
    console.error('Get gigs error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gigs' },
      { status: 500 }
    )
  }
}

// POST create new gig
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { employerId, ...gigData } = body
    
    // Get employer details
    const employer = await User.findById(employerId)
    if (!employer || employer.userType !== 'employer') {
      return NextResponse.json(
        { error: 'Invalid employer' },
        { status: 400 }
      )
    }
    
    // Create gig with employer info
    const gig = await Gig.create({
      ...gigData,
      employerId,
      employerName: employer.name,
      company: employer.company,
      postedDate: new Date(),
    })
    
    return NextResponse.json({ gig }, { status: 201 })
  } catch (error) {
    console.error('Create gig error:', error)
    return NextResponse.json(
      { error: 'Failed to create gig' },
      { status: 500 }
    )
  }
}