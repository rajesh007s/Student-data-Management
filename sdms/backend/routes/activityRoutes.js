const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/asyncHandler');
const { sendSuccess, paginate } = require('../utils/apiResponse');
const { protect } = require('../middleware/auth');

router.get(
  '/',
  protect,
  asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const { data, meta } = await paginate(Activity, {}, {
      page,
      limit: limit || 20,
      sort: '-createdAt',
      populate: ['performedBy'],
    });
    return sendSuccess(res, 200, 'Activities fetched', data, meta);
  })
);

module.exports = router;
