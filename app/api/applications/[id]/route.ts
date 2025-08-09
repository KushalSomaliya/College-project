import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Application from '@/app/models/Application'

// PATCH update application status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { status } = body
    
    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }
    
    const resolvedParams = await params
    const application = await Application.findById(resolvedParams.id)
    
    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      )
    }
    
    // Only update if currently pending
    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application already processed' },
        { status: 400 }
      )
    }
    
    application.status = status
    await application.save()
    
    return NextResponse.json({ application })
  } catch (error) {
    console.error('Update application error:', error)
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    )
  }
}