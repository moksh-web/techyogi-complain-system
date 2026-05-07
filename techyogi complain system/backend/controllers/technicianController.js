const Technician = require('../models/Technician');
const Complaint = require('../models/Complaint');

// Get all technicians
const getAllTechnicians = async (req, res) => {
  try {
    const { isActive, expertise } = req.query;

    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (expertise) {
      query.expertise = { $in: [expertise] };
    }

    const technicians = await Technician.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: technicians.length,
      data: technicians,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching technicians',
      error: error.message,
    });
  }
};

// Get single technician
const getTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findById(id).populate(
      'assignedComplaints',
      'complaintId fullName serviceType status priority'
    );

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found',
      });
    }

    res.json({
      success: true,
      data: technician,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching technician',
      error: error.message,
    });
  }
};

// Create technician
const createTechnician = async (req, res) => {
  try {
    const { name, phoneNumber, email, expertise } = req.body;

    const technician = await Technician.create({
      name,
      phoneNumber,
      email,
      expertise: expertise || [],
    });

    res.status(201).json({
      success: true,
      message: 'Technician created successfully',
      data: technician,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error creating technician',
      error: error.message,
    });
  }
};

// Update technician
const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber, email, expertise, isActive } = req.body;

    const technician = await Technician.findByIdAndUpdate(
      id,
      { name, phoneNumber, email, expertise, isActive },
      { new: true, runValidators: true }
    );

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found',
      });
    }

    res.json({
      success: true,
      message: 'Technician updated successfully',
      data: technician,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Phone number already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Error updating technician',
      error: error.message,
    });
  }
};

// Delete technician
const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;

    const technician = await Technician.findById(id);

    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found',
      });
    }

    // Check if technician has assigned complaints
    if (technician.assignedComplaints.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete technician with assigned complaints',
      });
    }

    await technician.deleteOne();

    res.json({
      success: true,
      message: 'Technician deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting technician',
      error: error.message,
    });
  }
};

// Get technician stats
const getTechnicianStats = async (req, res) => {
  try {
    const stats = await Technician.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactive: { $sum: { $cond: ['$isActive', 0, 1] } },
          totalAssigned: { $sum: { $size: '$assignedComplaints' } },
          totalCompleted: { $sum: '$completedComplaints' },
        },
      },
    ]);

    res.json({
      success: true,
      data: stats[0] || {
        total: 0,
        active: 0,
        inactive: 0,
        totalAssigned: 0,
        totalCompleted: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching technician stats',
      error: error.message,
    });
  }
};

module.exports = {
  getAllTechnicians,
  getTechnician,
  createTechnician,
  updateTechnician,
  deleteTechnician,
  getTechnicianStats,
};
