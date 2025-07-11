import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseConnection';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('newsletter_subscriptions')
        .insert([{ email }]);

      if (error) {
        if (error.code === '23505') {
          setError('This email is already subscribed!');
        } else {
          throw error;
        }
      } else {
        setSubscribed(true);
        setEmail('');
      }
    } catch (error: any) {
      setError('Failed to subscribe. Please try again.');
      console.error('Newsletter subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center"
      >
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
          Successfully Subscribed!
        </h3>
        <p className="text-green-600 dark:text-green-300">
          Thank you for subscribing to our newsletter. You'll receive the latest robotics updates and insights.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Mail className="w-6 h-6 text-orange-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Stay Updated
        </h3>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Get the latest robotics news, tutorials, and course updates delivered to your inbox.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email address"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          required
        />
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Subscribe</span>
            </>
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default Newsletter;