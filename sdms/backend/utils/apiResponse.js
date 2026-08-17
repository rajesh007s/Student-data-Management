const sendSuccess = (res, statusCode, message, data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const paginate = async (Model, query, { page = 1, limit = 10, sort = '-createdAt', populate = [] }) => {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  let q = Model.find(query).sort(sort).skip(skip).limit(limitNum);
  populate.forEach((p) => {
    q = q.populate(p);
  });

  const [data, total] = await Promise.all([q, Model.countDocuments(query)]);

  return {
    data,
    meta: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  };
};

module.exports = { sendSuccess, paginate };
