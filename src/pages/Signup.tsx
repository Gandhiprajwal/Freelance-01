import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Settings, ArrowRight, User, AlertCircle, Wifi, WifiOff, Key, Shield, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseConnection';
import { useApp } from '../context/AppContext';

const Signup: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<'user' | 'admin'>('user');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const navigate = useNavigate();
  const { refreshData } = useApp();

  // Admin key for creating admin accounts
  const ADMIN_SECRET_KEY = 'ROBOSTAAN_ADMIN_2024';

  useEffect(() => {
    // Check connection status
    const checkConnection = async () => {
      try {
        const { data, error } = await supabase.from('blogs').select('id').limit(1);
        if (error) {
          setConnectionStatus('error');
        } else {
          setConnectionStatus('connected');
        }
      } catch (err) {
        setConnectionStatus('error');
      }
    };

    checkConnection();

    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          navigate('/');
        }
      } catch (err) {
        console.error('Error checking user:', err);
      }
    };
    
    if (connectionStatus === 'connected') {
      checkUser();
    }
  }, [navigate, connectionStatus]);

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (accountType === 'admin') {
      if (!formData.adminKey.trim()) {
        setError('Admin key is required for admin accounts');
        return false;
      }
      if (formData.adminKey !== ADMIN_SECRET_KEY) {
        setError('Invalid admin key. Please contact the system administrator.');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus === 'error') {
      setError('Authentication service is currently unavailable. Please try again later.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Sign up the user
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            account_type: accountType
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.');
        } else if (error.message.includes('Invalid email')) {
          setError('Please enter a valid email address.');
        } else if (error.message.includes('Password should be at least')) {
          setError('Password should be at least 6 characters long.');
        } else {
          setError('Failed to create account. Please try again.');
        }
        return;
      }

      if (data.user) {
        // Create user profile with appropriate role
        const userRole = (accountType === 'admin' || formData.adminKey.trim() === ADMIN_SECRET_KEY)
          ? 'admin'
          : 'user';
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert([
            {
              user_id: data.user.id,
              email: data.user.email,
              full_name: formData.fullName,
              role: userRole
            }
          ], { onConflict: 'user_id' });
        if (profileError) {
          console.error('Profile creation/upsert error:', profileError);
        }

        setSuccess(true);
        
        // If email confirmation is disabled, sign in automatically
        if (data.session) {
          await refreshData();
          setTimeout(() => navigate('/'), 2000);
        } else {
          // Show success message for email confirmation
          setTimeout(() => navigate('/login'), 3000);
        }
      }
    } catch (error: any) {
      setError('Connection error. Please check your internet connection and try again.');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-white text-2xl font-bold"
            >
              ✓
            </motion.div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {accountType === 'admin' ? 'Admin Account Created!' : 'Account Created Successfully!'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {accountType === 'admin' 
              ? 'Welcome to ROBOSTAAN! You now have admin privileges to manage content.'
              : 'Welcome to ROBOSTAAN! You can now start exploring our courses and blogs.'
            }
          </p>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Redirecting...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-orange-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center space-x-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center"
            >
              <Settings className="w-7 h-7 text-white" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white">ROBOSTAAN</span>
              <span className="text-sm text-orange-500">An Ageless Adventure</span>
            </div>
          </Link>
        </motion.div>

        {/* Connection Status */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-4"
        >
          <div className={`flex items-center justify-center space-x-2 p-3 rounded-lg ${
            connectionStatus === 'connected' 
              ? 'bg-green-100 text-green-800' 
              : connectionStatus === 'error'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatus === 'connected' ? (
              <>
                <Wifi className="w-4 h-4" />
                <span className="text-sm">Connected to authentication service</span>
              </>
            ) : connectionStatus === 'error' ? (
              <>
                <WifiOff className="w-4 h-4" />
                <span className="text-sm">Authentication service temporarily unavailable</span>
              </>
            ) : (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm">Checking connection...</span>
              </>
            )}
          </div>
        </motion.div>

        {/* Signup Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Create Account
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Join the robotics community
            </p>
          </div>

          {/* Account Type Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setAccountType('user')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accountType === 'user'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <UserCheck className={`w-6 h-6 mx-auto mb-2 ${
                  accountType === 'user' ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className="text-sm font-medium text-gray-900 dark:text-white">User</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Regular account</div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => setAccountType('admin')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  accountType === 'admin'
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                }`}
              >
                <Shield className={`w-6 h-6 mx-auto mb-2 ${
                  accountType === 'admin' ? 'text-orange-500' : 'text-gray-400'
                }`} />
                <div className="text-sm font-medium text-gray-900 dark:text-white">Admin</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Requires key</div>
              </motion.button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Admin Key Field */}
            {accountType === 'admin' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Admin Key
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showAdminKey ? 'text' : 'password'}
                    value={formData.adminKey}
                    onChange={(e) => setFormData({ ...formData, adminKey: e.target.value })}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Enter admin key"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminKey(!showAdminKey)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showAdminKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Contact the system administrator for the admin key
                </p>
              </motion.div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Confirm your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || connectionStatus === 'error'}
              className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                accountType === 'admin'
                  ? 'bg-purple-500 hover:bg-purple-600 text-white'
                  : 'bg-orange-500 hover:bg-orange-600 text-white'
              }`}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {accountType === 'admin' ? <Shield className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                  <span>Create {accountType === 'admin' ? 'Admin' : 'User'} Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              Already have an account? Sign in
            </Link>
          </div>

          {/* Admin Key Info */}
          {accountType === 'admin' && (
            <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
              <div className="flex items-center space-x-2 text-purple-700 dark:text-purple-300">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Admin Account</span>
              </div>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Admin accounts have full access to manage content, users, and system settings. 
                The admin key is required for security purposes.
              </p>
            </div>
          )}

          {/* Terms and Privacy */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our{' '}
            <Link to="/terms" className="text-orange-500 hover:text-orange-600">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-orange-500 hover:text-orange-600">
              Privacy Policy
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-6"
        >
          <Link
            to="/"
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;