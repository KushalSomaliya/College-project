import mongoose from 'mongoose'

export interface IGig extends mongoose.Document {
  title: string
  description: string
  requirements: string
  company: string
  employerId: mongoose.Types.ObjectId
  employerName: string
  budget: number
  budgetType: 'fixed' | 'hourly'
  duration: string
  skills: string[]
  applicationsCount: number
  postedDate: Date
  deadline: Date
  status: 'active' | 'closed' | 'completed' | 'draft'
  category: string
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  locationType: 'remote' | 'on-site' | 'hybrid'
  studentsNeeded: number
  createdAt: Date
  updatedAt: Date
}

const GigSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  requirements: {
    type: String,
    default: '',
  },
  company: {
    type: String,
    required: true,
  },
  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employerName: {
    type: String,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
    min: 5,
    max: 10000,
  },
  budgetType: {
    type: String,
    enum: ['fixed', 'hourly'],
    default: 'fixed',
  },
  duration: {
    type: String,
    required: true,
  },
  skills: [{
    type: String,
  }],
  applicationsCount: {
    type: Number,
    default: 0,
  },
  postedDate: {
    type: Date,
    default: Date.now,
  },
  deadline: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'completed', 'draft'],
    default: 'active',
  },
  category: {
    type: String,
    required: true,
  },
  experienceLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true,
  },
  locationType: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    default: 'remote',
  },
  studentsNeeded: {
    type: Number,
    default: 1,
    min: 1,
  },
}, {
  timestamps: true,
})

const Gig = mongoose.models.Gig || mongoose.model<IGig>('Gig', GigSchema)

export default Gig