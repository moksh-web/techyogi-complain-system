const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternatePhone: {
      type: String,
      trim: true,
      default: '',
    },
    companyName: {
      type: String,
      required: [true, 'Company/Flat/Shop name is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Full address is required'],
      trim: true,
    },
    serviceType: {
      type: [String],
      required: [true, 'Service type is required'],
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
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    assignedTo: {
      type: String,
      default: null,
    },
    timeline: [
      {
        status: String,
        note: String,
        updatedBy: String,
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: null,
    },
    whatsappSent: {
      type: Boolean,
      default: false,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
complaintSchema.index({ phoneNumber: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ serviceType: 1 });
complaintSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Complaint', complaintSchema);
