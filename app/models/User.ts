import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  name: string
  email: string
  password: string
  userType: 'student' | 'employer'
  // Student specific fields
  university?: string
  skills?: string[]
  rating?: number
  completedGigs?: number
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
    enum: ['student', 'employer'],
    required: true,
  },
  // Student specific fields
  university: {
    type: String,
    required: function(this: IUser) { return this.userType === 'student' }
  },
  skills: [{
    type: String,
  }],
  rating: {
    type: Number,
    min: 0,
    max: 5,
  },
  completedGigs: {
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

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema)

export default User