const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');
const { recomputeStudentStats } = require('../services/studentStatsService');
const { attendanceCategory } = require('../utils/grading');

// @desc    Get attendance records (filterable by department/course/semester/date/student)
// @route   GET /api/attendance
const getAttendance = asyncHandler(async (req, res) => {
  const { department, course, semester, date, student, sort, page, limit } = req.query;
  const query = {};
  if (department) query.department = department;
  if (course) query.course = course;
  if (semester) query.semester = Number(semester);
  if (student) query.student = student;
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.date = { $gte: start, $lte: end };
  }

  const { data, meta } = await paginate(Attendance, query, {
    page,
    limit: limit || 100,
    sort: sort || '-date',
    populate: ['student', 'course', 'department'],
  });

  return sendSuccess(res, 200, 'Attendance fetched', data, meta);
});

// @desc    Bulk mark/save attendance for a class on a given date
// @route   POST /api/attendance
// body: { course, department, semester, date, records: [{ student, status, remarks }] }
const markAttendance = asyncHandler(async (req, res) => {
  const { course, department, semester, date, records } = req.body;

  if (!Array.isArray(records) || records.length === 0) {
    return res.status(400).json({ success: false, message: 'No attendance records provided' });
  }

  const ops = records.map((r) => ({
    updateOne: {
      filter: { student: r.student, course, date: new Date(date) },
      update: {
        $set: {
          student: r.student,
          course,
          department,
          semester,
          date: new Date(date),
          status: r.status,
          remarks: r.remarks || '',
          markedBy: req.user?.faculty || undefined,
        },
      },
      upsert: true,
    },
  }));

  await Attendance.bulkWrite(ops);

  // Recompute affected students' cached attendance %
  const studentIds = [...new Set(records.map((r) => r.student))];
  await Promise.all(studentIds.map((id) => recomputeStudentStats(id)));

  return sendSuccess(res, 201, 'Attendance saved successfully', { count: records.length });
});

// @desc    Update a single attendance record
// @route   PUT /api/attendance/:id
const updateAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!attendance) return res.status(404).json({ success: false, message: 'Attendance record not found' });

  await recomputeStudentStats(attendance.student);
  return sendSuccess(res, 200, 'Attendance updated successfully', attendance);
});

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
const deleteAttendance = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id);
  if (!attendance) return res.status(404).json({ success: false, message: 'Attendance record not found' });
  await attendance.deleteOne();
  await recomputeStudentStats(attendance.student);
  return sendSuccess(res, 200, 'Attendance record deleted successfully');
});

// @desc    Attendance summary/history for a specific student
// @route   GET /api/attendance/student/:studentId
const getStudentAttendanceHistory = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ student: req.params.studentId }).populate('course').sort('-date');
  const student = await Student.findById(req.params.studentId);

  const total = records.length;
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const late = records.filter((r) => r.status === 'Late').length;
  const percentage = total > 0 ? Math.round(((present + late) / total) * 10000) / 100 : 0;

  return sendSuccess(res, 200, 'Attendance history fetched', {
    records,
    summary: {
      total,
      present,
      absent,
      late,
      percentage,
      category: attendanceCategory(percentage),
      belowThreshold: percentage < 75,
    },
  });
});

module.exports = {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceHistory,
};
