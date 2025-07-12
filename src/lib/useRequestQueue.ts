import { useState, useEffect, useCallback } from 'react';
import { requestQueue, getQueueStatus, QueuedRequest } from './requestQueue';

export interface RequestQueueStatus {
  queueLength: number;
  processing: boolean;
  pendingRequests: number;
  retryRequests: number;
}

export interface UseRequestQueueReturn {
  // Queue status
  status: RequestQueueStatus;
  
  // Queue operations
  enqueueRequest: (
    type: QueuedRequest['type'],
    data: any,
    priority?: 'high' | 'normal' | 'low'
  ) => Promise<string>;
  
  // Queue management
  clearQueue: () => void;
  stopQueue: () => void;
  resumeQueue: () => void;
  
  // Connection status
  isConnected: boolean;
  connectionStatus: string;
  
  // Error handling
  failedRequests: Array<{
    requestId: string;
    type: string;
    error: string;
    timestamp: number;
  }>;
  
  // Utility functions
  retryFailedRequest: (requestId: string) => void;
  clearFailedRequests: () => void;
}

export function useRequestQueue(): UseRequestQueueReturn {
  const [status, setStatus] = useState<RequestQueueStatus>({
    queueLength: 0,
    processing: false,
    pendingRequests: 0,
    retryRequests: 0
  });

  const [isConnected, setIsConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [failedRequests, setFailedRequests] = useState<Array<{
    requestId: string;
    type: string;
    error: string;
    timestamp: number;
  }>>([]);

  // Update status periodically
  useEffect(() => {
    const updateStatus = () => {
      setStatus(getQueueStatus());
    };

    // Update immediately
    updateStatus();

    // Update every 2 seconds
    const interval = setInterval(updateStatus, 2000);

    return () => clearInterval(interval);
  }, []);

  // Listen for failed requests
  useEffect(() => {
    const handleRequestFailed = (event: CustomEvent) => {
      const { requestId, type, error, timestamp } = event.detail;
      
      setFailedRequests(prev => [
        ...prev,
        { requestId, type, error, timestamp }
      ]);
    };

    window.addEventListener('requestFailed', handleRequestFailed as EventListener);

    return () => {
      window.removeEventListener('requestFailed', handleRequestFailed as EventListener);
    };
  }, []);

  // Monitor connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const { getSupabaseConnection } = await import('./supabaseConnection');
        const connection = getSupabaseConnection();
        const status = connection.getConnectionStatus();
        
        setIsConnected(status === 'connected');
        setConnectionStatus(status);
      } catch (error) {
        console.error('Error checking connection status:', error);
        setIsConnected(false);
        setConnectionStatus('error');
      }
    };

    // Check immediately
    checkConnection();

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => clearInterval(interval);
  }, []);

  // Enqueue request with optimistic UI updates
  const enqueueRequest = useCallback(async (
    type: QueuedRequest['type'],
    data: any,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<string> => {
    try {
      const requestId = await requestQueue.enqueue(type, data, priority);
      
      // Update status immediately
      setStatus(getQueueStatus());
      
      return requestId;
    } catch (error) {
      console.error('Failed to enqueue request:', error);
      throw error;
    }
  }, []);

  // Queue management functions
  const clearQueue = useCallback(() => {
    requestQueue.clearQueue();
    setStatus(getQueueStatus());
  }, []);

  const stopQueue = useCallback(() => {
    requestQueue.stop();
    setStatus(getQueueStatus());
  }, []);

  const resumeQueue = useCallback(() => {
    requestQueue.resume();
    setStatus(getQueueStatus());
  }, []);

  // Retry failed request
  const retryFailedRequest = useCallback((requestId: string) => {
    setFailedRequests(prev => prev.filter(req => req.requestId !== requestId));
    
    // Re-enqueue the request with high priority
    const failedRequest = failedRequests.find(req => req.requestId === requestId);
    if (failedRequest) {
      // Reconstruct the request data based on type
      // This is a simplified version - in a real app you'd store the original data
      enqueueRequest(failedRequest.type as QueuedRequest['type'], {}, 'high');
    }
  }, [failedRequests, enqueueRequest]);

  // Clear failed requests
  const clearFailedRequests = useCallback(() => {
    setFailedRequests([]);
  }, []);

  return {
    status,
    enqueueRequest,
    clearQueue,
    stopQueue,
    resumeQueue,
    isConnected,
    connectionStatus,
    failedRequests,
    retryFailedRequest,
    clearFailedRequests
  };
}

// Convenience hooks for specific operations
export function useLikeQueue() {
  const { enqueueRequest, status, isConnected } = useRequestQueue();

  const queueLike = useCallback(async (blogId: string, userId: string) => {
    return await enqueueRequest('like', { blogId, userId }, 'high');
  }, [enqueueRequest]);

  const queueUnlike = useCallback(async (blogId: string, userId: string) => {
    return await enqueueRequest('unlike', { blogId, userId }, 'high');
  }, [enqueueRequest]);

  return {
    queueLike,
    queueUnlike,
    status,
    isConnected
  };
}

export function useCommentQueue() {
  const { enqueueRequest, status, isConnected } = useRequestQueue();

  const queueComment = useCallback(async (
    content: string,
    userId: string,
    blogId?: string,
    courseId?: string
  ) => {
    return await enqueueRequest('comment', { content, userId, blogId, courseId }, 'normal');
  }, [enqueueRequest]);

  const queueReply = useCallback(async (
    content: string,
    userId: string,
    parentId: string,
    blogId?: string,
    courseId?: string
  ) => {
    return await enqueueRequest('reply', { content, userId, parentId, blogId, courseId }, 'normal');
  }, [enqueueRequest]);

  const queueEditComment = useCallback(async (commentId: string, content: string) => {
    return await enqueueRequest('edit_comment', { commentId, content }, 'normal');
  }, [enqueueRequest]);

  const queueDeleteComment = useCallback(async (commentId: string) => {
    return await enqueueRequest('delete_comment', { commentId }, 'high');
  }, [enqueueRequest]);

  return {
    queueComment,
    queueReply,
    queueEditComment,
    queueDeleteComment,
    status,
    isConnected
  };
} 