import { NextResponse } from 'next/server'
import connectDB from '@/app/lib/db'
import User from '@/app/models/User'
import Job from '@/app/models/Job'
import Application from '@/app/models/Application'

export async function GET() {
  try {
    await connectDB()

    // Delete all existing data and drop old indexes
    await Promise.all([
      User.deleteMany({}),
      Job.deleteMany({}),
      Application.deleteMany({}),
    ])

    try {
      await Application.collection.dropIndexes()
    } catch {
      // Indexes may not exist, ignore
    }
    await Application.syncIndexes()

    // --- USERS ---

    // Demo employee account
    const demoEmployee = await User.create({
      name: 'Arjun Mehta',
      email: 'employee@test.com',
      password: 'password123',
      userType: 'employee',
      university: 'IIT Bombay',
      skills: ['React', 'Node.js', 'TypeScript', 'Python'],
      rating: 4.8,
      completedJobs: 12,
    })

    // Demo employer account
    const demoEmployer = await User.create({
      name: 'Neha Kapoor',
      email: 'employer@test.com',
      password: 'password123',
      userType: 'employer',
      company: 'TechStart India Pvt. Ltd.',
      verified: true,
      totalHired: 8,
    })

    // Additional employees
    const employee2 = await User.create({
      name: 'Sneha Iyer',
      email: 'sneha.iyer@email.com',
      password: 'password123',
      userType: 'employee',
      university: 'IIT Delhi',
      skills: ['Python', 'Django', 'Machine Learning', 'SQL'],
      rating: 4.5,
      completedJobs: 7,
    })

    const employee3 = await User.create({
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      password: 'password123',
      userType: 'employee',
      university: 'BITS Pilani',
      skills: ['React Native', 'Flutter', 'Firebase', 'Swift'],
      rating: 4.9,
      completedJobs: 20,
    })

    const employee4 = await User.create({
      name: 'Ananya Deshmukh',
      email: 'ananya.deshmukh@email.com',
      password: 'password123',
      userType: 'employee',
      university: 'NID Ahmedabad',
      skills: ['Figma', 'UI/UX', 'Adobe XD', 'CSS'],
      rating: 4.7,
      completedJobs: 15,
    })

    // Additional employers
    const employer2 = await User.create({
      name: 'Rajesh Nair',
      email: 'rajesh.nair@email.com',
      password: 'password123',
      userType: 'employer',
      company: 'CloudNine Solutions',
      verified: true,
      totalHired: 12,
    })

    const employer3 = await User.create({
      name: 'Priya Patel',
      email: 'priya.patel@email.com',
      password: 'password123',
      userType: 'employer',
      company: 'DataFlow Analytics',
      verified: true,
      totalHired: 5,
    })

    const employer4 = await User.create({
      name: 'Karan Malhotra',
      email: 'karan.malhotra@email.com',
      password: 'password123',
      userType: 'employer',
      company: 'PixelCraft Studios',
      verified: false,
      totalHired: 3,
    })

    // --- JOBS ---

    // Jobs posted by demoEmployer (Neha Kapoor / TechStart India)
    const job1 = await Job.create({
      title: 'Full-Stack Web Developer for E-Commerce Platform',
      description: 'We need a full-stack developer to build a modern e-commerce platform with product listings, shopping cart, payment integration via Razorpay, and admin dashboard. The tech stack is Next.js, Tailwind CSS, and MongoDB.',
      requirements: 'Experience with Next.js, React, and MongoDB. Familiarity with payment APIs like Razorpay is a plus.',
      company: demoEmployer.company,
      employerId: demoEmployer._id,
      employerName: demoEmployer.name,
      budget: 75000,
      budgetType: 'fixed',
      duration: '4-6 weeks',
      skills: ['Next.js', 'React', 'MongoDB', 'Tailwind CSS'],
      category: 'Web Development',
      experienceLevel: 'intermediate',
      locationType: 'remote',
      status: 'active',
    })

    const job2 = await Job.create({
      title: 'React Native Mobile App for Fitness Tracking',
      description: 'Looking for someone to build a cross-platform fitness tracking app with workout logging, progress charts, and social features. Must integrate with HealthKit and Google Fit.',
      requirements: 'At least 1 year of experience with React Native. Published app on App Store or Play Store preferred.',
      company: demoEmployer.company,
      employerId: demoEmployer._id,
      employerName: demoEmployer.name,
      budget: 100000,
      budgetType: 'fixed',
      duration: '6-8 weeks',
      skills: ['React Native', 'Firebase', 'TypeScript'],
      category: 'Mobile Development',
      experienceLevel: 'intermediate',
      locationType: 'remote',
      status: 'active',
    })

    // Jobs posted by employer2 (Rajesh Nair / CloudNine Solutions)
    const job3 = await Job.create({
      title: 'Backend API Developer - Node.js & PostgreSQL',
      description: 'We are building a SaaS platform and need a backend developer to design and implement RESTful APIs, handle authentication, and set up database schemas. Must write clean, well-tested code.',
      requirements: 'Strong knowledge of Node.js, Express, and PostgreSQL. Experience with JWT auth and API testing.',
      company: employer2.company,
      employerId: employer2._id,
      employerName: employer2.name,
      budget: 60000,
      budgetType: 'fixed',
      duration: '3-4 weeks',
      skills: ['Node.js', 'Express', 'PostgreSQL', 'Jest'],
      category: 'Backend Development',
      experienceLevel: 'intermediate',
      locationType: 'remote',
      status: 'active',
    })

    const job4 = await Job.create({
      title: 'WordPress Website for Small Business',
      description: 'Need a clean, professional WordPress website for a local restaurant. Should include a menu page, about us, contact form, and photo gallery. SEO-friendly and mobile-responsive.',
      requirements: 'WordPress theme customization experience. Basic SEO knowledge.',
      company: employer2.company,
      employerId: employer2._id,
      employerName: employer2.name,
      budget: 20000,
      budgetType: 'fixed',
      duration: '1-2 weeks',
      skills: ['WordPress', 'HTML', 'CSS', 'SEO'],
      category: 'Web Development',
      experienceLevel: 'beginner',
      locationType: 'remote',
      status: 'active',
    })

    // Jobs posted by employer3 (Priya Patel / DataFlow Analytics)
    const job5 = await Job.create({
      title: 'Data Analysis Dashboard with Python & Plotly',
      description: 'Build an interactive data visualization dashboard for our sales data. The dashboard should allow filtering by date range, product category, and region. Data is provided in CSV format.',
      requirements: 'Proficiency in Python, Pandas, and Plotly or Dash. Experience with data cleaning and visualization.',
      company: employer3.company,
      employerId: employer3._id,
      employerName: employer3.name,
      budget: 45000,
      budgetType: 'fixed',
      duration: '2-3 weeks',
      skills: ['Python', 'Pandas', 'Plotly', 'Data Visualization'],
      category: 'Data Science',
      experienceLevel: 'intermediate',
      locationType: 'remote',
      status: 'active',
    })

    const job6 = await Job.create({
      title: 'Machine Learning Model for Customer Churn Prediction',
      description: 'Develop a machine learning pipeline to predict customer churn using historical subscription data. Deliverables include a trained model, evaluation report, and a simple Flask API for predictions.',
      requirements: 'Experience with scikit-learn or TensorFlow. Understanding of classification algorithms and model evaluation metrics.',
      company: employer3.company,
      employerId: employer3._id,
      employerName: employer3.name,
      budget: 90000,
      budgetType: 'fixed',
      duration: '3-5 weeks',
      skills: ['Python', 'Machine Learning', 'scikit-learn', 'Flask'],
      category: 'Data Science',
      experienceLevel: 'advanced',
      locationType: 'hybrid',
      status: 'active',
    })

    // Jobs posted by employer4 (Karan Malhotra / PixelCraft Studios)
    const job7 = await Job.create({
      title: 'UI/UX Design for Mobile Banking App',
      description: 'Design a complete UI/UX for a mobile banking application including onboarding, dashboard, transactions, and settings screens. Deliver high-fidelity prototypes in Figma.',
      requirements: 'Strong portfolio in mobile app design. Proficiency in Figma. Understanding of accessibility standards.',
      company: employer4.company,
      employerId: employer4._id,
      employerName: employer4.name,
      budget: 55000,
      budgetType: 'fixed',
      duration: '2-4 weeks',
      skills: ['Figma', 'UI/UX', 'Prototyping', 'Mobile Design'],
      category: 'Design',
      experienceLevel: 'intermediate',
      locationType: 'remote',
      status: 'active',
    })

    const job8 = await Job.create({
      title: 'Logo and Brand Identity Design',
      description: 'Create a modern logo and brand identity package for a tech startup. Deliverables include logo variations, color palette, typography guide, and business card design.',
      requirements: 'Experience in brand identity design. Proficiency in Adobe Illustrator or Figma.',
      company: employer4.company,
      employerId: employer4._id,
      employerName: employer4.name,
      budget: 25000,
      budgetType: 'fixed',
      duration: '1-2 weeks',
      skills: ['Adobe Illustrator', 'Branding', 'Graphic Design'],
      category: 'Design',
      experienceLevel: 'beginner',
      locationType: 'remote',
      status: 'active',
    })

    // A closed job for variety
    await Job.create({
      title: 'Landing Page for Product Launch',
      description: 'Build a responsive landing page for our new product launch. Must include hero section, features, pricing, and signup form.',
      requirements: 'HTML, CSS, JavaScript basics.',
      company: demoEmployer.company,
      employerId: demoEmployer._id,
      employerName: demoEmployer.name,
      budget: 15000,
      budgetType: 'fixed',
      duration: '1 week',
      skills: ['HTML', 'CSS', 'JavaScript'],
      category: 'Web Development',
      experienceLevel: 'beginner',
      locationType: 'remote',
      status: 'closed',
    })

    // --- APPLICATIONS ---

    // Sneha applied to job1 (Full-Stack Web Dev) - accepted
    await Application.create({
      jobId: job1._id,
      employeeId: employee2._id,
      employeeName: employee2.name,
      employeeEmail: employee2.email,
      employeeUniversity: employee2.university,
      status: 'accepted',
      coverLetter: 'I have 2 years of experience building full-stack applications with Next.js and MongoDB. I recently completed an e-commerce project with Razorpay integration that handles over 500 daily transactions. I would love to bring my expertise to your platform.',
      proposedRate: 70000,
      experience: '2 years of experience',
    })

    // Vikram applied to job2 (React Native Fitness) - pending
    await Application.create({
      jobId: job2._id,
      employeeId: employee3._id,
      employeeName: employee3.name,
      employeeEmail: employee3.email,
      employeeUniversity: employee3.university,
      status: 'pending',
      coverLetter: 'I have published 3 apps on both the App Store and Google Play Store. My latest project was a health tracking app with HealthKit integration that reached 10K downloads. I am confident I can deliver a great fitness app for your team.',
      proposedRate: 90000,
      experience: '3 years and 6 months of experience',
    })

    // Demo employee (Arjun) applied to job3 (Backend API) - pending
    await Application.create({
      jobId: job3._id,
      employeeId: demoEmployee._id,
      employeeName: demoEmployee.name,
      employeeEmail: demoEmployee.email,
      employeeUniversity: demoEmployee.university,
      status: 'pending',
      coverLetter: 'I have strong experience with Node.js and have built several RESTful APIs for production applications. I am comfortable with PostgreSQL, JWT authentication, and writing comprehensive test suites with Jest.',
      proposedRate: 55000,
      experience: '2 years and 3 months of experience',
    })

    // Demo employee (Arjun) applied to job5 (Data Dashboard) - accepted
    await Application.create({
      jobId: job5._id,
      employeeId: demoEmployee._id,
      employeeName: demoEmployee.name,
      employeeEmail: demoEmployee.email,
      employeeUniversity: demoEmployee.university,
      status: 'accepted',
      coverLetter: 'I have built multiple data dashboards using Python and Plotly for various clients. I am skilled at transforming raw CSV data into insightful, interactive visualizations. I can deliver a polished dashboard within your timeline.',
      proposedRate: 42000,
      experience: '1 year and 6 months of experience',
    })

    // Ananya applied to job7 (UI/UX Banking) - pending
    await Application.create({
      jobId: job7._id,
      employeeId: employee4._id,
      employeeName: employee4.name,
      employeeEmail: employee4.email,
      employeeUniversity: employee4.university,
      status: 'pending',
      coverLetter: 'I specialize in mobile UI/UX design and have designed interfaces for fintech apps used by thousands of users. My portfolio includes banking and payment apps with a strong focus on accessibility and user experience. I would love to work on this project.',
      proposedRate: 50000,
      experience: '3 years of experience',
    })

    // Ananya applied to job8 (Logo & Brand) - rejected
    await Application.create({
      jobId: job8._id,
      employeeId: employee4._id,
      employeeName: employee4.name,
      employeeEmail: employee4.email,
      employeeUniversity: employee4.university,
      status: 'rejected',
      coverLetter: 'I have experience creating brand identities for startups and small businesses. I am proficient in Figma and Adobe Illustrator and can deliver multiple logo concepts with a complete brand guide.',
      proposedRate: 22000,
      experience: '2 years of experience',
    })

    // Sneha applied to job6 (ML Churn) - pending
    await Application.create({
      jobId: job6._id,
      employeeId: employee2._id,
      employeeName: employee2.name,
      employeeEmail: employee2.email,
      employeeUniversity: employee2.university,
      status: 'pending',
      coverLetter: 'I have a strong background in machine learning and have built classification models for several real-world projects. My recent work involved predicting user behavior using scikit-learn and deploying models via Flask APIs. I am excited about this opportunity.',
      proposedRate: 85000,
      experience: '2 years of experience',
    })

    // Update application counts on jobs
    const jobIds = [job1._id, job2._id, job3._id, job5._id, job6._id, job7._id, job8._id]
    for (const id of jobIds) {
      const count = await Application.countDocuments({ jobId: id })
      await Job.findByIdAndUpdate(id, { applicationsCount: count })
    }

    return NextResponse.json({
      message: 'Database wiped and seeded successfully!',
      data: {
        users: 7,
        jobs: 9,
        applications: 7,
      },
      demoAccounts: [
        { role: 'Employee', email: 'employee@test.com', password: 'password123' },
        { role: 'Employer', email: 'employer@test.com', password: 'password123' },
      ],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('Seed error:', message, error)
    return NextResponse.json(
      { error: 'Failed to seed database', details: message },
      { status: 500 }
    )
  }
}
