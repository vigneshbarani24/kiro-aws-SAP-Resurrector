# MCP Client Infrastructure

This directory contains the base MCP (Model Context Protocol) client infrastructure for the Resurrection Platform.

## Overview

The MCP client provides connection management, request/response handling, and error handling with automatic retry logic for communicating with MCP servers.

## Files

- **mcp-client.ts** - Base MCP client implementation
- **types.ts** - TypeScript type definitions for MCP infrastructure
- **README.md** - This documentation file

## Features

### Connection Management
- Automatic connection establishment
- Connection status tracking (DISCONNECTED, CONNECTING, CONNECTED, ERROR, RECONNECTING)
- Graceful disconnection
- Connection attempt tracking

### Request/Response Handling
- Type-safe request/response interfaces
- Timeout support (default: 30 seconds)
- Automatic connection before requests
- Duration tracking for all requests

### Error Handling
- Standardized error format with error codes
- Retryable vs non-retryable error classification
- Automatic retry logic with exponential backoff
- Configurable max retries (default: 3)
- Last error tracking

### Health Monitoring
- Health check method
- Connection statistics
- Error tracking

## Usage

### Basic Usage

```typescript
import { MCPClient } from './lib/mcp/mcp-client';

// Create client
const client = new MCPClient({
  name: 'abap-analyzer',
  command: 'node',
  args: ['analyzer.js'],
  timeout: 30000,
  maxRetries: 3
});

// Connect (optional - will auto-connect on first request)
await client.connect();

// Make request
const response = await client.call('analyzeCode', {
  code: 'REPORT test.'
});

if (response.success) {
  console.log('Analysis result:', response.data);
} else {
  console.error('Error:', response.error);
}

// Disconnect when done
await client.disconnect();
```

### With Environment Variables

```typescript
const client = new MCPClient({
  name: 'abap-analyzer',
  command: 'node',
  args: ['analyzer.js'],
  env: {
    SAP_DOMAIN_KNOWLEDGE: 'enabled',
    LOG_LEVEL: 'debug'
  }
});
```

### Error Handling

```typescript
const response = await client.call('analyzeCode', { code: 'REPORT test.' });

if (!response.success) {
  const error = response.error;
  console.error(`Error ${error.code}: ${error.message}`);
  
  if (error.retryable) {
    console.log('This error is retryable - client will automatically retry');
  } else {
    console.log('This error is not retryable - manual intervention required');
  }
}
```

### Health Check

```typescript
const isHealthy = await client.healthCheck();
if (!isHealthy) {
  console.error('MCP server is not responding');
}
```

### Connection Statistics

```typescript
const stats = client.getStats();
console.log('Server:', stats.serverName);
console.log('Status:', stats.status);
console.log('Connection attempts:', stats.connectionAttempts);
console.log('Last error:', stats.lastError);
```

## Configuration

### MCPServerConfig

```typescript
interface MCPServerConfig {
  name: string;           // Server name (e.g., 'abap-analyzer')
  command: string;        // Command to execute (e.g., 'node', 'uvx')
  args: string[];         // Command arguments
  env?: Record<string, string>;  // Environment variables
  timeout?: number;       // Request timeout in ms (default: 30000)
  maxRetries?: number;    // Max retry attempts (default: 3)
}
```

## Error Codes

Common error codes returned by the MCP client:

- **CONNECTION_FAILED** - Failed to connect to MCP server (retryable)
- **TIMEOUT** - Request timed out (retryable)
- **REQUEST_FAILED** - Request failed for unknown reason (retryable)
- **MAX_RETRIES_EXCEEDED** - Maximum retry attempts exceeded (not retryable)

## Retry Logic

The client implements exponential backoff for retries:

1. First retry: 1 second delay
2. Second retry: 2 seconds delay
3. Third retry: 4 seconds delay
4. Maximum backoff: 10 seconds

Retries only occur for errors marked as `retryable: true`.

## Connection Status

The client tracks connection status through the following states:

- **DISCONNECTED** - Not connected to server
- **CONNECTING** - Connection in progress
- **CONNECTED** - Successfully connected
- **ERROR** - Connection failed
- **RECONNECTING** - Attempting to reconnect

## Testing

Run tests with:

```bash
npm test -- mcp-client.test.ts --run
```

The test suite covers:
- Connection management (6 tests)
- Request/response handling (6 tests)
- Error handling (4 tests)
- Retry logic (5 tests)
- Configuration (3 tests)
- Health checks (2 tests)
- Statistics (2 tests)

