import { createClient, SupabaseClient, AuthChangeEvent, Session } from '@supabase/supabase-js';

class SupabaseConnection {
  private client: SupabaseClient | null = null;
  private connectionPromise: Promise<SupabaseClient> | null = null;
  private connectionAttempts = 0;
  private isConnecting = false;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;
  private readonly healthCheckInterval = 30_000;

  private readonly supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
  private readonly supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;
  private readonly localStorageAuthKeys = [
    'sb-auth-token',
    'supabase.auth.token',
    'user_profile'
  ];

  // 🔄 Realtime channels map
  private activeChannels: Map<string, ReturnType<SupabaseClient['channel']>> = new Map();

  constructor() {
    this.initializeConnection();
    this.setupVisibilityReconnect();
  }

  private initializeConnection() {
    if (!this.supabaseUrl || !this.supabaseAnonKey) {
      throw new Error('[Supabase] Missing environment variables');
    }

    this.client = createClient(this.supabaseUrl, this.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: { eventsPerSecond: 10 }
      },
      global: {
        headers: {
          'x-application-name': 'robostaan'
        }
      }
    });

    this.monitorAuthChanges();
    this.startHealthCheck();
  }

  private monitorAuthChanges() {
    this.client?.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('[Supabase] Auth event:', event);

      switch (event) {
        case 'SIGNED_OUT':
          this.clearAuthData();
          break;

        case 'TOKEN_REFRESH_FAILED':
          console.warn('[Supabase] Token refresh failed. Logging out.');
          await this.client?.auth.signOut();
          this.clearAuthData();
          break;

        case 'TOKEN_REFRESHED':
          console.info('[Supabase] Token refreshed');
          break;

        default:
          break;
      }
    });
  }

  private startHealthCheck() {
    if (this.healthCheckTimer) clearInterval(this.healthCheckTimer);

    this.healthCheckTimer = setInterval(() => {
      this.healthCheck();
    }, this.healthCheckInterval);
  }

  private async healthCheck() {
    if (!this.client) return;

    try {
      const { error } = await this.client.from('blogs').select('id').limit(1);
      if (error?.message?.toLowerCase().includes('connection')) {
        console.warn('[Supabase] Connection issue. Reconnecting...');
        await this.reconnect();
      }
    } catch (err) {
      console.warn('[Supabase] Health check failed:', err);
    }
  }

  private setupVisibilityReconnect() {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        console.log('[Supabase] Tab visible. Checking session...');
        const { data, error } = await this.client?.auth.getSession() ?? {};
        if (!data?.session || error) {
          console.warn('[Supabase] No active session. Reconnecting...');
          await this.reconnect();
        }
      }
    });
  }

  private clearAuthData() {
    [...Object.keys(localStorage), ...Object.keys(sessionStorage)].forEach(key => {
      if (key.startsWith('sb-') || key.includes('auth') || this.localStorageAuthKeys.includes(key)) {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      }
    });
  }

  private async connect(): Promise<SupabaseClient> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.initializeConnection();
        if (!this.client) throw new Error('[Supabase] Client not initialized');

        const { error } = await this.client.from('blogs').select('id').limit(1);
        if (error && !error.message.includes('relation')) throw error;

        console.info('[Supabase] Connected');
        this.connectionAttempts = 0;
        return this.client;
      } catch (error) {
        console.error(`[Supabase] Connect attempt ${attempt} failed`, error);
        await this.delay(this.retryDelay * attempt);
      }
    }

    throw new Error('[Supabase] Failed to connect after retries');
  }

  public async getClient(): Promise<SupabaseClient> {
    if (this.client) return this.client;
    if (this.isConnecting && this.connectionPromise) return this.connectionPromise;

    this.isConnecting = true;
    this.connectionPromise = this.connect();

    try {
      const client = await this.connectionPromise;
      return client;
    } finally {
      this.isConnecting = false;
      this.connectionPromise = null;
    }
  }

  public async reconnect(): Promise<SupabaseClient> {
    this.client = null;
    this.connectionPromise = null;
    this.isConnecting = false;

    const newClient = await this.getClient();

    // Reconnect all active channels
    const previousChannels = [...this.activeChannels.entries()];
    this.activeChannels.clear();
    for (const [channelName, channel] of previousChannels) {
      console.log(`[Supabase] Reconnecting channel "${channelName}"...`);
      await this.subscribeToChannel(channelName, channel.callback);
    }

    return newClient;
  }

  public async executeWithRetry<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    maxRetries = 2
  ): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
      try {
        const client = await this.getClient();
        return await operation(client);
      } catch (error: any) {
        const retryable = ['connection', 'network', 'timeout', 'PGRST301']
          .some(str => error?.message?.includes(str) || error?.code === str);

        if (retryable && attempt <= maxRetries) {
          console.warn(`[Supabase] Retrying operation (attempt ${attempt})`);
          await this.reconnect();
          await this.delay(this.retryDelay * attempt);
        } else {
          throw error;
        }
      }
    }

    throw new Error('[Supabase] Operation failed after all retries');
  }

  public getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' {
    if (this.client) return 'connected';
    if (this.isConnecting) return 'connecting';
    return 'disconnected';
  }

  public isConnected(): boolean {
    return !!this.client;
  }

  public async getRawClient(): Promise<SupabaseClient> {
    return this.getClient();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 🔄 ========== REALTIME CHANNEL METHODS ==========

  public async subscribeToChannel(
    channelName: string,
    onChange: (payload: any) => void,
    table = 'blogs'
  ) {
    const client = await this.getClient();

    if (this.activeChannels.has(channelName)) {
      console.warn(`[Supabase] Channel "${channelName}" already subscribed`);
      return;
    }

    const channel = client
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table }, payload => {
        onChange(payload);
      })
      .subscribe(status => {
        console.log(`[Supabase] Channel "${channelName}" status: ${status}`);
        if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          console.warn(`[Supabase] Channel "${channelName}" closed. Will reconnect.`);
          this.reconnectChannel(channelName, onChange, table);
        }
      });

    // Store callback for reconnect
    (channel as any).callback = onChange;
    this.activeChannels.set(channelName, channel);
  }

  private reconnectChannel(
    channelName: string,
    onChange: (payload: any) => void,
    table = 'blogs'
  ) {
    this.activeChannels.delete(channelName);
    setTimeout(() => {
      this.subscribeToChannel(channelName, onChange, table);
    }, 2000);
  }

  public async unsubscribeFromChannel(channelName: string) {
    const channel = this.activeChannels.get(channelName);
    if (channel) {
      await this.client?.removeChannel(channel);
      this.activeChannels.delete(channelName);
      console.info(`[Supabase] Unsubscribed from channel "${channelName}"`);
    }
  }
}

const supabaseConnection = new SupabaseConnection();
export const supabase = await supabaseConnection.getClient();
export const supabaseReady = supabaseConnection.getClient();
export default supabaseConnection;
