const Fee = require('../models/Fee');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');
const { recomputeStudentStats } = require('../services/studentStatsService');

const getFees = asyncHandler(async (req, res) => {
  const { search, student, department, status, feeType, sort, page, limit } = req.query;
  const query = {};
  if (student) query.student = student;
  if (department) query.department = department;
  if (status) query.status = status;
  if (feeType) query.feeType = feeType;

  let q = Fee.find(query);
  if (search) {
    // search by receipt/transaction id (student name search handled client-side after populate for simplicity)
    q = q.or([
      { receiptNumber: { $regex: search, $options: 'i' } },
      { transactionId: { $regex: search, $options: 'i' } },
    ]);
  }

  const { data, meta } = await paginate(Fee, query, {
    page,
    limit,
    sort: sort || '-createdAt',
    populate: ['student', 'department'],
  });

  return sendSuccess(res, 200, 'Fee records fetched', data, meta);
});

const recordPayment = asyncHandler(async (req, res) => {
  const receiptNumber = `RCPT-${Date.now().toString().slice(-8)}`;
  const fee = await Fee.create({ ...req.body, receiptNumber, recordedBy: req.user?._id });
  await recomputeStudentStats(fee.student);
  return sendSuccess(res, 201, 'Payment recorded successfully', fee);
});

const updatePayment = asyncHandler(async (req, res) => {
  const existing = await Fee.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Fee record not found' });
  Object.assign(existing, req.body);
  await existing.save();
  await recomputeStudentStats(existing.student);
  return sendSuccess(res, 200, 'Payment updated successfully', existing);
});

const deletePayment = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id);
  if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });
  await fee.deleteOne();
  await recomputeStudentStats(fee.student);
  return sendSuccess(res, 200, 'Fee record deleted successfully');
});

// @desc    Generate a simple receipt payload (frontend renders/prints it)
// @route   GET /api/fees/:id/receipt
const generateReceipt = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id).populate('student').populate('department');
  if (!fee) return res.status(404).json({ success: false, message: 'Fee record not found' });

  return sendSuccess(res, 200, 'Receipt generated', {
    receiptNumber: fee.receiptNumber || `RCPT-${fee._id.toString().slice(-8)}`,
    studentName: fee.student?.name,
    studentId: fee.student?.studentId,
    department: fee.department?.name,
    feeType: fee.feeType,
    totalAmount: fee.totalAmount,
    paidAmount: fee.paidAmount,
    pendingAmount: fee.pendingAmount,
    paymentDate: fee.paymentDate,
    paymentMethod: fee.paymentMethod,
    status: fee.status,
  });
});

module.exports = { getFees, recordPayment, updatePayment, deletePayment, generateReceipt };
