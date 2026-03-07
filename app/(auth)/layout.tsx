export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">
            Skill Orbit
          </h1>
          <p className="text-sm text-[var(--foreground)]/60">
            Connect. Work. Grow.
          </p>
        </div>
        {children}
      </div>
    </div>
  )
}