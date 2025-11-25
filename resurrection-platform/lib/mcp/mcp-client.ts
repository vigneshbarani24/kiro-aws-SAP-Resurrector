/**
 * Base MCP Client
 * 
 * Provides connection management, request/response handling, and error handling
 * with retry logic for Model Context Protocol (MCP) servers.
 * 
 * Requirements: 2.4, 4.3
 */

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  timeout?: number; // milliseconds
  maxRetries?: number;
}

export interface MCPRequest {
  method: string;
  params?: Record<string, any>;
  context?: Record<string, any>;
}

export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: MCPError;
  duration: number;
  timestamp: Date;
}

export interface MCPError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
}

export enum MCPConnectionStatus {
  DISCONNECTED = 'DISCONNECTED',
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING'
}

/**
 * Base MCP Client for connecting to and communicating with MCP servers
 */
export class MCPClient {
  private config: MCPServerConfig;
  private connectionStatus: MCPConnectionStatus;
  private lastError: MCPError | null;
  private retryCount: number;
  private connectionAttempts: number;

  constructor(config: MCPServerConfig) {
    this.config = {
      timeout: 30000, // 30 seconds default
      maxRetries: 3,
      ...config
    };
    this.connectionStatus = MCPConnectionStatus.DISCONNECTED;
    this.lastError = null;
    this.retryCount = 0;
    this.connectionAttempts = 0;
  }

  /**
   * Get current connection status
   */
  getStatus(): MCPConnectionStatus {
    return this.connectionStatus;
  }

  /**
   * Get last error if any
   */
  getLastError(): MCPError | null {
    return this.lastError;
  }

  /**
   * Get server configuration
   */
  getConfig(): MCPServerConfig {
    return { ...this.config };
  }

  /**
   * Connect to MCP server
   */
  async connect(): Promise<void> {
    if (this.connectionStatus === MCPConnectionStatus.CONNECTED) {
      return;
    }

    this.connectionStatus = MCPConnectionStatus.CONNECTING;
    this.connectionAttempts++;

    try {
      // Simulate connection logic
      // In real implementation, this would spawn the MCP server process
      // and establish communication channel
      await this.simulateConnection();
      
      this.connectionStatus = MCPConnectionStatus.CONNECTED;
      this.lastError = null;
      this.retryCount = 0;
      
      console.log(`[MCPClient] Connected to ${this.config.name}`);
    } catch (error) {
      this.connectionStatus = MCPConnectionStatus.ERROR;
      const mcpError = this.createError(
        'CONNECTION_FAILED',
        `Failed to connect to ${this.config.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error,
        true
      );
      this.lastError = mcpError;
      
      throw mcpError;
    }
  }

  /**
   * Disconnect from MCP server
   */
  async disconnect(): Promise<void> {
    if (this.connectionStatus === MCPConnectionStatus.DISCONNECTED) {
      return;
    }

    try {
      // Simulate disconnection logic
      // In real implementation, this would terminate the MCP server process
      await this.simulateDisconnection();
      
      this.connectionStatus = MCPConnectionStatus.DISCONNECTED;
      console.log(`[MCPClient] Disconnected from ${this.config.name}`);
    } catch (error) {
      console.error(`[MCPClient] Error disconnecting from ${this.config.name}:`, error);
    }
  }

  /**
   * Call MCP server method with automatic retry logic
   */
  async call<T = any>(method: string, params?: Record<string, any>, context?: Record<string, any>): Promise<MCPResponse<T>> {
    const startTime = Date.now();
    
    // Ensure connected
    if (this.connectionStatus !== MCPConnectionStatus.CONNECTED) {
      await this.connect();
    }

    const request: MCPRequest = {
      method,
      params,
      context
    };

    // Attempt call with retry logic
    for (let attempt = 1; attempt <= (this.config.maxRetries || 3); attempt++) {
      try {
        const result = await this.executeRequest<T>(request);
        const duration = Date.now() - startTime;
        
        return {
          success: true,
          data: result,
          duration,
          timestamp: new Date()
        };
      } catch (error) {
        // Check if error is already an MCPError
        let mcpError: MCPError;
        if (error && typeof error === 'object' && 'code' in error && 'retryable' in error) {
          mcpError = error as MCPError;
        } else {
          mcpError = this.createError(
            'REQUEST_FAILED',
            `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
            error,
            true
          );
        }

        // Check if error is retryable
        if (!mcpError.retryable || attempt >= (this.config.maxRetries || 3)) {
          const duration = Date.now() - startTime;
          this.lastError = mcpError;
          
          return {
            success: false,
            error: mcpError,
            duration,
            timestamp: new Date()
          };
        }

        // Exponential backoff before retry
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`[MCPClient] Retrying ${method} (attempt ${attempt + 1}/${this.config.maxRetries}) after ${backoffMs}ms`);
        await this.sleep(backoffMs);

