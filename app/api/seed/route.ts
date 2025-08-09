import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import User from '@/app/models/User'
import Gig from '@/app/models/Gig'

export async function GET() {
  try {
    await connectDB()
    
    // Create test users
    const student = await User.findOneAndUpdate(
      { email: 'student@test.com' },
      {
        name: 'John Doe',
        email: 'student@test.com',
        password: 'password123', // In production, hash this!
        userType: 'student',
        university: 'University of Technology',
        skills: ['React', 'Node.js', 'Python'],
        rating: 4.8,
        completedGigs: 12
      },
      { upsert: true, new: true }
    )
    
    const employer = await User.findOneAndUpdate(
      { email: 'employer@test.com' },
      {
        name: 'Sarah Johnson',
        email: 'employer@test.com',
        password: 'password123', // In production, hash this!
        userType: 'employer',
        company: 'TechStart Inc.',
        verified: true,
        totalHired: 25
      },
      { upsert: true, new: true }
    )
    
    // Create a sample gig
    const gig = await Gig.findOneAndUpdate(
      { title: 'React Native Mobile App Development' },
      {
        title: 'React Native Mobile App Development',
        description: 'Looking for a student developer to help build a mobile app for tracking fitness goals. Experience with React Native and Firebase required.',
        requirements: 'Must have built at least one mobile app.',
        company: employer.company,
        employerId: employer._id,
        employerName: employer.name,
        budget: 800,
        budgetType: 'fixed',
        duration: '2-3 weeks',
        skills: ['React Native', 'Firebase', 'JavaScript'],
        category: 'Mobile Development',
        experienceLevel: 'intermediate',
        locationType: 'remote',
        status: 'active'
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ 
      message: 'Seed data created successfully!',
      users: [
        { email: 'student@test.com', password: 'password123' },
        { email: 'employer@test.com', password: 'password123' }
      ]
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}