import type { Metadata } from 'next'
import { AuthProvider } from './contexts/AuthContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'Skill Orbit',
  description: 'Connect talent with freelance opportunities. Find jobs, build your portfolio, and earn while you learn.',
  icons: {
    icon: '/SO.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
