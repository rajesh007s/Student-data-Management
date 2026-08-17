const crypto = require('crypto');
const User = require('../models/User');
const Activity = require('../models/Activity');
const asyncHandler = require('../middleware/asyncHandler');
const generateToken = require('../utils/generateToken');
const { sendSuccess } = require('../utils/apiResponse');

// @desc    Register a new user (admin-only in production; open here for demo/portfolio use)
// @route   POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ success: false, message: 'A user with this email already exists' });
  }

  const user = await User.create({ name, email, password, role: role || 'student', phone });

  await Activity.create({
    action: 'User Registered',
    description: `${user.name} registered as ${user.role}`,
    entityType: 'User',
    entityId: user._id,
    performedBy: user._id,
    icon: 'user-plus',
  });

  const token = generateToken(user._id);
  return sendSuccess(res, 201, 'Registration successful', { user: user.toSafeObject(), token });
});

// @desc    Login user
// @route   POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' });
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'This account has been deactivated' });
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user._id);
  return sendSuccess(res, 200, 'Login successful', { user: user.toSafeObject(), token });
});

// @desc    Get current user profile
// @route   GET /api/auth/profile
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('student').populate('faculty');
  return sendSuccess(res, 200, 'Profile fetched', { user });
});

// @desc    Update current user profile
// @route   PUT /api/auth/profile
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, avatar } = req.body;
  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (avatar) user.avatar = avatar;
  await user.save();
  return sendSuccess(res, 200, 'Profile updated successfully', { user: user.toSafeObject() });
});

// @desc    Change password (while logged in)
// @route   PUT /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  return sendSuccess(res, 200, 'Password changed successfully');
});

// @desc    Request password reset - generates token (email delivery is out of scope for demo)
// @route   POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    // Do not reveal whether the email exists
    return sendSuccess(res, 200, 'If that email exists, a reset link has been generated');
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.resetPasswordExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
  await user.save();

  // In production this would be emailed. Returned here so the demo flow is testable end-to-end.
  return sendSuccess(res, 200, 'Reset token generated', { resetToken });
});

// @desc    Reset password using token
// @route   PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Reset token is invalid or has expired' });
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  return sendSuccess(res, 200, 'Password reset successfully');
});

module.exports = { register, login, getProfile, updateProfile, changePassword, forgotPassword, resetPassword };
