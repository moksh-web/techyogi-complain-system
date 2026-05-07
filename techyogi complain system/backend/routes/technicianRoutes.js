const express = require('express');
const router = express.Router();
const {
  getAllTechnicians,
  getTechnician,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getTechnicianStats,
} = require('../controllers/technicianController');
const { protect } = require('../middleware/auth');

// All technician routes are protected
router.get('/stats', protect, getTechnicianStats);
router.get('/', protect, getAllTechnicians);
router.post('/', protect, createTechnician);
router.get('/:id', protect, getTechnician);
router.put('/:id', protect, updateTechnician);
router.delete('/:id', protect, deleteTechnician);

module.exports = router;
