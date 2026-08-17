const express = require('express');
const router = express.Router();
const {
  getFees,
  recordPayment,
  updatePayment,
  deletePayment,
  generateReceipt,
} = require('../controllers/feeController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/:id/receipt', generateReceipt);

router.route('/')
  .get(getFees)
  .post(authorize('admin'), recordPayment);

router.route('/:id')
  .put(authorize('admin'), updatePayment)
  .delete(authorize('admin'), deletePayment);

module.exports = router;
