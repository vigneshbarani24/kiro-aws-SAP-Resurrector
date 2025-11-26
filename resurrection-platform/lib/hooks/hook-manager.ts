/**
 * Hook Manager
 * 
 * Manages Kiro hooks for automation of quality validation, CI/CD, and notifications
 * 
 * Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10
 */

import { PrismaClient } from '@prisma/client';
import { MCPOrchestrator } from '../mcp/orchestrator';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Hook trigger types
export type HookTrigger =
  | 'resurrection.started'
  | 'resurrection.completed'
  | 'resurrection.failed'
  | 'quality.validation.passed'
  | 'quality.validation.failed'
  | 'github.repository.created'
  | 'deployment.succeeded'
  | 'deployment.failed';

// Hook action types
export type HookActionType = 'mcp-call' | 'agent-execution' | 'shell-command';

// Hook action definition
export interface HookAction {
  type: HookActionType;
  server?: string; // For mcp-call
  method?: string; // For mcp-call
  params?: Record<string, any>; // For mcp-call
  message?: string; // For agent-execution
  command?: string; // For shell-command
}

// Hook definition
export interface Hook {
  id: string;
  name: string;
  trigger: HookTrigger;
  enabled: boolean;
  actions: HookAction[];
}

// Hook configuration
export interface HookConfig {
  hooks: Hook[];
}

// Hook execution context
export interface HookContext {
  resurrectionId?: string;
  resurrection?: any;
  capProject?: any;
  validation?: any;
  deployment?: any;
  error?: any;
  [key: string]: any;
}

// Hook execution result
export interface HookExecutionResult {
  hookId: string;
  hookName: string;
  trigger: string;
  status: 'COMPLETED' | 'FAILED';
  executionLog: any[];
  duration: number;
  error?: string;
}

/**
 * Hook Manager
 * 
 * Manages lifecycle and execution of Kiro hooks
 */
export class HookManager {
  private mcpOrchestrator: MCPOrchestrator;
  private configPath: string;
  private config: HookConfig | null = null;

  constructor(mcpOrchestrator: MCPOrchestrator, configPath?: string) {
    this.mcpOrchestrator = mcpOrchestrator;
    this.configPath = configPath || path.join(process.cwd(), '.kiro', 'hooks', 'resurrection-hooks.json');
  }

  /**
   * Load hook configuration from file
   */
  async loadConfig(): Promise<HookConfig> {
    try {
      const configContent = await fs.readFile(this.configPath, 'utf-8');
      this.config = JSON.parse(configContent);
      return this.config!;
    } catch (error) {
      console.warn('[HookManager] No hook configuration found, using defaults');
      this.config = this.getDefaultConfig();
      return this.config;
    }
  }

  /**
   * Save hook configuration to file
   */
  async saveConfig(config: HookConfig): Promise<void> {
    // Ensure directory exists
    const dir = path.dirname(this.configPath);
    await fs.mkdir(dir, { recursive: true });

    // Write config
    await fs.writeFile(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
    this.config = config;
  }

  /**
   * Get all hooks
   */
  async getHooks(): Promise<Hook[]> {
    if (!this.config) {
      await this.loadConfig();
    }
    return this.config!.hooks;
  }

  /**
   * Get hook by ID
   */
  async getHook(hookId: string): Promise<Hook | undefined> {
    const hooks = await this.getHooks();
    return hooks.find(h => h.id === hookId);
  }

  /**
   * Add or update hook
   */
  async upsertHook(hook: Hook): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }

    const existingIndex = this.config!.hooks.findIndex(h => h.id === hook.id);
    if (existingIndex >= 0) {
      this.config!.hooks[existingIndex] = hook;
    } else {
      this.config!.hooks.push(hook);
    }

