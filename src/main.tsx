
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { supabaseReady } from './lib/supabaseConnection';
import React, { useState, useEffect } from 'react';

const Root = () => {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabaseReady.then(() => setReady(true));
  }, []);
  if (!ready) return <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Connecting to Supabase...</div>;
  return <App />;
};

createRoot(document.getElementById('root')!).render(
    <Root />
);
