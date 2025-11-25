/**
 * MCP Orchestrator
 * 
 * Manages multiple MCP server connections, routes requests to appropriate servers,
 * and handles MCP server lifecycle.
 * 
 * Requirements: 4.1, 4.4
 */

import { MCPClient, MCPServerConfig, MCPResponse, MCPConnectionStatus } from './mcp-client';

export interface MCPOrchestratorConfig {
  servers: MCPServerConfig[];
  autoConnect?: boolean;
  healthCheckInterval?: number; // milliseconds
}

export interface ServerHealth {
  name: string;
  status: MCPConnectionStatus;
  healthy: boolean;
  lastCheck: Date;
  lastError?: string;
}

export interface AnalysisResult {
  businessLogic: string[];
  dependencies: string[];
  metadata: {
    module: string;
    complexity: number;
    linesOfCode?: number;
    tables?: string[];
    patterns?: string[];
  };
  documentation?: string;
}

export interface CDSFiles {
  files: Array<{
    path: string;
    content: string;
  }>;
}

export interface ServiceFiles {
  files: Array<{
    path: string;
    content: string;
  }>;
}

export interface UIFiles {
  files: Array<{
    path: string;
    content: string;
  }>;
}

export interface RepoConfig {
  name: string;
  description: string;
  files: Array<{
    path: string;
    content: string;
  }>;
  private?: boolean;
}

export interface RepoInfo {
  name: string;
  url: string;
  cloneUrl: string;
  htmlUrl: string;
}

/**
 * Orchestrates multiple MCP server connections and routes requests
 */
export class MCPOrchestrator {
  private clients: Map<string, MCPClient>;
  private config: MCPOrchestratorConfig;
  private healthCheckTimer?: NodeJS.Timeout;
  private serverHealth: Map<string, ServerHealth>;

  constructor(config: MCPOrchestratorConfig) {
    this.config = {
      autoConnect: true,
      healthCheckInterval: 60000, // 1 minute default
      ...config
    };
    this.clients = new Map();
    this.serverHealth = new Map();
    
    this.initializeClients();
  }

  /**
   * Initialize MCP clients for all configured servers
   */
  private initializeClients(): void {
    for (const serverConfig of this.config.servers) {
      const client = new MCPClient(serverConfig);
      this.clients.set(serverConfig.name, client);
      
      // Initialize health status
      this.serverHealth.set(serverConfig.name, {
        name: serverConfig.name,
        status: MCPConnectionStatus.DISCONNECTED,
        healthy: false,
        lastCheck: new Date()
      });
    }

    console.log(`[MCPOrchestrator] Initialized ${this.clients.size} MCP clients`);
  }

  /**
   * Start the orchestrator and connect to all servers
   */
  async start(): Promise<void> {
    console.log('[MCPOrchestrator] Starting orchestrator...');

    if (this.config.autoConnect) {
      await this.connectAll();
    }

    // Start health check monitoring
    if (this.config.healthCheckInterval && this.config.healthCheckInterval > 0) {
      this.startHealthChecks();
    }

    console.log('[MCPOrchestrator] Orchestrator started successfully');
  }

  /**
   * Stop the orchestrator and disconnect from all servers
   */
  async stop(): Promise<void> {
    console.log('[MCPOrchestrator] Stopping orchestrator...');

    // Stop health checks
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }

    // Disconnect all clients
    await this.disconnectAll();

