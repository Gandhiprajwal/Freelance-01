import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  releaseTimeout: number;
  healthCheckInterval: number;
  maxIdleTime: number;
  connectionTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  batchSize: number;
  batchTimeout: number;
  maxConcurrentOperations: number;
}

interface PooledConnection {
  id: string;
  client: SupabaseClient;
  isActive: boolean;
  lastUsed: number;
  createdAt: number;
  healthStatus: 'healthy' | 'unhealthy' | 'unknown';
  errorCount: number;
  inUse: boolean;
  operationCount: number;
  lastOperationTime: number;
  affinityKey?: string; // For connection affinity
}

interface BatchedOperation {
  id: string;
  operation: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
  priority: 'high' | 'normal' | 'low';
}

class SupabaseConnectionPool {
  private connections: Map<string, PooledConnection> = new Map();
  private availableConnections: Set<string> = new Set();
  private inUseConnections: Set<string> = new Set();
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private batchTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private batchedOperations: BatchedOperation[] = [];
  private processingBatch = false;
  private operationQueue: BatchedOperation[] = [];
  private processingQueue = false;

  private readonly config: PoolConfig = {
    minConnections: 3, // Increased for better handling of concurrent operations
    maxConnections: 15, // Increased for high-frequency operations
    acquireTimeout: 15000, // Increased timeout for high load
    releaseTimeout: 5000,
    healthCheckInterval: 20000, // More frequent health checks
    maxIdleTime: 300000,
    connectionTimeout: 8000,
    retryAttempts: 3,
    retryDelay: 1000,
    batchSize: 10, // Batch operations for efficiency
    batchTimeout: 100, // 100ms batch window
    maxConcurrentOperations: 50 // Limit concurrent operations
  };

  private readonly supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
  private readonly supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

  constructor() {
    this.validateEnvironment();
  }

  private validateEnvironment(): void {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('[ConnectionPool] Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    }
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.performInitialization();
    return this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      console.log('[ConnectionPool] Initializing connection pool...');
      
      // Create minimum connections
      await this.createInitialConnections();
      
      // Start health monitoring
      this.startHealthCheck();
      this.startCleanup();
      this.startBatchProcessing();
      
      this.isInitialized = true;
      console.log(`[ConnectionPool] Initialized with ${this.connections.size} connections`);
    } catch (error) {
      console.error('[ConnectionPool] Initialization failed:', error);
      throw error;
    }
  }

  private async createInitialConnections(): Promise<void> {
    const promises = [];
    
    for (let i = 0; i < this.config.minConnections; i++) {
      promises.push(this.createConnection());
    }
    
    await Promise.allSettled(promises);
  }

