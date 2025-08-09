import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-[var(--foreground)] mb-4">
          Student Freelancer Hub
        </h1>
        <p className="text-lg text-[var(--foreground)]/80 mb-8 max-w-md mx-auto">
          Connect students with freelance opportunities. Find gigs, build your portfolio, and earn while you learn.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/sign-up"
            className="px-6 py-3 bg-[var(--foreground)] text-[var(--background)] rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/sign-in"
            className="px-6 py-3 border border-[var(--foreground)]/20 text-[var(--foreground)] rounded-md font-medium hover:bg-[var(--foreground)]/5 transition-colors"
          >
            Sign In
          </Link>
        </div>
        
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="p-6 border border-[var(--foreground)]/10 rounded-lg">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Find Gigs</h3>
            <p className="text-sm text-[var(--foreground)]/60">
              Browse freelance opportunities tailored for students
            </p>
          </div>
          <div className="p-6 border border-[var(--foreground)]/10 rounded-lg">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Build Portfolio</h3>
            <p className="text-sm text-[var(--foreground)]/60">
              Showcase your work and grow your professional profile
            </p>
          </div>
          <div className="p-6 border border-[var(--foreground)]/10 rounded-lg">
            <h3 className="font-semibold text-[var(--foreground)] mb-2">Earn & Learn</h3>
            <p className="text-sm text-[var(--foreground)]/60">
              Gain real-world experience while funding your education
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}