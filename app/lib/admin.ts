import connectDB from '@/app/lib/db'
import User from '@/app/models/User'

export async function verifyAdmin(userId: string | null): Promise<boolean> {
  if (!userId) return false

  try {
    await connectDB()
    const user = await User.findById(userId).select('role')
    return user?.role === 'admin'
  } catch {
    return false
  }
}
