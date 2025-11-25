/**
 * ABAP Analyzer MCP Client
 * 
 * Specialized client for ABAP code analysis using the ABAP Analyzer MCP server.
 * Provides methods for parsing ABAP syntax, extracting metadata, and analyzing business logic.
 * 
 * Requirements: 3.2, 5.3, 9.1
 */

import { MCPClient, MCPServerConfig, MCPResponse } from './mcp-client';

export interface ABAPAnalysisOptions {
  extractBusinessLogic?: boolean;
  identifyDependencies?: boolean;
  detectPatterns?: boolean;
  generateDocumentation?: boolean;
  calculateComplexity?: boolean;
}

export interface ABAPAnalysisResult {
  // Core analysis data
  businessLogic: string[];
  dependencies: string[];
  metadata: {
    module: string;
    complexity: number;
    linesOfCode?: number;
    tables?: string[];
    patterns?: string[];
    functions?: string[];
    classes?: string[];
  };
  
  // Optional enhanced data
  documentation?: string;
  sapPatterns?: {
    pricing?: boolean;
    authorization?: boolean;
    numberRanges?: boolean;
    batchProcessing?: boolean;
  };
  
  // Quality metrics
  qualityMetrics?: {
    maintainability: number;
    testability: number;
    cleanCoreCompliance: number;
  };
}

export interface ABAPMetadata {
  name: string;
  type: 'FUNCTION' | 'REPORT' | 'CLASS' | 'INCLUDE' | 'FORM' | 'MODULE';
  module: string;
  description?: string;
  author?: string;
  createdDate?: string;
  modifiedDate?: string;
}

export interface ABAPDependency {
  name: string;
  type: 'TABLE' | 'FUNCTION' | 'CLASS' | 'BAPI' | 'RFC' | 'INCLUDE';
  usage: 'READ' | 'WRITE' | 'CALL' | 'INCLUDE';
  critical: boolean;
}

export interface ABAPBusinessLogic {
  type: 'CALCULATION' | 'VALIDATION' | 'WORKFLOW' | 'AUTHORIZATION' | 'DATA_MANIPULATION';
  description: string;
  code: string;
  lineNumbers: { start: number; end: number };
  complexity: number;
}

/**
 * ABAP Analyzer MCP Client
 * 
 * Wraps the base MCP client with ABAP-specific analysis methods
 */
export class ABAPAnalyzerClient {
  private client: MCPClient;

  constructor(config?: Partial<MCPServerConfig>) {
    const defaultConfig: MCPServerConfig = {
      name: 'abap-analyzer',
      command: 'node',
      args: ['./mcp-servers/abap-analyzer/index.js'],
      env: {
        SAP_DOMAIN_KNOWLEDGE: 'enabled',
        LOG_LEVEL: 'info'
      },
      timeout: 60000, // 60 seconds for complex ABAP analysis
      maxRetries: 3,
      ...config
    };

    this.client = new MCPClient(defaultConfig);
  }

