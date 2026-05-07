const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.admin = await Admin.findById(decoded.id).select('-password');

      if (!req.admin) {
        return res.status(401).json({
          success: false,
          message: 'Admin not found',
        });
      }

      if (!req.admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated',
        });
      }

      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token failed',
      });
    }
  } catch (error) {
    next(error);
  }
};

const adminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'admin' || req.admin.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as admin',
    });
  }
};

const superAdminOnly = (req, res, next) => {
  if (req.admin && req.admin.role === 'superadmin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Not authorized as super admin',
    });
  }
};

module.exports = { protect, adminOnly, superAdminOnly };
