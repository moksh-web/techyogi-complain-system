const Complaint = require('../models/Complaint');
const { generateComplaintId } = require('../utils/generateId');
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { 
  createNotification, 
  sendComplaintConfirmation, 
  sendAdminAlert 
} = require('../utils/notifications');

// Create new complaint
const createComplaint = async (req, res) => {
  try {
    const {
      fullName,
      phoneNumber,
      alternatePhone,
      companyName,
      address,
      serviceType,
      priority,
      message,
    } = req.body;

    // Generate unique complaint ID
    const complaintId = generateComplaintId();

    // Handle image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      const uploadPromises = req.files.map(file => 
        uploadToCloudinary(file.buffer, 'complaints')
      );
      
      const uploadResults = await Promise.all(uploadPromises);
      
      images = uploadResults
        .filter(result => result.success)
        .map(result => ({
          url: result.url,
          publicId: result.publicId,
        }));
    }

    // Create complaint
    const complaint = await Complaint.create({
      complaintId,
      fullName,
      phoneNumber,
      alternatePhone: alternatePhone || '',
      companyName,
      address,
      serviceType: Array.isArray(serviceType) ? serviceType : [serviceType],
      priority,
      message,
      images,
      status: 'Pending',
      timeline: [
        {
          status: 'Pending',
          note: 'Complaint submitted',
          updatedBy: 'System',
        },
      ],
    });

    // Create notification for admin
    await createNotification(
      'new_complaint',
      complaintId,
      `New ${priority} priority complaint from ${fullName}`,
      priority === 'High' ? 'high' : 'medium',
      { complaintId, serviceType, priority }
    );

    // Send notifications (async, don't wait)
    sendComplaintConfirmation(complaint);
    sendAdminAlert(complaint);

    res.status(201).json({
      success: true,
      message: 'Complaint submitted successfully',
      data: {
        complaintId: complaint.complaintId,
        status: complaint.status,
        createdAt: complaint.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating complaint',
      error: error.message,
    });
  }
};

// Get all complaints (admin only)
const getAllComplaints = async (req, res) => {
  try {
    const {
      status,
      priority,
      serviceType,
      search,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (serviceType) query.serviceType = { $in: [serviceType] };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const complaints = await Complaint.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count
    const total = await Complaint.countDocuments(query);

    // Get statistics
    const stats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          totalComplaints: { $sum: 1 },
          pendingComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] },
          },
          inProgressComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] },
          },
          completedComplaints: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] },
          },
          highPriorityComplaints: {
            $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] },
          },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        complaints,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit)),
        },
        stats: stats[0] || {
          totalComplaints: 0,
          pendingComplaints: 0,
          inProgressComplaints: 0,
          completedComplaints: 0,
          highPriorityComplaints: 0,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaints',
      error: error.message,
    });
  }
};

// Get single complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findOne({ 
      $or: [{ _id: id }, { complaintId: id }] 
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    res.json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching complaint',
      error: error.message,
    });
  }
};

// Track complaint (public)
const trackComplaint = async (req, res) => {
  try {
    const { complaintId, phoneNumber } = req.body;

    const complaint = await Complaint.findOne({
      complaintId: complaintId.toUpperCase(),
      phoneNumber: { $regex: phoneNumber.replace(/\D/g, ''), $options: 'i' },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found. Please check your Complaint ID and Phone Number.',
      });
    }

    res.json({
      success: true,
      data: {
        complaintId: complaint.complaintId,
        fullName: complaint.fullName,
        serviceType: complaint.serviceType,
        status: complaint.status,
        priority: complaint.priority,
        message: complaint.message,
        createdAt: complaint.createdAt,
        timeline: complaint.timeline,
        assignedTo: complaint.assignedTo,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error tracking complaint',
      error: error.message,
    });
  }
};

// Update complaint status
const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, assignedTo } = req.body;

    const complaint = await Complaint.findOne({
      $or: [{ _id: id }, { complaintId: id }],
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Update status
    if (status) {
      complaint.status = status;
      
      // Add to timeline
      complaint.timeline.push({
        status,
        note: note || `Status updated to ${status}`,
        updatedBy: req.admin?.name || 'Admin',
      });

      // Set completedAt if status is Completed
      if (status === 'Completed') {
        complaint.completedAt = new Date();
      }

      // Create notification
      if (status === 'In Progress') {
        await createNotification(
          'status_change',
          complaint.complaintId,
          `Complaint ${complaint.complaintId} is now In Progress`,
          'medium',
          { complaintId: complaint.complaintId, status }
        );
      } else if (status === 'Completed') {
        await createNotification(
          'status_change',
          complaint.complaintId,
          `Complaint ${complaint.complaintId} has been completed`,
          'low',
          { complaintId: complaint.complaintId, status }
        );
      }
    }

    // Update assigned technician
    if (assignedTo) {
      complaint.assignedTo = assignedTo;
      await createNotification(
        'assigned',
        complaint.complaintId,
        `Complaint ${complaint.complaintId} assigned to ${assignedTo}`,
        'medium',
        { complaintId: complaint.complaintId, assignedTo }
      );
    }

    // Update notes
    if (note && !status) {
      complaint.notes = note;
    }

    await complaint.save();

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating complaint',
      error: error.message,
    });
  }
};

// Delete complaint(s)
const deleteComplaints = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide complaint IDs to delete',
      });
    }

    // Delete complaints
    const result = await Complaint.deleteMany({
      $or: [
        { _id: { $in: ids } },
        { complaintId: { $in: ids } },
      ],
    });

    res.json({
      success: true,
      message: `${result.deletedCount} complaint(s) deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting complaints',
      error: error.message,
    });
  }
};

// Get dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    // Overall stats
    const overallStats = await Complaint.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'In Progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
          highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'High'] }, 1, 0] } },
        },
      },
    ]);

    // Monthly stats
    const monthlyStats = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        },
      },
    ]);

    // Stats by service type
    const serviceStats = await Complaint.aggregate([
      {
        $unwind: '$serviceType',
      },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Stats by priority
    const priorityStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    res.json({
      success: true,
      data: {
        overall: overallStats[0] || {
          total: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          highPriority: 0,
        },
        monthly: monthlyStats[0] || { total: 0, completed: 0 },
        byService: serviceStats,
        byPriority: priorityStats,
        monthlyTrend,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard stats',
      error: error.message,
    });
  }
};

// Get recent complaints
const getRecentComplaints = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const complaints = await Complaint.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('complaintId fullName phoneNumber serviceType priority status createdAt');

    res.json({
      success: true,
      data: complaints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recent complaints',
      error: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  trackComplaint,
  updateComplaintStatus,
  deleteComplaints,
  getDashboardStats,
  getRecentComplaints,
};
