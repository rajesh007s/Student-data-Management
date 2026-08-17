const Mark = require('../models/Mark');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');
const { recomputeStudentStats } = require('../services/studentStatsService');
const { calculateTotals } = require('../utils/grading');

const getMarks = asyncHandler(async (req, res) => {
  const { student, course, semester, subject, examType, sort, page, limit } = req.query;
  const query = {};
  if (student) query.student = student;
  if (course) query.course = course;
  if (semester) query.semester = Number(semester);
  if (subject) query.subject = { $regex: subject, $options: 'i' };
  if (examType) query.examType = examType;

  const { data, meta } = await paginate(Mark, query, {
    page,
    limit: limit || 100,
    sort: sort || '-createdAt',
    populate: ['student', 'course'],
  });

  return sendSuccess(res, 200, 'Marks fetched', data, meta);
});

const createMark = asyncHandler(async (req, res) => {
  const mark = await Mark.create({ ...req.body, recordedBy: req.user?.faculty });
  await recomputeStudentStats(mark.student);
  return sendSuccess(res, 201, 'Marks recorded successfully', mark);
});

const updateMark = asyncHandler(async (req, res) => {
  const existing = await Mark.findById(req.params.id);
  if (!existing) return res.status(404).json({ success: false, message: 'Mark record not found' });

  Object.assign(existing, req.body);
  // pre-save hook recalculates total/percentage/grade/gpa
  await existing.save();

  await recomputeStudentStats(existing.student);
  return sendSuccess(res, 200, 'Marks updated successfully', existing);
});

const deleteMark = asyncHandler(async (req, res) => {
  const mark = await Mark.findById(req.params.id);
  if (!mark) return res.status(404).json({ success: false, message: 'Mark record not found' });
  await mark.deleteOne();
  await recomputeStudentStats(mark.student);
  return sendSuccess(res, 200, 'Mark record deleted successfully');
});

// @desc    Marks/performance summary for one student across subjects
// @route   GET /api/marks/student/:studentId
const getStudentMarksSummary = asyncHandler(async (req, res) => {
  const records = await Mark.find({ student: req.params.studentId }).populate('course').sort('subject');
  const avgPercentage = records.length
    ? Math.round((records.reduce((s, r) => s + r.percentage, 0) / records.length) * 100) / 100
    : 0;
  const avgGpa = records.length
    ? Math.round((records.reduce((s, r) => s + r.gpa, 0) / records.length) * 100) / 100
    : 0;

  return sendSuccess(res, 200, 'Marks summary fetched', {
    records,
    summary: { avgPercentage, avgGpa, subjectCount: records.length },
  });
});

module.exports = { getMarks, createMark, updateMark, deleteMark, getStudentMarksSummary };
