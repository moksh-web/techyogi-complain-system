import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Shield,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
  Key,
} from 'lucide-react';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyOTP, resendOTP, forgotPassword, resetPassword, isAuthenticated, requiresOTP, tempUsername, isLoading } = useAuth();
  
  const [step, setStep] = useState('login'); // login, otp, forgot, reset
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/admin/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  useEffect(() => {
    if (requiresOTP) {
      setStep('otp');
    }
  }, [requiresOTP]);

  useEffect(() => {
    let timer;
    if (step === 'otp' && resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendTimer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.username, formData.password);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await verifyOTP(formData.otp);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResendOTP = async () => {
    try {
      await resendOTP();
      setResendTimer(60);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await forgotPassword(formData.username);
      setStep('reset');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      await resetPassword(formData.username, formData.otp, formData.newPassword);
      setStep('login');
      setFormData({ ...formData, otp: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">TY</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Techyogi Automation
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Admin Dashboard
          </p>
        </div>

        {/* Login Card */}
        <div className="card p-8 shadow-xl">
          {step === 'login' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Welcome Back
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Sign in to access the admin dashboard
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="input pl-10"
                      placeholder="Enter your username"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="input pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div />
                  <button
                    type="button"
                    onClick={() => setStep('forgot')}
                    className="text-primary-600 hover:text-primary-500"
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'otp' && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Verify OTP
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter the 4-digit code sent to your registered phone
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="input text-center text-2xl tracking-[0.5em] font-mono"
                    placeholder="0000"
                    maxLength={4}
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Verify & Continue'
                  )}
                </button>

                <div className="text-center">
                  {resendTimer > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in {resendTimer}s
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      className="text-sm text-primary-600 hover:text-primary-500 flex items-center justify-center mx-auto"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Resend OTP
                    </button>
                  )}
                </div>
              </form>
            </>
          )}

          {step === 'forgot' && (
            <>
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Forgot Password?
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter your username to receive reset OTP
                </p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Send Reset OTP'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to login
                </button>
              </form>
            </>
          )}

          {step === 'reset' && (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Reset Password
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enter the OTP and your new password
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    OTP Code
                  </label>
                  <input
                    type="text"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    className="input text-center tracking-[0.5em]"
                    placeholder="0000"
                    maxLength={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter new password"
                    minLength={6}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Confirm new password"
                    required
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn btn-primary py-3"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Reset Password'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-sm text-gray-500 hover:text-gray-700"
                >
                  Back to login
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Authorized personnel only
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
