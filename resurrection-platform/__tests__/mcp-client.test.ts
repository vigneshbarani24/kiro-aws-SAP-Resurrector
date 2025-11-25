/**
 * MCP Client Tests
 * 
 * Tests for base MCP client connection management, request/response handling,
 * and error handling with retry logic.
 * 
 * Requirements: 2.4, 4.3
 */

import { MCPClient, MCPConnectionStatus } from '../lib/mcp/mcp-client';

describe('MCPClient', () => {
  describe('Connection Management', () => {
    it('should initialize with DISCONNECTED status', () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      expect(client.getStatus()).toBe(MCPConnectionStatus.DISCONNECTED);
    });

    it('should connect successfully', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      await client.connect();
      expect(client.getStatus()).toBe(MCPConnectionStatus.CONNECTED);
    });

    it('should handle connection failures', async () => {
      const client = new MCPClient({
        name: 'test-fail-connection',
        command: 'node',
        args: ['server.js']
      });

      await expect(client.connect()).rejects.toMatchObject({
        code: 'CONNECTION_FAILED',
        retryable: true
      });
      expect(client.getStatus()).toBe(MCPConnectionStatus.ERROR);
      expect(client.getLastError()).not.toBeNull();
      expect(client.getLastError()?.code).toBe('CONNECTION_FAILED');
    });

    it('should disconnect successfully', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      await client.connect();
      await client.disconnect();
      expect(client.getStatus()).toBe(MCPConnectionStatus.DISCONNECTED);
    });

    it('should not throw when disconnecting already disconnected client', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      await expect(client.disconnect()).resolves.not.toThrow();
    });

    it('should not reconnect if already connected', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      await client.connect();
      const stats1 = client.getStats();
      
      await client.connect();
      const stats2 = client.getStats();

      expect(stats1.connectionAttempts).toBe(stats2.connectionAttempts);
    });
  });

  describe('Request/Response Handling', () => {
    it('should execute successful request', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const response = await client.call('analyzeCode', { code: 'REPORT test.' });

      expect(response.success).toBe(true);
      expect(response.data).toBeDefined();
      expect(response.duration).toBeGreaterThan(0);
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('should auto-connect before making request', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      expect(client.getStatus()).toBe(MCPConnectionStatus.DISCONNECTED);

      await client.call('analyzeCode', { code: 'REPORT test.' });

      expect(client.getStatus()).toBe(MCPConnectionStatus.CONNECTED);
    });

    it('should include request params in call', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const params = { code: 'REPORT test.', module: 'SD' };
      const response = await client.call('analyzeCode', params);

      expect(response.success).toBe(true);
    });

    it('should include context in call', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const context = { userId: '123', resurrectionId: 'abc' };
      const response = await client.call('analyzeCode', {}, context);

      expect(response.success).toBe(true);
    });

    it('should return structured response for analyzeCode', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const response = await client.call('analyzeCode', { code: 'REPORT test.' });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('businessLogic');
      expect(response.data).toHaveProperty('dependencies');
      expect(response.data).toHaveProperty('metadata');
    });

    it('should return structured response for generateCDSModels', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const response = await client.call('generateCDSModels', { models: {} });

      expect(response.success).toBe(true);
      expect(response.data).toHaveProperty('files');
      expect(Array.isArray(response.data.files)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle request timeout', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        timeout: 50 // Very short timeout
      });

      // Mock a slow request
      const originalSendRequest = (client as any).sendRequest;
      (client as any).sendRequest = async () => {
        await new Promise(resolve => setTimeout(resolve, 200));
        return {};
      };

      const response = await client.call('slowMethod');

      expect(response.success).toBe(false);
      expect(response.error).toBeDefined();
      expect(response.error?.code).toBe('TIMEOUT');
      expect(response.error?.retryable).toBe(true);

      // Restore original method
      (client as any).sendRequest = originalSendRequest;
    }, 10000);

    it('should create error with correct structure', async () => {
      const client = new MCPClient({
        name: 'test-fail-connection',
        command: 'node',
        args: ['server.js']
      });

      try {
        await client.connect();
      } catch (error: any) {
        expect(error).toHaveProperty('code');
        expect(error).toHaveProperty('message');
        expect(error).toHaveProperty('retryable');
        expect(error.code).toBe('CONNECTION_FAILED');
      }
    });

    it('should store last error', async () => {
      const client = new MCPClient({
        name: 'test-fail-connection',
        command: 'node',
        args: ['server.js']
      });

      try {
        await client.connect();
      } catch (error) {
        // Expected
      }

      const lastError = client.getLastError();
      expect(lastError).not.toBeNull();
      expect(lastError?.code).toBe('CONNECTION_FAILED');
    });

    it('should clear last error on successful connection', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      await client.connect();
      expect(client.getLastError()).toBeNull();
    });
  });

  describe('Retry Logic', () => {
    it('should use default maxRetries of 3', () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const config = client.getConfig();
      expect(config.maxRetries).toBe(3);
    });

    it('should respect custom maxRetries', () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        maxRetries: 5
      });

      const config = client.getConfig();
      expect(config.maxRetries).toBe(5);
    });

    it('should retry on retryable errors', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        maxRetries: 2,
        timeout: 100
      });

      let attemptCount = 0;
      const originalSendRequest = (client as any).sendRequest;
      (client as any).sendRequest = async () => {
        attemptCount++;
        if (attemptCount < 2) {
          throw {
            code: 'TEMPORARY_ERROR',
            message: 'Temporary error',
            retryable: true
          };
        }
        return { success: true };
      };

      const response = await client.call('testMethod');

      expect(attemptCount).toBe(2);
      expect(response.success).toBe(true);

      // Restore original method
      (client as any).sendRequest = originalSendRequest;
    }, 10000);

    it('should not retry on non-retryable errors', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        maxRetries: 3
      });

      let attemptCount = 0;
      const originalSendRequest = (client as any).sendRequest;
      (client as any).sendRequest = async () => {
        attemptCount++;
        throw {
          code: 'PERMANENT_ERROR',
          message: 'Permanent error',
          retryable: false
        };
      };

      const response = await client.call('testMethod');

      expect(attemptCount).toBe(1);
      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('PERMANENT_ERROR');

      // Restore original method
      (client as any).sendRequest = originalSendRequest;
    });

    it('should stop retrying after maxRetries', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        maxRetries: 2,
        timeout: 100
      });

      let attemptCount = 0;
      const originalSendRequest = (client as any).sendRequest;
      (client as any).sendRequest = async () => {
        attemptCount++;
        throw {
          code: 'TEMPORARY_ERROR',
          message: 'Temporary error',
          retryable: true
        };
      };

      const response = await client.call('testMethod');

      expect(attemptCount).toBe(2);
      expect(response.success).toBe(false);

      // Restore original method
      (client as any).sendRequest = originalSendRequest;
    }, 10000);
  });

  describe('Configuration', () => {
    it('should use default timeout of 30000ms', () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const config = client.getConfig();
      expect(config.timeout).toBe(30000);
    });

    it('should respect custom timeout', () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js'],
        timeout: 5000
      });

      const config = client.getConfig();
      expect(config.timeout).toBe(5000);
    });

    it('should store server configuration', () => {
      const config = {
        name: 'abap-analyzer',
        command: 'node',
        args: ['analyzer.js'],
        env: { SAP_DOMAIN: 'enabled' }
      };

      const client = new MCPClient(config);
      const storedConfig = client.getConfig();

      expect(storedConfig.name).toBe('abap-analyzer');
      expect(storedConfig.command).toBe('node');
      expect(storedConfig.args).toEqual(['analyzer.js']);
      expect(storedConfig.env).toEqual({ SAP_DOMAIN: 'enabled' });
    });
  });

  describe('Health Check', () => {
    it('should return true for healthy server', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      const isHealthy = await client.healthCheck();
      expect(isHealthy).toBe(true);
    });

    it('should return false for unhealthy server', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      // Mock failed health check
      const originalCall = client.call.bind(client);
      client.call = async () => ({
        success: false,
        error: { code: 'ERROR', message: 'Failed', retryable: false },
        duration: 0,
        timestamp: new Date()
      });

      const isHealthy = await client.healthCheck();
      expect(isHealthy).toBe(false);

      // Restore
      client.call = originalCall;
    });
  });

  describe('Statistics', () => {
    it('should track connection attempts', async () => {
      const client = new MCPClient({
        name: 'test-server',
        command: 'node',
        args: ['server.js']
      });

      await client.connect();
      const stats = client.getStats();

      expect(stats.connectionAttempts).toBe(1);
      expect(stats.serverName).toBe('test-server');
      expect(stats.status).toBe(MCPConnectionStatus.CONNECTED);
    });

    it('should include last error in stats', async () => {
      const client = new MCPClient({
        name: 'test-fail-connection',
        command: 'node',
        args: ['server.js']
      });

      try {
        await client.connect();
      } catch (error) {
        // Expected
      }

      const stats = client.getStats();
      expect(stats.lastError).not.toBeNull();
      expect(stats.lastError?.code).toBe('CONNECTION_FAILED');
    });
  });
});
