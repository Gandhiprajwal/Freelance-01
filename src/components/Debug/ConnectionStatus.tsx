import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../Auth/AuthProvider';

const ConnectionStatus: React.FC = () => {
  const { blogs, courses, loading } = useApp();
  const { user, profile } = useAuth();
  const [envStatus, setEnvStatus] = useState({
    supabaseUrl: false,
    supabaseKey: false
  });

  useEffect(() => {
    // Check if environment variables are available
    setEnvStatus({
      supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL,
      supabaseKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
    });
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="text-sm space-y-1">
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>Blogs: {blogs.length}</div>
        <div>Courses: {courses.length}</div>
        <div>User: {user ? 'Logged in' : 'Not logged in'}</div>
        <div>Profile: {profile ? 'Loaded' : 'Not loaded'}</div>
        <div>SUPABASE_URL: {envStatus.supabaseUrl ? '✅' : '❌'}</div>
        <div>SUPABASE_KEY: {envStatus.supabaseKey ? '✅' : '❌'}</div>
      </div>
    </div>
  );
};

export default ConnectionStatus; 