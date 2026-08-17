const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  assignStudent,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getCourses)
  .post(authorize('admin'), createCourse);

router.route('/:id')
  .get(getCourse)
  .put(authorize('admin'), updateCourse)
  .delete(authorize('admin'), deleteCourse);

router.put('/:id/assign-student', authorize('admin'), assignStudent);

module.exports = router;
