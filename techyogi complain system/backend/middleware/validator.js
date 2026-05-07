const { body, validationResult } = require('express-validator');

const validateComplaint = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[+]?[0-9\s-]{10,15}$/)
    .withMessage('Please enter a valid phone number'),
  
  body('companyName')
    .trim()
    .notEmpty()
    .withMessage('Company/Shop name is required')
    .isLength({ min: 2, max: 200 })
    .withMessage('Name must be between 2 and 200 characters'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 5, max: 500 })
    .withMessage('Address must be between 5 and 500 characters'),
  
  body('serviceType')
    .notEmpty()
    .withMessage('Service type is required')
    .isArray({ min: 1 })
    .withMessage('At least one service type must be selected'),
  
  body('priority')
    .notEmpty()
    .withMessage('Priority is required')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Invalid priority value'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10, max: 2000 })
    .withMessage('Message must be between 10 and 2000 characters'),
];

const validateAdminLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const validateOTP = [
  body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),
  
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .isLength({ min: 4, max: 6 })
    .withMessage('OTP must be 4-6 digits'),
];

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  
  next();
};

module.exports = {
  validateComplaint,
  validateAdminLogin,
  validateOTP,
  handleValidationErrors,
};