    await this.saveConfig(this.config!);
  }

  /**
   * Delete hook
   */
  async deleteHook(hookId: string): Promise<void> {
    if (!this.config) {
      await this.loadConfig();
    }

    this.config!.hooks = this.config!.hooks.filter(h => h.id !== hookId);
    await this.saveConfig(this.config!);
  }

  /**
   * Trigger hooks for a specific event
   */
  async trigger(trigger: HookTrigger, context: HookContext): Promise<HookExecutionResult[]> {
    console.log(`[HookManager] Triggering hooks for: ${trigger}`);

    const hooks = await this.getHooks();
    const matchingHooks = hooks.filter(h => h.trigger === trigger && h.enabled);

    if (matchingHooks.length === 0) {
      console.log(`[HookManager] No enabled hooks found for trigger: ${trigger}`);
      return [];
    }

    const results: HookExecutionResult[] = [];

    for (const hook of matchingHooks) {
      const result = await this.executeHook(hook, context);
      results.push(result);
    }

    return results;
  }

  /**
   * Execute a single hook
   */
  private async executeHook(hook: Hook, context: HookContext): Promise<HookExecutionResult> {
    const startTime = Date.now();
    const executionLog: any[] = [];

    console.log(`[HookManager] Executing hook: ${hook.name} (${hook.id})`);

    try {
      for (const action of hook.actions) {
        const actionResult = await this.executeAction(action, context);
        executionLog.push(actionResult);
      }

      const duration = Date.now() - startTime;

      // Log to database
      if (context.resurrectionId) {
        await prisma.hookExecution.create({
          data: {
            resurrectionId: context.resurrectionId,
            hookId: hook.id,
            hookName: hook.name,
            trigger: hook.trigger,
            status: 'COMPLETED',
            executionLog,
            duration
          }
        });
      }

      console.log(`[HookManager] Hook executed successfully: ${hook.name} (${duration}ms)`);

      return {
        hookId: hook.id,
        hookName: hook.name,
        trigger: hook.trigger,
        status: 'COMPLETED',
        executionLog,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      console.error(`[HookManager] Hook execution failed: ${hook.name}`, error);

      // Log to database
      if (context.resurrectionId) {
        await prisma.hookExecution.create({
          data: {
            resurrectionId: context.resurrectionId,
            hookId: hook.id,
            hookName: hook.name,
            trigger: hook.trigger,
            status: 'FAILED',
            executionLog: [...executionLog, { error: errorMessage }],
            duration
          }
        });
      }

      return {
        hookId: hook.id,
        hookName: hook.name,
        trigger: hook.trigger,
        status: 'FAILED',
        executionLog,
        duration,
        error: errorMessage
      };
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: HookAction, context: HookContext): Promise<any> {
    console.log(`[HookManager] Executing action: ${action.type}`);

    switch (action.type) {
      case 'mcp-call':
        return await this.executeMCPCall(action, context);
      
      case 'agent-execution':
        return await this.executeAgentExecution(action, context);
      
      case 'shell-command':
        return await this.executeShellCommand(action, context);
      
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Execute MCP call action
   */
  private async executeMCPCall(action: HookAction, context: HookContext): Promise<any> {
    if (!action.server || !action.method) {
      throw new Error('MCP call action requires server and method');
    }

    // Replace template variables in params
    const params = this.replaceTemplateVariables(action.params || {}, context);

    console.log(`[HookManager] Calling MCP: ${action.server}.${action.method}`);

    // Execute MCP call based on server type
    if (action.server === 'slack') {
      return await this.mcpOrchestrator.notifySlack(
        params.channel,
        context.resurrection || {},
        params.event || 'custom'
      );
    } else if (action.server === 'github') {
      // Handle GitHub MCP calls
      return await this.executeGitHubMCPCall(action.method, params);
    }

    return { success: true, server: action.server, method: action.method };
  }

  /**
   * Execute GitHub MCP call
   */
  private async executeGitHubMCPCall(method: string, params: any): Promise<any> {
    // This would integrate with the GitHub MCP client
    console.log(`[HookManager] GitHub MCP call: ${method}`, params);
    return { success: true, method, params };
  }

  /**
   * Execute agent execution action
   */
  private async executeAgentExecution(action: HookAction, context: HookContext): Promise<any> {
    if (!action.message) {
      throw new Error('Agent execution action requires message');
    }

    const message = this.replaceTemplateVariables(action.message, context);

    console.log(`[HookManager] Agent execution: ${message}`);

    // This would trigger a Kiro agent execution
    // For now, we'll just log it
    return { success: true, message };
  }

  /**
   * Execute shell command action
   */
  private async executeShellCommand(action: HookAction, context: HookContext): Promise<any> {
    if (!action.command) {
      throw new Error('Shell command action requires command');
    }

    const command = this.replaceTemplateVariables(action.command, context);

    console.log(`[HookManager] Shell command: ${command}`);

    // This would execute a shell command
    // For now, we'll just log it
    return { success: true, command };
  }

  /**
   * Replace template variables in a value
   */
  private replaceTemplateVariables(value: any, context: HookContext): any {
    if (typeof value === 'string') {
      return value.replace(/\{\{([^}]+)\}\}/g, (match, path) => {
        const keys = path.trim().split('.');
        let result: any = context;
        for (const key of keys) {
          result = result?.[key];
        }
        return result !== undefined ? String(result) : match;
      });
    } else if (Array.isArray(value)) {
      return value.map(item => this.replaceTemplateVariables(item, context));
    } else if (typeof value === 'object' && value !== null) {
      const result: any = {};
      for (const [key, val] of Object.entries(value)) {
        result[key] = this.replaceTemplateVariables(val, context);
      }
      return result;
    }
    return value;
  }

  /**
   * Get default hook configuration
   */
  private getDefaultConfig(): HookConfig {
    return {
      hooks: [
        {
          id: 'on-resurrection-start',
          name: 'Notify team on resurrection start',
          trigger: 'resurrection.started',
          enabled: true,
          actions: [
            {
              type: 'mcp-call',
              server: 'slack',
              method: 'postMessage',
              params: {
                channel: '#resurrections',
                event: 'started'
              }
            }
          ]
        },
        {
          id: 'on-resurrection-complete',
          name: 'Quality validation on completion',
          trigger: 'resurrection.completed',
          enabled: true,
          actions: [
            {
              type: 'agent-execution',
              message: 'Validate quality for resurrection {{resurrection.id}}: Check CDS syntax, CAP structure, Clean Core compliance'
            }
          ]
        },
        {
          id: 'on-quality-failure',
          name: 'Alert on quality validation failure',
          trigger: 'quality.validation.failed',
          enabled: true,
          actions: [
            {
              type: 'mcp-call',
              server: 'slack',
              method: 'postMessage',
              params: {
                channel: '#resurrections',
                event: 'failed'
              }
            }
          ]
        },
        {
          id: 'on-deployment-success',
          name: 'Celebrate deployment success',
          trigger: 'deployment.succeeded',
          enabled: true,
          actions: [
            {
              type: 'mcp-call',
              server: 'slack',
              method: 'postMessage',
              params: {
                channel: '#resurrections',
                event: 'deployed'
              }
            }
          ]
        },
        {
          id: 'setup-ci-cd',
          name: 'Configure GitHub Actions CI/CD',
          trigger: 'github.repository.created',
          enabled: true,
          actions: [
            {
              type: 'mcp-call',
              server: 'github',
              method: 'createWorkflow',
              params: {
                repo: '{{resurrection.githubRepo}}',
                workflow: 'ci.yml'
              }
            }
          ]
        }
      ]
    };
  }
}