  private async createConnection(): Promise<PooledConnection> {
    const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      const client = createClient(this.supabaseUrl, this.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: this.createSecureStorage(),
          storageKey: `robostaan-auth-${connectionId}`
        },
        realtime: {
          params: { 
            eventsPerSecond: 15, // Increased for better real-time updates
            heartbeatIntervalMs: 10000, // More frequent heartbeats
            reconnectAfterMs: (tries: number) => Math.min(tries * 300, 3000) // Faster reconnection
          }
        },
        global: {
          headers: {
            'x-application-name': 'robostaan',
            'x-client-info': 'robostaan-web',
            'x-connection-id': connectionId,
            'x-connection-type': 'pooled'
          }
        }
      });

      // Test the connection with a lightweight query
      const { error } = await client
        .from('blogs')
        .select('id')
        .limit(1)
        .abortSignal(AbortSignal.timeout(this.config.connectionTimeout));

      if (error && !error.message.includes('relation')) {
        throw error;
      }

      const connection: PooledConnection = {
        id: connectionId,
        client,
        isActive: true,
        lastUsed: Date.now(),
        createdAt: Date.now(),
        healthStatus: 'healthy',
        errorCount: 0,
        inUse: false,
        operationCount: 0,
        lastOperationTime: Date.now()
      };

      this.connections.set(connectionId, connection);
      this.availableConnections.add(connectionId);
      
      console.log(`[ConnectionPool] Created connection ${connectionId}`);
      return connection;
    } catch (error) {
      console.error(`[ConnectionPool] Failed to create connection ${connectionId}:`, error);
      throw error;
    }
  }

  private createSecureStorage() {
    return {
      getItem: (key: string): string | null => {
        try {
          return sessionStorage.getItem(key);
        } catch (error) {
          console.warn('[ConnectionPool] Failed to get item from storage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string): void => {
        try {
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.warn('[ConnectionPool] Failed to set item in storage:', error);
        }
      },
      removeItem: (key: string): void => {
        try {
          sessionStorage.removeItem(key);
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('[ConnectionPool] Failed to remove item from storage:', error);
        }
      }
    };
  }

  public async acquireConnection(affinityKey?: string): Promise<SupabaseClient> {
    await this.initialize();

    const startTime = Date.now();
    
    while (Date.now() - startTime < this.config.acquireTimeout) {
      // Try to get an available connection with affinity
      const availableConnectionId = this.getAvailableConnection(affinityKey);
      
      if (availableConnectionId) {
        const connection = this.connections.get(availableConnectionId);
        if (connection && connection.healthStatus === 'healthy') {
          connection.inUse = true;
          connection.lastUsed = Date.now();
          connection.operationCount++;
          connection.lastOperationTime = Date.now();
          
          if (affinityKey) {
            connection.affinityKey = affinityKey;
          }
          
          this.availableConnections.delete(availableConnectionId);
          this.inUseConnections.add(availableConnectionId);
          
          console.log(`[ConnectionPool] Acquired connection ${availableConnectionId} (affinity: ${affinityKey || 'none'})`);
          return connection.client;
        }
      }

      // If no available connections and we can create more
      if (this.connections.size < this.config.maxConnections) {
        try {
          const newConnection = await this.createConnection();
          if (newConnection) {
            return newConnection.client;
          }
        } catch (error) {
          console.warn('[ConnectionPool] Failed to create new connection:', error);
        }
      }

      // Wait a bit before retrying
      await this.delay(100);
    }

    throw new Error('[ConnectionPool] Timeout waiting for available connection');
  }

  private getAvailableConnection(affinityKey?: string): string | null {
    // First, try to find a connection with matching affinity
    if (affinityKey) {
      for (const connectionId of this.availableConnections) {
        const connection = this.connections.get(connectionId);
        if (connection && connection.affinityKey === affinityKey && connection.healthStatus === 'healthy') {
          return connectionId;
        }
      }
    }

    // Then, find any available healthy connection
    for (const connectionId of this.availableConnections) {
      const connection = this.connections.get(connectionId);
      if (connection && connection.healthStatus === 'healthy') {
        return connectionId;
      }
    }

    return null;
  }

  public async releaseConnection(client: SupabaseClient): Promise<void> {
    const connectionId = this.findConnectionIdByClient(client);
    
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.inUse = false;
        connection.lastUsed = Date.now();
        
        this.inUseConnections.delete(connectionId);
        this.availableConnections.add(connectionId);
        
        console.log(`[ConnectionPool] Released connection ${connectionId}`);
      }
    }
  }

  private findConnectionIdByClient(client: SupabaseClient): string | null {
    for (const [connectionId, connection] of this.connections.entries()) {
      if (connection.client === client) {
        return connectionId;
      }
    }
    return null;
  }

  public async executeWithConnection<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    affinityKey?: string,
    priority: 'high' | 'normal' | 'low' = 'normal'
  ): Promise<T> {
    // Check if we should batch this operation
    if (this.shouldBatchOperation(operation, priority)) {
      return this.executeBatchedOperation(operation, priority);
    }

    // Check queue limits
    if (this.operationQueue.length >= this.config.maxConcurrentOperations) {
      throw new Error('[ConnectionPool] Too many concurrent operations');
    }

    const client = await this.acquireConnection(affinityKey);
    
    try {
      // Ensure the client has the current session for RLS policies
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        // Try to refresh the session
        const { data: { session: refreshedSession } } = await client.auth.refreshSession();
        if (!refreshedSession) {
          throw new Error('[ConnectionPool] No authenticated session available');
        }
      }
      
      const result = await operation(client);
      return result;
    } catch (error) {
      // Mark connection as unhealthy if it's a connection error
      if (this.isConnectionError(error)) {
        await this.markConnectionUnhealthy(client);
      }
      throw error;
    } finally {
      await this.releaseConnection(client);
    }
  }

  private shouldBatchOperation(operation: Function, priority: 'high' | 'normal' | 'low'): boolean {
    // Don't batch high priority operations
    if (priority === 'high') return false;
    
    // Batch read operations and low-priority writes
    const operationString = operation.toString().toLowerCase();
    const isReadOperation = operationString.includes('select') || operationString.includes('count');
    const isLowPriorityWrite = priority === 'low' && (
      operationString.includes('insert') || 
      operationString.includes('update') || 
      operationString.includes('delete')
    );
    
    return isReadOperation || isLowPriorityWrite;
  }

  private async executeBatchedOperation<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    priority: 'high' | 'normal' | 'low'
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batchedOp: BatchedOperation = {
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        operation: () => this.executeWithConnection(operation),
        resolve,
        reject,
        timestamp: Date.now(),
        priority
      };

      this.batchedOperations.push(batchedOp);
      
      // Process batch if it's full or after timeout
      if (this.batchedOperations.length >= this.config.batchSize) {
        this.processBatch();
      }
    });
  }

  private startBatchProcessing(): void {
    this.batchTimer = setInterval(() => {
      if (this.batchedOperations.length > 0) {
        this.processBatch();
      }
    }, this.config.batchTimeout);
  }

  private async processBatch(): Promise<void> {
    if (this.processingBatch || this.batchedOperations.length === 0) return;
    
    this.processingBatch = true;
    const operations = [...this.batchedOperations];
    this.batchedOperations = [];

    try {
      // Execute operations in parallel
      const results = await Promise.allSettled(
        operations.map(op => op.operation())
      );

      // Resolve/reject each operation
      results.forEach((result, index) => {
        const operation = operations[index];
        if (result.status === 'fulfilled') {
          operation.resolve(result.value);
        } else {
          operation.reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all operations if batch processing fails
      operations.forEach(op => op.reject(error));
    } finally {
      this.processingBatch = false;
    }
  }

  private async markConnectionUnhealthy(client: SupabaseClient): Promise<void> {
    const connectionId = this.findConnectionIdByClient(client);
    
    if (connectionId) {
      const connection = this.connections.get(connectionId);
      if (connection) {
        connection.healthStatus = 'unhealthy';
        connection.errorCount++;
        
        console.warn(`[ConnectionPool] Marked connection ${connectionId} as unhealthy (errors: ${connection.errorCount})`);
        
        // Remove from available connections
        this.availableConnections.delete(connectionId);
        this.inUseConnections.delete(connectionId);
        
        // Try to create a replacement connection
        if (this.connections.size < this.config.maxConnections) {
          try {
            await this.createConnection();
          } catch (error) {
            console.error('[ConnectionPool] Failed to create replacement connection:', error);
          }
        }
      }
    }
  }

  private isConnectionError(error: any): boolean {
    if (!error) return false;
    
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code?.toLowerCase() || '';
    
    return (
      errorMessage.includes('connection') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorCode.includes('connection') ||
      errorCode.includes('timeout') ||
      errorCode.includes('network')
    );
  }

  private startHealthCheck(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, this.config.healthCheckInterval);
  }

  private async performHealthCheck(): Promise<void> {
    console.log('[ConnectionPool] Performing health check...');
    
    const healthChecks = Array.from(this.connections.values()).map(async (connection) => {
      try {
        const { error } = await connection.client
          .from('blogs')
          .select('id')
          .limit(1)
          .abortSignal(AbortSignal.timeout(5000));

        if (error && !error.message.includes('relation')) {
          connection.healthStatus = 'unhealthy';
          connection.errorCount++;
          console.warn(`[ConnectionPool] Health check failed for ${connection.id}:`, error);
        } else {
          connection.healthStatus = 'healthy';
          connection.errorCount = Math.max(0, connection.errorCount - 1);
        }
      } catch (error) {
        connection.healthStatus = 'unhealthy';
        connection.errorCount++;
        console.warn(`[ConnectionPool] Health check error for ${connection.id}:`, error);
      }
    });

    await Promise.allSettled(healthChecks);
    
    const healthyCount = Array.from(this.connections.values()).filter(c => c.healthStatus === 'healthy').length;
    console.log(`[ConnectionPool] Health check complete. ${healthyCount}/${this.connections.size} connections healthy`);
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanupIdleConnections();
    }, this.config.healthCheckInterval * 2);
  }

  private cleanupIdleConnections(): void {
    const now = Date.now();
    const connectionsToRemove: string[] = [];

    for (const [connectionId, connection] of this.connections.entries()) {
      // Remove connections that are idle for too long (but keep minimum connections)
      if (
        !connection.inUse &&
        now - connection.lastUsed > this.config.maxIdleTime &&
        this.connections.size > this.config.minConnections
      ) {
        connectionsToRemove.push(connectionId);
      }
      
      // Remove unhealthy connections with too many errors
      if (connection.errorCount > 5) {
        connectionsToRemove.push(connectionId);
      }
    }

    connectionsToRemove.forEach(connectionId => {
      const connection = this.connections.get(connectionId);
      if (connection) {
        this.connections.delete(connectionId);
        this.availableConnections.delete(connectionId);
        this.inUseConnections.delete(connectionId);
        console.log(`[ConnectionPool] Removed connection ${connectionId}`);
      }
    });

    if (connectionsToRemove.length > 0) {
      console.log(`[ConnectionPool] Cleaned up ${connectionsToRemove.length} connections`);
    }
  }

  public getPoolStatus() {
    const healthyConnections = Array.from(this.connections.values()).filter(c => c.healthStatus === 'healthy');
    const availableConnections = this.availableConnections.size;
    const inUseConnections = this.inUseConnections.size;
    
    return {
      totalConnections: this.connections.size,
      healthyConnections: healthyConnections.length,
      availableConnections,
      inUseConnections,
      batchedOperations: this.batchedOperations.length,
      operationQueue: this.operationQueue.length,
      isInitialized: this.isInitialized,
      config: this.config
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async shutdown(): Promise<void> {
    console.log('[ConnectionPool] Shutting down connection pool...');
    
    // Clear timers
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }

    // Process any remaining batched operations
    if (this.batchedOperations.length > 0) {
      await this.processBatch();
    }

    // Wait for in-use connections to be released
    const maxWaitTime = 10000; // 10 seconds
    const startTime = Date.now();
    
    while (this.inUseConnections.size > 0 && Date.now() - startTime < maxWaitTime) {
      await this.delay(100);
    }

    // Clear all connections
    this.connections.clear();
    this.availableConnections.clear();
    this.inUseConnections.clear();
    this.batchedOperations = [];
    this.operationQueue = [];
    
    this.isInitialized = false;
    this.initializationPromise = null;
    
    console.log('[ConnectionPool] Shutdown complete');
  }
}

// Singleton instance
let connectionPoolInstance: SupabaseConnectionPool | null = null;

export function getConnectionPool(): SupabaseConnectionPool {
  if (!connectionPoolInstance) {
    connectionPoolInstance = new SupabaseConnectionPool();
  }
  return connectionPoolInstance;
}

export function getPoolStatus() {
  return getConnectionPool().getPoolStatus();
}

export function shutdownPool() {
  if (connectionPoolInstance) {
    return connectionPoolInstance.shutdown();
  }
} 