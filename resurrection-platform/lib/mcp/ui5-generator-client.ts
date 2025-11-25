/**
 * SAP UI5 Generator MCP Client
 * 
 * Specialized client for generating SAP Fiori UIs using the SAP UI5 Generator MCP server.
 * Provides methods for generating Fiori Elements and Freestyle UI5 applications.
 * 
 * Requirements: 3.4, 9.3, 9.4
 */

import { MCPClient, MCPServerConfig } from './mcp-client';

export type FioriTemplate = 
  | 'ListReport'
  | 'ObjectPage'
  | 'AnalyticalListPage'
  | 'OverviewPage'
  | 'WorklistPage'
  | 'Freestyle';

export interface FioriElementsConfig {
  template: FioriTemplate;
  serviceName: string;
  serviceUrl: string;
  mainEntity: string;
  namespace: string;
  appName: string;
  title: string;
  description?: string;
  
  // List Report specific
  listEntity?: string;
  listColumns?: string[];
  
  // Object Page specific
  objectEntity?: string;
  objectSections?: ObjectPageSection[];
  
  // Navigation
  navigation?: {
    source: string;
    target: string;
  }[];
}

export interface ObjectPageSection {
  title: string;
  fields: string[];
  type?: 'form' | 'table' | 'chart';
}

export interface UI5GenerationResult {
  files: Array<{
    path: string;
    content: string;
  }>;
  manifest: any;
  appName: string;
  namespace: string;
}

export interface ManifestConfig {
  appId: string;
  appName: string;
  appTitle: string;
  appDescription?: string;
  appVersion?: string;
  dataSources: DataSource[];
  models?: ModelConfig[];
  routing?: RoutingConfig;
}

export interface DataSource {
  name: string;
  uri: string;
  type: 'OData' | 'JSON' | 'XML';
  settings?: {
    odataVersion?: '2.0' | '4.0';
    localUri?: string;
    annotations?: string[];
  };
}

export interface ModelConfig {
  name?: string;
  type?: string;
  dataSource?: string;
  settings?: Record<string, any>;
}

export interface RoutingConfig {
  routes: Route[];
  targets: Record<string, Target>;
}

export interface Route {
  name: string;
  pattern: string;
  target: string | string[];
}

export interface Target {
  viewName: string;
  viewLevel?: number;
  viewId?: string;
}

export interface AnnotationsConfig {
  entity: string;
  annotations: {
    // UI Annotations
    lineItem?: AnnotationLineItem[];
    selectionFields?: string[];
    headerInfo?: AnnotationHeaderInfo;
    fieldGroup?: AnnotationFieldGroup[];
    identification?: AnnotationIdentification[];
    
    // Semantic Annotations
    semanticKey?: string[];
    
    // Value Help
    valueList?: Record<string, AnnotationValueList>;
  };
}

export interface AnnotationLineItem {
  value: string;
  label?: string;
  criticality?: string;
  criticalityRepresentation?: 'WithIcon' | 'WithoutIcon';
}

export interface AnnotationHeaderInfo {
  typeName: string;
  typeNamePlural: string;
  title?: {
    value: string;
  };
  description?: {
    value: string;
  };
  imageUrl?: string;
}

export interface AnnotationFieldGroup {
  label: string;
  data: Array<{
    value: string;
    label?: string;
  }>;
}

export interface AnnotationIdentification {
  value: string;
  label?: string;
}

export interface AnnotationValueList {
  collectionPath: string;
  parameters: Array<{
    localDataProperty: string;
    valueListProperty: string;
  }>;
}

export interface FreestyleUI5Config {
  namespace: string;
  appName: string;
  title: string;
  description?: string;
  viewType: 'XML' | 'JSON' | 'JS' | 'HTML';
  views: FreestyleView[];
  models?: ModelConfig[];
}

export interface FreestyleView {
  name: string;
  type: 'XML' | 'JSON' | 'JS' | 'HTML';
  controller?: boolean;
  content?: string;
}

/**
 * SAP UI5 Generator MCP Client
 * 
 * Wraps the base MCP client with UI5-specific generation methods
 */
export class UI5GeneratorClient {
  private client: MCPClient;

  constructor(config?: Partial<MCPServerConfig>) {
    const defaultConfig: MCPServerConfig = {
      name: 'sap-ui5-generator',
      command: 'node',
      args: ['./mcp-servers/sap-ui5-generator/index.js'],
      env: {
        UI5_VERSION: '1.120.0',
        FIORI_GUIDELINES: 'enabled',
        LOG_LEVEL: 'info'
      },
      timeout: 60000, // 60 seconds for UI generation
      maxRetries: 3,
      ...config
    };

    this.client = new MCPClient(defaultConfig);
  }

