import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Wrench,
  Star,
  X,
  Save,
} from 'lucide-react';
import { technicianAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const serviceOptions = [
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

const Technicians = () => {
  const [technicians, setTechnicians] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTech, setEditingTech] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    expertise: [],
    isActive: true,
  });

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const fetchTechnicians = async () => {
    try {
      setIsLoading(true);
      const [techRes, statsRes] = await Promise.all([
        technicianAPI.getAll(),
        technicianAPI.getStats(),
      ]);

      if (techRes.data.success) {
        setTechnicians(techRes.data.data);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (error) {
      toast.error('Failed to load technicians');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleExpertiseToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.includes(service)
        ? prev.expertise.filter(s => s !== service)
        : [...prev.expertise, service],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingTech) {
        const response = await technicianAPI.update(editingTech._id, formData);
        if (response.data.success) {
          toast.success('Technician updated successfully');
        }
      } else {
        const response = await technicianAPI.create(formData);
        if (response.data.success) {
          toast.success('Technician created successfully');
        }
      }

      setIsModalOpen(false);
      setEditingTech(null);
      setFormData({
        name: '',
        phoneNumber: '',
        email: '',
        expertise: [],
        isActive: true,
      });
      fetchTechnicians();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (tech) => {
    setEditingTech(tech);
    setFormData({
      name: tech.name,
      phoneNumber: tech.phoneNumber,
      email: tech.email || '',
      expertise: tech.expertise || [],
      isActive: tech.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this technician?')) {
      return;
    }

    try {
      await technicianAPI.delete(id);
      toast.success('Technician deleted successfully');
      fetchTechnicians();
    } catch (error) {
      toast.error('Failed to delete technician');
    }
  };

  const filteredTechnicians = technicians.filter(tech =>
    tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tech.phoneNumber.includes(searchTerm)
  );

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Users className="w-7 h-7 mr-2 text-primary-600" />
              Technicians
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage your technical team
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                setEditingTech(null);
                setFormData({
                  name: '',
                  phoneNumber: '',
                  email: '',
                  expertise: [],
                  isActive: true,
                });
                setIsModalOpen(true);
              }}
              className="btn btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Technician
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Active</p>
            <p className="text-2xl font-bold text-green-600">{stats.active || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Assigned</p>
            <p className="text-2xl font-bold text-blue-600">{stats.totalAssigned || 0}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalCompleted || 0}</p>
          </div>
        </div>

        {/* Search */}
        <div className="card p-4 mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
              placeholder="Search technicians by name or phone..."
            />
          </div>
        </div>

        {/* Technicians Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTechnicians.map((tech) => (
            <div key={tech._id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{tech.name}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>{tech.rating || '0.0'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  {tech.isActive ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Phone className="w-4 h-4 text-gray-400 mr-2" />
                  <a href={`tel:${tech.phoneNumber}`} className="text-primary-600 hover:text-primary-500">
                    {tech.phoneNumber}
                  </a>
                </div>
                {tech.email && (
                  <div className="flex items-center text-sm">
                    <Mail className="w-4 h-4 text-gray-400 mr-2" />
                    <a href={`mailto:${tech.email}`} className="text-primary-600 hover:text-primary-500">
                      {tech.email}
                    </a>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 uppercase mb-2">Expertise</p>
                <div className="flex flex-wrap gap-1">
                  {tech.expertise?.slice(0, 3).map((exp, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                    >
                      {exp}
                    </span>
                  ))}
                  {tech.expertise?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                      +{tech.expertise.length - 3}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm">
                  <span className="text-gray-500">Assigned: </span>
                  <span className="font-medium text-gray-900 dark:text-white">{tech.assignedComplaints?.length || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(tech)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tech._id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTechnicians.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No technicians found</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {editingTech ? 'Edit Technician' : 'Add Technician'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email (Optional)
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Expertise
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {serviceOptions.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => handleExpertiseToggle(service)}
                        className={`p-2 text-left text-sm rounded-lg border-2 transition-all ${
                          formData.expertise.includes(service)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Active
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {editingTech ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Technicians;
