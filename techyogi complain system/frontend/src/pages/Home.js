import React from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Fingerprint,
  DoorOpen,
  Video,
  Lock,
  Network,
  Wifi,
  HomeIcon,
  Phone,
  Shield,
  CheckCircle,
  Clock,
  Headphones,
  ChevronRight,
} from 'lucide-react';

const services = [
  {
    icon: Camera,
    title: 'CCTV Surveillance',
    description: '24/7 monitoring with HD cameras and smart recording systems',
  },
  {
    icon: Fingerprint,
    title: 'Biometric Attendance',
    description: 'Advanced time attendance and access control solutions',
  },
  {
    icon: DoorOpen,
    title: 'Video Door Phone',
    description: 'Smart video intercom systems for secure entry management',
  },
  {
    icon: Lock,
    title: 'Smart Door Lock',
    description: 'Keyless entry with fingerprint and mobile app control',
  },
  {
    icon: Network,
    title: 'LAN & Networking',
    description: 'Professional network setup and infrastructure solutions',
  },
  {
    icon: Wifi,
    title: 'Wi-Fi Solutions',
    description: 'High-speed wireless coverage for homes and offices',
  },
  {
    icon: HomeIcon,
    title: 'Home Automation',
    description: 'Smart home integration for modern living',
  },
  {
    icon: Phone,
    title: 'EPABX / Intercom',
    description: 'Business communication systems and intercom setup',
  },
];

const features = [
  {
    icon: Clock,
    title: '24/7 Support',
    description: 'Round-the-clock assistance for all your security needs',
  },
  {
    icon: Shield,
    title: 'Expert Technicians',
    description: 'Certified professionals with years of experience',
  },
  {
    icon: CheckCircle,
    title: 'Quality Assurance',
    description: 'Premium products with warranty and AMC support',
  },
  {
    icon: Headphones,
    title: 'Quick Response',
    description: 'Fast complaint resolution and service delivery',
  },
];

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnptMCAwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4xKSIvPjwvZz48L3N2Zz4=')] opacity-30"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-6">
              <Shield className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Trusted Security Partner</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Smart Security,
              <span className="block text-primary-200">Always On</span>
            </h1>
            
            <p className="text-lg md:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              Your trusted partner for CCTV, Biometric Systems, Access Control, 
              and complete automation solutions for homes and businesses.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/submit-complaint"
                className="w-full sm:w-auto px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors flex items-center justify-center"
              >
                Submit Complaint
                <ChevronRight className="w-5 h-5 ml-2" />
              </Link>
              <Link
                to="/track"
                className="w-full sm:w-auto px-8 py-4 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors border border-primary-500 flex items-center justify-center"
              >
                Track Status
              </Link>
            </div>

            {/* Contact Numbers */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="tel:+918511150751" className="flex items-center hover:text-primary-200 transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                +91 85111 50751
              </a>
              <a href="tel:+917567490201" className="flex items-center hover:text-primary-200 transition-colors">
                <Phone className="w-4 h-4 mr-2" />
                +91 75674 90201
              </a>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-gray-50 dark:text-gray-900"/>
          </svg>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Comprehensive security and automation solutions tailored to your needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                Why Choose Techyogi?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
                We combine cutting-edge technology with exceptional service to deliver 
                security solutions that you can rely on. Our commitment to quality and 
                customer satisfaction sets us apart.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <feature.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/20 dark:to-primary-800/20 rounded-3xl flex items-center justify-center">
                <div className="text-center p-8">
                  <Shield className="w-24 h-24 text-primary-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Your Security,
                  </h3>
                  <p className="text-xl text-primary-600 dark:text-primary-400 font-semibold">
                    Our Priority
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Need Support?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Facing issues with your security system? Submit a complaint and our team 
            will resolve it quickly. Track your complaint status anytime.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/submit-complaint"
              className="w-full sm:w-auto px-8 py-4 bg-white text-primary-700 font-semibold rounded-xl hover:bg-primary-50 transition-colors"
            >
              Submit a Complaint
            </Link>
            <Link
              to="/track"
              className="w-full sm:w-auto px-8 py-4 bg-primary-700 text-white font-semibold rounded-xl hover:bg-primary-600 transition-colors border border-primary-500"
            >
              Track Your Complaint
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TY</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Techyogi Automation</h3>
                  <p className="text-xs text-gray-400">Smart Security, Always On</p>
                </div>
              </div>
              <p className="text-sm">
                Your trusted partner for all security and automation needs.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/submit-complaint" className="hover:text-white transition-colors">Submit Complaint</Link></li>
                <li><Link to="/track" className="hover:text-white transition-colors">Track Status</Link></li>
                <li><Link to="/admin/login" className="hover:text-white transition-colors">Admin Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href="tel:+918511150751" className="hover:text-white transition-colors">+91 85111 50751</a>
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href="tel:+917567490201" className="hover:text-white transition-colors">+91 75674 90201</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Techyogi Automation. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
