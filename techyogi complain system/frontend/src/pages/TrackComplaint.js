import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ArrowLeft,
  FileSearch,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Phone,
  MapPin,
  Wrench,
  AlertTriangle,
  Calendar,
  Package,
} from 'lucide-react';
import { complaintAPI } from '../utils/api';
import StatusBadge from '../components/StatusBadge';
import toast from 'react-hot-toast';
import moment from 'moment';

const TrackComplaint = () => {
  const [complaintId, setComplaintId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [complaint, setComplaint] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setComplaint(null);

    if (!complaintId.trim() || !phoneNumber.trim()) {
      setError('Please enter both Complaint ID and Phone Number');
      return;
    }

    setIsLoading(true);

    try {
      const response = await complaintAPI.track({
        complaintId: complaintId.trim(),
        phoneNumber: phoneNumber.trim(),
      });

      if (response.data.success) {
        setComplaint(response.data.data);
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to track complaint';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <Clock className="w-6 h-6 text-yellow-500" />;
      case 'In Progress':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'Completed':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'Pending':
        return 'Your complaint has been received and is awaiting review.';
      case 'In Progress':
        return 'A technician has been assigned and is working on your complaint.';
      case 'Completed':
        return 'Your complaint has been resolved. Thank you for your patience.';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Search className="w-8 h-8 mr-3 text-primary-600" />
            Track Your Complaint
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Enter your Complaint ID and Phone Number to check the status.
          </p>
        </div>

        {/* Search Form */}
        <div className="card p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Complaint ID *
                </label>
                <div className="relative">
                  <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={complaintId}
                    onChange={(e) => setComplaintId(e.target.value.toUpperCase())}
                    className="input pl-10"
                    placeholder="e.g., TYG-ABC123-XYZ"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="input pl-10"
                    placeholder="Enter registered phone number"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Track Complaint
                  </>
                )}
              </button>
              <Link
                to="/"
                className="btn btn-secondary"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Results */}
        {complaint && (
          <div className="card overflow-hidden animate-fade-in">
            {/* Status Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-primary-100 text-sm">Complaint ID</p>
                  <p className="text-2xl font-bold tracking-wider">{complaint.complaintId}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={complaint.status} />
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Message */}
              <div className="flex items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                {getStatusIcon(complaint.status)}
                <div className="ml-3">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Status: {complaint.status}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {getStatusMessage(complaint.status)}
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-primary-600" />
                  Customer Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                    <p className="font-medium text-gray-900 dark:text-white">{complaint.fullName}</p>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
                    <p className="font-medium text-gray-900 dark:text-white">{complaint.phoneNumber}</p>
                  </div>
                </div>
              </section>

              {/* Complaint Details */}
              <section>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Wrench className="w-5 h-5 mr-2 text-primary-600" />
                  Complaint Details
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Package className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Service Type</p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {complaint.serviceType?.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-gray-400 mr-2" />
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">Priority:</span>
                      <StatusBadge priority={complaint.priority} />
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Message</p>
                      <p className="text-sm text-gray-900 dark:text-white">{complaint.message}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Timeline */}
              {complaint.timeline && complaint.timeline.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    Complaint Timeline
                  </h3>
                  <div className="space-y-4">
                    {complaint.timeline.map((item, index) => (
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
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              {moment(item.updatedAt).format('MMM DD, HH:mm')}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.note}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            by {item.updatedBy}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Technician */}
              {complaint.assignedTo && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Assigned Technician
                  </h3>
                  <div className="p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="font-medium text-primary-700 dark:text-primary-400">
                      {complaint.assignedTo}
                    </p>
                    <p className="text-sm text-primary-600 dark:text-primary-500">
                      Will contact you shortly
                    </p>
                  </div>
                </section>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackComplaint;
