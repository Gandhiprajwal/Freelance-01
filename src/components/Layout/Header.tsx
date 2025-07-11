import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, Settings, Moon, Sun, AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/AuthProvider';
import SearchBar from '../Features/SearchBar';
import UserProfile from '../Features/UserProfile';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { darkMode, toggleDarkMode } = useApp();
  const { user, authError, loading: authLoading } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/blogs', label: 'Blogs' },
    { path: '/courses', label: 'Courses' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm z-50 border-b border-gray-200 dark:border-gray-700">
      {/* Auth Error Banner */}
      {authError && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <div className="flex items-center justify-center space-x-2">
            <AlertTriangle className="w-4 h-4" />
            <span>{authError}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center"
            >
              <Settings className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900 dark:text-white">ROBOSTAAN</span>
              <span className="text-xs text-orange-500 -mt-1">An Ageless Adventure</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                  isActive(item.path)
                    ? 'text-orange-500'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <SearchBar />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            {authLoading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            ) : user ? (
              <UserProfile />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-orange-500 border border-orange-500 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                  >
                    Sign In
                  </motion.button>
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700"
        >
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'text-gray-700 dark:text-gray-300 hover:text-orange-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {!user && (
              <div className="pt-4 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-center text-orange-500 border border-orange-500 rounded-lg font-medium hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block px-3 py-2 text-center bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;