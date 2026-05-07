const { sendSMS } = require('../config/twilio');
const Notification = require('../models/Notification');

const createNotification = async (type, complaintId, message, priority = 'low', data = {}) => {
  try {
    const notification = await Notification.create({
      type,
      complaintId,
      message,
      priority,
      data,
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

const sendComplaintConfirmation = async (complaint) => {
  try {
    const message = `Dear ${complaint.fullName}, your complaint has been registered with ID: ${complaint.complaintId}. We will contact you shortly. - Techyogi Automation`;
    
    await sendSMS(complaint.phoneNumber, message);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending confirmation:', error);
    return { success: false, error: error.message };
  }
};

const sendAdminAlert = async (complaint) => {
  try {
    const adminPhones = process.env.ADMIN_PHONES.split(',');
    const message = `New ${complaint.priority} priority complaint received! ID: ${complaint.complaintId}, Service: ${complaint.serviceType.join(', ')}, Customer: ${complaint.fullName}, Phone: ${complaint.phoneNumber}`;
    
    const results = [];
    for (const phone of adminPhones) {
      const result = await sendSMS(phone.trim(), message);
      results.push(result);
    }
    
    return { success: true, results };
  } catch (error) {
    console.error('Error sending admin alert:', error);
    return { success: false, error: error.message };
  }
};

const sendStatusUpdate = async (complaint, status) => {
  try {
    let message = '';
    
    switch (status) {
      case 'In Progress':
        message = `Your complaint ${complaint.complaintId} is now In Progress. Our technician will contact you soon. - Techyogi Automation`;
        break;
      case 'Completed':
        message = `Your complaint ${complaint.complaintId} has been resolved. Thank you for choosing Techyogi Automation!`;
        break;
      default:
        message = `Your complaint ${complaint.complaintId} status has been updated to: ${status}. - Techyogi Automation`;
    }
    
    await sendSMS(complaint.phoneNumber, message);
    
    return { success: true };
  } catch (error) {
    console.error('Error sending status update:', error);
    return { success: false, error: error.message };
  }
};

const getUnreadNotifications = async () => {
  try {
    return await Notification.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(20);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
};

const markNotificationAsRead = async (notificationId) => {
  try {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
};

module.exports = {
  createNotification,
  sendComplaintConfirmation,
  sendAdminAlert,
  sendStatusUpdate,
  getUnreadNotifications,
  markNotificationAsRead,
};