## Requirements

This implementation satisfies:
- **Requirement 2.4**: MCP server connectivity
- **Requirement 4.3**: MCP request/response handling with error handling

## Future Enhancements

- Real MCP protocol implementation (currently simulated)
- WebSocket support for streaming responses
- Connection pooling for multiple concurrent requests
- Circuit breaker pattern for failing servers
- Metrics and monitoring integration
- Request/response logging
- Request cancellation support

## Notes

- The current implementation uses simulated connections for testing
- Real MCP protocol implementation will be added when MCP servers are available
- The client is designed to be extended by specific MCP server clients (ABAP Analyzer, CAP Generator, etc.)

---

## MCP Orchestrator

The **MCPOrchestrator** manages multiple MCP server connections and provides a unified interface for all MCP operations.

### Features

#### Multi-Server Management
- Manages connections to multiple MCP servers simultaneously
- Automatic connection on startup (configurable)
- Graceful shutdown with cleanup
- Individual server reconnection support

#### Request Routing
- Routes requests to appropriate MCP servers
- Unified interface for common operations
- Type-safe method signatures
- Error handling per operation

#### Health Monitoring
- Periodic health checks for all servers
- Real-time health status tracking
- Last error tracking per server
- Server availability checks

### Usage

#### Basic Setup

```typescript
import { MCPOrchestrator } from './lib/mcp/orchestrator';

const orchestrator = new MCPOrchestrator({
  servers: [
    {
      name: 'abap-analyzer',
      command: 'node',
      args: ['./mcp-servers/abap-analyzer/index.js']
    },
    {
      name: 'sap-cap-generator',
      command: 'node',
      args: ['./mcp-servers/cap-generator/index.js']
    },
    {
      name: 'sap-ui5-generator',
      command: 'node',
      args: ['./mcp-servers/ui5-generator/index.js']
    },
    {
      name: 'github',
      command: 'uvx',
      args: ['mcp-server-github'],
      env: { GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN }
    },
    {
      name: 'slack',
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-slack'],
      env: {
        SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN,
        SLACK_TEAM_ID: process.env.SLACK_TEAM_ID
      }
    }
  ],
  autoConnect: true,
  healthCheckInterval: 60000 // 1 minute
});

// Start orchestrator
await orchestrator.start();

// Use MCP services
const analysis = await orchestrator.analyzeABAP(abapCode);
const cdsFiles = await orchestrator.generateCDS(models);
const uiFiles = await orchestrator.generateUI(uiDesign);

// Stop orchestrator
await orchestrator.stop();
```

#### ABAP Analysis

```typescript
const analysis = await orchestrator.analyzeABAP(abapCode, {
  extractBusinessLogic: true,
  identifyDependencies: true,
  detectPatterns: true
});

console.log('Business logic:', analysis.businessLogic);
console.log('Dependencies:', analysis.dependencies);
console.log('Metadata:', analysis.metadata);
```

#### CAP Generation

```typescript
// Generate CDS models
const cdsFiles = await orchestrator.generateCDS({
  entities: [
    { name: 'SalesOrder', fields: [...] },
    { name: 'Customer', fields: [...] }
  ]
});

// Generate services
const serviceFiles = await orchestrator.generateServices({
  services: [
    { name: 'SalesOrderService', entities: ['SalesOrder'] }
  ]
});
```

#### UI Generation

```typescript
const uiFiles = await orchestrator.generateUI({
  template: 'fiori-elements-list-report',
  service: 'SalesOrderService',
  entity: 'SalesOrder'
});
```

#### GitHub Repository Creation

```typescript
const repo = await orchestrator.createGitHubRepo({
  name: 'resurrection-sd-pricing',
  description: 'Resurrected from ABAP: SD Pricing Logic',
  files: [
    { path: 'db/schema.cds', content: '...' },
    { path: 'srv/service.cds', content: '...' },
    { path: 'package.json', content: '...' }
  ],
  private: false
});

console.log('Repository created:', repo.url);
console.log('Clone URL:', repo.cloneUrl);
```

#### Slack Notifications

```typescript
await orchestrator.notifySlack('#resurrections', {
  name: 'SD Pricing Logic',
  githubUrl: 'https://github.com/org/resurrection-sd-pricing',
  basUrl: 'https://bas.region.hana.ondemand.com/...',
  module: 'SD',
  locSaved: 1200,
  qualityScore: 95
}, 'completed');
```

#### Health Monitoring

