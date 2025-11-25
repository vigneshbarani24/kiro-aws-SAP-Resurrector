/**
 * LLM Service Tests
 * 
 * Tests for the LLM service that creates transformation plans
 */

import { LLMService } from '../lib/llm/llm-service';
import { AnalysisResult } from '../lib/mcp/orchestrator';

describe('LLMService', () => {
  let llmService: LLMService;
  
  // Mock analysis result
  const mockAnalysis: AnalysisResult = {
    businessLogic: [
      'Calculate discount based on customer type',
      'Validate order quantity against stock',
      'Apply pricing procedure'
    ],
    dependencies: [
      'VBAK - Sales Order Header',
      'VBAP - Sales Order Items',
      'KNA1 - Customer Master'
    ],
    metadata: {
      module: 'SD',
      complexity: 75,
      linesOfCode: 450,
      tables: ['VBAK', 'VBAP', 'KNA1', 'KONV'],
      patterns: ['Pricing Procedure', 'Authorization Check', 'Batch Processing']
    },
    documentation: 'Sales order processing with pricing and discount logic'
  };

  beforeEach(() => {
    // Create LLM service with mock API key for testing
    llmService = new LLMService({
      apiKey: process.env.OPENAI_API_KEY || 'test-api-key',
      model: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 4000
    });
  });

  describe('createTransformationPlan', () => {
    it('should create a basic transformation plan when LLM fails', async () => {
      // This test will use the fallback mechanism since we don't have a real API key
      const plan = await llmService.createTransformationPlan(mockAnalysis);

      // Verify plan structure
      expect(plan).toHaveProperty('architecture');
      expect(plan).toHaveProperty('cdsModels');
      expect(plan).toHaveProperty('services');
      expect(plan).toHaveProperty('uiDesign');

      // Verify architecture
      expect(plan.architecture.layers).toContain('db');
      expect(plan.architecture.layers).toContain('srv');
      expect(plan.architecture.layers).toContain('app');
      expect(plan.architecture.patterns).toContain('CAP');
      expect(plan.architecture.patterns).toContain('Clean Core');

      // Verify CDS models
      expect(plan.cdsModels.entities).toBeDefined();
      expect(Array.isArray(plan.cdsModels.entities)).toBe(true);
      expect(plan.cdsModels.entities.length).toBeGreaterThan(0);

      // Verify services
      expect(Array.isArray(plan.services)).toBe(true);
      expect(plan.services.length).toBeGreaterThan(0);
      expect(plan.services[0]).toHaveProperty('name');
      expect(plan.services[0]).toHaveProperty('operations');

      // Verify UI design
      expect(plan.uiDesign.type).toBe('FIORI_ELEMENTS');
      expect(plan.uiDesign.template).toBeDefined();
      expect(Array.isArray(plan.uiDesign.features)).toBe(true);
    });

    it('should generate entities from ABAP tables', async () => {
      const plan = await llmService.createTransformationPlan(mockAnalysis);

      // Should have entities based on ABAP tables
      expect(plan.cdsModels.entities.length).toBeGreaterThan(0);

      // Check that entities have proper structure
      for (const entity of plan.cdsModels.entities) {
        expect(entity).toHaveProperty('name');
        expect(entity).toHaveProperty('fields');
        expect(Array.isArray(entity.fields)).toBe(true);
        expect(entity.fields.length).toBeGreaterThan(0);

        // Check that fields have proper structure
        for (const field of entity.fields) {
          expect(field).toHaveProperty('name');
          expect(field).toHaveProperty('type');
          expect(typeof field.name).toBe('string');
          expect(typeof field.type).toBe('string');
        }
      }
    });

    it('should include standard CAP fields in entities', async () => {
      const plan = await llmService.createTransformationPlan(mockAnalysis);

      // Check that entities have standard CAP managed fields
      const entity = plan.cdsModels.entities[0];
      const fieldNames = entity.fields.map(f => f.name);

      expect(fieldNames).toContain('ID');
      expect(fieldNames).toContain('createdAt');
      expect(fieldNames).toContain('createdBy');
      expect(fieldNames).toContain('modifiedAt');
      expect(fieldNames).toContain('modifiedBy');
    });

    it('should create service based on module name', async () => {
      const plan = await llmService.createTransformationPlan(mockAnalysis);

      // Service name should include module
      expect(plan.services[0].name).toContain('SD');
      expect(plan.services[0].name).toContain('Service');

      // Should have CRUD operations
      expect(plan.services[0].operations).toContain('CREATE');
      expect(plan.services[0].operations).toContain('READ');
      expect(plan.services[0].operations).toContain('UPDATE');
      expect(plan.services[0].operations).toContain('DELETE');
    });

    it('should handle analysis without tables', async () => {
      const analysisWithoutTables: AnalysisResult = {
        ...mockAnalysis,
        metadata: {
          ...mockAnalysis.metadata,
          tables: undefined
        }
      };

      const plan = await llmService.createTransformationPlan(analysisWithoutTables);

      // Should still create a default entity
      expect(plan.cdsModels.entities.length).toBeGreaterThan(0);
      expect(plan.cdsModels.entities[0].name).toContain('Object');
    });

    it('should respect transformation options', async () => {
      const plan = await llmService.createTransformationPlan(mockAnalysis, {
        includeArchitecture: true,
        includeCDSModels: true,
        includeServiceDefinitions: true,
        includeUIDesign: true,
        targetComplexity: 'simple'
      });

      // All components should be included
      expect(plan.architecture).toBeDefined();
      expect(plan.cdsModels).toBeDefined();
      expect(plan.services).toBeDefined();
      expect(plan.uiDesign).toBeDefined();
    });

    it('should convert SAP table names to entity names', async () => {
      const plan = await llmService.createTransformationPlan(mockAnalysis);

      // Check if common SAP tables are converted to meaningful names
      const entityNames = plan.cdsModels.entities.map(e => e.name);
      
      // VBAK should become SalesOrder
      if (mockAnalysis.metadata.tables?.includes('VBAK')) {
        expect(entityNames).toContain('SalesOrder');
      }

      // KNA1 should become Customer
      if (mockAnalysis.metadata.tables?.includes('KNA1')) {
        expect(entityNames).toContain('Customer');
      }
    });
  });

  describe('Table name conversion', () => {
    it('should convert common SAP table names correctly', async () => {
      const testCases = [
        { table: 'VBAK', expected: 'SalesOrder' },
        { table: 'VBAP', expected: 'SalesOrderItem' },
        { table: 'KNA1', expected: 'Customer' },
        { table: 'LFA1', expected: 'Vendor' },
        { table: 'MARA', expected: 'Material' },
        { table: 'EKKO', expected: 'PurchaseOrder' }
      ];

      for (const testCase of testCases) {
        const analysis: AnalysisResult = {
          ...mockAnalysis,
          metadata: {
            ...mockAnalysis.metadata,
            tables: [testCase.table]
          }
        };

        const plan = await llmService.createTransformationPlan(analysis);
        const entityNames = plan.cdsModels.entities.map(e => e.name);
        
        expect(entityNames).toContain(testCase.expected);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle invalid API key gracefully', async () => {
      const invalidService = new LLMService({
        apiKey: 'invalid-key',
        model: 'gpt-4-turbo-preview'
      });

      // Should fall back to basic plan instead of throwing
      const plan = await invalidService.createTransformationPlan(mockAnalysis);
      
      expect(plan).toBeDefined();
      expect(plan.architecture).toBeDefined();
      expect(plan.cdsModels).toBeDefined();
    });

    it('should handle missing analysis data', async () => {
      const minimalAnalysis: AnalysisResult = {
        businessLogic: [],
        dependencies: [],
        metadata: {
          module: 'Unknown',
          complexity: 0
        }
      };

      const plan = await llmService.createTransformationPlan(minimalAnalysis);
      
      // Should still create a valid plan
      expect(plan).toBeDefined();
      expect(plan.cdsModels.entities.length).toBeGreaterThan(0);
      expect(plan.services.length).toBeGreaterThan(0);
    });
  });

  describe('Plan structure validation', () => {
    it('should create a plan that matches TransformationPlan interface', async () => {
      const plan = await llmService.createTransformationPlan(mockAnalysis);

      // Validate architecture structure
      expect(plan.architecture).toMatchObject({
        layers: expect.arrayContaining(['db', 'srv', 'app']),
        patterns: expect.any(Array)
      });

      // Validate cdsModels structure
      expect(plan.cdsModels).toHaveProperty('entities');
      expect(Array.isArray(plan.cdsModels.entities)).toBe(true);

      // Validate services structure
      expect(Array.isArray(plan.services)).toBe(true);
      if (plan.services.length > 0) {
        expect(plan.services[0]).toMatchObject({
          name: expect.any(String),
          operations: expect.any(Array)
        });
      }

      // Validate uiDesign structure
      expect(plan.uiDesign).toMatchObject({
        type: expect.stringMatching(/FIORI_ELEMENTS|FREESTYLE/),
        template: expect.any(String),
        features: expect.any(Array)
      });
    });
  });
});
