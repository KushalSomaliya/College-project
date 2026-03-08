'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserType = 'employee' | 'employer'

export interface User {
  id: string
  name: string
  email: string
  userType: UserType
  role: 'user' | 'admin'
  profilePicture?: string
  // Employee specific fields
  university?: string
  skills?: string[]
  rating?: number
  completedJobs?: number
  // Employer specific fields
  company?: string
  verified?: boolean
  totalHired?: number
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<User | null>
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem('skill-orbit-user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = getStoredUser()
    if (stored) {
      setUser(stored)
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<User | null> => {
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
        localStorage.setItem('skill-orbit-user', JSON.stringify(data.user))
        setIsLoading(false)
        return data.user
      }

      setIsLoading(false)
      return null
    } catch (error) {
      console.error('Login error:', error)
      setIsLoading(false)
      return null
    }
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('skill-orbit-user', JSON.stringify(updatedUser))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('skill-orbit-user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isLoading }}>
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
