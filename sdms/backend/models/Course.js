const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    credits: { type: Number, required: true, min: 1, max: 10 },
    semester: { type: Number, required: true, min: 1, max: 8 },
    faculty: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Faculty' }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    description: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  },
  { timestamps: true }
);

courseSchema.virtual('studentCount').get(function () {
  return this.students ? this.students.length : 0;
});
courseSchema.set('toJSON', { virtuals: true });
courseSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Course', courseSchema);
