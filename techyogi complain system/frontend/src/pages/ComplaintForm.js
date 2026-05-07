import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  User,
  Phone,
  Building,
  MapPin,
  Wrench,
  AlertTriangle,
  MessageSquare,
  Upload,
  X,
  CheckCircle,
  ArrowLeft,
  Camera,
  Fingerprint,
  DoorOpen,
  Video,
  Lock,
  Network,
  Wifi,
  HomeIcon,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { complaintAPI } from '../utils/api';
import toast from 'react-hot-toast';

const serviceOptions = [
  { value: 'CCTV', label: 'CCTV Surveillance & Security', icon: Camera },
  { value: 'Biometric Attendance', label: 'Biometric Attendance System', icon: Fingerprint },
  { value: 'Access Control', label: 'Access Door Control System', icon: DoorOpen },
  { value: 'Video Door Phone', label: 'Video Door Phone', icon: Video },
  { value: 'Smart Door Lock', label: 'Smart Door Lock', icon: Lock },
  { value: 'LAN Networking', label: 'LAN & Networking Setup', icon: Network },
  { value: 'Wi-Fi Solution', label: 'Wireless / Wi-Fi Solution', icon: Wifi },
  { value: 'Home Automation', label: 'Home Automation', icon: HomeIcon },
  { value: 'EPABX / Intercom', label: 'EPABX / Intercom System', icon: PhoneCall },
  { value: 'AMC Support', label: 'Annual Maintenance Contract', icon: ShieldCheck },
];

const priorityOptions = [
  { value: 'Low', label: 'Low - Not urgent', color: 'text-green-600 bg-green-50' },
  { value: 'Medium', label: 'Medium - Needs attention', color: 'text-orange-600 bg-orange-50' },
  { value: 'High', label: 'High - Urgent issue', color: 'text-red-600 bg-red-50' },
];

const ComplaintForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    alternatePhone: '',
    companyName: '',
    address: '',
    serviceType: [],
    priority: 'Medium',
    message: '',
  });
  
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceToggle = (service) => {
    setFormData(prev => ({
      ...prev,
      serviceType: prev.serviceType.includes(service)
        ? prev.serviceType.filter(s => s !== service)
        : [...prev.serviceType, service],
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.serviceType.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      
      Object.keys(formData).forEach(key => {
        if (key === 'serviceType') {
          formData[key].forEach(value => submitData.append('serviceType[]', value));
        } else {
          submitData.append(key, formData[key]);
        }
      });

      images.forEach(image => {
        submitData.append('images', image);
      });

      const response = await complaintAPI.create(submitData);

      if (response.data.success) {
        setSubmittedComplaint(response.data.data);
        toast.success('Complaint submitted successfully!');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit complaint';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phoneNumber: '',
      alternatePhone: '',
      companyName: '',
      address: '',
      serviceType: [],
      priority: 'Medium',
      message: '',
    });
    setImages([]);
    setImagePreview([]);
    setSubmittedComplaint(null);
  };

  // Success View
  if (submittedComplaint) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="card p-8 text-center animate-fade-in">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Complaint Submitted Successfully!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We have received your complaint and will contact you shortly.
            </p>

            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl p-6 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Your Complaint ID
              </p>
              <p className="text-3xl font-bold text-primary-700 dark:text-primary-400 tracking-wider">
                {submittedComplaint.complaintId}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                Please save this ID for tracking your complaint
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/track"
                className="btn btn-primary"
              >
                Track Your Complaint
              </Link>
              <button
                onClick={resetForm}
                className="btn btn-secondary"
              >
                Submit Another Complaint
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
            <FileText className="w-8 h-8 mr-3 text-primary-600" />
            Submit a Complaint
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Fill in the details below and we will get back to you as soon as possible.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card overflow-hidden">
          <div className="p-6 md:p-8 space-y-8">
            {/* Personal Information */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Personal Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Enter your full name"
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
                    required
                    className="input"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Alternate Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    name="alternatePhone"
                    value={formData.alternatePhone}
                    onChange={handleInputChange}
                    className="input"
                    placeholder="Enter alternate phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Company / Shop / Flat Name *
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    required
                    className="input"
                    placeholder="Enter company or property name"
                  />
                </div>
              </div>
            </section>

            {/* Address */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Address
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="input"
                  placeholder="Enter your complete address"
                />
              </div>
            </section>

            {/* Service Selection */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Wrench className="w-5 h-5 mr-2 text-primary-600" />
                Select Service(s) *
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {serviceOptions.map((service) => {
                  const Icon = service.icon;
                  const isSelected = formData.serviceType.includes(service.value);
                  
                  return (
                    <button
                      key={service.value}
                      type="button"
                      onClick={() => handleServiceToggle(service.value)}
                      className={`p-3 rounded-lg border-2 text-left transition-all flex items-start space-x-3 ${
                        isSelected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                      }`}
                    >
                      <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-primary-600' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${isSelected ? 'text-primary-700 dark:text-primary-400' : 'text-gray-700 dark:text-gray-300'}`}>
                        {service.label}
                      </span>
                    </button>
                  );
                })}
              </div>
              {formData.serviceType.length === 0 && (
                <p className="text-sm text-red-500 mt-2">
                  Please select at least one service
                </p>
              )}
            </section>

            {/* Priority */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-primary-600" />
                Complaint Priority *
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      formData.priority === option.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        option.value === 'Low' ? 'bg-green-500' :
                        option.value === 'Medium' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`} />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {option.value}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${option.color}`}>
                      {option.label}
                    </p>
                  </button>
                ))}
              </div>
            </section>

            {/* Message */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-primary-600" />
                Problem Description *
              </h2>
              <div>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className="input"
                  placeholder="Describe the issue you're facing in detail..."
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Please provide as much detail as possible to help us understand the issue.
                </p>
              </div>
            </section>

            {/* Image Upload */}
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Upload className="w-5 h-5 mr-2 text-primary-600" />
                Upload Images (Optional)
              </h2>
              <div>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Click to upload images (Max 5 images, 5MB each)
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: JPEG, PNG, WebP
                    </p>
                  </label>
                </div>

                {imagePreview.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {imagePreview.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Submit Button */}
          <div className="bg-gray-50 dark:bg-gray-800 px-6 md:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                * Required fields
              </p>
              <div className="flex gap-3">
                <Link
                  to="/"
                  className="btn btn-secondary"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting || formData.serviceType.length === 0}
                  className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Complaint'
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComplaintForm;
