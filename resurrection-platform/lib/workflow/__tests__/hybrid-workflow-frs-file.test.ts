/**
 * Hybrid Workflow FRS File Generation Tests
 * 
 * Tests for FRS.md file creation in the generate step
 */

// Increase timeout for tests that run real CAP CLI
jest.setTimeout(15000);

import { HybridResurrectionWorkflow } from '../hybrid-workflow';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'fs';
import { readFile, rm } from 'fs/promises';
import { join } from 'path';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockResurrection = {
    id: 'test-frs-file',
    name: 'Test FRS File',
    description: 'Test FRS file generation',
    originalLOC: 1000,
    transformedLOC: 400,
    locSaved: 600,
    qualityScore: 90,
    module: 'SD',
    complexityScore: 7
  };

  return {
    PrismaClient: jest.fn().mockImplementation(() => {
      return {
        resurrection: {
          findUnique: jest.fn().mockResolvedValue(mockResurrection),
          update: jest.fn().mockResolvedValue(mockResurrection)
        },
        transformationLog: {
          create: jest.fn().mockResolvedValue({})
        }
      };
    })
  };
});

describe('HybridResurrectionWorkflow - FRS File Generation', () => {
  let workflow: HybridResurrectionWorkflow;
  let testProjectPath: string;

  beforeEach(() => {
    workflow = new HybridResurrectionWorkflow();
  });

  afterEach(async () => {
    // Clean up test project if it exists
    if (testProjectPath && existsSync(testProjectPath)) {
      try {
        await rm(testProjectPath, { recursive: true, force: true });
      } catch (error) {
        console.warn('Failed to clean up test project:', error);
      }
    }
  });

  describe('stepGenerate with FRS file', () => {
    it('should create docs/FRS.md file in generated project', async () => {
      const analysis = {
        businessLogic: ['Pricing calculation'],
        dependencies: [],
        tables: ['VBAK', 'VBAP'],
        patterns: ['SAP Pricing Procedure'],
        module: 'SD',
        complexity: 7,
        documentation: 'Test documentation',
        frsDocument: '# Test FRS Document\n\nThis is a test FRS document.'
      };

      const plan = {
        entities: [{ name: 'SalesOrder', fields: ['ID', 'orderNumber'] }],
        services: [{ name: 'SalesOrderService', operations: ['CREATE', 'READ'] }],
        businessLogic: ['Pricing calculation'],
        patterns: ['SAP Pricing Procedure']
      };

      // Access the private method
      const stepGenerate = (workflow as any).stepGenerate.bind(workflow);
      const result = await stepGenerate('test-frs-file', analysis, plan);

      testProjectPath = result.path;

      // Verify docs/FRS.md exists
      const frsPath = join(result.path, 'docs', 'FRS.md');
      expect(existsSync(frsPath)).toBe(true);

      // Verify FRS content
      const frsContent = await readFile(frsPath, 'utf-8');
      expect(frsContent).toContain('Test FRS Document');
      expect(frsContent).toContain('This is a test FRS document');
    });

    it('should include FRS.md in project files list', async () => {
      const analysis = {
        businessLogic: [],
        dependencies: [],
        tables: ['VBAK'],
        patterns: [],
        module: 'SD',
        complexity: 5,
        documentation: 'Test',
        frsDocument: '# FRS Document\n\nContent here.'
      };

      const plan = {
        entities: [{ name: 'TestEntity', fields: ['ID'] }],
        services: [{ name: 'TestService', operations: ['READ'] }],
        businessLogic: [],
        patterns: []
      };

      const stepGenerate = (workflow as any).stepGenerate.bind(workflow);
      const result = await stepGenerate('test-frs-file', analysis, plan);

      testProjectPath = result.path;

      // Verify FRS.md is in the files list
      const frsFile = result.files.find((f: any) => f.path.includes('FRS.md'));
      expect(frsFile).toBeDefined();
      expect(frsFile.content).toContain('FRS Document');
    });

    it('should handle missing FRS document gracefully', async () => {
      const analysis = {
        businessLogic: [],
        dependencies: [],
        tables: [],
        patterns: [],
        module: 'CUSTOM',
        complexity: 3,
        documentation: 'Test',
        // No frsDocument field
      };

      const plan = {
        entities: [{ name: 'TestEntity', fields: ['ID'] }],
        services: [{ name: 'TestService', operations: ['READ'] }],
        businessLogic: [],
        patterns: []
      };

      const stepGenerate = (workflow as any).stepGenerate.bind(workflow);
      
      // Should not throw error
      const result = await stepGenerate('test-frs-file', analysis, plan);
      testProjectPath = result.path;

      // Verify docs/FRS.md does not exist
      const frsPath = join(result.path, 'docs', 'FRS.md');
      expect(existsSync(frsPath)).toBe(false);
    });
  });
});
