const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true, trim: true },
    rollNumber: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    profilePhoto: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
    address: { type: String, default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    year: { type: Number, required: true, min: 1, max: 4 },
    semester: { type: Number, required: true, min: 1, max: 8 },
    section: { type: String, default: 'A' },
    admissionDate: { type: Date, required: true },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    status: { type: String, enum: ['active', 'inactive', 'graduated', 'suspended'], default: 'active' },

    // Derived / cached academic stats (recomputed by services when attendance/marks change)
    attendancePercentage: { type: Number, default: 0, min: 0, max: 100 },
    cgpa: { type: Number, default: 0, min: 0, max: 10 },
    totalFees: { type: Number, default: 0 },
    paidFees: { type: Number, default: 0 },
    pendingFees: { type: Number, default: 0 },
    backlogs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

studentSchema.virtual('performanceScore').get(function () {
  // Weighted score: attendance 30%, cgpa 50% (scaled to 100), backlogs penalty 20%
  const attendanceScore = this.attendancePercentage || 0;
  const cgpaScore = ((this.cgpa || 0) / 10) * 100;
  const backlogPenalty = Math.min((this.backlogs || 0) * 10, 100);
  const score = attendanceScore * 0.3 + cgpaScore * 0.5 - backlogPenalty * 0.2;
  return Math.max(0, Math.round(score));
});

studentSchema.virtual('performanceLabel').get(function () {
  const score = this.performanceScore;
  if (score >= 85) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Average';
  return 'Needs Attention';
});

studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

studentSchema.index({ name: 'text', studentId: 'text', rollNumber: 'text', email: 'text' });

module.exports = mongoose.model('Student', studentSchema);
