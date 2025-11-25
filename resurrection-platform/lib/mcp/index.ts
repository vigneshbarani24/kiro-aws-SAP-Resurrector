/**
 * MCP Client Library
 * 
 * Exports all MCP clients and types for easy importing
 */

// Base MCP infrastructure
export { MCPClient, MCPConnectionStatus } from './mcp-client';
export type {
  MCPServerConfig,
  MCPRequest,
  MCPResponse,
  MCPError
} from './mcp-client';

export { MCPOrchestrator } from './orchestrator';
export type {
  MCPOrchestratorConfig,
  ServerHealth,
  AnalysisResult,
  CDSFiles,
  ServiceFiles,
  UIFiles,
  RepoConfig,
  RepoInfo
} from './orchestrator';

// Specialized MCP clients
export { ABAPAnalyzerClient } from './abap-analyzer-client';
export type {
  ABAPAnalysisOptions,
  ABAPAnalysisResult,
  ABAPMetadata,
  ABAPDependency,
  ABAPBusinessLogic
} from './abap-analyzer-client';

export { CAPGeneratorClient } from './cap-generator-client';
export type {
  CDSEntity,
  CDSElement,
  CDSAssociation,
  CDSModel,
  CDSType,
  CDSAspect,
  CDSGenerationResult,
  ServiceDefinition,
  ServiceEntity,
  ServiceAction,
  ServiceFunction,
  ServiceParameter,
  ServiceGenerationResult,
  HandlerOptions,
  HandlerGenerationResult
} from './cap-generator-client';

export { UI5GeneratorClient } from './ui5-generator-client';
export type {
  FioriTemplate,
  FioriElementsConfig,
  ObjectPageSection,
  UI5GenerationResult,
  ManifestConfig,
  DataSource,
  ModelConfig,
  RoutingConfig,
  Route,
  Target,
  AnnotationsConfig,
  AnnotationLineItem,
  AnnotationHeaderInfo,
  AnnotationFieldGroup,
  AnnotationIdentification,
  AnnotationValueList,
  FreestyleUI5Config,
  FreestyleView
} from './ui5-generator-client';

export { GitHubClient } from './github-client';
export type {
  GitHubRepoConfig,
  GitHubRepoInfo,
  GitHubFileContent,
  GitHubCommitInfo,
  GitHubBranchInfo,
  GitHubIssueConfig,
  GitHubIssueInfo,
  GitHubPullRequestConfig,
  GitHubPullRequestInfo,
  GitHubWorkflowConfig,
  GitHubReleaseConfig,
  GitHubReleaseInfo
} from './github-client';

// Shared types
export type {
  MCPStats,
  ABAPAnalysisResult as ABAPAnalysisResultType,
  CDSGenerationResult as CDSGenerationResultType,
  ServiceGenerationResult as ServiceGenerationResultType,
  UI5GenerationResult as UI5GenerationResultType,
  GitHubRepoConfig as GitHubRepoConfigType,
  GitHubRepoInfo as GitHubRepoInfoType
} from './types';

