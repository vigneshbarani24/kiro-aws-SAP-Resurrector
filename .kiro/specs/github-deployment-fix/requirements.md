# Requirements Document

## Introduction

The resurrection platform workflow completes all steps (ANALYZE, PLAN, GENERATE, VALIDATE) successfully, but has three critical issues in the DEPLOY step:

1. **GitHub API 403 Error**: The DEPLOY step fails when attempting to create a GitHub repository because the GITHUB_TOKEN lacks the required `repo` scope permissions.
2. **Missing FRS Documentation**: The system does not generate Functional Requirements Specification (FRS) documentation for each resurrection, making it difficult to understand what was transformed.
3. **Empty GitHub Repositories**: Even when GitHub repositories are created, they remain empty because the system only creates the repo but doesn't push the generated CAP files.

The workflow is designed to handle GitHub failures gracefully by marking resurrections as completed with a local file path, but users don't get the full deployment experience with comprehensive documentation and populated repositories.

## Glossary

- **Resurrection Platform**: The SAP ABAP to CAP transformation platform
- **Hybrid Workflow**: The workflow engine that orchestrates ABAP analysis and CAP generation
- **GitHub Deployment**: The process of creating a GitHub repository and pushing generated CAP code
- **GITHUB_TOKEN**: Personal Access Token for GitHub API authentication
- **FRS Documentation**: Functional Requirements Specification document that describes the original ABAP functionality and transformation details
- **GitHub Contents API**: GitHub REST API endpoint for creating and updating files in a repository

## Requirements

### Requirement 1

**User Story:** As a platform user, I want the GitHub deployment step to work reliably, so that my resurrected CAP projects are automatically pushed to GitHub repositories.

#### Acceptance Criteria

1. WHEN the workflow reaches the DEPLOY step THEN the system SHALL validate the GITHUB_TOKEN has required scopes before attempting API calls
2. WHEN the GITHUB_TOKEN lacks repo scope THEN the system SHALL provide clear instructions for creating a token with correct permissions
3. WHEN the GITHUB_TOKEN is valid with repo scope THEN the system SHALL successfully create a GitHub repository
4. WHEN the GitHub repository is created THEN the system SHALL push all generated CAP files to the repository using GitHub Contents API
5. WHEN the deployment completes THEN the system SHALL store the GitHub URL and BAS deep link in the database

### Requirement 2

**User Story:** As a platform administrator, I want clear visibility into deployment failures, so that I can troubleshoot GitHub integration issues.

#### Acceptance Criteria

1. WHEN GitHub deployment fails THEN the system SHALL log the specific error reason including HTTP status and GitHub error message
2. WHEN the GITHUB_TOKEN returns 403 forbidden THEN the system SHALL indicate missing repo scope permissions
3. WHEN the GitHub API returns an error THEN the system SHALL parse and display the error message from GitHub response
4. WHEN deployment fails THEN the system SHALL still mark the resurrection as completed with local file path fallback
5. WHEN viewing resurrection details THEN the system SHALL display deployment status, error messages, and setup instructions

### Requirement 3

**User Story:** As a developer, I want proper environment variable configuration, so that GitHub tokens are loaded correctly.

#### Acceptance Criteria

1. WHEN the application starts THEN the system SHALL load environment variables from .env.local file
2. WHEN multiple GITHUB_TOKEN entries exist THEN the system SHALL use the first valid entry and log a warning
3. WHEN the GITHUB_TOKEN has whitespace or formatting issues THEN the system SHALL trim and sanitize the token value
4. WHEN the token is missing THEN the system SHALL skip GitHub deployment and use local-only mode
5. WHEN the token is present THEN the system SHALL validate it has repo scope by checking GitHub API user permissions endpoint

### Requirement 4

**User Story:** As a platform user, I want to see deployment progress in real-time, so that I know what's happening during the resurrection process.

#### Acceptance Criteria

1. WHEN the DEPLOY step starts THEN the system SHALL update the UI with "Deploying to GitHub" status
2. WHEN creating the GitHub repository THEN the system SHALL show "Creating repository..." progress
3. WHEN pushing files THEN the system SHALL show "Pushing files (X/Y)..." progress
4. WHEN deployment completes THEN the system SHALL show the GitHub URL and BAS link
5. WHEN deployment fails THEN the system SHALL show the error message and local file path fallback

### Requirement 5

**User Story:** As a new platform user, I want clear instructions for setting up GitHub integration, so that I can enable automatic repository deployment.

#### Acceptance Criteria

1. WHEN the user first accesses the platform THEN the system SHALL check for valid GITHUB_TOKEN configuration
2. WHEN the GITHUB_TOKEN is missing or invalid THEN the system SHALL display a setup guide in the UI
3. WHEN viewing the setup guide THEN the system SHALL provide step-by-step instructions for creating a GitHub Personal Access Token
4. WHEN creating the token THEN the system SHALL specify that repo scope is required for repository creation
5. WHEN the token is configured THEN the system SHALL validate it and show success confirmation or specific error messages

### Requirement 6

**User Story:** As a platform user, I want comprehensive FRS documentation generated for each resurrection, so that I can understand what was transformed and how the business logic was preserved.

#### Acceptance Criteria

1. WHEN the ANALYZE step completes THEN the system SHALL generate an FRS document containing original ABAP analysis
2. WHEN generating FRS documentation THEN the system SHALL include business logic description, SAP tables used, detected patterns, and complexity analysis
3. WHEN generating FRS documentation THEN the system SHALL include transformation mapping showing how ABAP constructs map to CAP entities and services
4. WHEN the resurrection completes THEN the system SHALL store the FRS document in the generated CAP project as FRS.md
5. WHEN viewing resurrection details THEN the system SHALL display a link to download or view the FRS documentation

### Requirement 7

**User Story:** As a platform user, I want all generated CAP files pushed to the GitHub repository, so that I have a complete, working project in GitHub.

#### Acceptance Criteria

1. WHEN the GitHub repository is created THEN the system SHALL push all generated CAP files using the GitHub Contents API
2. WHEN pushing files THEN the system SHALL upload package.json, schema.cds, service.cds, service.js, README.md, and FRS.md
3. WHEN pushing files THEN the system SHALL create proper directory structure (db/, srv/, docs/) in the repository
4. WHEN all files are pushed THEN the system SHALL create an initial commit with message "Initial resurrection from ABAP"
5. WHEN file push completes THEN the system SHALL verify the repository contains all expected files before marking deployment as successful
