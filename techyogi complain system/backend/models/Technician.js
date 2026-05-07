const mongoose = require('mongoose');

const technicianSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    expertise: [
      {
        type: String,
        enum: [
          'CCTV',
          'Biometric Attendance',
          'Access Control',
          'Video Door Phone',
          'Smart Door Lock',
          'LAN Networking',
          'Wi-Fi Solution',
          'Home Automation',
          'EPABX / Intercom',
          'AMC Support',
        ],
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    assignedComplaints: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Complaint',
      },
    ],
    completedComplaints: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Technician', technicianSchema);
