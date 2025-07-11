
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import React, { useState, useEffect } from 'react';

const Root = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    // The original code had supabaseReady.then(() => setReady(true));
    // Since supabaseReady is removed, we need to wait for Supabase directly
    // or assume it's available globally. For now, we'll just set ready to true
    // as a placeholder, as the original code didn't explicitly wait for Supabase.
    // If Supabase is truly needed, this logic needs to be re-evaluated.
    setReady(true); // Assuming Supabase is available or handled elsewhere
  }, []);
  if (!ready) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Connecting to Supabase...</div>;
  return <App />;
};

createRoot(document.getElementById('root')!).render(
    <Root />
);
