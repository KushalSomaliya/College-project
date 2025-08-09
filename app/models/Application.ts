import mongoose from 'mongoose'

export interface IApplication extends mongoose.Document {
  gigId: mongoose.Types.ObjectId
  studentId: mongoose.Types.ObjectId
  studentName: string
  studentEmail: string
  studentUniversity?: string
  status: 'pending' | 'accepted' | 'rejected'
  appliedDate: Date
  coverLetter: string
  proposedRate: number
  experience?: string
  createdAt: Date
  updatedAt: Date
}

const ApplicationSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentName: {
    type: String,
    required: true,
  },
  studentEmail: {
    type: String,
    required: true,
  },
  studentUniversity: {
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
    max: 10000,
  },
  experience: {
    type: String,
  },
}, {
  timestamps: true,
})

// Create compound index to ensure a student can only apply once per gig
ApplicationSchema.index({ gigId: 1, studentId: 1 }, { unique: true })

const Application = mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema)

export default Application