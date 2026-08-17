const Course = require('../models/Course');
const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');

const getCourses = asyncHandler(async (req, res) => {
  const { search, department, semester, status, sort, page, limit } = req.query;
  const query = {};
  if (search) query.courseName = { $regex: search, $options: 'i' };
  if (department) query.department = department;
  if (semester) query.semester = Number(semester);
  if (status) query.status = status;

  const { data, meta } = await paginate(Course, query, {
    page,
    limit,
    sort: sort || 'courseName',
    populate: ['department', 'faculty'],
  });

  return sendSuccess(res, 200, 'Courses fetched', data, meta);
});

const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate('department').populate('faculty').populate('students');
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  return sendSuccess(res, 200, 'Course fetched', course);
});

const createCourse = asyncHandler(async (req, res) => {
  const course = await Course.create(req.body);
  return sendSuccess(res, 201, 'Course created successfully', course);
});

const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  return sendSuccess(res, 200, 'Course updated successfully', course);
});

const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
  await course.deleteOne();
  await Faculty.updateMany({ assignedCourses: course._id }, { $pull: { assignedCourses: course._id } });
  return sendSuccess(res, 200, 'Course deleted successfully');
});

// @desc    Assign a student to a course
// @route   PUT /api/courses/:id/assign-student
const assignStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  const course = await Course.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { students: studentId } },
    { new: true }
  ).populate('students');
  if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

  await Student.findByIdAndUpdate(studentId, { course: course._id });

  return sendSuccess(res, 200, 'Student assigned to course', course);
});

module.exports = { getCourses, getCourse, createCourse, updateCourse, deleteCourse, assignStudent };
