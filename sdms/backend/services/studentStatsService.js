const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const Mark = require('../models/Mark');
const Fee = require('../models/Fee');

// Recalculates and persists a student's attendance %, CGPA, backlog count, and fee totals.
// Called after any attendance/mark/fee record is created, updated, or deleted.
async function recomputeStudentStats(studentId) {
  const [attendanceRecords, markRecords, feeRecords] = await Promise.all([
    Attendance.find({ student: studentId }),
    Mark.find({ student: studentId }),
    Fee.find({ student: studentId }),
  ]);

  // Attendance %
  let attendancePercentage = 0;
  if (attendanceRecords.length > 0) {
    const presentOrLate = attendanceRecords.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    attendancePercentage = Math.round((presentOrLate / attendanceRecords.length) * 100 * 100) / 100;
  }

  // CGPA = average GPA across all mark records
  let cgpa = 0;
  let backlogs = 0;
  if (markRecords.length > 0) {
    const gpaSum = markRecords.reduce((sum, m) => sum + (m.gpa || 0), 0);
    cgpa = Math.round((gpaSum / markRecords.length) * 100) / 100;
    backlogs = markRecords.filter((m) => m.grade === 'F').length;
  }

  // Fees
  const totalFees = feeRecords.reduce((sum, f) => sum + (f.totalAmount || 0), 0);
  const paidFees = feeRecords.reduce((sum, f) => sum + (f.paidAmount || 0), 0);
  const pendingFees = Math.max(0, totalFees - paidFees);

  await Student.findByIdAndUpdate(studentId, {
    attendancePercentage,
    cgpa,
    backlogs,
    totalFees,
    paidFees,
    pendingFees,
  });
}

module.exports = { recomputeStudentStats };
