/**
 * Fit-to-Standard Service Tests
 * 
 * Tests for the fit-to-standard recommendation system.
 */

import { describe, it, expect } from '@jest/globals';
import { getAllStandards, getStandardsByModule, searchStandards } from '../sap-standards-kb';
import { createPatternMatcher } from '../pattern-matcher';
import { createFitToStandardService } from '../fit-to-standard-service';
import { getImplementationGuide } from '../implementation-guides';

describe('SAP Standards Knowledge Base', () => {
  it('should return all standards', () => {
    const standards = getAllStandards();
    expect(standards.length).toBeGreaterThan(0);
  });
  
  it('should filter standards by module', () => {
    const sdStandards = getStandardsByModule('SD');
    expect(sdStandards.length).toBeGreaterThan(0);
    sdStandards.forEach(std => {
      expect(['SD', 'CROSS']).toContain(std.module);
    });
  });
  
  it('should search standards by keyword', () => {
    const pricingStandards = searchStandards('pricing');
    expect(pricingStandards.length).toBeGreaterThan(0);
  });
  
  it('should return Clean Core compliant standards', () => {
    const standards = getAllStandards();
    const cleanCoreStandards = standards.filter(s => s.cleanCoreCompliant);
    expect(cleanCoreStandards.length).toBeGreaterThan(0);
  });
});

describe('Pattern Matcher', () => {
  const matcher = createPatternMatcher();
  
  it('should detect pricing logic', async () => {
    const analysis = {
      code: `FUNCTION Z_PRICING.
        SELECT * FROM KONV WHERE kschl = 'PR00'.
        price = base_price * ( 1 - discount / 100 ).
      ENDFUNCTION.`,
      module: 'SD' as const,
      functionName: 'Z_PRICING',
      tables: ['KONV', 'VBAP'],
      operations: ['pricing calculation', 'discount'],
      businessLogic: ['Calculate price']
    };
    
    const matches = await matcher.findStandardAlternatives(analysis);
    expect(matches.length).toBeGreaterThan(0);
    
    // Should find pricing procedure pattern
    const pricingMatch = matches.find(m => m.standard.id === 'PRICING_PROCEDURE');
    expect(pricingMatch).toBeDefined();
    expect(pricingMatch?.confidence).toBeGreaterThan(0.5);
  });
  
  it('should detect authorization checks', async () => {
    const analysis = {
      code: `AUTHORITY-CHECK OBJECT 'V_VBAK_VKO'
        ID 'VKORG' FIELD sales_org.`,
      module: 'SD' as const,
      functionName: 'Z_AUTH_CHECK',
      tables: [],
      operations: ['authorization check'],
      businessLogic: ['Check authorization']
    };
    
    const matches = await matcher.findStandardAlternatives(analysis);
    const authMatch = matches.find(m => m.standard.id === 'AUTHORIZATION_OBJECT');
    expect(authMatch).toBeDefined();
  });
  
  it('should match BAPIs by table usage', async () => {
    const analysis = {
      code: 'SELECT * FROM VBAK.',
      module: 'SD' as const,
      functionName: 'Z_CREATE_ORDER',
      tables: ['VBAK', 'VBAP'],
      operations: ['create order'],
      businessLogic: ['Create sales order']
    };
    
    const matches = await matcher.findStandardAlternatives(analysis);
    expect(matches.length).toBeGreaterThan(0);
    
    // Should find sales order BAPIs
    const bapiMatches = matches.filter(m => m.standard.type === 'BAPI');
    expect(bapiMatches.length).toBeGreaterThan(0);
  });
});

