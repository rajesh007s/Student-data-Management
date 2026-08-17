const Student = require('../models/Student');
const Course = require('../models/Course');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');

// @desc    Get all students (search, filter, sort, paginate)
// @route   GET /api/students
const getStudents = asyncHandler(async (req, res) => {
  const { search, department, course, year, semester, status, sort, page, limit } = req.query;

  const query = {};
  if (search) query.$text = { $search: search };
  if (department) query.department = department;
  if (course) query.course = course;
  if (year) query.year = Number(year);
  if (semester) query.semester = Number(semester);
  if (status) query.status = status;

  const { data, meta } = await paginate(Student, query, {
    page,
    limit,
    sort: sort || '-createdAt',
    populate: ['department', 'course'],
  });

  return sendSuccess(res, 200, 'Students fetched', data, meta);
});

// @desc    Get single student by id
// @route   GET /api/students/:id
const getStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id).populate('department').populate('course');
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
  return sendSuccess(res, 200, 'Student fetched', student);
});

// @desc    Create student
// @route   POST /api/students
const createStudent = asyncHandler(async (req, res) => {
  const student = await Student.create(req.body);

  if (student.course) {
    await Course.findByIdAndUpdate(student.course, { $addToSet: { students: student._id } });
  }

  await Activity.create({
    action: 'Student Added',
    description: `${student.name} was added to the system`,
    entityType: 'Student',
    entityId: student._id,
    performedBy: req.user?._id,
    icon: 'user-plus',
  });

  await Notification.create({
    title: 'New Student Registration',
    message: `${student.name} (${student.studentId}) has been registered`,
    type: 'registration',
    recipientRole: 'admin',
    relatedStudent: student._id,
  });

  return sendSuccess(res, 201, 'Student added successfully', student);
});

// @desc    Update student
// @route   PUT /api/students/:id
const updateStudent = asyncHandler(async (req, res) => {
  const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  await Activity.create({
    action: 'Student Updated',
    description: `${student.name}'s record was updated`,
    entityType: 'Student',
    entityId: student._id,
    performedBy: req.user?._id,
    icon: 'edit',
  });

  return sendSuccess(res, 200, 'Student updated successfully', student);
});

// @desc    Delete student
// @route   DELETE /api/students/:id
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  await student.deleteOne();
  await Course.updateMany({ students: student._id }, { $pull: { students: student._id } });

  await Activity.create({
    action: 'Student Deleted',
    description: `${student.name} was removed from the system`,
    entityType: 'Student',
    performedBy: req.user?._id,
    icon: 'user-x',
  });

  return sendSuccess(res, 200, 'Student deleted successfully');
});

// @desc    Export students as CSV
// @route   GET /api/students/export/csv
const exportStudentsCSV = asyncHandler(async (req, res) => {
  const students = await Student.find().populate('department').populate('course');

  const headers = [
    'Student ID', 'Roll Number', 'Name', 'Email', 'Phone', 'Department',
    'Course', 'Year', 'Semester', 'Attendance %', 'CGPA', 'Status',
  ];

  const rows = students.map((s) => [
    s.studentId, s.rollNumber, s.name, s.email, s.phone,
    s.department?.name || '', s.course?.courseName || '', s.year, s.semester,
    s.attendancePercentage, s.cgpa, s.status,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map((v) => `"${v}"`).join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=students.csv');
  return res.send(csv);
});

// @desc    Smart insights - at-risk students, high performers, declining, pending fees
// @route   GET /api/students/insights/smart
const getSmartInsights = asyncHandler(async (req, res) => {
  const [lowAttendance, highPerformers, pendingFees, allStudents] = await Promise.all([
    Student.find({ attendancePercentage: { $lt: 75 } }).populate('department').populate('course'),
    Student.find({ cgpa: { $gte: 8.5 } }).populate('department').populate('course'),
    Student.find({ pendingFees: { $gt: 0 } }).populate('department').populate('course'),
    Student.find(),
  ]);

  const atRisk = allStudents
    .filter((s) => s.attendancePercentage < 75 || s.cgpa < 5 || s.backlogs > 0)
    .map((s) => {
      const reasons = [];
      if (s.attendancePercentage < 75) reasons.push('Low Attendance');
      if (s.cgpa < 5) reasons.push('Low CGPA');
      if (s.backlogs > 0) reasons.push(`${s.backlogs} Backlog(s)`);

      let recommendation = 'Monitor progress closely.';
      if (s.attendancePercentage < 75) recommendation = 'Student should improve attendance before the next examination.';
      else if (s.cgpa < 5) recommendation = 'Consider academic counseling and remedial classes.';
      else if (s.backlogs > 0) recommendation = 'Encourage backlog clearance in the upcoming exam cycle.';

      return {
        studentId: s._id,
        name: s.name,
        rollNumber: s.rollNumber,
        attendance: s.attendancePercentage,
        cgpa: s.cgpa,
        risk: reasons.join(', '),
        recommendation,
      };
    })
    .sort((a, b) => a.attendance - b.attendance)
    .slice(0, 20);

  return sendSuccess(res, 200, 'Smart insights generated', {
    summary: [
      `${lowAttendance.length} students have attendance below 75%.`,
      `${highPerformers.length} students are performing excellently (CGPA 8.5+).`,
      `${pendingFees.length} students have pending fees.`,
      `${atRisk.length} students are flagged as academically at-risk.`,
    ],
    counts: {
      lowAttendance: lowAttendance.length,
      highPerformers: highPerformers.length,
      pendingFees: pendingFees.length,
      atRisk: atRisk.length,
    },
    atRiskStudents: atRisk,
    highPerformers: highPerformers.slice(0, 10),
  });
});

module.exports = {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentsCSV,
  getSmartInsights,
};
