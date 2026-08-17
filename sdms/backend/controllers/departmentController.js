const Department = require('../models/Department');
const Student = require('../models/Student');
const Faculty = require('../models/Faculty');
const Course = require('../models/Course');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.find().populate('headOfDepartment').sort('name');

  // Attach live counts so the frontend doesn't need extra round trips
  const withCounts = await Promise.all(
    departments.map(async (d) => {
      const [studentCount, facultyCount, courseCount] = await Promise.all([
        Student.countDocuments({ department: d._id }),
        Faculty.countDocuments({ department: d._id }),
        Course.countDocuments({ department: d._id }),
      ]);
      return { ...d.toObject(), studentCount, facultyCount, courseCount };
    })
  );

  return sendSuccess(res, 200, 'Departments fetched', withCounts);
});

const getDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id).populate('headOfDepartment');
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  return sendSuccess(res, 200, 'Department fetched', department);
});

const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  return sendSuccess(res, 201, 'Department created successfully', department);
});

const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  return sendSuccess(res, 200, 'Department updated successfully', department);
});

const deleteDepartment = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return res.status(404).json({ success: false, message: 'Department not found' });
  await department.deleteOne();
  return sendSuccess(res, 200, 'Department deleted successfully');
});

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
