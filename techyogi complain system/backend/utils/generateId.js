const generateComplaintId = () => {
  const prefix = 'TYG';
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

const generateOTP = (length = 4) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

const formatPhoneNumber = (phone) => {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Add +91 if not present and starts with 0 or 91
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('91')) {
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('0')) {
      cleaned = '+91' + cleaned.substring(1);
    } else {
      cleaned = '+91' + cleaned;
    }
  }
  
  return cleaned;
};

module.exports = {
  generateComplaintId,
  generateOTP,
  formatPhoneNumber,
};
