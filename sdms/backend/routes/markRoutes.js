const express = require('express');
const router = express.Router();
const {
  getMarks,
  createMark,
  updateMark,
  deleteMark,
  getStudentMarksSummary,
} = require('../controllers/markController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/student/:studentId', getStudentMarksSummary);

router.route('/')
  .get(getMarks)
  .post(authorize('admin', 'faculty'), createMark);

router.route('/:id')
  .put(authorize('admin', 'faculty'), updateMark)
  .delete(authorize('admin', 'faculty'), deleteMark);

module.exports = router;
