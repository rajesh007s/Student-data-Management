const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Department = require('../models/Department');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Global instant search across students, faculty, courses, departments
// @route   GET /api/search?q=...
const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return sendSuccess(res, 200, 'Search results', { students: [], faculty: [], courses: [], departments: [] });
  }

  const regex = { $regex: q, $options: 'i' };

  const [students, faculty, courses, departments] = await Promise.all([
    Student.find({ $or: [{ name: regex }, { studentId: regex }, { rollNumber: regex }, { email: regex }] })
      .limit(5)
      .populate('department', 'name'),
    Faculty.find({ $or: [{ name: regex }, { facultyId: regex }, { email: regex }] })
      .limit(5)
      .populate('department', 'name'),
    Course.find({ $or: [{ courseName: regex }, { courseCode: regex }] }).limit(5),
    Department.find({ $or: [{ name: regex }, { code: regex }] }).limit(5),
  ]);

  return sendSuccess(res, 200, 'Search results', { students, faculty, courses, departments });
});

module.exports = { globalSearch };
