import React, { useState, useEffect } from 'react';
import { getConnectionHealth, forceReconnect, checkConnectionHealth } from '../../lib/supabaseConnection';

interface ConnectionStatusProps {
  showDetails?: boolean;
  className?: string;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [status, setStatus] = useState<any>(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateStatus = () => {
      const healthStatus = getConnectionHealth();
      setStatus(healthStatus);
      setLastUpdate(new Date());
    };

    // Initial status
    updateStatus();

    // Update status every 5 seconds
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      await forceReconnect();
      // Wait a bit for reconnection to complete
      setTimeout(() => {
        const healthStatus = getConnectionHealth();
        setStatus(healthStatus);
        setIsReconnecting(false);
      }, 2000);
    } catch (error) {
      console.error('Reconnection failed:', error);
      setIsReconnecting(false);
    }
  };

  const getStatusColor = () => {
    if (!status) return 'text-gray-400';
    
    switch (status.connectionState) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusText = () => {
    if (!status) return 'Unknown';
    
    switch (status.connectionState) {
      case 'connected':
        return 'Connected';
      case 'connecting':
        return 'Connecting...';
      case 'error':
        return 'Error';
      case 'disconnected':
        return 'Disconnected';
      default:
        return 'Unknown';
    }
  };

  const getUptimeText = () => {
    if (!status?.uptime) return 'N/A';
    
    const minutes = Math.floor(status.uptime / 60000);
    const seconds = Math.floor((status.uptime % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  if (!status) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Checking connection...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <span className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500' : status === 'connecting' ? 'bg-yellow-400' : 'bg-red-500'}`}></span>
      <span>{status === 'connected' ? 'Online' : status === 'connecting' ? 'Reconnecting...' : 'Offline'}</span>
    </div>
  );
};

export default ConnectionStatus; 