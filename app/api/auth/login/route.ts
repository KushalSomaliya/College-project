import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import User from '@/app/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { email, password } = body

    // Find user by email
    const user = await User.findOne({ email })
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Check password (in production, you should compare hashed passwords!)
    if (user.password !== password) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      university: user.university,
      company: user.company,
      skills: user.skills,
      rating: user.rating,
      completedJobs: user.completedJobs,
      verified: user.verified,
      totalHired: user.totalHired,
    }

    return NextResponse.json({ user: userResponse })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    )
  }
}