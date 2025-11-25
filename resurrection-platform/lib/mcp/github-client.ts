/**
 * GitHub MCP Client
 * 
 * Specialized client for GitHub repository management using the GitHub MCP server.
 * Provides methods for creating repositories, committing files, and managing GitHub resources.
 * 
 * Requirements: 3.6, 10.2, 10.3, 10.4
 */

import { MCPClient, MCPServerConfig } from './mcp-client';

export interface GitHubRepoConfig {
  name: string;
  description?: string;
  private?: boolean;
  auto_init?: boolean;
  gitignore_template?: string;
  license_template?: string;
  homepage?: string;
  has_issues?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
}

export interface GitHubRepoInfo {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    type: string;
  };
  html_url: string;
  clone_url: string;
  ssh_url: string;
  git_url: string;
  description?: string;
  private: boolean;
  created_at: string;
  updated_at: string;
  default_branch: string;
}

export interface GitHubFileContent {
  path: string;
  content: string;
  encoding?: 'utf-8' | 'base64';
  branch?: string;
}

export interface GitHubCommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
    date: string;
  };
  url: string;
}

export interface GitHubBranchInfo {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubIssueConfig {
  title: string;
  body?: string;
  assignees?: string[];
  labels?: string[];
  milestone?: number;
}

export interface GitHubIssueInfo {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  html_url: string;
  created_at: string;
  updated_at: string;
  assignees: Array<{
    login: string;
  }>;
  labels: Array<{
    name: string;
    color: string;
  }>;
}

export interface GitHubPullRequestConfig {
  title: string;
  body?: string;
  head: string;
  base: string;
  draft?: boolean;
}

export interface GitHubPullRequestInfo {
  id: number;
  number: number;
  title: string;
  body?: string;
  state: 'open' | 'closed';
  html_url: string;
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  created_at: string;
  updated_at: string;
  merged: boolean;
}

export interface GitHubWorkflowConfig {
  name: string;
  path: string;
  content: string;
}

export interface GitHubReleaseConfig {
  tag_name: string;
  name: string;
  body?: string;
  draft?: boolean;
  prerelease?: boolean;
  target_commitish?: string;
}

export interface GitHubReleaseInfo {
  id: number;
  tag_name: string;
  name: string;
  body?: string;
  draft: boolean;
  prerelease: boolean;
  html_url: string;
  created_at: string;
  published_at?: string;
}

/**
 * GitHub MCP Client
 * 
 * Wraps the base MCP client with GitHub-specific repository management methods
 */
export class GitHubClient {
  private client: MCPClient;

  constructor(config?: Partial<MCPServerConfig>) {
    const defaultConfig: MCPServerConfig = {
      name: 'github',
      command: 'uvx',
      args: ['mcp-server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN || '',
        LOG_LEVEL: 'info'
      },
      timeout: 60000, // 60 seconds for GitHub operations
      maxRetries: 3,
      ...config
    };

    this.client = new MCPClient(defaultConfig);
  }

  /**
   * Connect to GitHub MCP server
   */
  async connect(): Promise<void> {
    await this.client.connect();
  }

