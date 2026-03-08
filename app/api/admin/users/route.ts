import { NextRequest, NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import { verifyAdmin } from '@/app/lib/admin'
import User from '@/app/models/User'

export async function GET(request: NextRequest) {
  const adminId = request.headers.get('x-admin-id')
  if (!(await verifyAdmin(adminId))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    await connectDB()

    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search') || ''
    const userType = searchParams.get('userType') || ''

    const query: Record<string, unknown> = { role: { $ne: 'admin' } }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ]
    }

    if (userType && userType !== 'all') {
      query.userType = userType
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
