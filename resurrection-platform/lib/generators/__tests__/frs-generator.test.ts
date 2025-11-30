/**
 * FRS Generator Tests
 * 
 * Tests for the FRS (Functional Requirements Specification) generator
 */

import { FRSGenerator } from '../frs-generator';

describe('FRSGenerator', () => {
  let generator: FRSGenerator;

  beforeEach(() => {
    generator = new FRSGenerator();
  });

  describe('generateFRS', () => {
    it('should generate a complete FRS document with all required sections', async () => {
      const analysis = {
        businessLogic: ['Pricing calculation', 'Discount application'],
        dependencies: [],
        tables: ['VBAK', 'VBAP', 'KONV'],
        patterns: ['SAP Pricing Procedure'],
        module: 'SD',
        complexity: 7,
        documentation: 'Test documentation'
      };

      const resurrection = {
        id: 'test-123',
        name: 'Sales Order Processing',
        description: 'Legacy sales order processing system',
        originalLOC: 1000,
        transformedLOC: 400,
        locSaved: 600,
        qualityScore: 90,
        module: 'SD',
        complexityScore: 7
      };

      const plan = {
        entities: [
          { name: 'SalesOrder', fields: ['ID', 'orderNumber', 'customerID'] },
          { name: 'OrderItem', fields: ['ID', 'orderID', 'productID', 'quantity'] }
        ],
        services: [
          { name: 'SalesOrderService', operations: ['CREATE', 'READ', 'UPDATE', 'DELETE'] }
        ],
        businessLogic: ['Pricing calculation', 'Discount application'],
        patterns: ['SAP Pricing Procedure']
      };

      const frs = await generator.generateFRS(analysis, resurrection, plan);

      // Verify document structure
      expect(frs).toContain('# Functional Requirements Specification (FRS)');
      expect(frs).toContain('## 1. Overview');
      expect(frs).toContain('## 2. Original ABAP Analysis');
      expect(frs).toContain('## 3. Transformation Mapping');
      expect(frs).toContain('## 4. Quality Metrics');
      expect(frs).toContain('## 5. Business Logic Preservation');
      expect(frs).toContain('## 6. Technical Details');
      expect(frs).toContain('## 7. Recommendations');

      // Verify content
      expect(frs).toContain('Sales Order Processing');
      expect(frs).toContain('SD');
      expect(frs).toContain('VBAK');
      expect(frs).toContain('VBAP');
      expect(frs).toContain('KONV');
      expect(frs).toContain('Pricing calculation');
      expect(frs).toContain('SAP Pricing Procedure');
      expect(frs).toContain('SalesOrder');
      expect(frs).toContain('SalesOrderService');
    });

    it('should generate FRS without transformation plan', async () => {
      const analysis = {
        businessLogic: ['Tax calculation'],
        dependencies: [],
        tables: ['BKPF', 'BSEG'],
        patterns: [],
        module: 'FI',
        complexity: 5,
        documentation: 'Financial accounting module'
      };

      const resurrection = {
        id: 'test-456',
        name: 'Financial Posting',
        description: null,
        originalLOC: 500,
        transformedLOC: 200,
        locSaved: 300,
        qualityScore: 85,
        module: 'FI',
        complexityScore: 5
      };

      const frs = await generator.generateFRS(analysis, resurrection);

      // Should still have all main sections except transformation mapping
      expect(frs).toContain('# Functional Requirements Specification (FRS)');
      expect(frs).toContain('## 1. Overview');
      expect(frs).toContain('## 2. Original ABAP Analysis');
      expect(frs).toContain('## 4. Quality Metrics');
      expect(frs).toContain('Financial Posting');
      expect(frs).toContain('FI');
      expect(frs).toContain('BKPF');
    });

    it('should handle empty business logic and patterns', async () => {
      const analysis = {
        businessLogic: [],
        dependencies: [],
        tables: ['MARA'],
        patterns: [],
        module: 'MM',
        complexity: 3,
        documentation: 'Simple material master'
      };

      const resurrection = {
        id: 'test-789',
        name: 'Material Master',
        description: 'Material master data management',
        originalLOC: 200,
        transformedLOC: 100,
        locSaved: 100,
        qualityScore: 95,
        module: 'MM',
        complexityScore: 3
      };

      const frs = await generator.generateFRS(analysis, resurrection);

      expect(frs).toContain('Material Master');
      expect(frs).toContain('MM');
      expect(frs).toContain('MARA');
      // Should handle empty arrays gracefully
      expect(frs).toBeDefined();
      expect(frs.length).toBeGreaterThan(0);
    });
  });

  describe('formatBusinessLogic', () => {
    it('should format business logic as numbered list', () => {
      const logic = ['Pricing calculation', 'Discount application', 'Tax calculation'];
      const formatted = generator.formatBusinessLogic(logic);

      expect(formatted).toContain('1. Pricing calculation');
      expect(formatted).toContain('2. Discount application');
      expect(formatted).toContain('3. Tax calculation');
    });

    it('should handle empty business logic', () => {
      const formatted = generator.formatBusinessLogic([]);
      expect(formatted).toContain('No specific business logic patterns identified');
    });
  });

  describe('formatTransformationMapping', () => {
    it('should format transformation mapping', () => {
      const analysis = {
        businessLogic: [],
        dependencies: [],
        tables: ['VBAK', 'VBAP'],
        patterns: [],
        module: 'SD',
        complexity: 5,
        documentation: ''
      };

      const plan = {
        entities: [
          { name: 'SalesOrder', fields: ['ID', 'orderNumber'] }
        ],
        services: [
          { name: 'SalesOrderService', operations: ['CREATE', 'READ'] }
        ],
        businessLogic: [],
        patterns: []
      };

      const formatted = generator.formatTransformationMapping(analysis, plan);

      expect(formatted).toContain('ABAP → CAP Mapping');
      expect(formatted).toContain('SalesOrder');
      expect(formatted).toContain('SalesOrderService');
    });
  });

  describe('Quality Metrics', () => {
    it('should calculate LOC reduction percentage correctly', async () => {
      const analysis = {
        businessLogic: [],
        dependencies: [],
        tables: [],
        patterns: [],
        module: 'CUSTOM',
        complexity: 5,
        documentation: ''
      };

      const resurrection = {
        id: 'test-metrics',
        name: 'Test',
        description: null,
        originalLOC: 1000,
        transformedLOC: 400,
        locSaved: 600,
        qualityScore: 90,
        module: null,
        complexityScore: null
      };

      const frs = await generator.generateFRS(analysis, resurrection);

      expect(frs).toContain('Original ABAP LOC:** 1,000');
      expect(frs).toContain('Transformed CAP LOC:** 400');
      expect(frs).toContain('Lines Saved:** 600');
      expect(frs).toContain('Reduction Percentage:** 60%');
    });
  });

  describe('Clean Core Compliance', () => {
    it('should always mark as Clean Core compliant', async () => {
      const analysis = {
        businessLogic: [],
        dependencies: [],
        tables: [],
        patterns: [],
        module: 'CUSTOM',
        complexity: 5,
        documentation: ''
      };

      const resurrection = {
        id: 'test-clean-core',
        name: 'Test',
        description: null,
        originalLOC: 100,
        transformedLOC: 50,
        locSaved: 50,
        qualityScore: 85,
        module: null,
        complexityScore: null
      };

      const frs = await generator.generateFRS(analysis, resurrection);

      expect(frs).toContain('Clean Core Compliant:** ✅ Yes');
      expect(frs).toContain('Uses Released APIs Only:** ✅ Yes');
      expect(frs).toContain('No Standard Modifications:** ✅ Yes');
      expect(frs).toContain('Cloud-Ready:** ✅ Yes');
    });
  });
});
