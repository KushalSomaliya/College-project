import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  userType: 'employee' | 'employer'
  role: 'user' | 'admin'
  // Employee specific fields
  university?: string
  skills?: string[]
  rating?: number
  completedJobs?: number
  // Employer specific fields
  company?: string
  verified?: boolean
  totalHired?: number
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    enum: ['employee', 'employer'],
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // Employee specific fields
  university: {
    type: String,
    required: function(this: IUser) { return this.userType === 'employee' }
  },
  skills: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  completedJobs: {
    type: Number,
    default: 0,
  },
  // Employer specific fields
  company: {
    type: String,
    required: function(this: IUser) { return this.userType === 'employer' }
  },
  verified: {
    type: Boolean,
    default: false,
  },
  totalHired: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

// In development, delete the cached model so schema changes are picked up
if (process.env.NODE_ENV !== 'production' && mongoose.models.User) {
  delete mongoose.models.User
}

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User
