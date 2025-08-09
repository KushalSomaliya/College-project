import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from './contexts/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Student Freelancer Hub - Connect, Work, Grow',
  description: 'Connect students with freelance opportunities. Find gigs, build your portfolio, and earn while you learn.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}