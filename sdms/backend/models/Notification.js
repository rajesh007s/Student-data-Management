const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['registration', 'attendance', 'fees', 'exam', 'announcement', 'system'],
      default: 'announcement',
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // null = broadcast to all
    recipientRole: { type: String, enum: ['admin', 'faculty', 'student', 'all'], default: 'all' },
    relatedStudent: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
