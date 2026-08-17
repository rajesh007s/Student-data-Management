const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' },
    remarks: { type: String, default: '' },
  },
  { timestamps: true }
);

// One attendance record per student, per course, per day
attendanceSchema.index({ student: 1, course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
