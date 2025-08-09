import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import Gig from '@/app/models/Gig'

// GET single gig by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const resolvedParams = await params
    const gig = await Gig.findById(resolvedParams.id)
    
    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ gig })
  } catch (error) {
    console.error('Get gig error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gig' },
      { status: 500 }
    )
  }
}

// PATCH update gig (mainly for closing)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { status } = body
    
    const resolvedParams = await params
    const gig = await Gig.findById(resolvedParams.id)
    
    if (!gig) {
      return NextResponse.json(
        { error: 'Gig not found' },
        { status: 404 }
      )
    }
    
    // Update gig status
    if (status) {
      gig.status = status
    }
    
    await gig.save()
    
    return NextResponse.json({ gig })
  } catch (error) {
    console.error('Update gig error:', error)
    return NextResponse.json(
      { error: 'Failed to update gig' },
      { status: 500 }
    )
  }
}