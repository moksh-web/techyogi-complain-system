import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  ArrowRight,
  Bell,
  Package,
  Calendar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import StatsCard from '../../components/StatsCard';
import StatusBadge from '../../components/StatusBadge';
import { complaintAPI, notificationAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import moment from 'moment';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [statsRes, recentRes, notifRes] = await Promise.all([
        complaintAPI.getDashboardStats(),
        complaintAPI.getRecent(5),
        notificationAPI.getAll({ unreadOnly: true, limit: 5 }),
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (recentRes.data.success) {
        setRecentComplaints(recentRes.data.data);
      }
      if (notifRes.data.success) {
        setNotifications(notifRes.data.data.notifications);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const markNotificationRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const overallStats = stats?.overall || {};

  // Prepare chart data
  const serviceChartData = stats?.byService?.map(item => ({
    name: item._id,
    value: item.count,
  })) || [];

  const priorityChartData = stats?.byPriority?.map(item => ({
    name: item._id,
    value: item.count,
  })) || [];

  const monthlyTrendData = stats?.monthlyTrend?.map(item => ({
    name: `${item._id.month}/${item._id.year}`,
    count: item.count,
  })) || [];

  const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <LayoutDashboard className="w-7 h-7 mr-2 text-primary-600" />
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Overview of your complaint management system
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-4">
            <Link
              to="/admin/complaints"
              className="btn btn-primary"
            >
              View All Complaints
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard
            title="Total Complaints"
            value={overallStats.total || 0}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={overallStats.pending || 0}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="In Progress"
            value={overallStats.inProgress || 0}
            icon={Package}
            color="blue"
          />
          <StatsCard
            title="Completed"
            value={overallStats.completed || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="High Priority"
            value={overallStats.highPriority || 0}
            icon={AlertTriangle}
            color="red"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly Trend Chart */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
              Monthly Complaint Trend
            </h3>
            <div className="h-64">
              {monthlyTrendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>

          {/* Service Distribution */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-primary-600" />
              Complaints by Service Type
            </h3>
            <div className="h-64">
              {serviceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={serviceChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0ea5e9" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Priority Distribution
            </h3>
            <div className="h-48">
              {priorityChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={priorityChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {priorityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  No data
                </div>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-2">
              {priorityChartData.map((entry, index) => (
                <div key={entry.name} className="flex items-center text-sm">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Complaints */}
          <div className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Clock className="w-5 h-5 mr-2 text-primary-600" />
                Recent Complaints
              </h3>
              <Link
                to="/admin/complaints"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <th className="pb-3">ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Priority</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {recentComplaints.map((complaint) => (
                    <tr key={complaint._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="py-3">
                        <Link
                          to={`/admin/complaints/${complaint._id}`}
                          className="text-sm font-medium text-primary-600 hover:text-primary-500"
                        >
                          {complaint.complaintId}
                        </Link>
                      </td>
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {complaint.fullName}
                          </p>
                          <p className="text-xs text-gray-500">{complaint.phoneNumber}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {complaint.serviceType?.[0]}
                          {complaint.serviceType?.length > 1 && ` +${complaint.serviceType.length - 1}`}
                        </span>
                      </td>
                      <td className="py-3">
                        <StatusBadge priority={complaint.priority} />
                      </td>
                      <td className="py-3">
                        <StatusBadge status={complaint.status} />
                      </td>
                      <td className="py-3">
                        <span className="text-sm text-gray-500">
                          {moment(complaint.createdAt).format('MMM DD, HH:mm')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {recentComplaints.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No recent complaints
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Bell className="w-5 h-5 mr-2 text-primary-600" />
                Recent Notifications
                <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                  {notifications.length}
                </span>
              </h3>
              <Link
                to="/admin/settings"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                View All
              </Link>
            </div>
            <div className="space-y-3">
              {notifications.slice(0, 3).map((notification) => (
                <div
                  key={notification._id}
                  className="flex items-start justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-start">
                    <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                      notification.priority === 'high' ? 'bg-red-500' :
                      notification.priority === 'medium' ? 'bg-orange-500' :
                      'bg-green-500'
                    }`} />
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {moment(notification.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => markNotificationRead(notification._id)}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Mark read
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
