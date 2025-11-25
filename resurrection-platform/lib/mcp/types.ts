/**
 * MCP Type Definitions
 * 
 * Shared types for MCP client infrastructure
 */

export interface MCPServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
  timeout?: number;
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

export interface MCPStats {
  serverName: string;
  status: MCPConnectionStatus;
  connectionAttempts: number;
  lastError: MCPError | null;
  retryCount: number;
}

// ABAP Analyzer MCP Types
export interface ABAPAnalysisResult {
  businessLogic: string[];
  dependencies: string[];
  metadata: {
    module: string;
    complexity: number;
    linesOfCode?: number;
    tables?: string[];
  };
  patterns?: string[];
}

// CAP Generator MCP Types
export interface CDSGenerationResult {
  files: Array<{
    path: string;
    content: string;
  }>;
}

export interface ServiceGenerationResult {
  files: Array<{
    path: string;
    content: string;
  }>;
}

// UI5 Generator MCP Types
export interface UI5GenerationResult {
  files: Array<{
    path: string;
    content: string;
  }>;
  manifest?: any;
}

// GitHub MCP Types
export interface GitHubRepoConfig {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
}

export interface GitHubRepoInfo {
  name: string;
  url: string;
  clone_url: string;
  html_url: string;
}

// Slack MCP Types
export interface SlackMessageConfig {
  channel: string;
  text: string;
  attachments?: Array<{
    color?: string;
    title?: string;
    text?: string;
    fields?: Array<{
      title: string;
      value: string;
      short?: boolean;
    }>;
  }>;
}
