const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');
const Faculty = require('../models/Faculty');
const Department = require('../models/Department');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const buildStudentFilter = (query) => {
  const filter = {};
  if (query.department) filter.department = query.department;
  if (query.course) filter.course = query.course;
  if (query.semester) filter.semester = Number(query.semester);
  if (query.student) filter._id = query.student;
  return filter;
};

// @desc    Student report
// @route   GET /api/reports/students
const studentReport = asyncHandler(async (req, res) => {
  const students = await Student.find(buildStudentFilter(req.query)).populate('department').populate('course');
  return sendSuccess(res, 200, 'Student report generated', {
    count: students.length,
    students,
  });
});

// @desc    Attendance report
// @route   GET /api/reports/attendance
const attendanceReport = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.course) filter.course = req.query.course;
  if (req.query.semester) filter.semester = Number(req.query.semester);
  if (req.query.date) {
    const start = new Date(req.query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(req.query.date);
    end.setHours(23, 59, 59, 999);
    filter.date = { $gte: start, $lte: end };
  }

  const records = await Attendance.find(filter).populate('student').populate('course');
  const present = records.filter((r) => r.status === 'Present').length;
  const absent = records.filter((r) => r.status === 'Absent').length;
  const late = records.filter((r) => r.status === 'Late').length;

  return sendSuccess(res, 200, 'Attendance report generated', {
    count: records.length,
    summary: { present, absent, late },
    records,
  });
});

// @desc    Marks report
// @route   GET /api/reports/marks
const marksReport = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.course) filter.course = req.query.course;
  if (req.query.semester) filter.semester = Number(req.query.semester);
  if (req.query.student) filter.student = req.query.student;

  const records = await Mark.find(filter).populate('student').populate('course');
  const avgPercentage = records.length
    ? Math.round((records.reduce((s, r) => s + r.percentage, 0) / records.length) * 100) / 100
    : 0;

  return sendSuccess(res, 200, 'Marks report generated', {
    count: records.length,
    avgPercentage,
    records,
  });
});

// @desc    Fee report
// @route   GET /api/reports/fees
const feeReport = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  if (req.query.student) filter.student = req.query.student;
  if (req.query.status) filter.status = req.query.status;

  const records = await Fee.find(filter).populate('student').populate('department');
  const totalCollected = records.reduce((s, r) => s + r.paidAmount, 0);
  const totalPending = records.reduce((s, r) => s + r.pendingAmount, 0);

  return sendSuccess(res, 200, 'Fee report generated', {
    count: records.length,
    totalCollected,
    totalPending,
    records,
  });
});

// @desc    Faculty report
// @route   GET /api/reports/faculty
const facultyReport = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.department) filter.department = req.query.department;
  const faculty = await Faculty.find(filter).populate('department').populate('assignedCourses');
  return sendSuccess(res, 200, 'Faculty report generated', { count: faculty.length, faculty });
});

// @desc    Department report
// @route   GET /api/reports/departments
const departmentReport = asyncHandler(async (req, res) => {
  const departments = await Department.find();
  const data = await Promise.all(
    departments.map(async (d) => {
      const [studentCount, facultyCount, students] = await Promise.all([
        Student.countDocuments({ department: d._id }),
        Faculty.countDocuments({ department: d._id }),
        Student.find({ department: d._id }),
      ]);
      const avgCgpa = students.length
        ? Math.round((students.reduce((s, x) => s + x.cgpa, 0) / students.length) * 100) / 100
        : 0;
      const avgAttendance = students.length
        ? Math.round((students.reduce((s, x) => s + x.attendancePercentage, 0) / students.length) * 100) / 100
        : 0;
      return { department: d.name, code: d.code, studentCount, facultyCount, avgCgpa, avgAttendance };
    })
  );
  return sendSuccess(res, 200, 'Department report generated', data);
});

module.exports = { studentReport, attendanceReport, marksReport, feeReport, facultyReport, departmentReport };