describe('Fit-to-Standard Service', () => {
  const service = createFitToStandardService();
  
  it('should generate recommendations', async () => {
    const analysis = {
      code: `FUNCTION Z_PRICING.
        DATA: lv_price TYPE p DECIMALS 2.
        SELECT SINGLE netpr INTO lv_price FROM KONV.
        lv_price = lv_price * ( 1 - discount / 100 ).
      ENDFUNCTION.`,
      module: 'SD' as const,
      functionName: 'Z_PRICING',
      tables: ['KONV'],
      operations: ['pricing'],
      businessLogic: ['Calculate price']
    };
    
    const recommendations = await service.generateRecommendations(
      'test-obj-1',
      'Z_PRICING',
      analysis,
      { minConfidence: 0.3 }
    );
    
    expect(recommendations.length).toBeGreaterThan(0);
    
    // Check recommendation structure
    const rec = recommendations[0];
    expect(rec).toHaveProperty('id');
    expect(rec).toHaveProperty('abapObjectId', 'test-obj-1');
    expect(rec).toHaveProperty('standardAlternative');
    expect(rec).toHaveProperty('confidence');
    expect(rec).toHaveProperty('description');
    expect(rec).toHaveProperty('benefits');
    expect(rec).toHaveProperty('effort');
    expect(rec).toHaveProperty('potentialSavings');
    expect(rec).toHaveProperty('implementationGuide');
    
    // Check savings
    expect(rec.potentialSavings.locReduction).toBeGreaterThan(0);
    expect(rec.potentialSavings.maintenanceReduction).toBeGreaterThan(0);
    expect(rec.potentialSavings.complexityReduction).toBeGreaterThan(0);
    
    // Check effort
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(rec.effort);
  });
  
  it('should filter by confidence threshold', async () => {
    const analysis = {
      code: 'SELECT * FROM VBAK.',
      module: 'SD' as const,
      functionName: 'Z_TEST',
      tables: ['VBAK'],
      operations: ['read'],
      businessLogic: ['Read data']
    };
    
    const highConfidenceRecs = await service.generateRecommendations(
      'test-obj-2',
      'Z_TEST',
      analysis,
      { minConfidence: 0.8 }
    );
    
    const lowConfidenceRecs = await service.generateRecommendations(
      'test-obj-2',
      'Z_TEST',
      analysis,
      { minConfidence: 0.3 }
    );
    
    expect(lowConfidenceRecs.length).toBeGreaterThanOrEqual(highConfidenceRecs.length);
    
    // All recommendations should meet confidence threshold
    highConfidenceRecs.forEach(rec => {
      expect(rec.confidence).toBeGreaterThanOrEqual(0.8);
    });
  });
  
  it('should limit number of recommendations', async () => {
    const analysis = {
      code: 'SELECT * FROM VBAK.',
      module: 'SD' as const,
      functionName: 'Z_TEST',
      tables: ['VBAK', 'VBAP', 'KONV'],
      operations: ['create', 'update', 'delete'],
      businessLogic: ['CRUD operations']
    };
    
    const recommendations = await service.generateRecommendations(
      'test-obj-3',
      'Z_TEST',
      analysis,
      { maxRecommendations: 3 }
    );
    
    expect(recommendations.length).toBeLessThanOrEqual(3);
  });
});

describe('Implementation Guides', () => {
  it('should generate guide for BAPI', () => {
    const standards = getAllStandards();
    const bapi = standards.find(s => s.type === 'BAPI');
    
    if (bapi) {
      const guide = getImplementationGuide(bapi);
      
      expect(guide).toHaveProperty('standardId', bapi.id);
      expect(guide).toHaveProperty('standardName', bapi.name);
      expect(guide).toHaveProperty('overview');
      expect(guide).toHaveProperty('prerequisites');
      expect(guide).toHaveProperty('steps');
      expect(guide).toHaveProperty('testing');
      expect(guide).toHaveProperty('rollback');
      expect(guide).toHaveProperty('bestPractices');
      expect(guide).toHaveProperty('commonPitfalls');
      
      expect(guide.steps.length).toBeGreaterThan(0);
      expect(guide.prerequisites.length).toBeGreaterThan(0);
    }
  });
  
  it('should generate guide for pricing pattern', () => {
    const standards = getAllStandards();
    const pricingPattern = standards.find(s => s.id === 'PRICING_PROCEDURE');
    
    if (pricingPattern) {
      const guide = getImplementationGuide(pricingPattern);
      
      expect(guide.steps.length).toBeGreaterThan(0);
      
      // Should have specific pricing steps
      const hasConfigStep = guide.steps.some(s => 
        s.title.toLowerCase().includes('pricing') || 
        s.title.toLowerCase().includes('condition')
      );
      expect(hasConfigStep).toBe(true);
    }
  });
  
  it('should include transaction codes in steps', () => {
    const standards = getAllStandards();
    const pricingPattern = standards.find(s => s.id === 'PRICING_PROCEDURE');
    
    if (pricingPattern) {
      const guide = getImplementationGuide(pricingPattern);
      
      const stepsWithTCodes = guide.steps.filter(s => s.transactionCode);
      expect(stepsWithTCodes.length).toBeGreaterThan(0);
    }
  });
});
