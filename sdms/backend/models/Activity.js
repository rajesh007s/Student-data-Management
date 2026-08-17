const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true }, // e.g. "Student Added", "Payment Recorded"
    description: { type: String, required: true },
    entityType: { type: String, enum: ['Student', 'Faculty', 'Course', 'Attendance', 'Mark', 'Fee', 'User'] },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    icon: { type: String, default: 'activity' }, // lucide-react icon name
  },
  { timestamps: true }
);

module.exports = mongoose.model('Activity', activitySchema);
