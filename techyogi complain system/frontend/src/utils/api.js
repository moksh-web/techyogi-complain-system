import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Complaint API
export const complaintAPI = {
  create: (formData) => api.post('/complaints', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getAll: (params) => api.get('/complaints', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  track: (data) => api.post('/complaints/track', data),
  updateStatus: (id, data) => api.put(`/complaints/${id}`, data),
  delete: (ids) => api.delete('/complaints', { data: { ids } }),
  getDashboardStats: () => api.get('/complaints/stats/dashboard'),
  getRecent: (limit = 10) => api.get('/complaints/recent', { params: { limit } }),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Technician API
export const technicianAPI = {
  getAll: (params) => api.get('/technicians', { params }),
  getById: (id) => api.get(`/technicians/${id}`),
  create: (data) => api.post('/technicians', data),
  update: (id, data) => api.put(`/technicians/${id}`, data),
  delete: (id) => api.delete(`/technicians/${id}`),
  getStats: () => api.get('/technicians/stats'),
};

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
};

export default api;
