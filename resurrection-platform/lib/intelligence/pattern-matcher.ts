/**
 * Pattern Matching Service
 * 
 * Analyzes custom ABAP code and matches it against SAP standard functionality
 * to identify fit-to-standard opportunities.
 */

import { 
  getAllStandards, 
  getStandardsByModule, 
  searchStandards,
  type SAPStandard 
} from './sap-standards-kb';

export interface PatternMatch {
  standard: SAPStandard;
  confidence: number; // 0-1
  matchedPatterns: string[];
  reasoning: string;
}

export interface ABAPAnalysis {
  code: string;
  module: string;
  functionName?: string;
  tables: string[];
  operations: string[];
  businessLogic: string[];
}

/**
 * Pattern Matcher Service
 */
export class PatternMatcher {
  /**
   * Find SAP standard alternatives for custom ABAP code
   */
  async findStandardAlternatives(analysis: ABAPAnalysis): Promise<PatternMatch[]> {
    const matches: PatternMatch[] = [];
    
    // Get relevant standards for the module
    const moduleStandards = getStandardsByModule(analysis.module);
    
    // Match against BAPIs
    const bapiMatches = this.matchBAPIs(analysis, moduleStandards);
    matches.push(...bapiMatches);
    
    // Match against transactions
    const transactionMatches = this.matchTransactions(analysis, moduleStandards);
    matches.push(...transactionMatches);
    
    // Match against patterns
    const patternMatches = this.matchPatterns(analysis, moduleStandards);
    matches.push(...patternMatches);
    
    // Sort by confidence (highest first)
    return matches.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Match against SAP BAPIs
   */
  private matchBAPIs(analysis: ABAPAnalysis, standards: SAPStandard[]): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const bapis = standards.filter(s => s.type === 'BAPI');
    
    for (const bapi of bapis) {
      const match = this.calculateBAPIMatch(analysis, bapi);
      if (match.confidence > 0.3) {
        matches.push(match);
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate BAPI match confidence
   */
  private calculateBAPIMatch(analysis: ABAPAnalysis, bapi: SAPStandard): PatternMatch {
    let confidence = 0;
    const matchedPatterns: string[] = [];
    const reasons: string[] = [];
    
    // Check table usage
    const tableOverlap = this.calculateTableOverlap(analysis.tables, bapi.relatedObjects || []);
    if (tableOverlap > 0) {
      confidence += tableOverlap * 0.4;
      matchedPatterns.push(`Uses ${tableOverlap * 100}% of related tables`);
      reasons.push(`Custom code uses tables: ${analysis.tables.join(', ')}`);
    }
    
    // Check operation patterns
    const operationMatch = this.matchOperations(analysis.operations, bapi.useCases);
    if (operationMatch > 0) {
      confidence += operationMatch * 0.3;
      matchedPatterns.push(`Matches ${operationMatch * 100}% of use cases`);
      reasons.push(`Operations align with: ${bapi.useCases.slice(0, 2).join(', ')}`);
    }
    
    // Check function name similarity
    if (analysis.functionName) {
      const nameMatch = this.calculateNameSimilarity(analysis.functionName, bapi.name);
      if (nameMatch > 0.5) {
        confidence += nameMatch * 0.3;
        matchedPatterns.push(`Function name similarity: ${Math.round(nameMatch * 100)}%`);
        reasons.push(`Function name '${analysis.functionName}' similar to '${bapi.name}'`);
      }
    }
    
    // Cap confidence at 1.0
    confidence = Math.min(confidence, 1.0);
    
    const reasoning = reasons.length > 0 
      ? reasons.join('. ') + '.'
      : 'No strong match found.';
    
    return {
      standard: bapi,
      confidence,
      matchedPatterns,
      reasoning
    };
  }
  
  /**
   * Match against SAP transactions
   */
  private matchTransactions(analysis: ABAPAnalysis, standards: SAPStandard[]): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const transactions = standards.filter(s => s.type === 'TRANSACTION');
    
    for (const transaction of transactions) {
      const match = this.calculateTransactionMatch(analysis, transaction);
      if (match.confidence > 0.3) {
        matches.push(match);
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate transaction match confidence
   */
  private calculateTransactionMatch(analysis: ABAPAnalysis, transaction: SAPStandard): PatternMatch {
    let confidence = 0;
    const matchedPatterns: string[] = [];
    const reasons: string[] = [];
    
    // Check table usage
    const tableOverlap = this.calculateTableOverlap(analysis.tables, transaction.relatedObjects || []);
    if (tableOverlap > 0) {
      confidence += tableOverlap * 0.5;
      matchedPatterns.push(`Uses ${Math.round(tableOverlap * 100)}% of related tables`);
      reasons.push(`Accesses same tables as ${transaction.name}`);
    }
    
    // Check use case alignment
    const useCaseMatch = this.matchOperations(analysis.operations, transaction.useCases);
    if (useCaseMatch > 0) {
      confidence += useCaseMatch * 0.5;
      matchedPatterns.push(`Matches ${Math.round(useCaseMatch * 100)}% of use cases`);
      reasons.push(`Functionality aligns with ${transaction.name}`);
    }
    
    confidence = Math.min(confidence, 1.0);
    
    const reasoning = reasons.length > 0
      ? reasons.join('. ') + '.'
      : 'Limited match with transaction.';
    
    return {
      standard: transaction,
      confidence,
      matchedPatterns,
      reasoning
    };
  }
  
  /**
   * Match against SAP patterns
   */
  private matchPatterns(analysis: ABAPAnalysis, standards: SAPStandard[]): PatternMatch[] {
    const matches: PatternMatch[] = [];
    const patterns = standards.filter(s => s.type === 'PATTERN');
    
    for (const pattern of patterns) {
      const match = this.calculatePatternMatch(analysis, pattern);
      if (match.confidence > 0.3) {
        matches.push(match);
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate pattern match confidence
   */
  private calculatePatternMatch(analysis: ABAPAnalysis, pattern: SAPStandard): PatternMatch {
    let confidence = 0;
    const matchedPatterns: string[] = [];
    const reasons: string[] = [];
    
    // Pricing pattern detection
    if (pattern.id === 'PRICING_PROCEDURE') {
      if (this.detectsPricingLogic(analysis)) {
        confidence = 0.8;
        matchedPatterns.push('Pricing calculations detected');
        reasons.push('Custom pricing logic can be replaced with SAP pricing procedure');
      }
    }
    
    // Authorization pattern detection
    if (pattern.id === 'AUTHORIZATION_OBJECT') {
      if (this.detectsAuthorizationChecks(analysis)) {
        confidence = 0.7;
        matchedPatterns.push('Authorization checks detected');
        reasons.push('Custom authorization can use SAP authorization objects');
      }
    }
    
    // Number range pattern detection
    if (pattern.id === 'NUMBER_RANGE') {
      if (this.detectsNumberGeneration(analysis)) {
        confidence = 0.75;
        matchedPatterns.push('Number generation detected');
        reasons.push('Custom numbering can use SAP number range objects');
      }
    }
    
    // Batch processing pattern detection
    if (pattern.id === 'BATCH_INPUT') {
      if (this.detectsBatchProcessing(analysis)) {
        confidence = 0.6;
        matchedPatterns.push('Batch processing detected');
        reasons.push('Custom batch logic can use SAP batch input framework');
      }
    }
    
    const reasoning = reasons.length > 0
      ? reasons.join('. ') + '.'
      : 'Pattern not detected in code.';
    
    return {
      standard: pattern,
      confidence,
      matchedPatterns,
      reasoning
    };
  }
  
  /**
   * Calculate table overlap between custom code and standard
   */
  private calculateTableOverlap(customTables: string[], standardTables: string[]): number {
    if (customTables.length === 0 || standardTables.length === 0) {
      return 0;
    }
    
    const customSet = new Set(customTables.map(t => t.toUpperCase()));
    const standardSet = new Set(standardTables.map(t => t.toUpperCase()));
    
    let overlap = 0;
    for (const table of customSet) {
      if (standardSet.has(table)) {
        overlap++;
      }
    }
    
    return overlap / customTables.length;
  }
  
  /**
   * Match operations against use cases
   */
  private matchOperations(operations: string[], useCases: string[]): number {
    if (operations.length === 0 || useCases.length === 0) {
      return 0;
    }
    
    let matches = 0;
    for (const operation of operations) {
      for (const useCase of useCases) {
        if (this.textSimilarity(operation, useCase) > 0.5) {
          matches++;
          break;
        }
      }
    }
    
    return matches / operations.length;
  }
  
  /**
   * Calculate name similarity using Levenshtein distance
   */
  private calculateNameSimilarity(name1: string, name2: string): number {
    const s1 = name1.toLowerCase();
    const s2 = name2.toLowerCase();
    
    // Simple substring check
    if (s1.includes(s2) || s2.includes(s1)) {
      return 0.8;
    }
    
    // Check for common keywords
    const keywords = ['create', 'change', 'display', 'delete', 'get', 'post', 'update'];
    for (const keyword of keywords) {
      if (s1.includes(keyword) && s2.includes(keyword)) {
        return 0.6;
      }
    }
    
    return this.levenshteinSimilarity(s1, s2);
  }
  
  /**
   * Calculate text similarity
   */
  private textSimilarity(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    let commonWords = 0;
    for (const word of words1) {
      if (words2.includes(word) && word.length > 3) {
        commonWords++;
      }
    }
    
    return commonWords / Math.max(words1.length, words2.length);
  }
  
  /**
   * Levenshtein distance similarity
   */
  private levenshteinSimilarity(s1: string, s2: string): number {
    const distance = this.levenshteinDistance(s1, s2);
    const maxLength = Math.max(s1.length, s2.length);
    return 1 - (distance / maxLength);
  }
  
  /**
   * Levenshtein distance calculation
   */
  private levenshteinDistance(s1: string, s2: string): number {
    const matrix: number[][] = [];
    
    for (let i = 0; i <= s2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= s1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= s2.length; i++) {
      for (let j = 1; j <= s1.length; j++) {
        if (s2.charAt(i - 1) === s1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[s2.length][s1.length];
  }
  
  /**
   * Detect pricing logic in ABAP code
   */
  private detectsPricingLogic(analysis: ABAPAnalysis): boolean {
    const pricingKeywords = ['price', 'pricing', 'discount', 'condition', 'konv', 'konh'];
    const pricingTables = ['KONV', 'KONH', 'A304', 'A305'];
    
    const hasKeywords = analysis.operations.some(op => 
      pricingKeywords.some(kw => op.toLowerCase().includes(kw))
    );
    
    const hasTables = analysis.tables.some(table => 
      pricingTables.includes(table.toUpperCase())
    );
    
    return hasKeywords || hasTables;
  }
  
  /**
   * Detect authorization checks in ABAP code
   */
  private detectsAuthorizationChecks(analysis: ABAPAnalysis): boolean {
    const authKeywords = ['authority-check', 'authorization', 'auth', 'actvt'];
    
    return analysis.code.toLowerCase().includes('authority-check') ||
           analysis.operations.some(op => 
             authKeywords.some(kw => op.toLowerCase().includes(kw))
           );
  }
  
  /**
   * Detect number generation logic
   */
  private detectsNumberGeneration(analysis: ABAPAnalysis): boolean {
    const numberKeywords = ['number_get_next', 'number range', 'nriv', 'tnro'];
    
    return analysis.code.toLowerCase().includes('number_get_next') ||
           analysis.operations.some(op => 
             numberKeywords.some(kw => op.toLowerCase().includes(kw))
           );
  }
  
  /**
   * Detect batch processing patterns
   */
  private detectsBatchProcessing(analysis: ABAPAnalysis): boolean {
    const batchKeywords = ['loop at', 'batch', 'mass', 'bulk'];
    const hasLoop = analysis.code.toLowerCase().includes('loop at');
    const hasBatchKeywords = analysis.operations.some(op => 
      batchKeywords.some(kw => op.toLowerCase().includes(kw))
    );
    
    return hasLoop || hasBatchKeywords;
  }
}

/**
 * Create a new pattern matcher instance
 */
export function createPatternMatcher(): PatternMatcher {
  return new PatternMatcher();
}