  /**
   * Connect to SAP UI5 Generator MCP server
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Disconnect from SAP UI5 Generator MCP server
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Generate Fiori Elements application
   * 
   * Creates a complete Fiori Elements app with:
   * - manifest.json with OData service configuration
   * - Annotations for UI rendering
   * - Component.js
   * - index.html
   * - i18n files
   * 
   * Supports templates:
   * - List Report (list + object page)
   * - Object Page (detail view)
   * - Analytical List Page (analytics)
   * - Overview Page (cards)
   * - Worklist (task list)
   * 
   * @param config - Fiori Elements configuration
   * @returns Generated UI files including manifest.json
   */
  async generateFioriElements(
    config: FioriElementsConfig
  ): Promise<UI5GenerationResult> {
    const response = await this.client.call<UI5GenerationResult>(
      'generateFioriElements',
      { config }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Fiori Elements generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate Freestyle UI5 application
   * 
   * Creates a custom UI5 app with:
   * - Custom views and controllers
   * - Flexible layout
   * - Custom controls
   * - Full control over UI logic
   * 
   * @param config - Freestyle UI5 configuration
   * @returns Generated UI files
   */
  async generateFreestyleUI5(
    config: FreestyleUI5Config
  ): Promise<UI5GenerationResult> {
    const response = await this.client.call<UI5GenerationResult>(
      'generateFreestyleUI5',
      { config }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Freestyle UI5 generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate manifest.json
   * 
   * Creates UI5 application manifest with:
   * - App metadata
   * - Data sources (OData services)
   * - Models configuration
   * - Routing configuration
   * - Dependencies
   * 
   * @param config - Manifest configuration
   * @returns Generated manifest.json content
   */
  async generateManifest(config: ManifestConfig): Promise<any> {
    const response = await this.client.call<{ manifest: any }>(
      'generateManifest',
      { config }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Manifest generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.manifest;
  }

  /**
   * Generate UI annotations
   * 
   * Creates CDS annotations for Fiori Elements:
   * - @UI.lineItem (table columns)
   * - @UI.selectionFields (filters)
   * - @UI.headerInfo (object page header)
   * - @UI.fieldGroup (form sections)
   * - @UI.identification (actions)
   * 
   * @param config - Annotations configuration
   * @returns Generated annotations CDS file content
   */
  async generateAnnotations(config: AnnotationsConfig): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generateAnnotations',
      { config }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Annotations generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Generate Component.js
   * 
   * Creates UI5 component with:
   * - Component initialization
   * - Model setup
   * - Router initialization
   * - Device model
   * 
   * @param namespace - App namespace
   * @param appName - App name
   * @returns Generated Component.js content
   */
  async generateComponent(namespace: string, appName: string): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generateComponent',
      { namespace, appName }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Component generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Generate view and controller
   * 
   * Creates UI5 view (XML/JSON/JS/HTML) and corresponding controller
   * 
   * @param viewName - Name of the view
   * @param viewType - Type of view (XML, JSON, JS, HTML)
   * @param namespace - App namespace
   * @returns Generated view and controller files
   */
  async generateView(
    viewName: string,
    viewType: 'XML' | 'JSON' | 'JS' | 'HTML',
    namespace: string
  ): Promise<{
    view: { path: string; content: string };
    controller: { path: string; content: string };
  }> {
    const response = await this.client.call<{
      view: { path: string; content: string };
      controller: { path: string; content: string };
    }>('generateView', {
      viewName,
      viewType,
      namespace
    });

    if (!response.success || !response.data) {
      throw new Error(
        `View generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Generate i18n resource bundle
   * 
   * Creates internationalization files with:
   * - App title and description
   * - Field labels
   * - Button texts
   * - Messages
   * 
   * @param appName - App name
   * @param texts - Text key-value pairs
   * @param languages - Languages to generate (default: ['en'])
   * @returns Generated i18n files
   */
  async generateI18n(
    appName: string,
    texts: Record<string, string>,
    languages: string[] = ['en']
  ): Promise<Array<{
    path: string;
    content: string;
  }>> {
    const response = await this.client.call<{
      files: Array<{
        path: string;
        content: string;
      }>;
    }>('generateI18n', {
      appName,
      texts,
      languages
    });

    if (!response.success || !response.data) {
      throw new Error(
        `i18n generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.files;
  }

  /**
   * Generate index.html
   * 
   * Creates HTML entry point with:
   * - UI5 bootstrap
   * - Theme configuration
   * - Component initialization
   * 
   * @param namespace - App namespace
   * @param appName - App name
   * @param ui5Version - UI5 version (default: latest)
   * @returns Generated index.html content
   */
  async generateIndexHtml(
    namespace: string,
    appName: string,
    ui5Version: string = '1.120.0'
  ): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generateIndexHtml',
      {
        namespace,
        appName,
        ui5Version
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `index.html generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Generate UI5 application package.json
   * 
   * Creates package.json for UI5 app with:
   * - UI5 tooling dependencies
   * - Build scripts
   * - UI5 configuration
   * 
   * @param appName - App name
   * @param namespace - App namespace
   * @returns Generated package.json content
   */
  async generateUIPackageJson(
    appName: string,
    namespace: string
  ): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generateUIPackageJson',
      {
        appName,
        namespace
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `UI package.json generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Generate ui5.yaml
   * 
   * Creates UI5 tooling configuration with:
   * - Framework configuration
   * - Middleware setup
   * - Build configuration
   * 
   * @param appName - App name
   * @returns Generated ui5.yaml content
   */
  async generateUI5Yaml(appName: string): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'generateUI5Yaml',
      { appName }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `ui5.yaml generation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Validate Fiori design guidelines compliance
   * 
   * Checks if UI follows SAP Fiori design guidelines:
   * - Consistent layout
   * - Proper control usage
   * - Accessibility
   * - Responsive design
   * 
   * @param files - UI files to validate
   * @returns Validation report
   */
  async validateFioriGuidelines(files: Array<{
    path: string;
    content: string;
  }>): Promise<{
    compliant: boolean;
    violations: Array<{
      file: string;
      line: number;
      rule: string;
      message: string;
      severity: 'error' | 'warning' | 'info';
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
        severity: 'error' | 'warning' | 'info';
      }>;
      score: number;
    }>('validateFioriGuidelines', { files });

    if (!response.success || !response.data) {
      throw new Error(
        `Fiori guidelines validation failed: ${response.error?.message || 'Unknown error'}`
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

