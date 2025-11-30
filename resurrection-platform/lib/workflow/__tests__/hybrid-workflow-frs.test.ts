/**
 * Hybrid Workflow FRS Generation Tests
 * 
 * Tests for FRS document generation in the analyze step
 */

import { HybridResurrectionWorkflow } from '../hybrid-workflow';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockResurrection = {
    id: 'test-123',
    name: 'Test Sales Order',
    description: 'Test description',
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

describe('HybridResurrectionWorkflow - FRS Generation', () => {
  let workflow: HybridResurrectionWorkflow;

  beforeEach(() => {
    workflow = new HybridResurrectionWorkflow();
  });

  describe('stepAnalyze with FRS generation', () => {
    it('should generate FRS document after analysis', async () => {
      const abapCode = `
        REPORT z_sales_order.
        
        TABLES: vbak, vbap, konv.
        
        * Calculate pricing
        PERFORM calculate_price.
        
        * Apply discount
        PERFORM apply_discount.
      `;

      // Access the private method using type assertion
      const stepAnalyze = (workflow as any).stepAnalyze.bind(workflow);
      const result = await stepAnalyze('test-123', abapCode);

      // Verify FRS document was generated
      expect(result.frsDocument).toBeDefined();
      expect(result.frsDocument).toContain('Functional Requirements Specification');
      expect(result.frsDocument).toContain('Test Sales Order');
      expect(result.frsDocument).toContain('SD');
    });

    it('should include all required FRS sections', async () => {
      const abapCode = `
        REPORT z_test.
        TABLES: vbak, vbap.
      `;

      const stepAnalyze = (workflow as any).stepAnalyze.bind(workflow);
      const result = await stepAnalyze('test-123', abapCode);

      expect(result.frsDocument).toBeDefined();
      
      // Check for all major sections
      expect(result.frsDocument).toContain('## 1. Overview');
      expect(result.frsDocument).toContain('## 2. Original ABAP Analysis');
      expect(result.frsDocument).toContain('## 4. Quality Metrics');
      expect(result.frsDocument).toContain('## 5. Business Logic Preservation');
      expect(result.frsDocument).toContain('## 6. Technical Details');
      expect(result.frsDocument).toContain('## 7. Recommendations');
    });

    it('should store FRS content in analysis result', async () => {
      const abapCode = `
        REPORT z_test.
        TABLES: bkpf, bseg.
      `;

      const stepAnalyze = (workflow as any).stepAnalyze.bind(workflow);
      const result = await stepAnalyze('test-123', abapCode);

      // Verify the frsDocument field is populated
      expect(result).toHaveProperty('frsDocument');
      expect(typeof result.frsDocument).toBe('string');
      expect(result.frsDocument!.length).toBeGreaterThan(0);
    });

    it('should handle FRS generation gracefully if resurrection not found', async () => {
      // Mock resurrection not found
      const prisma = new PrismaClient();
      (prisma.resurrection.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const abapCode = `REPORT z_test.`;

      const stepAnalyze = (workflow as any).stepAnalyze.bind(workflow);
      
      // Should not throw error, just skip FRS generation
      await expect(stepAnalyze('test-456', abapCode)).resolves.toBeDefined();
    });
  });
});
