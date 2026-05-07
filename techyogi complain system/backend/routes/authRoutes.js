const express = require('express');
const router = express.Router();
const {
  login,
  verifyOTP,
  resendOTP,
  getCurrentAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateAdminLogin, validateOTP, handleValidationErrors } = require('../middleware/validator');

// Public routes
router.post('/login', validateAdminLogin, handleValidationErrors, login);
router.post('/verify-otp', validateOTP, handleValidationErrors, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', protect, getCurrentAdmin);
router.put('/change-password', protect, changePassword);

module.exports = router;
