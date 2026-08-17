const mongoose = require('mongoose');
const { calculateTotals } = require('../utils/grading');

const markSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    subject: { type: String, required: true, trim: true },
    semester: { type: Number, required: true },
    internalMarks: { type: Number, default: 0, min: 0, max: 20 },
    assignmentMarks: { type: Number, default: 0, min: 0, max: 10 },
    practicalMarks: { type: Number, default: 0, min: 0, max: 20 },
    externalMarks: { type: Number, default: 0, min: 0, max: 50 },
    totalMarks: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },
    gpa: { type: Number, default: 0 },
    examType: { type: String, enum: ['Midterm', 'Final', 'Supplementary'], default: 'Final' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
  },
  { timestamps: true }
);

markSchema.pre('save', function (next) {
  const { total, percentage, grade, gpa } = calculateTotals({
    internal: this.internalMarks,
    assignment: this.assignmentMarks,
    practical: this.practicalMarks,
    external: this.externalMarks,
    maxTotal: 100,
  });
  this.totalMarks = total;
  this.percentage = percentage;
  this.grade = grade;
  this.gpa = gpa;
  next();
});

module.exports = mongoose.model('Mark', markSchema);
