const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Department = require('../models/Department');
const Fee = require('../models/Fee');
const Activity = require('../models/Activity');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Aggregated dashboard stats + chart-ready data
// @route   GET /api/dashboard
const getDashboardData = asyncHandler(async (req, res) => {
  const [
    totalStudents,
    totalFaculty,
    totalCourses,
    students,
    fees,
    recentStudents,
    recentActivities,
    departments,
  ] = await Promise.all([
    Student.countDocuments(),
    Faculty.countDocuments(),
    Course.countDocuments(),
    Student.find(),
    Fee.find(),
    Student.find().sort('-createdAt').limit(5).populate('department').populate('course'),
    Activity.find().sort('-createdAt').limit(10).populate('performedBy', 'name role'),
    Department.find(),
  ]);

  const avgAttendance = students.length
    ? Math.round((students.reduce((s, x) => s + (x.attendancePercentage || 0), 0) / students.length) * 100) / 100
    : 0;
  const avgCgpa = students.length
    ? Math.round((students.reduce((s, x) => s + (x.cgpa || 0), 0) / students.length) * 100) / 100
    : 0;
  const feesCollected = fees.reduce((s, f) => s + (f.paidAmount || 0), 0);
  const pendingFees = fees.reduce((s, f) => s + (f.pendingAmount || 0), 0);

  // Enrollment trend by admission month (last 12 months)
  const now = new Date();
  const enrollmentTrend = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString('default', { month: 'short', year: '2-digit' });
    const count = students.filter((s) => {
      const ad = new Date(s.admissionDate);
      return ad.getFullYear() === d.getFullYear() && ad.getMonth() === d.getMonth();
    }).length;
    enrollmentTrend.push({ month: monthLabel, students: count });
  }

  // Department-wise student distribution
  const deptDistribution = await Promise.all(
    departments.map(async (d) => ({
      department: d.name,
      students: await Student.countDocuments({ department: d._id }),
    }))
  );

  // Attendance overview buckets
  const attendanceBuckets = [
    { name: 'Excellent (90%+)', value: students.filter((s) => s.attendancePercentage >= 90).length },
    { name: 'Good (75-89%)', value: students.filter((s) => s.attendancePercentage >= 75 && s.attendancePercentage < 90).length },
    { name: 'Warning (60-74%)', value: students.filter((s) => s.attendancePercentage >= 60 && s.attendancePercentage < 75).length },
    { name: 'Critical (<60%)', value: students.filter((s) => s.attendancePercentage < 60).length },
  ];

  // Academic performance buckets (by CGPA)
  const performanceBuckets = [
    { name: 'Excellent (9-10)', value: students.filter((s) => s.cgpa >= 9).length },
    { name: 'Good (7-9)', value: students.filter((s) => s.cgpa >= 7 && s.cgpa < 9).length },
    { name: 'Average (5-7)', value: students.filter((s) => s.cgpa >= 5 && s.cgpa < 7).length },
    { name: 'Below Average (<5)', value: students.filter((s) => s.cgpa < 5).length },
  ];

  // Fee collection by month (last 6 months, based on paymentDate)
  const feeCollectionTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthLabel = d.toLocaleString('default', { month: 'short' });
    const collected = fees
      .filter((f) => f.paymentDate && new Date(f.paymentDate).getFullYear() === d.getFullYear() && new Date(f.paymentDate).getMonth() === d.getMonth())
      .reduce((s, f) => s + f.paidAmount, 0);
    feeCollectionTrend.push({ month: monthLabel, collected });
  }

  const atRiskCount = students.filter((s) => s.attendancePercentage < 75 || s.cgpa < 5 || s.backlogs > 0).length;

  return sendSuccess(res, 200, 'Dashboard data fetched', {
    stats: {
      totalStudents,
      totalFaculty,
      totalCourses,
      avgAttendance,
      avgCgpa,
      feesCollected,
      pendingFees,
      atRiskCount,
    },
    charts: {
      enrollmentTrend,
      deptDistribution,
      attendanceBuckets,
      performanceBuckets,
      feeCollectionTrend,
      feesPaidVsPending: [
        { name: 'Paid', value: feesCollected },
        { name: 'Pending', value: pendingFees },
      ],
    },
    recentStudents,
    recentActivities,
  });
});

module.exports = { getDashboardData };