  /**
   * Disconnect from GitHub MCP server
   */
  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  /**
   * Create a new GitHub repository
   * 
   * Creates a repository with:
   * - README.md (if auto_init is true)
   * - .gitignore (if template specified)
   * - LICENSE (if template specified)
   * - Initial commit
   * 
   * @param config - Repository configuration
   * @returns Created repository information
   */
  async createRepository(config: GitHubRepoConfig): Promise<GitHubRepoInfo> {
    const response = await this.client.call<GitHubRepoInfo>(
      'createRepository',
      {
        name: config.name,
        description: config.description,
        private: config.private ?? false,
        auto_init: config.auto_init ?? true,
        gitignore_template: config.gitignore_template,
        license_template: config.license_template,
        homepage: config.homepage,
        has_issues: config.has_issues ?? true,
        has_projects: config.has_projects ?? false,
        has_wiki: config.has_wiki ?? false
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Repository creation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Create or update a single file in a repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param file - File to create/update
   * @param message - Commit message
   * @returns Commit information
   */
  async createOrUpdateFile(
    owner: string,
    repo: string,
    file: GitHubFileContent,
    message: string
  ): Promise<GitHubCommitInfo> {
    const response = await this.client.call<GitHubCommitInfo>(
      'createOrUpdateFile',
      {
        owner,
        repo,
        path: file.path,
        content: file.content,
        message,
        branch: file.branch || 'main',
        encoding: file.encoding || 'utf-8'
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `File creation/update failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Create or update multiple files in a repository
   * 
   * Commits multiple files in a single operation:
   * - More efficient than individual commits
   * - Maintains atomicity
   * - Single commit message for all files
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param files - Files to create/update
   * @param message - Commit message (default: "🔄 Resurrection: ABAP to CAP transformation complete")
   * @param branch - Target branch (default: "main")
   * @returns Commit information
   */
  async createOrUpdateFiles(
    owner: string,
    repo: string,
    files: GitHubFileContent[],
    message: string = '🔄 Resurrection: ABAP to CAP transformation complete',
    branch: string = 'main'
  ): Promise<GitHubCommitInfo> {
    const response = await this.client.call<GitHubCommitInfo>(
      'createOrUpdateFiles',
      {
        owner,
        repo,
        files: files.map(f => ({
          path: f.path,
          content: f.content,
          encoding: f.encoding || 'utf-8'
        })),
        message,
        branch
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Files creation/update failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Get file content from repository
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param path - File path
   * @param branch - Branch name (default: main)
   * @returns File content
   */
  async getFileContent(
    owner: string,
    repo: string,
    path: string,
    branch: string = 'main'
  ): Promise<string> {
    const response = await this.client.call<{ content: string }>(
      'getFileContent',
      {
        owner,
        repo,
        path,
        branch
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Get file content failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.content;
  }

  /**
   * Add topics to a repository
   * 
   * Topics help with repository discovery and categorization
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param topics - Array of topic strings (lowercase, no spaces)
   * @returns Updated topics list
   */
  async addTopics(
    owner: string,
    repo: string,
    topics: string[]
  ): Promise<string[]> {
    const response = await this.client.call<{ topics: string[] }>(
      'addTopics',
      {
        owner,
        repo,
        topics: topics.map(t => t.toLowerCase().replace(/\s+/g, '-'))
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Add topics failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.topics;
  }

  /**
   * Create a GitHub Actions workflow
   * 
   * Sets up CI/CD automation with GitHub Actions
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param workflow - Workflow configuration
   * @returns Commit information
   */
  async createWorkflow(
    owner: string,
    repo: string,
    workflow: GitHubWorkflowConfig
  ): Promise<GitHubCommitInfo> {
    const workflowPath = workflow.path.startsWith('.github/workflows/')
      ? workflow.path
      : `.github/workflows/${workflow.path}`;

    return this.createOrUpdateFile(
      owner,
      repo,
      {
        path: workflowPath,
        content: workflow.content
      },
      `Add ${workflow.name} workflow`
    );
  }

  /**
   * Create a branch
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param branchName - Name of the new branch
   * @param fromBranch - Source branch (default: main)
   * @returns Branch information
   */
  async createBranch(
    owner: string,
    repo: string,
    branchName: string,
    fromBranch: string = 'main'
  ): Promise<GitHubBranchInfo> {
    const response = await this.client.call<GitHubBranchInfo>(
      'createBranch',
      {
        owner,
        repo,
        branch: branchName,
        from: fromBranch
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Branch creation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Create an issue
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param issue - Issue configuration
   * @returns Created issue information
   */
  async createIssue(
    owner: string,
    repo: string,
    issue: GitHubIssueConfig
  ): Promise<GitHubIssueInfo> {
    const response = await this.client.call<GitHubIssueInfo>(
      'createIssue',
      {
        owner,
        repo,
        title: issue.title,
        body: issue.body,
        assignees: issue.assignees,
        labels: issue.labels,
        milestone: issue.milestone
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Issue creation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Create a pull request
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param pr - Pull request configuration
   * @returns Created pull request information
   */
  async createPullRequest(
    owner: string,
    repo: string,
    pr: GitHubPullRequestConfig
  ): Promise<GitHubPullRequestInfo> {
    const response = await this.client.call<GitHubPullRequestInfo>(
      'createPullRequest',
      {
        owner,
        repo,
        title: pr.title,
        body: pr.body,
        head: pr.head,
        base: pr.base,
        draft: pr.draft
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Pull request creation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Create a release
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @param release - Release configuration
   * @returns Created release information
   */
  async createRelease(
    owner: string,
    repo: string,
    release: GitHubReleaseConfig
  ): Promise<GitHubReleaseInfo> {
    const response = await this.client.call<GitHubReleaseInfo>(
      'createRelease',
      {
        owner,
        repo,
        tag_name: release.tag_name,
        name: release.name,
        body: release.body,
        draft: release.draft,
        prerelease: release.prerelease,
        target_commitish: release.target_commitish
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Release creation failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * Get repository information
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Repository information
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepoInfo> {
    const response = await this.client.call<GitHubRepoInfo>(
      'getRepository',
      {
        owner,
        repo
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Get repository failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data;
  }

  /**
   * List repository branches
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Array of branches
   */
  async listBranches(
    owner: string,
    repo: string
  ): Promise<GitHubBranchInfo[]> {
    const response = await this.client.call<{ branches: GitHubBranchInfo[] }>(
      'listBranches',
      {
        owner,
        repo
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `List branches failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.branches;
  }

  /**
   * Delete a repository
   * 
   * WARNING: This is a destructive operation and cannot be undone
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Success status
   */
  async deleteRepository(owner: string, repo: string): Promise<boolean> {
    const response = await this.client.call<{ success: boolean }>(
      'deleteRepository',
      {
        owner,
        repo
      }
    );

    if (!response.success || !response.data) {
      throw new Error(
        `Repository deletion failed: ${response.error?.message || 'Unknown error'}`
      );
    }

    return response.data.success;
  }

  /**
   * Get repository statistics
   * 
   * @param owner - Repository owner
   * @param repo - Repository name
   * @returns Repository statistics
   */
  async getRepositoryStats(owner: string, repo: string): Promise<{
    stars: number;
    forks: number;
    watchers: number;
    openIssues: number;
    size: number;
    language: string;
  }> {
    const response = await this.client.call<{
      stars: number;
      forks: number;
      watchers: number;
      openIssues: number;
      size: number;
      language: string;
    }>('getRepositoryStats', {
      owner,
      repo
    });

    if (!response.success || !response.data) {
      throw new Error(
        `Get repository stats failed: ${response.error?.message || 'Unknown error'}`
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

