const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  trackComplaint,
  updateComplaintStatus,
  deleteComplaints,
  getDashboardStats,
  getRecentComplaints,
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');
const { validateComplaint, handleValidationErrors } = require('../middleware/validator');

// Public routes
router.post(
  '/',
  upload.array('images', 5),
  handleUploadError,
  validateComplaint,
  handleValidationErrors,
  createComplaint
);

router.post('/track', trackComplaint);

// Protected routes (Admin only)
router.get('/stats/dashboard', protect, getDashboardStats);
router.get('/recent', protect, getRecentComplaints);
router.get('/', protect, getAllComplaints);
router.get('/:id', protect, getComplaintById);
router.put('/:id', protect, updateComplaintStatus);
router.delete('/', protect, deleteComplaints);

module.exports = router;