```typescript
// Get health status of all servers
const health = orchestrator.getServerHealth();
health.forEach(server => {
  console.log(`${server.name}: ${server.healthy ? '✅' : '❌'}`);
  if (!server.healthy) {
    console.log(`  Error: ${server.lastError}`);
  }
});

// Check specific server
const isAvailable = orchestrator.isServerAvailable('abap-analyzer');
if (!isAvailable) {
  await orchestrator.reconnectServer('abap-analyzer');
}
```

#### Statistics

```typescript
const stats = orchestrator.getStats();
console.log(`Total servers: ${stats.totalServers}`);
console.log(`Healthy servers: ${stats.healthyServers}`);

stats.servers.forEach(server => {
  console.log(`${server.serverName}:`);
  console.log(`  Status: ${server.status}`);
  console.log(`  Connection attempts: ${server.connectionAttempts}`);
  console.log(`  Health: ${server.health?.healthy ? '✅' : '❌'}`);
});
```

### Configuration

#### MCPOrchestratorConfig

```typescript
interface MCPOrchestratorConfig {
  servers: MCPServerConfig[];      // Array of MCP server configurations
  autoConnect?: boolean;           // Auto-connect on start (default: true)
  healthCheckInterval?: number;    // Health check interval in ms (default: 60000)
}
```

### API Methods

#### Lifecycle Management
- `start()` - Start orchestrator and connect to all servers
- `stop()` - Stop orchestrator and disconnect from all servers
- `connectAll()` - Connect to all configured servers
- `disconnectAll()` - Disconnect from all servers
- `reconnectServer(serverName)` - Reconnect to a specific server

#### MCP Operations
- `analyzeABAP(code, context)` - Analyze ABAP code
- `generateCDS(models)` - Generate CDS models
- `generateServices(services)` - Generate service definitions
- `generateUI(uiDesign)` - Generate UI files
- `createGitHubRepo(config)` - Create GitHub repository
- `notifySlack(channel, resurrection, event)` - Send Slack notification

#### Monitoring
- `getServerHealth()` - Get health status of all servers
- `getServerHealthByName(name)` - Get health status of specific server
- `isServerAvailable(name)` - Check if server is available
- `getStats()` - Get orchestrator statistics
- `getAvailableServers()` - Get list of available server names

### Error Handling

The orchestrator handles errors gracefully:

```typescript
try {
  const analysis = await orchestrator.analyzeABAP(abapCode);
} catch (error) {
  if (error.message.includes('not found')) {
    console.error('ABAP Analyzer MCP server not configured');
  } else if (error.message.includes('failed')) {
    console.error('ABAP analysis failed:', error.message);
  }
}
```

Non-critical operations (like Slack notifications) log errors but don't throw:

```typescript
// This won't throw even if Slack is unavailable
await orchestrator.notifySlack('#channel', resurrection, 'completed');
```

### Requirements

This implementation satisfies:
- **Requirement 4.1**: MCP configuration loading and management
- **Requirement 4.4**: MCP response streaming and real-time updates

### Status

- ✅ Task 8.1: Base MCP client implementation complete
- ✅ Task 8.2: MCP orchestrator complete
- ⏳ Task 9.x: Individual MCP client wrappers (pending)



---

## Specialized MCP Clients

The platform now includes four specialized MCP client wrappers that provide type-safe, domain-specific interfaces for each MCP server.

### ABAPAnalyzerClient

**File:** `abap-analyzer-client.ts`

Specialized client for ABAP code analysis with SAP domain knowledge.

#### Key Methods

- `analyzeCode(code, options)` - Comprehensive ABAP analysis
- `parseMetadata(code)` - Extract basic metadata
- `extractBusinessLogic(code)` - Extract business logic patterns
- `findDependencies(code)` - Identify dependencies (tables, functions, BAPIs)
- `identifySAPPatterns(code)` - Detect SAP patterns (pricing, auth, number ranges)
- `calculateComplexity(code)` - Calculate complexity metrics
- `generateDocumentation(code)` - Generate AI documentation
- `validateSyntax(code)` - Validate ABAP syntax

#### Example Usage

```typescript
import { ABAPAnalyzerClient } from './lib/mcp';

const client = new ABAPAnalyzerClient();
await client.connect();

// Comprehensive analysis
const analysis = await client.analyzeCode(abapCode, {
  extractBusinessLogic: true,
  identifyDependencies: true,
  detectPatterns: true,
  calculateComplexity: true
});

// Extract specific information
const businessLogic = await client.extractBusinessLogic(abapCode);
const dependencies = await client.findDependencies(abapCode);
const sapPatterns = await client.identifySAPPatterns(abapCode);
const complexity = await client.calculateComplexity(abapCode);

await client.disconnect();
```