    console.log('[MCPOrchestrator] Orchestrator stopped');
  }

  /**
   * Connect to all MCP servers
   */
  async connectAll(): Promise<void> {
    const connectionPromises = Array.from(this.clients.entries()).map(
      async ([name, client]) => {
        try {
          await client.connect();
          console.log(`[MCPOrchestrator] Connected to ${name}`);
        } catch (error) {
          console.error(`[MCPOrchestrator] Failed to connect to ${name}:`, error);
          // Update health status
          const health = this.serverHealth.get(name);
          if (health) {
            health.healthy = false;
            health.lastError = error instanceof Error ? error.message : 'Connection failed';
            health.lastCheck = new Date();
          }
        }
      }
    );

    await Promise.allSettled(connectionPromises);
  }

  /**
   * Disconnect from all MCP servers
   */
  async disconnectAll(): Promise<void> {
    const disconnectionPromises = Array.from(this.clients.values()).map(
      client => client.disconnect()
    );

    await Promise.allSettled(disconnectionPromises);
  }

  /**
   * Get a specific MCP client by name
   */
  private getClient(serverName: string): MCPClient {
    const client = this.clients.get(serverName);
    if (!client) {
      throw new Error(`MCP server '${serverName}' not found. Available servers: ${Array.from(this.clients.keys()).join(', ')}`);
    }
    return client;
  }

  /**
   * Start periodic health checks for all servers
   */
  private startHealthChecks(): void {
    this.healthCheckTimer = setInterval(async () => {
      await this.performHealthChecks();
    }, this.config.healthCheckInterval);

    // Perform initial health check
    this.performHealthChecks();
  }

  /**
   * Perform health checks on all servers
   */
  private async performHealthChecks(): Promise<void> {
    const healthPromises = Array.from(this.clients.entries()).map(
      async ([name, client]) => {
        try {
          const healthy = await client.healthCheck();
          const status = client.getStatus();
          
          this.serverHealth.set(name, {
            name,
            status,
            healthy,
            lastCheck: new Date(),
            lastError: healthy ? undefined : client.getLastError()?.message
          });
        } catch (error) {
          this.serverHealth.set(name, {
            name,
            status: MCPConnectionStatus.ERROR,
            healthy: false,
            lastCheck: new Date(),
            lastError: error instanceof Error ? error.message : 'Health check failed'
          });
        }
      }
    );

    await Promise.allSettled(healthPromises);
  }

  /**
   * Get health status of all servers
   */
  getServerHealth(): ServerHealth[] {
    return Array.from(this.serverHealth.values());
  }

  /**
   * Get health status of a specific server
   */
  getServerHealthByName(serverName: string): ServerHealth | undefined {
    return this.serverHealth.get(serverName);
  }

  /**
   * Analyze ABAP code using ABAP Analyzer MCP
   */
  async analyzeABAP(abapCode: string, context: Record<string, any> = {}): Promise<AnalysisResult> {
    const client = this.getClient('abap-analyzer');
    
    const response = await client.call<AnalysisResult>('analyzeCode', {
      code: abapCode,
      extractBusinessLogic: true,
      identifyDependencies: true,
      detectPatterns: true,
      ...context
    });

    if (!response.success || !response.data) {
      throw new Error(`ABAP analysis failed: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Generate CDS models using SAP CAP Generator MCP
   */
  async generateCDS(models: Record<string, any>): Promise<CDSFiles> {
    const client = this.getClient('sap-cap-generator');
    
    const response = await client.call<CDSFiles>('generateCDSModels', {
      models
    });

    if (!response.success || !response.data) {
      throw new Error(`CDS generation failed: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Generate service definitions using SAP CAP Generator MCP
   */
  async generateServices(services: Record<string, any>): Promise<ServiceFiles> {
    const client = this.getClient('sap-cap-generator');
    
    const response = await client.call<ServiceFiles>('generateServiceDefinitions', {
      services
    });

    if (!response.success || !response.data) {
      throw new Error(`Service generation failed: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Generate UI using SAP UI5 Generator MCP
   */
  async generateUI(uiDesign: Record<string, any>): Promise<UIFiles> {
    const client = this.getClient('sap-ui5-generator');
    
    const response = await client.call<UIFiles>('generateFioriElements', {
      design: uiDesign
    });

    if (!response.success || !response.data) {
      throw new Error(`UI generation failed: ${response.error?.message || 'Unknown error'}`);
    }

    return response.data;
  }

  /**
   * Create GitHub repository using GitHub MCP
   */
  async createGitHubRepo(config: RepoConfig): Promise<RepoInfo> {
    const githubClient = this.getClient('github');
    
    // Step 1: Create repository
    const createRepoResponse = await githubClient.call<RepoInfo>('createRepository', {
      name: config.name,
      description: config.description,
      auto_init: true,
      private: config.private || false
    });

    if (!createRepoResponse.success || !createRepoResponse.data) {
      throw new Error(`GitHub repo creation failed: ${createRepoResponse.error?.message || 'Unknown error'}`);
    }

    const repo = createRepoResponse.data;

    // Step 2: Commit all files
    const commitResponse = await githubClient.call('createOrUpdateFiles', {
      repo: repo.name,
      files: config.files,
      message: '🔄 Resurrection: ABAP to CAP transformation complete'
    });

    if (!commitResponse.success) {
      console.warn(`[MCPOrchestrator] Warning: Failed to commit files to ${repo.name}:`, commitResponse.error?.message);
    }

    // Step 3: Add topics
    const topicsResponse = await githubClient.call('addTopics', {
      repo: repo.name,
      topics: ['sap-cap', 'abap-resurrection', 'clean-core', 'sap-btp']
    });

    if (!topicsResponse.success) {
      console.warn(`[MCPOrchestrator] Warning: Failed to add topics to ${repo.name}:`, topicsResponse.error?.message);
    }

    // Step 4: Setup CI/CD workflow
    const ciWorkflow = this.generateCIWorkflow();
    const workflowResponse = await githubClient.call('createWorkflow', {
      repo: repo.name,
      workflow: ciWorkflow
    });

    if (!workflowResponse.success) {
      console.warn(`[MCPOrchestrator] Warning: Failed to create CI/CD workflow for ${repo.name}:`, workflowResponse.error?.message);
    }

    return repo;
  }

  /**
   * Send Slack notification using Slack MCP
   */
  async notifySlack(
    channel: string,
    resurrection: {
      name: string;
      githubUrl?: string;
      basUrl?: string;
      error?: string;
      deploymentUrl?: string;
      module?: string;
      locSaved?: number;
      qualityScore?: number;
    },
    event: 'started' | 'completed' | 'failed' | 'deployed'
  ): Promise<void> {
    const slackClient = this.getClient('slack');
    
    const messages = {
      'started': `🚀 Resurrection started: ${resurrection.name}`,
      'completed': `✅ Resurrection completed: ${resurrection.name}\n🔗 GitHub: ${resurrection.githubUrl}\n💻 Open in BAS: ${resurrection.basUrl}`,
      'failed': `🔴 Resurrection failed: ${resurrection.name}\n❌ Error: ${resurrection.error}`,
      'deployed': `🎉 Resurrection deployed: ${resurrection.name}\n🌐 Live URL: ${resurrection.deploymentUrl}`
    };

    const attachments = [];
    
    if (event !== 'started') {
      attachments.push({
        color: event === 'failed' ? 'danger' : 'good',
        fields: [
          { title: 'Module', value: resurrection.module || 'N/A', short: true },
          { title: 'LOC Saved', value: resurrection.locSaved?.toString() || 'N/A', short: true },
          { title: 'Quality Score', value: resurrection.qualityScore ? `${resurrection.qualityScore}%` : 'N/A', short: true }
        ]
      });
    }

    const response = await slackClient.call('postMessage', {
      channel,
      text: messages[event],
      attachments
    });

    if (!response.success) {
      console.error(`[MCPOrchestrator] Failed to send Slack notification:`, response.error?.message);
      // Don't throw - Slack notifications are non-critical
    }
  }

  /**
   * Generate CI/CD workflow configuration
   */
  private generateCIWorkflow(): string {
    return `name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Build CAP application
      run: npm run build
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to SAP BTP (if main branch)
      if: github.ref == 'refs/heads/main'
      run: |
        echo "Deployment step - configure with your SAP BTP credentials"
        # cf login -a \${{ secrets.CF_API }} -u \${{ secrets.CF_USER }} -p \${{ secrets.CF_PASSWORD }}
        # cf push
`;
  }

  /**
   * Get statistics for all MCP servers
   */
  getStats() {
    const stats = Array.from(this.clients.entries()).map(([name, client]) => {
      const clientStats = client.getStats();
      return {
        ...clientStats,
        health: this.serverHealth.get(name)
      };
    });

    return {
      totalServers: this.clients.size,
      healthyServers: Array.from(this.serverHealth.values()).filter(h => h.healthy).length,
      servers: stats
    };
  }

  /**
   * Reconnect to a specific server
   */
  async reconnectServer(serverName: string): Promise<void> {
    const client = this.getClient(serverName);
    
    try {
      await client.disconnect();
      await client.connect();
      
      // Update health status
      const health = this.serverHealth.get(serverName);
      if (health) {
        health.status = client.getStatus();
        health.healthy = true;
        health.lastCheck = new Date();
        health.lastError = undefined;
      }
      
      console.log(`[MCPOrchestrator] Successfully reconnected to ${serverName}`);
    } catch (error) {
      console.error(`[MCPOrchestrator] Failed to reconnect to ${serverName}:`, error);
      throw error;
    }
  }

  /**
   * Check if a specific server is available
   */
  isServerAvailable(serverName: string): boolean {
    const health = this.serverHealth.get(serverName);
    return health?.healthy || false;
  }

  /**
   * Get list of available server names
   */
  getAvailableServers(): string[] {
    return Array.from(this.clients.keys());
  }
}
