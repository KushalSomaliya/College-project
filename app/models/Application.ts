import mongoose from 'mongoose'

export interface IApplication extends mongoose.Document {
  jobId: mongoose.Types.ObjectId
  employeeId: mongoose.Types.ObjectId
  employeeName: string
  employeeEmail: string
  employeeUniversity?: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: Date
  coverLetter: string
  proposedRate: number
  experience?: string
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  employeeName: {
    type: String,
    required: true,
  },
  employeeEmail: {
    type: String,
    required: true,
  },
  employeeUniversity: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending',
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  coverLetter: {
    type: String,
    required: true,
  },
  proposedRate: {
    type: Number,
    required: true,
    min: 5,
    max: 1000000,
  },
  experience: {
    type: String,
  },
}, {
  timestamps: true,
})

// Create compound index to ensure an employee can only apply once per job
ApplicationSchema.index({ jobId: 1, employeeId: 1 }, { unique: true })

const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)

export default Application