### CAPGeneratorClient

**File:** `cap-generator-client.ts`

Specialized client for generating SAP CAP applications with Clean Core compliance.

#### Key Methods

- `generateCDSModels(models)` - Generate CDS entity definitions
- `generateCDSFromABAP(structures)` - Convert ABAP structures to CDS
- `generateServiceDefinitions(services)` - Generate service CDS files
- `generateHandlers(service, entities, options)` - Generate service handlers
- `generateProject(name, models, services)` - Generate complete CAP project
- `generatePackageJson(name, options)` - Generate package.json
- `generateMTAYaml(name, options)` - Generate mta.yaml for BTP deployment
- `generateXSSecurity(name, scopes)` - Generate xs-security.json
- `validateCDS(content)` - Validate CDS syntax
- `validateCleanCore(files)` - Validate Clean Core compliance

#### Example Usage

```typescript
import { CAPGeneratorClient } from './lib/mcp';

const client = new CAPGeneratorClient();
await client.connect();

// Generate CDS models
const cdsResult = await client.generateCDSModels({
  namespace: 'com.sap.resurrection',
  entities: [
    {
      name: 'SalesOrder',
      elements: [
        { name: 'ID', type: 'UUID', notNull: true },
        { name: 'orderNumber', type: 'String', length: 10 },
        { name: 'totalAmount', type: 'Decimal', precision: 15, scale: 2 }
      ],
      keys: ['ID']
    }
  ]
});

// Generate services
const serviceResult = await client.generateServiceDefinitions([
  {
    name: 'SalesOrderService',
    entities: [
      { name: 'SalesOrders', as: 'SalesOrder' }
    ]
  }
]);

// Generate complete project files
const packageJson = await client.generatePackageJson('resurrection-sd-pricing');
const mtaYaml = await client.generateMTAYaml('resurrection-sd-pricing');
const xsSecurity = await client.generateXSSecurity('resurrection-sd-pricing', [
  { name: 'Admin', description: 'Administrator' },
  { name: 'User', description: 'User' }
]);

await client.disconnect();
```

### UI5GeneratorClient

**File:** `ui5-generator-client.ts`

Specialized client for generating SAP Fiori UIs with Fiori design guidelines compliance.

#### Key Methods

- `generateFioriElements(config)` - Generate Fiori Elements app (List Report, Object Page, etc.)
- `generateFreestyleUI5(config)` - Generate Freestyle UI5 app
- `generateManifest(config)` - Generate manifest.json
- `generateAnnotations(config)` - Generate UI annotations for Fiori Elements
- `generateComponent(namespace, appName)` - Generate Component.js
- `generateView(name, type, namespace)` - Generate view and controller
- `generateI18n(appName, texts, languages)` - Generate i18n resource bundles
- `generateIndexHtml(namespace, appName, version)` - Generate index.html
- `generateUIPackageJson(appName, namespace)` - Generate UI package.json
- `generateUI5Yaml(appName)` - Generate ui5.yaml
- `validateFioriGuidelines(files)` - Validate Fiori design guidelines

#### Example Usage

```typescript
import { UI5GeneratorClient } from './lib/mcp';

const client = new UI5GeneratorClient();
await client.connect();

// Generate Fiori Elements List Report
const fioriApp = await client.generateFioriElements({
  template: 'ListReport',
  serviceName: 'SalesOrderService',
  serviceUrl: '/odata/v4/sales-order',
  mainEntity: 'SalesOrders',
  namespace: 'com.sap.resurrection',
  appName: 'salesorders',
  title: 'Sales Orders',
  description: 'Manage sales orders'
});

// Generate manifest.json
const manifest = await client.generateManifest({
  appId: 'com.sap.resurrection.salesorders',
  appName: 'salesorders',
  appTitle: 'Sales Orders',
  dataSources: [
    {
      name: 'mainService',
      uri: '/odata/v4/sales-order',
      type: 'OData',
      settings: { odataVersion: '4.0' }
    }
  ]
});

// Generate UI annotations
const annotations = await client.generateAnnotations({
  entity: 'SalesOrders',
  annotations: {
    lineItem: [
      { value: 'orderNumber', label: 'Order Number' },
      { value: 'customer', label: 'Customer' },
      { value: 'totalAmount', label: 'Total Amount' }
    ],
    selectionFields: ['orderNumber', 'customer'],
    headerInfo: {
      typeName: 'Sales Order',
      typeNamePlural: 'Sales Orders',
      title: { value: 'orderNumber' }
    }
  }
});

await client.disconnect();
```

