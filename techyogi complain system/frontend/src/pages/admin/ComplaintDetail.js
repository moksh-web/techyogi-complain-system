import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Phone,
  MapPin,
  Wrench,
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Package,
  UserCheck,
  MessageSquare,
  Download,
  Edit,
  Save,
  X,
  Image,
  Send,
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { complaintAPI, technicianAPI } from '../../utils/api';
import { exportComplaintDetail } from '../../utils/export';
import toast from 'react-hot-toast';
import moment from 'moment';

const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updateData, setUpdateData] = useState({
    status: '',
    assignedTo: '',
    note: '',
  });

  useEffect(() => {
    fetchComplaint();
    fetchTechnicians();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setIsLoading(true);
      const response = await complaintAPI.getById(id);
      if (response.data.success) {
        setComplaint(response.data.data);
        setUpdateData({
          status: response.data.data.status,
          assignedTo: response.data.data.assignedTo || '',
          note: '',
        });
      }
    } catch (error) {
      toast.error('Failed to load complaint details');
      navigate('/admin/complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTechnicians = async () => {
    try {
      const response = await technicianAPI.getAll({ isActive: true });
      if (response.data.success) {
        setTechnicians(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching technicians:', error);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await complaintAPI.updateStatus(id, {
        status: updateData.status,
        assignedTo: updateData.assignedTo,
        note: updateData.note,
      });

      if (response.data.success) {
        toast.success('Complaint updated successfully');
        setComplaint(response.data.data);
        setIsEditing(false);
        setUpdateData(prev => ({ ...prev, note: '' }));
      }
    } catch (error) {
      toast.error('Failed to update complaint');
    }
  };

  const handleExport = () => {
    exportComplaintDetail(complaint);
    toast.success('PDF exported successfully');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!complaint) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'In Progress': return <Package className="w-5 h-5 text-blue-500" />;
      case 'Completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center">
            <Link
              to="/admin/complaints"
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-7 h-7 mr-2 text-primary-600" />
                {complaint.complaintId}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Complaint Details
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <button
              onClick={handleExport}
              className="btn btn-secondary"
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </button>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn btn-primary"
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </>
              ) : (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Update
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status Banner */}
        <div className={`p-4 rounded-lg mb-6 flex items-center justify-between ${
          complaint.status === 'Pending' ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800' :
          complaint.status === 'In Progress' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
          'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
        }`}>
          <div className="flex items-center">
            {getStatusIcon(complaint.status)}
            <div className="ml-3">
              <p className="font-medium text-gray-900 dark:text-white">
                Status: {complaint.status}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Created {moment(complaint.createdAt).format('MMMM DD, YYYY at HH:mm')}
              </p>
            </div>
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Customer Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Full Name</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.fullName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Phone Number</p>
                  <a href={`tel:${complaint.phoneNumber}`} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                    {complaint.phoneNumber}
                  </a>
                </div>
                {complaint.alternatePhone && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Alternate Phone</p>
                    <a href={`tel:${complaint.alternatePhone}`} className="text-sm font-medium text-primary-600 hover:text-primary-500">
                      {complaint.alternatePhone}
                    </a>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500 uppercase">Company/Shop</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.companyName}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Address
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{complaint.address}</p>
                </div>
              </div>
            </div>

            {/* Complaint Details */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-primary-600" />
                Complaint Details
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Service Type(s)</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {complaint.serviceType?.map((service, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm rounded-md"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center">
                  <p className="text-xs text-gray-500 uppercase mr-2">Priority:</p>
                  <StatusBadge priority={complaint.priority} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase flex items-center">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    Problem Description
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-white whitespace-pre-wrap">
                      {complaint.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Images */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="card p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Image className="w-5 h-5 mr-2 text-primary-600" />
                  Uploaded Images
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {complaint.images.map((image, index) => (
                    <a
                      key={index}
                      href={image.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative group"
                    >
                      <img
                        src={image.url}
                        alt={`Complaint image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                        <span className="text-white text-sm">View</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Timeline
              </h2>
              <div className="space-y-4">
                {complaint.timeline?.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="relative">
                      <div className={`w-3 h-3 rounded-full ${
                        item.status === 'Completed' ? 'bg-green-500' :
                        item.status === 'In Progress' ? 'bg-blue-500' :
                        'bg-yellow-500'
                      }`} />
                      {index !== complaint.timeline.length - 1 && (
                        <div className="absolute top-3 left-1.5 w-0.5 h-full bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />
                      )}
                    </div>
                    <div className="ml-4 pb-4">
                      <div className="flex items-center">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.status}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {moment(item.updatedAt).format('MMM DD, HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {item.note}
                      </p>
                      <p className="text-xs text-gray-500">
                        by {item.updatedBy}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Update Panel */}
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Edit className="w-5 h-5 mr-2 text-primary-600" />
                Update Status
              </h2>

              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={updateData.status}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, status: e.target.value }))}
                      className="input"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Assign To
                    </label>
                    <select
                      value={updateData.assignedTo}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, assignedTo: e.target.value }))}
                      className="input"
                    >
                      <option value="">Select Technician</option>
                      {technicians.map(tech => (
                        <option key={tech._id} value={tech.name}>{tech.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Note
                    </label>
                    <textarea
                      value={updateData.note}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, note: e.target.value }))}
                      className="input"
                      rows={3}
                      placeholder="Add a note about this update..."
                    />
                  </div>

                  <button
                    onClick={handleUpdate}
                    className="w-full btn btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Current Status</p>
                    <StatusBadge status={complaint.status} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase flex items-center">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Assigned To
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {complaint.assignedTo || 'Not assigned'}
                    </p>
                  </div>
                  {complaint.notes && (
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Notes</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{complaint.notes}</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-400 text-center">
                    Click "Update" to make changes
                  </p>
                </div>
              )}
            </div>

            {/* Quick Info */}
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Quick Info
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-gray-900 dark:text-white">
                    {moment(complaint.createdAt).format('MMM DD, YYYY')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority</span>
                  <StatusBadge priority={complaint.priority} />
                </div>
                {complaint.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Completed</span>
                    <span className="text-green-600">
                      {moment(complaint.completedAt).format('MMM DD, YYYY')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetail;
