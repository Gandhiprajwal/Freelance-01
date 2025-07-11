import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Settings, ArrowRight, AlertCircle, Wifi, WifiOff } from 'lucide-react';
import { supabase } from '../lib/supabaseConnection';
import { useApp } from '../context/AppContext';
import { useAuth } from '../components/Auth/AuthProvider';

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const navigate = useNavigate();
  const { refreshData } = useApp();
  const { authError } = useAuth();

  // Demo credentials
  const demoCredentials = [
    { email: 'admin@robostaan.com', password: 'admin123', role: 'Admin' },
    { email: 'instructor@robostaan.com', password: 'instructor123', role: 'Instructor' },
    { email: 'student@robostaan.com', password: 'student123', role: 'Student' }
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (connectionStatus === 'error') {
      setError('Authentication service is currently unavailable. Please try again later.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please check your email and confirm your account before signing in.');
        } else {
          setError('Login failed. Please try again later.');
        }
        return;
      }

      if (data.user) {
        // Create or update user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .upsert({
            user_id: data.user.id,
            email: data.user.email,
            full_name: data.user.user_metadata?.full_name,
            role: formData.email === 'admin@robostaan.com' ? 'admin' : 'user'
          });

        if (profileError) console.error('Profile error:', profileError);
        
        await refreshData();
        navigate('/');
      }
    } catch (error: any) {
      setError('Connection error. Please check your internet connection and try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (credentials: { email: string; password: string; role: string }) => {
    if (connectionStatus === 'error') {
      setError('Authentication service is currently unavailable. Please try again later.');
      return;
    }

    setFormData({ email: credentials.email, password: credentials.password });
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (data.user) {
        await refreshData();
        navigate('/');
      }
    } catch (error: any) {
      setError('Demo login failed. Please try again.');
      console.error('Demo login error:', error);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to your account
            </p>
          </div>

          {(error || authError) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center space-x-2"
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error || authError}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || connectionStatus === 'error'}
              className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/signup"
              className="text-orange-500 hover:text-orange-600 transition-colors"
            >
              Don't have an account? Sign up
            </Link>
          </div>

          {/* Demo Credentials */}
          {connectionStatus === 'connected' && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Demo Accounts
              </h3>
              <div className="space-y-2">
                {demoCredentials.map((cred, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleDemoLogin(cred)}
                    disabled={loading}
                    className="w-full p-3 text-left bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {cred.role}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {cred.email}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          )}
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

export default Login;