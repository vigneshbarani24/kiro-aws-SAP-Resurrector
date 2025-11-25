/**
 * SAP CAP Generator MCP Client
 * 
 * Specialized client for generating SAP CAP applications using the SAP CAP Generator MCP server.
 * Provides methods for generating CDS models, service definitions, and handlers.
 * 
 * Requirements: 3.4, 9.2, 9.3
 */

import { MCPClient, MCPServerConfig } from './mcp-client';

export interface CDSEntity {
  name: string;
  label?: string;
  description?: string;
  elements: CDSElement[];
  keys?: string[];
  associations?: CDSAssociation[];
  annotations?: Record<string, any>;
}

export interface CDSElement {
  name: string;
  type: string;
  length?: number;
  precision?: number;
  scale?: number;
  notNull?: boolean;
  default?: any;
  label?: string;
  description?: string;
}

export interface CDSAssociation {
  name: string;
  target: string;
  cardinality: 'one' | 'many';
  on?: string;
}

export interface CDSModel {
  namespace: string;
  entities: CDSEntity[];
  types?: CDSType[];
  aspects?: CDSAspect[];
}

export interface CDSType {
  name: string;
  type: string;
  elements?: CDSElement[];
}

export interface CDSAspect {
  name: string;
  elements: CDSElement[];
}

export interface CDSGenerationResult {
  files: Array<{
    path: string;
    content: string;
  }>;
  entities: string[];
  namespace: string;
}

export interface ServiceDefinition {
  name: string;
  namespace?: string;
  entities: ServiceEntity[];
  actions?: ServiceAction[];
  functions?: ServiceFunction[];
  annotations?: Record<string, any>;
}

export interface ServiceEntity {
  name: string;
  as?: string;
  projection?: string[];
  where?: string;
  orderBy?: string[];
  readonly?: boolean;
  insertable?: boolean;
  updatable?: boolean;
  deletable?: boolean;
}

export interface ServiceAction {
  name: string;
  params?: ServiceParameter[];
  returns?: string;
  bound?: boolean;
}

export interface ServiceFunction {
  name: string;
  params?: ServiceParameter[];
  returns: string;
}

export interface ServiceParameter {
  name: string;
  type: string;
  optional?: boolean;
}

export interface ServiceGenerationResult {
  files: Array<{
    path: string;
    content: string;
  }>;
  services: string[];
  handlers: string[];
}

export interface HandlerOptions {
  language: 'javascript' | 'typescript';
  includeValidation?: boolean;
  includeAuthorization?: boolean;
  includeBusinessLogic?: boolean;
  preserveABAPLogic?: boolean;
}

export interface HandlerGenerationResult {
  files: Array<{
    path: string;
    content: string;
  }>;
  handlers: string[];
}

/**
 * SAP CAP Generator MCP Client
 * 
 * Wraps the base MCP client with CAP-specific generation methods
 */
export class CAPGeneratorClient {
  private client: MCPClient;

  constructor(config?: Partial<MCPServerConfig>) {
    const defaultConfig: MCPServerConfig = {
      name: 'sap-cap-generator',
      command: 'node',
      args: ['./mcp-servers/sap-cap-generator/index.js'],
      env: {
        CAP_VERSION: '7.0.0',
        CLEAN_CORE_MODE: 'enabled',
        LOG_LEVEL: 'info'
      },
      timeout: 90000, // 90 seconds for complex CAP generation
      maxRetries: 3,
      ...config
    };

    this.client = new MCPClient(defaultConfig);
  }

