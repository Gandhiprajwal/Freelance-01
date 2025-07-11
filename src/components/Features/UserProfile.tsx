import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Settings, LogOut, BookOpen, GraduationCap, ChevronDown, Edit, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../Auth/AuthProvider';
import UserProfileModal from './UserProfileModal';

const UserProfile: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const { user, profile, signOut, isAdmin, authError } = useAuth();

  if (!user) {
    if (authError) {
      return (
        <div className="flex items-center space-x-2 text-red-500">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Auth Error</span>
        </div>
      );
    }
    return null;
  }

  const handleSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    setIsOpen(false);
    
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
      // Force reload if signOut fails
      window.location.href = '/';
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user.email || '';

  // Show role badge with proper styling
  const getRoleBadge = () => {
    if (!profile?.role) return null;
    
    const roleColors = {
      admin: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
      instructor: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
      user: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
    };

    return (
      <span className={`inline-block mt-1 px-2 py-1 text-xs rounded-full ${roleColors[profile.role]}`}>
        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
      </span>
    );
  };

  return (
    <>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          disabled={isSigningOut}
        >
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden relative">
            {profile?.avatar_url ? (
              <>
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                  onError={(e) => {
                    // Fallback to initials if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <span className="hidden text-white text-sm font-medium absolute inset-0 flex items-center justify-center">
                  {getInitials(displayName)}
                </span>
              </>
            ) : (
              <span className="text-white text-sm font-medium">
                {getInitials(displayName)}
              </span>
            )}
          </div>
          <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {displayName}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center overflow-hidden relative">
                    {profile?.avatar_url ? (
                      <>
                        <img
                          src={profile.avatar_url}
                          alt={displayName}
                          className="w-12 h-12 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                        <span className="hidden text-white text-lg font-medium absolute inset-0 flex items-center justify-center">
                          {getInitials(displayName)}
                        </span>
                      </>
                    ) : (
                      <span className="text-white text-lg font-medium">
                        {getInitials(displayName)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {displayName}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {displayEmail}
                    </p>
                    {getRoleBadge()}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsOpen(false);
                  }}
                  className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Edit Profile</span>
                </button>

                <Link
                  to="/my-blogs"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">My Blogs</span>
                </Link>

                <Link
                  to="/my-courses"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">My Courses</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Admin Panel</span>
                  </Link>
                )}

                <hr className="my-2 border-gray-200 dark:border-gray-700" />

                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="flex items-center space-x-3 w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-red-600 dark:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSigningOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span className="text-sm">
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Modal */}
      <UserProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default UserProfile;