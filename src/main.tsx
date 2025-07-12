
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getSupabaseConnection } from './lib/supabaseConnection';
import React, { useState, useEffect } from 'react';

const Root = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const connection = getSupabaseConnection();
    connection.executeWithRetry(async (client) => {
      // Just test the connection
      await client.from('blogs').select('id').limit(1);
    }).then(() => setReady(true)).catch(() => setReady(true)); // Even if it fails, we can still render the app
  }, []);
  if (!ready) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Connecting to Supabase...</div>;
  return <App />;
};

createRoot(document.getElementById('root')!).render(
    <Root />
);