        // Reconnect if connection was lost
        if (this.connectionStatus !== MCPConnectionStatus.CONNECTED) {
          this.connectionStatus = MCPConnectionStatus.RECONNECTING;
          await this.connect();
        }
      }
    }

    // Should never reach here, but TypeScript needs it
    const duration = Date.now() - startTime;
    return {
      success: false,
      error: this.createError('MAX_RETRIES_EXCEEDED', 'Maximum retry attempts exceeded', null, false),
      duration,
      timestamp: new Date()
    };
  }

  /**
   * Execute MCP request with timeout
   */
  private async executeRequest<T>(request: MCPRequest): Promise<T> {
    const timeout = this.config.timeout || 30000;

    return Promise.race([
      this.sendRequest<T>(request),
      this.createTimeoutPromise(timeout)
    ]);
  }

  /**
   * Send request to MCP server
   * This is a placeholder - real implementation would use actual MCP protocol
   */
  private async sendRequest<T>(request: MCPRequest): Promise<T> {
    // Simulate network delay
    await this.sleep(100);

    // Simulate different response scenarios for testing
    if (request.method === 'analyzeCode') {
      return {
        businessLogic: ['Sample business logic'],
        dependencies: ['VBAK', 'VBAP'],
        metadata: { module: 'SD', complexity: 5 }
      } as T;
    }

    if (request.method === 'generateCDSModels') {
      return {
        files: [
          { path: 'db/schema.cds', content: 'entity SalesOrder { key ID: UUID; }' }
        ]
      } as T;
    }

    // Default response
    return {
      status: 'success',
      message: `Method ${request.method} executed successfully`
    } as T;
  }

  /**
   * Create timeout promise that rejects after specified milliseconds
   */
  private createTimeoutPromise(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(this.createError(
          'TIMEOUT',
          `Request timed out after ${ms}ms`,
          null,
          true
        ));
      }, ms);
    });
  }

  /**
   * Simulate connection (placeholder for real implementation)
   */
  private async simulateConnection(): Promise<void> {
    await this.sleep(100);
    
    // Simulate connection failure for testing error handling
    if (this.config.name === 'test-fail-connection') {
      throw new Error('Connection refused');
    }
  }

  /**
   * Simulate disconnection (placeholder for real implementation)
   */
  private async simulateDisconnection(): Promise<void> {
    await this.sleep(50);
  }

  /**
   * Create standardized MCP error
   */
  private createError(code: string, message: string, details: any, retryable: boolean): MCPError {
    return {
      code,
      message,
      details,
      retryable
    };
  }

  /**
   * Sleep utility for delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Health check - verify server is responsive
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.call('ping', {}, {});
      return response.success;
    } catch (error) {
      console.error(`[MCPClient] Health check failed for ${this.config.name}:`, error);
      return false;
    }
  }

  /**
   * Get connection statistics
   */
  getStats() {
    return {
      serverName: this.config.name,
      status: this.connectionStatus,
      connectionAttempts: this.connectionAttempts,
      lastError: this.lastError,
      retryCount: this.retryCount
    };
  }
}