### GitHubClient

**File:** `github-client.ts`

Specialized client for GitHub repository management and automation.

#### Key Methods

- `createRepository(config)` - Create GitHub repository
- `createOrUpdateFile(owner, repo, file, message)` - Create/update single file
- `createOrUpdateFiles(owner, repo, files, message)` - Create/update multiple files (atomic)
- `getFileContent(owner, repo, path, branch)` - Get file content
- `addTopics(owner, repo, topics)` - Add repository topics
- `createWorkflow(owner, repo, workflow)` - Create GitHub Actions workflow
- `createBranch(owner, repo, name, from)` - Create branch
- `createIssue(owner, repo, issue)` - Create issue
- `createPullRequest(owner, repo, pr)` - Create pull request
- `createRelease(owner, repo, release)` - Create release
- `getRepository(owner, repo)` - Get repository info
- `listBranches(owner, repo)` - List branches
- `getRepositoryStats(owner, repo)` - Get repository statistics

#### Example Usage

```typescript
import { GitHubClient } from './lib/mcp';

const client = new GitHubClient({
  env: {
    GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN
  }
});
await client.connect();

// Create repository
const repo = await client.createRepository({
  name: 'resurrection-sd-pricing',
  description: 'Resurrected from ABAP: SD Pricing Logic',
  private: false,
  auto_init: true,
  license_template: 'mit'
});

// Commit multiple files atomically
await client.createOrUpdateFiles(
  'myorg',
  'resurrection-sd-pricing',
  [
    { path: 'db/schema.cds', content: cdsContent },
    { path: 'srv/service.cds', content: serviceContent },
    { path: 'srv/service.js', content: handlerContent },
    { path: 'package.json', content: packageJsonContent },
    { path: 'mta.yaml', content: mtaYamlContent },
    { path: 'README.md', content: readmeContent }
  ],
  '🔄 Resurrection: ABAP to CAP transformation complete'
);

// Add topics for discoverability
await client.addTopics('myorg', 'resurrection-sd-pricing', [
  'sap-cap',
  'abap-resurrection',
  'clean-core',
  'sap-btp'
]);

// Create CI/CD workflow
await client.createWorkflow('myorg', 'resurrection-sd-pricing', {
  name: 'CI/CD Pipeline',
  path: 'ci.yml',
  content: ciWorkflowYaml
});

// Create release
await client.createRelease('myorg', 'resurrection-sd-pricing', {
  tag_name: 'v1.0.0',
  name: 'Production Release',
  body: 'Initial resurrection from ABAP'
});

await client.disconnect();
```

### Importing Clients

All clients can be imported from the main index:

```typescript
// Import everything
import {
  ABAPAnalyzerClient,
  CAPGeneratorClient,
  UI5GeneratorClient,
  GitHubClient,
  MCPOrchestrator
} from './lib/mcp';

// Or import specific types
import type {
  ABAPAnalysisResult,
  CDSGenerationResult,
  UI5GenerationResult,
  GitHubRepoInfo
} from './lib/mcp';
```

### Status Update

- ✅ Task 8.1: Base MCP client implementation complete
- ✅ Task 8.2: MCP orchestrator complete
- ✅ Task 9.1: ABAP Analyzer client complete
- ✅ Task 9.2: CAP Generator client complete
- ✅ Task 9.3: UI5 Generator client complete
- ✅ Task 9.4: GitHub client complete
- ⏳ Task 10.x: Resurrection workflow engine (next phase)

### Requirements Satisfied

- **Requirement 3.2**: ABAP Analyzer MCP integration for parsing
- **Requirement 5.3**: ABAP code analysis with MCP
- **Requirement 9.1**: ABAP analysis capabilities
- **Requirement 3.4**: CAP and UI5 generation via MCP
- **Requirement 9.2**: CDS model generation
- **Requirement 9.3**: Service definition generation
- **Requirement 9.4**: Fiori UI generation
- **Requirement 3.6**: GitHub repository creation
- **Requirement 10.2**: GitHub repo creation with MCP
- **Requirement 10.3**: File commits via MCP
- **Requirement 10.4**: Repository configuration (topics, workflows)

