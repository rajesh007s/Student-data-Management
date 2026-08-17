const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema(
  {
    facultyId: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    profilePhoto: { type: String, default: '' },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    designation: {
      type: String,
      enum: ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Head of Department'],
      required: true,
    },
    joiningDate: { type: Date, required: true },
    assignedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
    qualification: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive', 'on-leave'], default: 'active' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Faculty', facultySchema);
