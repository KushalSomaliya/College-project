import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4">
          Skill Orbit
        </h1>
        <p className="text-lg text-[var(--foreground)]/80 mb-8 max-w-md mx-auto">
          Connect employees with freelance opportunities. Find jobs, build your portfolio, and earn while you learn.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-3 border border-gray-300 text-foreground rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-foreground mb-2">Find Jobs</h3>
            <p className="text-sm text-gray-500">
              Browse freelance opportunities tailored for employees
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-foreground mb-2">Build Portfolio</h3>
            <p className="text-sm text-gray-500">
              Showcase your work and grow your professional profile
            </p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-foreground mb-2">Earn & Learn</h3>
            <p className="text-sm text-gray-500">
              Gain real-world experience while funding your education
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}