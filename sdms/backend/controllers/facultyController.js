const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');

const getFacultyList = asyncHandler(async (req, res) => {
  const { search, department, designation, status, sort, page, limit } = req.query;
  const query = {};
  if (search) query.name = { $regex: search, $options: 'i' };
  if (department) query.department = department;
  if (designation) query.designation = designation;
  if (status) query.status = status;

  const { data, meta } = await paginate(Faculty, query, {
    page,
    limit,
    sort: sort || '-createdAt',
    populate: ['department', 'assignedCourses'],
  });

  return sendSuccess(res, 200, 'Faculty fetched', data, meta);
});

const getFacultyMember = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id).populate('department').populate('assignedCourses');
  if (!faculty) return res.status(404).json({ success: false, message: 'Faculty member not found' });
  return sendSuccess(res, 200, 'Faculty member fetched', faculty);
});

const createFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.create(req.body);

  await Activity.create({
    action: 'Faculty Added',
    description: `${faculty.name} joined as ${faculty.designation}`,
    entityType: 'Faculty',
    entityId: faculty._id,
    performedBy: req.user?._id,
    icon: 'user-plus',
  });

  return sendSuccess(res, 201, 'Faculty added successfully', faculty);
});

const updateFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!faculty) return res.status(404).json({ success: false, message: 'Faculty member not found' });
  return sendSuccess(res, 200, 'Faculty updated successfully', faculty);
});

const deleteFaculty = asyncHandler(async (req, res) => {
  const faculty = await Faculty.findById(req.params.id);
  if (!faculty) return res.status(404).json({ success: false, message: 'Faculty member not found' });

  await faculty.deleteOne();
  await Course.updateMany({ faculty: faculty._id }, { $pull: { faculty: faculty._id } });

  return sendSuccess(res, 200, 'Faculty deleted successfully');
});

// @desc    Assign faculty to a course
// @route   PUT /api/faculty/:id/assign-course
const assignCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const faculty = await Faculty.findByIdAndUpdate(
    req.params.id,
    { $addToSet: { assignedCourses: courseId } },
    { new: true }
  ).populate('assignedCourses');
  if (!faculty) return res.status(404).json({ success: false, message: 'Faculty member not found' });

  await Course.findByIdAndUpdate(courseId, { $addToSet: { faculty: faculty._id } });

  return sendSuccess(res, 200, 'Course assigned successfully', faculty);
});

module.exports = {
  getFacultyList,
  getFacultyMember,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  assignCourse,
};
