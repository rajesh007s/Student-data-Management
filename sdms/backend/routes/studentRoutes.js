const express = require('express');
const router = express.Router();
const {
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  exportStudentsCSV,
  getSmartInsights,
} = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/export/csv', authorize('admin', 'faculty'), exportStudentsCSV);
router.get('/insights/smart', authorize('admin', 'faculty'), getSmartInsights);

router.route('/')
  .get(getStudents)
  .post(authorize('admin'), createStudent);

router.route('/:id')
  .get(getStudent)
  .put(authorize('admin', 'faculty'), updateStudent)
  .delete(authorize('admin'), deleteStudent);

module.exports = router;
