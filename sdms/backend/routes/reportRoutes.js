const express = require('express');
const router = express.Router();
const {
  studentReport,
  attendanceReport,
  marksReport,
  feeReport,
  facultyReport,
  departmentReport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin', 'faculty'));

router.get('/students', studentReport);
router.get('/attendance', attendanceReport);
router.get('/marks', marksReport);
router.get('/fees', feeReport);
router.get('/faculty', facultyReport);
router.get('/departments', departmentReport);

module.exports = router;
