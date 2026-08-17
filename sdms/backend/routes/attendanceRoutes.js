const express = require('express');
const router = express.Router();
const {
  getAttendance,
  markAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentAttendanceHistory,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/student/:studentId', getStudentAttendanceHistory);

router.route('/')
  .get(getAttendance)
  .post(authorize('admin', 'faculty'), markAttendance);

router.route('/:id')
  .put(authorize('admin', 'faculty'), updateAttendance)
  .delete(authorize('admin', 'faculty'), deleteAttendance);

module.exports = router;
