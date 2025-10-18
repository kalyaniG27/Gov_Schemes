import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, IndianRupee as GovIndia } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Government Scheme Portal</h3>
            <p className="text-gray-400 mb-4">
              Your one-stop platform to discover, learn about, and apply for various government welfare schemes available to citizens.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="text-gray-400 hover:text-primary transition-colors">
                  Explore Schemes
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="text-gray-400 hover:text-primary transition-colors">
                  Check Eligibility
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-gray-400 hover:text-primary transition-colors">
                  User Dashboard
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Scheme Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/schemes?category=students" className="text-gray-400 hover:text-primary transition-colors">
                  Student Schemes
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=farmers" className="text-gray-400 hover:text-primary transition-colors">
                  Farmer Schemes
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=women" className="text-gray-400 hover:text-primary transition-colors">
                  Women Schemes
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=senior-citizens" className="text-gray-400 hover:text-primary transition-colors">
                  Senior Citizen Schemes
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=health" className="text-gray-400 hover:text-primary transition-colors">
                  Health Schemes
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=housing" className="text-gray-400 hover:text-primary transition-colors">
                  Housing Schemes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin size={20} className="text-primary mr-3 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Ministry of Electronics & IT, Electronics Niketan, 6, CGO Complex, New Delhi - 110003
                </span>
              </li>
              <li className="flex items-center">
                <Phone size={20} className="text-primary mr-3 flex-shrink-0" />
                <span className="text-gray-400">1800-11-4455</span>
              </li>
              <li className="flex items-center">
                <Mail size={20} className="text-primary mr-3 flex-shrink-0" />
                <span className="text-gray-400">support@govschemes.gov.in</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800 py-6">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 Government Scheme Portal. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">
              Terms of Service
            </a>
            <a href="#" className="text-gray-400 hover:text-primary text-sm transition-colors">
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;