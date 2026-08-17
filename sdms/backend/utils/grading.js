// Central grading logic so it's never duplicated across controllers/models.

const GRADE_SCALE = [
  { min: 90, grade: 'A+', gpa: 10 },
  { min: 80, grade: 'A', gpa: 9 },
  { min: 70, grade: 'B+', gpa: 8 },
  { min: 60, grade: 'B', gpa: 7 },
  { min: 50, grade: 'C+', gpa: 6 },
  { min: 40, grade: 'C', gpa: 5 },
  { min: 33, grade: 'D', gpa: 4 },
  { min: 0, grade: 'F', gpa: 0 },
];

function calculateTotals({ internal = 0, assignment = 0, practical = 0, external = 0, maxTotal = 100 }) {
  const total = Number(internal) + Number(assignment) + Number(practical) + Number(external);
  const percentage = maxTotal > 0 ? Math.round((total / maxTotal) * 10000) / 100 : 0;
  const { grade, gpa } = GRADE_SCALE.find((g) => percentage >= g.min);
  return { total, percentage, grade, gpa };
}

function attendanceCategory(percentage) {
  if (percentage >= 90) return 'Excellent';
  if (percentage >= 75) return 'Good';
  if (percentage >= 60) return 'Warning';
  return 'Critical';
}

module.exports = { calculateTotals, attendanceCategory, GRADE_SCALE };
