import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import Newsletter from '../Features/Newsletter';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' }
  ];

  const quickLinks = [
    { path: '/', label: 'Home' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/courses', label: 'Courses' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  const resourceLinks = [
    { path: '/tutorials', label: 'Tutorials' },
    { path: '/documentation', label: 'Documentation' },
    { path: '/community', label: 'Community' },
    { path: '/support', label: 'Support' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center"
              >
                <Settings className="w-6 h-6 text-white" />
              </motion.div>
              <div className="flex flex-col">
                <span className="text-xl font-bold">ROBOSTAAN</span>
                <span className="text-sm text-orange-500">An Ageless Adventure</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm">
              Empowering the next generation of roboticists with cutting-edge education and hands-on experience.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  whileHover={{ scale: 1.2 }}
                  className="text-gray-400 hover:text-orange-500 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-gray-400 hover:text-orange-500 transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Contact Info</h4>
              <div className="space-y-2 text-sm text-gray-400">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>info@robostaan.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4" />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Robotics St, Tech City</span>
                </div>
              </div>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <Newsletter />
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} ROBOSTAAN. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
            <Link to="/privacy" className="hover:text-orange-500 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-orange-500 transition-colors">
              Terms of Service
            </Link>
            <Link to="/cookies" className="hover:text-orange-500 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;