const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { generateOTP, formatPhoneNumber } = require('../utils/generateId');
const { sendSMS } = require('../config/twilio');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { generateOTP, formatPhoneNumber } = require('../utils/generateId');
const { sendSMS } = require('../config/twilio');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// Initialize default admins on first run
const initializeAdmins = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      const adminPhones = process.env.ADMIN_PHONES.split(',');
      
      for (let i = 0; i < adminPhones.length; i++) {
        const phone = adminPhones[i].trim();
        const formattedPhone = formatPhoneNumber(phone);
        
        await Admin.create({
          username: `admin${i + 1}`,
          password: 'admin488', // Should be changed after first login
          phoneNumber: formattedPhone,
          name: `Admin ${i + 1}`,
          role: i === 0 ? 'superadmin' : 'admin',
        });
        
        console.log(`Created admin user: admin${i + 1} with phone ${formattedPhone}`);
      }
      
      console.log('Default admins created successfully');
    }
  } catch (error) {
    console.error('Error initializing admins:', error);
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.',
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      admin.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await admin.save();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLogin = new Date();
    await admin.save();

    // Skip OTP - Direct login for now
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          phoneNumber: admin.phoneNumber,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid request',
      });
    }

    // Check if OTP exists and is valid
    if (!admin.otp || !admin.otp.code || !admin.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP not requested or expired',
      });
    }

    // Check if OTP is expired
    if (new Date() > admin.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please login again.',
      });
    }

    // Verify OTP
    if (admin.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Clear OTP after successful verification
    admin.otp = undefined;
    await admin.save();

    // Generate JWT token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          username: admin.username,
          role: admin.role,
          phoneNumber: admin.phoneNumber,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { username } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid request',
      });
    }

    // Generate new OTP
    const otp = generateOTP(4);
    admin.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
    await admin.save();

    // Send OTP via SMS
    const smsResult = await sendSMS(
      admin.phoneNumber,
      `Your Techyogi Admin verification code is: ${otp}. Valid for 10 minutes.`
    );

    res.json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        phoneNumber: admin.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
        otpSent: smsResult.success,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message,
    });
  }
};

// Get current admin
const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password -otp');

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin details',
      error: error.message,
    });
  }
};

// Forgot password - Request reset
const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP(4);
    admin.resetPasswordToken = otp;
    admin.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await admin.save();

    // Send OTP via SMS
    const smsResult = await sendSMS(
      admin.phoneNumber,
      `Your Techyogi password reset code is: ${otp}. Valid for 30 minutes.`
    );

    res.json({
      success: true,
      message: 'Password reset OTP sent to your phone',
      data: {
        phoneNumber: admin.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
        otpSent: smsResult.success,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting password reset',
      error: error.message,
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    const admin = await Admin.findOne({
      username,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Update password
    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id);

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};

module.exports = {
  initializeAdmins,
  login,
  verifyOTP,
  resendOTP,
  getCurrentAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
};

};

// Initialize default admins on first run
const initializeAdmins = async () => {
  try {
    const adminCount = await Admin.countDocuments();
    
    if (adminCount === 0) {
      const adminPhones = process.env.ADMIN_PHONES.split(',');
      
      for (let i = 0; i < adminPhones.length; i++) {
        const phone = adminPhones[i].trim();
        const formattedPhone = formatPhoneNumber(phone);
        
        await Admin.create({
          username: `admin${i + 1}`,
          password: 'admin123', // Should be changed after first login
          phoneNumber: formattedPhone,
          name: `Admin ${i + 1}`,
          role: i === 0 ? 'superadmin' : 'admin',
        });
        
        console.log(`Created admin user: admin${i + 1} with phone ${formattedPhone}`);
      }
      
      console.log('Default admins created successfully');
    }
  } catch (error) {
    console.error('Error initializing admins:', error);
  }
};

// Login
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if admin exists
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (admin.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is temporarily locked. Please try again later.',
      });
    }

    // Check password
    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
      // Increment login attempts
      admin.loginAttempts += 1;
      
      // Lock account after 5 failed attempts
      if (admin.loginAttempts >= 5) {
        admin.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      }
      
      await admin.save();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Reset login attempts on successful login
    admin.loginAttempts = 0;
    admin.lockUntil = null;
    admin.lastLogin = new Date();
    await admin.save();

    // Skip OTP - Direct login for now
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
          phoneNumber: admin.phoneNumber,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message,
    });
  }
};

// Verify OTP
const verifyOTP = async (req, res) => {
  try {
    const { username, otp } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid request',
      });
    }

    // Check if OTP exists and is valid
    if (!admin.otp || !admin.otp.code || !admin.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP not requested or expired',
      });
    }

    // Check if OTP is expired
    if (new Date() > admin.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please login again.',
      });
    }

    // Verify OTP
    if (admin.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
      });
    }

    // Clear OTP after successful verification
    admin.otp = undefined;
    await admin.save();

    // Generate JWT token
    const token = generateToken(admin._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        admin: {
          id: admin._id,
          name: admin.name,
          username: admin.username,
          role: admin.role,
          phoneNumber: admin.phoneNumber,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying OTP',
      error: error.message,
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { username } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid request',
      });
    }

    // Generate new OTP
    const otp = generateOTP(4);
    admin.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
    await admin.save();

    // Send OTP via SMS
    const smsResult = await sendSMS(
      admin.phoneNumber,
      `Your Techyogi Admin verification code is: ${otp}. Valid for 10 minutes.`
    );

    res.json({
      success: true,
      message: 'OTP resent successfully',
      data: {
        phoneNumber: admin.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
        otpSent: smsResult.success,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resending OTP',
      error: error.message,
    });
  }
};

// Get current admin
const getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password -otp');

    res.json({
      success: true,
      data: admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching admin details',
      error: error.message,
    });
  }
};

// Forgot password - Request reset
const forgotPassword = async (req, res) => {
  try {
    const { username } = req.body;

    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin not found',
      });
    }

    // Generate OTP for password reset
    const otp = generateOTP(4);
    admin.resetPasswordToken = otp;
    admin.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
    await admin.save();

    // Send OTP via SMS
    const smsResult = await sendSMS(
      admin.phoneNumber,
      `Your Techyogi password reset code is: ${otp}. Valid for 30 minutes.`
    );

    res.json({
      success: true,
      message: 'Password reset OTP sent to your phone',
      data: {
        phoneNumber: admin.phoneNumber.replace(/\d(?=\d{4})/g, '*'),
        otpSent: smsResult.success,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error requesting password reset',
      error: error.message,
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { username, otp, newPassword } = req.body;

    const admin = await Admin.findOne({
      username,
      resetPasswordToken: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Update password
    admin.password = newPassword;
    admin.resetPasswordToken = undefined;
    admin.resetPasswordExpires = undefined;
    await admin.save();

    res.json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message,
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.admin._id);

    // Verify current password
    const isMatch = await admin.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message,
    });
  }
};

module.exports = {
  initializeAdmins,
  login,
  verifyOTP,
  resendOTP,
  getCurrentAdmin,
  forgotPassword,
  resetPassword,
  changePassword,
};
