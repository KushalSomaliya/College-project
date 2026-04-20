export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: '#ffffff' }}>

      {/* FLOATING CHIPS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <span className="chip">Coding</span>
        <span className="chip">Graphic Design</span>
        <span className="chip">Video Editing</span>
        <span className="chip">Marketing</span>
        <span className="chip">Research</span>
        <span className="chip">Data Analytics</span>
        <span className="chip">UI / UX</span>
        <span className="chip">Content Writing</span>
      </div>

      {/* FORM AREA */}
      <div className="relative z-[1] flex-1 flex items-center justify-center p-6 sm:p-12">
        {children}
      </div>
    </div>
  )
}