  /**
   * Connect to SAP CAP Generator MCP server
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Disconnect from SAP CAP Generator MCP server
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Generate CDS models from business logic
   * 
   * Creates CDS entity definitions based on:
   * - ABAP data structures (TABLES, TYPES, STRUCTURES)
   * - Business logic requirements
   * - SAP best practices
   * 
   * Generates:
   * - Entity definitions with proper types
   * - Associations between entities
   * - Aspects for reusable fields (managed, temporal, etc.)
   * - Annotations for UI and validation
   * 
   * @param models - CDS model definitions
   * @returns Generated CDS files
   */
  async generateCDSModels(models: CDSModel): Promise<CDSGenerationResult> {
    const response = await this.client.call<CDSGenerationResult>(
      'generateCDSModels',
      { models }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `CDS model generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate CDS models from ABAP structures
   * 
   * Converts ABAP data structures to CDS entities:
   * - ABAP tables → CDS entities
   * - ABAP types → CDS types
   * - ABAP includes → CDS aspects
   * 
   * @param abapStructures - ABAP structure definitions
   * @returns Generated CDS files
   */
  async generateCDSFromABAP(abapStructures: {
    tables: Array<{
      name: string;
      fields: Array<{
        name: string;
        type: string;
        length?: number;
        decimals?: number;
        key?: boolean;
      }>;
    }>;
    types?: Array<{
      name: string;
      fields: Array<{
        name: string;
        type: string;
      }>;
    }>;
  }): Promise<CDSGenerationResult> {
    const response = await this.client.call<CDSGenerationResult>(
      'generateCDSFromABAP',
      { structures: abapStructures }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `CDS generation from ABAP failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate service definitions
   * 
   * Creates CAP service definitions that expose entities via OData:
   * - Service CDS files
   * - Entity projections
   * - Actions and functions
   * - Authorization annotations
   * 
   * @param services - Service definition specifications
   * @returns Generated service CDS files
   */
  async generateServiceDefinitions(
    services: ServiceDefinition[]
  ): Promise<ServiceGenerationResult> {
    const response = await this.client.call<ServiceGenerationResult>(
      'generateServiceDefinitions',
      { services }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Service definition generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate service handlers
   * 
   * Creates JavaScript/TypeScript handler files for:
   * - Custom business logic
   * - Event handlers (before/after/on)
   * - Validations
   * - Authorization checks
   * - ABAP business logic preservation
   * 
   * @param service - Service name
   * @param entities - Entities to generate handlers for
   * @param options - Handler generation options
   * @returns Generated handler files
   */
  async generateHandlers(
    service: string,
    entities: string[],
    options: HandlerOptions = { language: 'javascript' }
  ): Promise<HandlerGenerationResult> {
    const response = await this.client.call<HandlerGenerationResult>(
      'generateHandlers',
      {
        service,
        entities,
        ...options
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Handler generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate complete CAP project structure
   * 
   * Creates a full CAP application with:
   * - db/ folder with CDS models
   * - srv/ folder with services and handlers
   * - package.json with dependencies
   * - .cdsrc.json with CAP configuration
   * - README.md with setup instructions
   * 
   * @param projectName - Name of the CAP project
   * @param models - CDS models
   * @param services - Service definitions
   * @returns Complete project structure
   */
  async generateProject(
    projectName: string,
    models: CDSModel,
    services: ServiceDefinition[]
  ): Promise<{
    files: Array<{
      path: string;
      content: string;
    }>;
    structure: {
      db: string[];
      srv: string[];
      config: string[];
    };
  }> {
    const response = await this.client.call<{
      files: Array<{
        path: string;
        content: string;
      }>;
      structure: {
        db: string[];
        srv: string[];
        config: string[];
      };
    }>('generateProject', {
      projectName,
      models,
      services
    });

    if (!response.success || !response.data) {
      throw new Error(
        `CAP project generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate package.json for CAP project
   * 
   * Creates package.json with:
   * - CAP dependencies (@sap/cds, @sap/xssec, etc.)
   * - Scripts (start, build, deploy, test)
   * - CDS configuration
   * 
   * @param projectName - Name of the project
   * @param options - Package configuration options
   * @returns Generated package.json content
   */
  async generatePackageJson(
    projectName: string,
    options: {
      version?: string;
      description?: string;
      author?: string;
      database?: 'hana' | 'sqlite' | 'postgres';
      authentication?: 'xsuaa' | 'mock' | 'none';
    } = {}
  ): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generatePackageJson',
      {
        projectName,
        ...options
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `package.json generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Generate MTA deployment descriptor
   * 
   * Creates mta.yaml for SAP BTP deployment with:
   * - CAP service module
   * - Database deployer module
   * - UI module (if applicable)
   * - Resources (HDI container, XSUAA, destination)
   * 
   * @param projectName - Name of the project
   * @param options - MTA configuration options
   * @returns Generated mta.yaml content
   */
  async generateMTAYaml(
    projectName: string,
    options: {
      version?: string;
      description?: string;
      includeUI?: boolean;
      includeDestination?: boolean;
    } = {}
  ): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generateMTAYaml',
      {
        projectName,
        ...options
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `mta.yaml generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Generate xs-security.json for XSUAA
   * 
   * Creates XSUAA security configuration with:
   * - Scopes
   * - Role templates
   * - Attributes
   * 
   * @param projectName - Name of the project
   * @param scopes - Security scopes to define
   * @returns Generated xs-security.json content
   */
  async generateXSSecurity(
    projectName: string,
    scopes: Array<{
      name: string;
      description: string;
    }> = []
  ): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generateXSSecurity',
      {
        projectName,
        scopes
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `xs-security.json generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Validate CDS syntax
   * 
   * Checks CDS files for syntax errors
   * 
   * @param cdsContent - CDS file content
   * @returns Validation result
   */
  async validateCDS(cdsContent: string): Promise<{
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
    }>('validateCDS', { content: cdsContent });

    if (!response.success || !response.data) {
      throw new Error(
        `CDS validation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Validate Clean Core compliance
   * 
   * Checks if generated CAP code follows Clean Core principles:
   * - No standard modifications
   * - Uses released APIs only
   * - Cloud-native patterns
   * - Standard integration
   * 
   * @param projectFiles - Project files to validate
   * @returns Compliance report
   */
  async validateCleanCore(projectFiles: Array<{
    path: string;
    content: string;
  }>): Promise<{
    compliant: boolean;
    violations: Array<{
      file: string;
      line: number;
      rule: string;
      message: string;
      severity: 'error' | 'warning';
    }>;
    score: number;
  }> {
    const response = await this.client.call<{
      compliant: boolean;
      violations: Array<{
        file: string;
        line: number;
        rule: string;
        message: string;
        severity: 'error' | 'warning';
      }>;
      score: number;
    }>('validateCleanCore', { files: projectFiles });

    if (!response.success || !response.data) {
      throw new Error(
        `Clean Core validation failed: ${response.error?.message || 'Unknown error'}`
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

