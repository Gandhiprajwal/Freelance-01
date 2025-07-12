import React, { useState, useEffect } from 'react';
import { getPoolStatus } from '../../lib/supabaseConnectionPool';
import { Database, Activity, AlertTriangle, CheckCircle } from 'lucide-react';

interface ConnectionPoolStatusProps {
  showDetails?: boolean;
  className?: string;
}

const ConnectionPoolStatus: React.FC<ConnectionPoolStatusProps> = ({ 
  showDetails = false, 
  className = '' 
}) => {
  const [poolStatus, setPoolStatus] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const updateStatus = () => {
      const status = getPoolStatus();
      setPoolStatus(status);
      setLastUpdate(new Date());
    };

    // Initial status
    updateStatus();

    // Update status every 10 seconds
    const interval = setInterval(updateStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  const getPoolHealthColor = () => {
    if (!poolStatus) return 'text-gray-400';
    
    const healthRatio = poolStatus.healthyConnections / poolStatus.totalConnections;
    
    if (healthRatio >= 0.8) return 'text-green-500';
    if (healthRatio >= 0.5) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getPoolHealthText = () => {
    if (!poolStatus) return 'Unknown';
    
    const healthRatio = poolStatus.healthyConnections / poolStatus.totalConnections;
    
    if (healthRatio >= 0.8) return 'Healthy';
    if (healthRatio >= 0.5) return 'Warning';
    return 'Critical';
  };

  const getUtilizationPercentage = () => {
    if (!poolStatus || poolStatus.totalConnections === 0) return 0;
    return Math.round((poolStatus.inUseConnections / poolStatus.totalConnections) * 100);
  };

  if (!poolStatus) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-500">Checking pool...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Pool Icon */}
      <Database className={`w-4 h-4 ${getPoolHealthColor()}`} />
      
      {/* Status Text */}
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${getPoolHealthColor()}`}>
          Pool: {getPoolHealthText()}
        </span>
        {showDetails && (
          <span className="text-xs text-gray-500">
            {poolStatus.inUseConnections}/{poolStatus.totalConnections} in use
          </span>
        )}
      </div>
      
      {/* Health Indicator */}
      <div className={`w-2 h-2 rounded-full ${getPoolHealthColor()}`}></div>
      
      {/* Detailed Status (optional) */}
      {showDetails && (
        <div className="text-xs text-gray-500 space-y-1 ml-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-3 h-3 text-green-500" />
            <span>Healthy: {poolStatus.healthyConnections}</span>
          </div>
          {poolStatus.unhealthyConnections > 0 && (
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-3 h-3 text-red-500" />
              <span>Unhealthy: {poolStatus.unhealthyConnections}</span>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Activity className="w-3 h-3 text-blue-500" />
            <span>Utilization: {getUtilizationPercentage()}%</span>
          </div>
          <div className="text-xs">
            Min: {poolStatus.minConnections} | Max: {poolStatus.maxConnections}
          </div>
          <div className="text-xs text-gray-400">
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionPoolStatus; 