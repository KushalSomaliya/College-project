import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'

export async function GET() {
  try {
    await connectDB()
    return NextResponse.json({ message: 'Database connected successfully!' })
  } catch (error) {
    console.error('Database connection error:', error)
    return NextResponse.json(
      { error: 'Failed to connect to database' },
      { status: 500 }
    )
  }
}