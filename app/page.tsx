import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#f7f5f0' }}>

      {/* FLOATING SKILL CHIPS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <span className="chip">Coding</span>
        <span className="chip">Graphic Design</span>
        <span className="chip">Video Editing</span>
        <span className="chip">Marketing</span>
        <span className="chip">Research</span>
        <span className="chip">Data Analytics</span>
        <span className="chip">UI / UX</span>
        <span className="chip">Content Writing</span>
        <span className="chip">Web Dev</span>
        <span className="chip">Photography</span>
        <span className="chip">Social Media</span>
        <span className="chip">Translation</span>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-10 flex justify-between items-center px-12 py-6 border-b border-black/[0.07]" style={{ background: 'rgba(247,245,240,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="font-bold text-xl tracking-tight text-[#111]" style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.03em' }}>
          Skill<span className="text-[#e85d2f]">Orbit</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/sign-in" className="text-sm text-[#555] hover:text-[#111] transition-colors">Sign In</Link>
          <Link href="/sign-up" className="text-sm bg-[#111] text-white px-5 py-2.5 rounded-full font-medium hover:bg-[#333] transition-colors">Get Started</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-[1] max-w-[680px] mx-auto mt-28 mb-20 px-8 text-center">
        <div
          className="inline-block bg-[#fff7f4] border border-[#fdd5c7] text-[#e85d2f] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-7 uppercase tracking-wider"
          style={{ animation: 'fadeUp 0.5s ease both', letterSpacing: '0.04em' }}
        >
          College Freelance Platform
        </div>
        <h1
          className="text-[clamp(2.5rem,5vw,3.75rem)] font-extrabold text-[#111] leading-[1.08] mb-5"
          style={{ fontFamily: "'Syne', sans-serif", letterSpacing: '-0.04em', animation: 'fadeUp 0.5s 0.1s ease both' }}
        >
          Find work that fits<br />your <em className="text-[#e85d2f] italic">skills.</em>
        </h1>
        <p
          className="text-base text-[#777] leading-relaxed font-light mb-10"
          style={{ animation: 'fadeUp 0.5s 0.2s ease both', lineHeight: 1.7 }}
        >
          Connect employees with freelance opportunities. Find jobs, browse jobs, apply, and build your portfolio, all in one place.
        </p>
        <div className="flex gap-3 justify-center" style={{ animation: 'fadeUp 0.5s 0.3s ease both' }}>
          <Link
            href="/sign-up"
            className="bg-[#e85d2f] text-white px-7 py-3.5 rounded-full font-medium text-[0.95rem] hover:-translate-y-0.5 transition-transform"
            style={{ boxShadow: '0 4px 16px rgba(232,93,47,0.3)' }}
          >
            Create Account
          </Link>
          <Link
            href="/sign-in"
            className="bg-transparent text-[#111] px-7 py-3.5 rounded-full font-medium text-[0.95rem] border-[1.5px] border-[#ddd] hover:border-[#111] transition-colors"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* FEATURE CARDS */}
      <div
        className="relative z-[1] max-w-[900px] mx-auto mb-24 px-8 grid grid-cols-1 sm:grid-cols-3 gap-5"
        style={{ animation: 'fadeUp 0.5s 0.4s ease both' }}
      >
        <div className="border border-[#ede9e3] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-lg transition-all" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="text-2xl mb-4">&#128269;</div>
          <h3 className="text-base font-bold text-[#111] mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>Browse Jobs</h3>
          <p className="text-sm text-[#888] leading-relaxed font-light">Browse freelance opportunities tailored for employees</p>
        </div>
        <div className="border border-[#ede9e3] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-lg transition-all" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="text-2xl mb-4">&#128193;</div>
          <h3 className="text-base font-bold text-[#111] mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>Build Your Portfolio</h3>
          <p className="text-sm text-[#888] leading-relaxed font-light">Showcase your work and grow your professional profile</p>
        </div>
        <div className="border border-[#ede9e3] rounded-2xl p-7 hover:-translate-y-1 hover:shadow-lg transition-all" style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(8px)' }}>
          <div className="text-2xl mb-4">&#127891;</div>
          <h3 className="text-base font-bold text-[#111] mb-1.5" style={{ fontFamily: "'Syne', sans-serif" }}>Earn While You Study</h3>
          <p className="text-sm text-[#888] leading-relaxed font-light">Gain real-world experience while funding your education</p>
        </div>
      </div>

      <hr className="relative z-[1] max-w-[900px] mx-auto mb-12 border-t border-[#ede9e3]" />
      <footer className="relative z-[1] text-center pb-8 text-xs text-[#bbb]">
        &copy; 2026 Skill Orbit &middot; Built for college students
      </footer>
    </div>
  )
}
