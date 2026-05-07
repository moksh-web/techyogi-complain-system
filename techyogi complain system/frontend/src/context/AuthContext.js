import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [requiresOTP, setRequiresOTP] = useState(false);
  const [tempUsername, setTempUsername] = useState('');

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedAdmin = localStorage.getItem('admin');
    
    if (token && storedAdmin) {
      setAdmin(JSON.parse(storedAdmin));
      setIsAuthenticated(true);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
    
    setIsLoading(false);
  }, []);

  // Login step 1 - Credentials
  const login = async (username, password) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password,
      });

      if (response.data.success) {
        if (response.data.data.requiresOTP) {
          setRequiresOTP(true);
          setTempUsername(username);
          toast.success('OTP sent to your phone!');
          return { requiresOTP: true };
        }
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async (otp) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/verify-otp`, {
        username: tempUsername,
        otp,
      });

      if (response.data.success) {
        const { token, admin: adminData } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('admin', JSON.stringify(adminData));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setAdmin(adminData);
        setIsAuthenticated(true);
        setRequiresOTP(false);
        setTempUsername('');
        
        toast.success('Login successful!');
        return response.data;
      }
    } catch (error) {
      const message = error.response?.data?.message || 'OTP verification failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/resend-otp`, {
        username: tempUsername,
      });

      if (response.data.success) {
        toast.success('OTP resent successfully!');
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to resend OTP';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (username) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/forgot-password`, {
        username,
      });

      if (response.data.success) {
        toast.success('Password reset OTP sent!');
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset OTP';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (username, otp, newPassword) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        username,
        otp,
        newPassword,
      });

      if (response.data.success) {
        toast.success('Password reset successful!');
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Change password
  const changePassword = async (currentPassword, newPassword) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`${API_URL}/auth/change-password`, {
        currentPassword,
        newPassword,
      });

      if (response.data.success) {
        toast.success('Password changed successfully!');
      }
      
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to change password';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    delete axios.defaults.headers.common['Authorization'];
    setAdmin(null);
    setIsAuthenticated(false);
    setRequiresOTP(false);
    setTempUsername('');
    toast.success('Logged out successfully');
  };

  // Fetch current admin
  const fetchCurrentAdmin = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data.success) {
        setAdmin(response.data.data);
        localStorage.setItem('admin', JSON.stringify(response.data.data));
      }
    } catch (error) {
      console.error('Error fetching admin:', error);
    }
  };

  const value = {
    admin,
    isAuthenticated,
    isLoading,
    requiresOTP,
    tempUsername,
    login,
    verifyOTP,
    resendOTP,
    forgotPassword,
    resetPassword,
    changePassword,
    logout,
    fetchCurrentAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