  /**
   * Connect to ABAP Analyzer MCP server
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Disconnect from ABAP Analyzer MCP server
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Analyze ABAP code
   * 
   * Main method for comprehensive ABAP code analysis including:
   * - Syntax parsing
   * - Business logic extraction
   * - Dependency identification
   * - Pattern detection
   * - Complexity calculation
   * 
   * @param abapCode - The ABAP source code to analyze
   * @param options - Analysis options to control what data is extracted
   * @returns Comprehensive analysis result
   */
  async analyzeCode(
    abapCode: string,
    options: ABAPAnalysisOptions = {}
  ): Promise<ABAPAnalysisResult> {
    const defaultOptions: ABAPAnalysisOptions = {
      extractBusinessLogic: true,
      identifyDependencies: true,
      detectPatterns: true,
      generateDocumentation: false,
      calculateComplexity: true,
      ...options
    };

    const response = await this.client.call<ABAPAnalysisResult>(
      'analyzeCode',
      {
        code: abapCode,
        ...defaultOptions
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `ABAP analysis failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Parse ABAP syntax and extract metadata
   * 
   * Lightweight parsing that extracts basic metadata without deep analysis
   * 
   * @param abapCode - The ABAP source code to parse
   * @returns Basic metadata about the ABAP object
   */
  async parseMetadata(abapCode: string): Promise<ABAPMetadata> {
    const response = await this.client.call<ABAPMetadata>(
      'parseMetadata',
      { code: abapCode }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `ABAP metadata parsing failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Extract business logic from ABAP code
   * 
   * Identifies and extracts business logic patterns including:
   * - Calculations (pricing, discounts, taxes)
   * - Validations (credit checks, authorization)
   * - Workflows (approval chains, status transitions)
   * 
   * @param abapCode - The ABAP source code
   * @returns Array of identified business logic blocks
   */
  async extractBusinessLogic(abapCode: string): Promise<ABAPBusinessLogic[]> {
    const response = await this.client.call<{ businessLogic: ABAPBusinessLogic[] }>(
      'extractBusinessLogic',
      { code: abapCode }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Business logic extraction failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.businessLogic;
  }

  /**
   * Identify dependencies in ABAP code
   * 
   * Finds all external dependencies including:
   * - Database tables (SELECT, INSERT, UPDATE, DELETE)
   * - Function modules (CALL FUNCTION)
   * - BAPIs (CALL FUNCTION 'BAPI_*')
   * - Classes (CREATE OBJECT, method calls)
   * - Includes (INCLUDE statements)
   * 
   * @param abapCode - The ABAP source code
   * @returns Array of identified dependencies
   */
  async findDependencies(abapCode: string): Promise<ABAPDependency[]> {
    const response = await this.client.call<{ dependencies: ABAPDependency[] }>(
      'findDependencies',
      { code: abapCode }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Dependency identification failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.dependencies;
  }

  /**
   * Identify SAP-specific patterns in ABAP code
   * 
   * Detects common SAP patterns:
   * - Pricing procedures (condition-based pricing)
   * - Authorization checks (AUTHORITY-CHECK)
   * - Number ranges (NUMBER_GET_NEXT)
   * - Batch processing (LOOP with chunking)
   * - RFC calls (CALL FUNCTION DESTINATION)
   * - IDoc processing
   * 
   * @param abapCode - The ABAP source code
   * @returns Object indicating which patterns were found
   */
  async identifySAPPatterns(abapCode: string): Promise<{
    pricing: boolean;
    authorization: boolean;
    numberRanges: boolean;
    batchProcessing: boolean;
    rfc: boolean;
    idoc: boolean;
  }> {
    const response = await this.client.call<{
      patterns: {
        pricing: boolean;
        authorization: boolean;
        numberRanges: boolean;
        batchProcessing: boolean;
        rfc: boolean;
        idoc: boolean;
      };
    }>('identifySAPPatterns', { code: abapCode });

    if (!response.success || !response.data) {
      throw new Error(
        `SAP pattern identification failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.patterns;
  }

  /**
   * Calculate code complexity metrics
   * 
   * Calculates various complexity metrics:
   * - Cyclomatic complexity
   * - Lines of code (LOC)
   * - Number of functions/methods
   * - Nesting depth
   * - Maintainability index
   * 
   * @param abapCode - The ABAP source code
   * @returns Complexity metrics
   */
  async calculateComplexity(abapCode: string): Promise<{
    cyclomaticComplexity: number;
    linesOfCode: number;
    numberOfFunctions: number;
    maxNestingDepth: number;
    maintainabilityIndex: number;
  }> {
    const response = await this.client.call<{
      complexity: {
        cyclomaticComplexity: number;
        linesOfCode: number;
        numberOfFunctions: number;
        maxNestingDepth: number;
        maintainabilityIndex: number;
      };
    }>('calculateComplexity', { code: abapCode });

    if (!response.success || !response.data) {
      throw new Error(
        `Complexity calculation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.complexity;
  }

  /**
   * Generate AI documentation for ABAP code
   * 
   * Uses LLM to generate comprehensive documentation including:
   * - Purpose and functionality
   * - Business context
   * - Input/output parameters
   * - Dependencies
   * - Usage examples
   * 
   * @param abapCode - The ABAP source code
   * @param analysisResult - Optional pre-computed analysis result
   * @returns Generated documentation in Markdown format
   */
  async generateDocumentation(
    abapCode: string,
    analysisResult?: ABAPAnalysisResult
  ): Promise<string> {
    const response = await this.client.call<{ documentation: string }>(
      'generateDocumentation',
      {
        code: abapCode,
        analysis: analysisResult
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Documentation generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.documentation;
  }

  /**
   * Validate ABAP syntax
   * 
   * Performs syntax validation without full analysis
   * 
   * @param abapCode - The ABAP source code
   * @returns Validation result with any syntax errors
   */
  async validateSyntax(abapCode: string): Promise<{
    valid: boolean;
    errors: Array<{
      line: number;
      column: number;
      message: string;
      severity: 'error' | 'warning';
    }>;
  }> {
    const response = await this.client.call<{
      valid: boolean;
      errors: Array<{
        line: number;
        column: number;
        message: string;
        severity: 'error' | 'warning';
      }>;
    }>('validateSyntax', { code: abapCode });

    if (!response.success || !response.data) {
      throw new Error(
        `Syntax validation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Get client status and statistics
   */
  getStats() {
    return this.client.getStats();
  }

  /**
   * Perform health check
   */
  async healthCheck(): Promise<boolean> {
    return this.client.healthCheck();
  }
}

