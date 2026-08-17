const express = require('express');
const router = express.Router();
const {
  getFacultyList,
  getFacultyMember,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  assignCourse,
} = require('../controllers/facultyController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFacultyList)
  .post(authorize('admin'), createFaculty);

router.route('/:id')
  .get(getFacultyMember)
  .put(authorize('admin'), updateFaculty)
  .delete(authorize('admin'), deleteFaculty);

router.put('/:id/assign-course', authorize('admin'), assignCourse);

module.exports = router;
