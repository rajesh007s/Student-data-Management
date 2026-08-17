const mongoose = require('mongoose');

const feeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },
    feeType: {
      type: String,
      enum: ['Tuition', 'Hostel', 'Library', 'Lab', 'Exam', 'Transport', 'Other'],
      default: 'Tuition',
    },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    pendingAmount: { type: Number, default: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: ['Paid', 'Partial', 'Pending', 'Overdue'], default: 'Pending' },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ['Cash', 'Card', 'UPI', 'Bank Transfer', 'Cheque', ''], default: '' },
    transactionId: { type: String, default: '' },
    receiptNumber: { type: String, default: '' },
    recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

feeSchema.pre('save', function (next) {
  this.pendingAmount = Math.max(0, this.totalAmount - this.paidAmount);
  if (this.pendingAmount === 0) this.status = 'Paid';
  else if (this.paidAmount > 0) this.status = 'Partial';
  else if (this.dueDate < new Date()) this.status = 'Overdue';
  else this.status = 'Pending';
  next();
});

module.exports = mongoose.model('Fee', feeSchema);
