'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export type UserType = 'student' | 'employer'

export interface User {
  id: string
  name: string
  email: string
  userType: UserType
  profilePicture?: string
  // Student specific fields
  university?: string
  skills?: string[]
  rating?: number
  completedGigs?: number
  // Employer specific fields
  company?: string
  verified?: boolean
  totalHired?: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users data
const mockUsers: Record<string, User> = {
  'test@example.com': {
    id: '1',
    name: 'John Doe',
    email: 'test@example.com',
    userType: 'student',
    university: 'University of Technology',
    skills: ['React', 'Node.js', 'Python', 'UI/UX Design'],
    rating: 4.8,
    completedGigs: 12
  },
  'employer@example.com': {
    id: '2',
    name: 'Sarah Johnson',
    email: 'employer@example.com',
    userType: 'employer',
    company: 'TechStart Inc.',
    verified: true,
    totalHired: 8
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setIsLoading(false)
        return true
      }
      
      setIsLoading(false)
      return false
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return false
    }
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}