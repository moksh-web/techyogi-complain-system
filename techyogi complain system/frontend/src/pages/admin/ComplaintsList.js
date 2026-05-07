import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Search,
  Filter,
  Download,
  Trash2,
  CheckSquare,
  Square,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit,
  Calendar,
  X,
  RefreshCw,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { complaintAPI } from '../../utils/api';
import { exportToPDF, exportToExcel } from '../../utils/export';
import toast from 'react-hot-toast';
import moment from 'moment';

const ComplaintsList = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    serviceType: '',
    search: '',
    startDate: '',
    endDate: '',
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await complaintAPI.getAll({
        ...filters,
        page: pagination.page || 1,
        limit: 20,
      });

      if (response.data.success) {
        setComplaints(response.data.data.complaints);
        setPagination(response.data.data.pagination);
        setStats(response.data.data.stats);
      }
    } catch (error) {
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  }, [filters, pagination.page]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    setSelectedIds([]);
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      serviceType: '',
      search: '',
      startDate: '',
      endDate: '',
    });
    setSelectedIds([]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === complaints.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(complaints.map(c => c._id));
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} complaint(s)?`)) {
      return;
    }

    try {
      const response = await complaintAPI.delete(selectedIds);
      if (response.data.success) {
        toast.success(response.data.message);
        setSelectedIds([]);
        fetchComplaints();
      }
    } catch (error) {
      toast.error('Failed to delete complaints');
    }
  };

  const handleExportPDF = () => {
    const dataToExport = selectedIds.length > 0
      ? complaints.filter(c => selectedIds.includes(c._id))
      : complaints;
    exportToPDF(dataToExport, 'complaints');
    toast.success('PDF exported successfully');
  };

  const handleExportExcel = () => {
    const dataToExport = selectedIds.length > 0
      ? complaints.filter(c => selectedIds.includes(c._id))
      : complaints;
    exportToExcel(dataToExport, 'complaints');
    toast.success('Excel exported successfully');
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const serviceTypes = [
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
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <FileText className="w-7 h-7 mr-2 text-primary-600" />
              Complaints
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and track all customer complaints
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn btn-secondary"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </button>
            <button
              onClick={handleExportPDF}
              className="btn btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              PDF
            </button>
            <button
              onClick={handleExportExcel}
              className="btn btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Excel
            </button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalComplaints || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pendingComplaints || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">In Progress</p>
            <p className="text-2xl font-bold text-blue-600">{stats.inProgressComplaints || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completedComplaints || 0}</p>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="card p-4 mb-6 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All Priority</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Service Type
                </label>
                <select
                  name="serviceType"
                  value={filters.serviceType}
                  onChange={handleFilterChange}
                  className="input"
                >
                  <option value="">All Services</option>
                  {serviceTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="search"
                    value={filters.search}
                    onChange={handleFilterChange}
                    className="input pl-9"
                    placeholder="Name, phone, or ID"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={filters.startDate}
                  onChange={handleFilterChange}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={filters.endDate}
                  onChange={handleFilterChange}
                  className="input"
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear Filters
              </button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <div className="card p-4 mb-6 flex items-center justify-between animate-fade-in">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              {selectedIds.length} item(s) selected
            </p>
            <button
              onClick={handleDelete}
              className="btn btn-danger"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Selected
            </button>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button
                      onClick={toggleSelectAll}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      {selectedIds.length === complaints.length && complaints.length > 0 ? (
                        <CheckSquare className="w-5 h-5" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {complaints.map((complaint) => (
                  <tr
                    key={complaint._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelect(complaint._id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {selectedIds.includes(complaint._id) ? (
                          <CheckSquare className="w-5 h-5 text-primary-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-primary-600">
                        {complaint.complaintId}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {complaint.fullName}
                        </p>
                        <p className="text-xs text-gray-500">{complaint.phoneNumber}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {complaint.serviceType?.join(', ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge priority={complaint.priority} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {complaint.assignedTo || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-500">
                        {moment(complaint.createdAt).format('MMM DD, YYYY')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/admin/complaints/${complaint._id}`}
                          className="p-1 text-gray-400 hover:text-primary-600"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {complaints.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No complaints found</p>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-700 dark:text-gray-400">
                Showing page {pagination.page} of {pagination.pages}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className="btn btn-secondary disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintsList;
