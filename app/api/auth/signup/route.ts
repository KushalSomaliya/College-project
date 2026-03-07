import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import User from '@/app/models/User'

export async function POST(request: NextRequest) {
  try {
    await connectDB()
    
    const body = await request.json()
    const { name, email, password, userType, university, company } = body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Create new user
    const userData: any = {
      name,
      email,
      password, // In production, you should hash this password!
      userType,
    }

    if (userType === 'employee') {
      userData.university = university
    } else {
      userData.company = company
    }

    const user = await User.create(userData)

    // Return user without password
    const userResponse = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      university: user.university,
      company: user.company,
    }

    return NextResponse.json({ user: userResponse }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    )
  }
}