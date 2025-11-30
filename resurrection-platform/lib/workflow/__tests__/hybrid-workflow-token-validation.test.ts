/**
 * Tests for HybridResurrectionWorkflow token validation
 * 
 * These tests verify that the stepDeploy method properly validates
 * GitHub tokens before attempting to create repositories.
 */

import { HybridResurrectionWorkflow } from '../hybrid-workflow';
import { PrismaClient } from '@prisma/client';

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    resurrection: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transformationLog: {
      create: jest.fn(),
    },
    gitHubActivity: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
  };
});

// Mock fetch
global.fetch = jest.fn();

describe('HybridResurrectionWorkflow - Token Validation', () => {
  let workflow: HybridResurrectionWorkflow;
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Clear mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Token Configuration Check', () => {
    it('should throw descriptive error when GITHUB_TOKEN is not configured', async () => {
      // Set up environment without token
      process.env.GITHUB_TOKEN = '';
      
      // Create workflow instance
      workflow = new HybridResurrectionWorkflow();

      // Mock resurrection data
      const mockResurrection = {
        id: 'test-id',
        name: 'test-resurrection',
        description: 'Test description',
      };

      const mockPrisma = new PrismaClient();
      (mockPrisma.resurrection.findUnique as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.resurrection.update as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.transformationLog.create as jest.Mock).mockResolvedValue({});

      const capProject = {
        path: '/test/path',
        files: [],
      };

      // Attempt to deploy - should throw error about missing token
      await expect(
        (workflow as any).stepDeploy('test-id', capProject)
      ).rejects.toThrow(/GITHUB_TOKEN not configured/);
    });

    it('should throw descriptive error when GITHUB_TOKEN is missing', async () => {
      // Set up environment without token
      delete process.env.GITHUB_TOKEN;
      
      // Create workflow instance
      workflow = new HybridResurrectionWorkflow();

      // Mock resurrection data
      const mockResurrection = {
        id: 'test-id',
        name: 'test-resurrection',
        description: 'Test description',
      };

      const mockPrisma = new PrismaClient();
      (mockPrisma.resurrection.findUnique as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.resurrection.update as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.transformationLog.create as jest.Mock).mockResolvedValue({});

      const capProject = {
        path: '/test/path',
        files: [],
      };

      // Attempt to deploy - should throw error about missing token
      await expect(
        (workflow as any).stepDeploy('test-id', capProject)
      ).rejects.toThrow(/GITHUB_TOKEN not configured/);
    });
  });

  describe('Token Validation', () => {
    it('should throw descriptive error when token is invalid', async () => {
      // Set up environment with invalid token
      process.env.GITHUB_TOKEN = 'invalid_token_format';
      
      // Create workflow instance
      workflow = new HybridResurrectionWorkflow();

      // Mock resurrection data
      const mockResurrection = {
        id: 'test-id',
        name: 'test-resurrection',
        description: 'Test description',
      };

      const mockPrisma = new PrismaClient();
      (mockPrisma.resurrection.findUnique as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.resurrection.update as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.transformationLog.create as jest.Mock).mockResolvedValue({});

      const capProject = {
        path: '/test/path',
        files: [],
      };

      // Attempt to deploy - should throw error about invalid token format
      await expect(
        (workflow as any).stepDeploy('test-id', capProject)
      ).rejects.toThrow(/Token format is invalid/);
    });

    it('should throw descriptive error when token lacks repo scope', async () => {
      // Set up environment with valid token format
      process.env.GITHUB_TOKEN = 'ghp_' + 'x'.repeat(36); // Valid format but will fail scope check
      
      // Create workflow instance
      workflow = new HybridResurrectionWorkflow();

      // Mock resurrection data
      const mockResurrection = {
        id: 'test-id',
        name: 'test-resurrection',
        description: 'Test description',
      };

      const mockPrisma = new PrismaClient();
      (mockPrisma.resurrection.findUnique as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.resurrection.update as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.transformationLog.create as jest.Mock).mockResolvedValue({});

      // Mock GitHub API responses
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' }),
          headers: new Headers({ 'X-OAuth-Scopes': 'user, gist' }), // Missing 'repo' scope
        })
        .mockResolvedValueOnce({
          ok: false, // Repo access check fails
          status: 403,
        });

      const capProject = {
        path: '/test/path',
        files: [],
      };

      // Attempt to deploy - should throw error about missing repo scope
      await expect(
        (workflow as any).stepDeploy('test-id', capProject)
      ).rejects.toThrow(/missing required "repo" scope/);
    });
  });

  describe('Token Sanitization', () => {
    it('should sanitize token with whitespace', async () => {
      // Set up environment with token that has whitespace
      const validToken = 'ghp_' + 'x'.repeat(36);
      process.env.GITHUB_TOKEN = `  ${validToken}  \n`;
      
      // Create workflow instance
      workflow = new HybridResurrectionWorkflow();

      // Mock resurrection data
      const mockResurrection = {
        id: 'test-id',
        name: 'test-resurrection',
        description: 'Test description',
      };

      const mockPrisma = new PrismaClient();
      (mockPrisma.resurrection.findUnique as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.resurrection.update as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.transformationLog.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.gitHubActivity.create as jest.Mock).mockResolvedValue({});

      // Mock GitHub API responses for successful validation
      // First call: validateToken in stepDeploy
      // Second call: validateToken inside hasRepoScope -> checkScopes
      // Third call: verifyRepoAccess (since scopes include 'repo', this won't be called)
      // Fourth call: create repo
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' }),
          headers: new Headers({ 'X-OAuth-Scopes': 'repo, user' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' }),
          headers: new Headers({ 'X-OAuth-Scopes': 'repo, user' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            name: 'test-repo',
            full_name: 'testuser/test-repo',
            html_url: 'https://github.com/testuser/test-repo',
            clone_url: 'https://github.com/testuser/test-repo.git',
          }),
        });

      const capProject = {
        path: '/test/path',
        files: [],
      };

      // Should not throw - token should be sanitized and work
      await (workflow as any).stepDeploy('test-id', capProject);

      // Verify fetch was called with sanitized token (no whitespace)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.github.com/user',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': `Bearer ${validToken}`,
          }),
        })
      );
    });
  });

  describe('Logging', () => {
    it('should log validation results', async () => {
      // Set up environment with valid token
      const validToken = 'ghp_' + 'x'.repeat(36);
      process.env.GITHUB_TOKEN = validToken;
      
      // Spy on console.log
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // Create workflow instance
      workflow = new HybridResurrectionWorkflow();

      // Mock resurrection data
      const mockResurrection = {
        id: 'test-id',
        name: 'test-resurrection',
        description: 'Test description',
      };

      const mockPrisma = new PrismaClient();
      (mockPrisma.resurrection.findUnique as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.resurrection.update as jest.Mock).mockResolvedValue(mockResurrection);
      (mockPrisma.transformationLog.create as jest.Mock).mockResolvedValue({});
      (mockPrisma.gitHubActivity.create as jest.Mock).mockResolvedValue({});

      // Mock GitHub API responses
      // First call: validateToken in stepDeploy
      // Second call: validateToken inside hasRepoScope -> checkScopes
      // Third call: create repo
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' }),
          headers: new Headers({ 'X-OAuth-Scopes': 'repo, user' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ login: 'testuser' }),
          headers: new Headers({ 'X-OAuth-Scopes': 'repo, user' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            name: 'test-repo',
            full_name: 'testuser/test-repo',
            html_url: 'https://github.com/testuser/test-repo',
            clone_url: 'https://github.com/testuser/test-repo.git',
          }),
        });

      const capProject = {
        path: '/test/path',
        files: [],
      };

      await (workflow as any).stepDeploy('test-id', capProject);

      // Verify logging
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[HybridWorkflow] Sanitizing GitHub token')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[HybridWorkflow] Validating GitHub token')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[HybridWorkflow] Token validated successfully')
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[HybridWorkflow] Token has required "repo" scope')
      );

      consoleLogSpy.mockRestore();
    });
  });
});
