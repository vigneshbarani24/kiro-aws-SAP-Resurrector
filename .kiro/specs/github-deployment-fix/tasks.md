# Implementation Plan

- [x] 1. Create GitHubTokenValidator class






  - Implement token sanitization (trim whitespace, remove invalid characters)
  - Implement token validation using GitHub API `/user` endpoint
  - Implement scope checking by parsing `X-OAuth-Scopes` header
  - Return structured validation results with error messages
  - _Requirements: 1.1, 1.2, 3.3, 3.5_

- [ ]* 1.1 Write property test for token sanitization idempotence
  - **Property 5: Token sanitization idempotence**
  - **Validates: Requirements 3.3**

- [ ]* 1.2 Write unit tests for token validation
  - Test validation with missing token
  - Test validation with invalid token format
  - Test validation with valid token but missing repo scope
  - Test validation with valid token and repo scope
  - _Requirements: 1.1, 1.2, 3.5_

- [x] 2. Create FRSGenerator class




  - Implement generateFRS() method that creates markdown document
  - Include original ABAP analysis section (module, complexity, tables, business logic, patterns)
  - Include transformation mapping section (ABAP → CAP entities and services)
  - Include quality metrics section (LOC reduction, Clean Core compliance)
  - Format output as structured markdown with proper headings
  - _Requirements: 6.1, 6.2, 6.3_

- [ ]* 2.1 Write property test for FRS content completeness
  - **Property 2: FRS generation completeness**
  - **Validates: Requirements 6.2**

- [ ]* 2.2 Write unit tests for FRS generation
  - Test FRS contains all required sections
  - Test markdown formatting is valid
  - Test transformation mapping accuracy
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 3. Create GitHubFileUploader class

  - Implement uploadFiles() method using GitHub Contents API
  - Base64 encode file contents before upload
  - Create directory structure (db/, srv/, docs/) in repository
  - Implement progress callback for UI updates
  - Handle errors gracefully with retry logic for transient failures
  - Return structured upload results with success/error counts
  - _Requirements: 1.4, 7.1, 7.2, 7.3_

- [ ]* 3.1 Write property test for file upload count consistency
  - **Property 3: File upload completeness**
  - **Validates: Requirements 7.1, 7.5**

- [ ]* 3.2 Write property test for progress reporting monotonicity
  - **Property 6: Progress reporting accuracy**
  - **Validates: Requirements 4.3**

- [ ]* 3.3 Write unit tests for file uploader
  - Test Base64 encoding is correct
  - Test directory structure creation
  - Test error handling and retries
  - Test progress callback invocation
  - _Requirements: 1.4, 7.1, 7.3_


- [x] 4. Enhance HybridResurrectionWorkflow.stepAnalyze()


  - After existing analysis, call FRSGenerator.generateFRS()
  - Store FRS content in analysis result object
  - Add frsDocument field to AnalysisResult interface
  - _Requirements: 6.1_

- [ ]* 4.1 Write unit test for FRS generation in analyze step
  - Test FRS is generated after analysis
  - Test FRS content is stored in analysis result
  - _Requirements: 6.1_



- [x] 5. Enhance HybridResurrectionWorkflow.stepGenerate()

  - Create docs/ directory in generated project
  - Write FRS document to docs/FRS.md
  - Include FRS.md in project files list
  - _Requirements: 6.4_

- [ ]* 5.1 Write property test for FRS file inclusion
  - **Property 4: FRS file storage**
  - **Validates: Requirements 6.4**

- [x] 6. Enhance HybridResurrectionWorkflow.stepDeploy() - Token Validation





  - Check if GITHUB_TOKEN is configured
  - Sanitize token using GitHubTokenValidator
  - Validate token and check for repo scope
  - Throw descriptive errors for missing/invalid tokens
  - Log validation results
  - _Requirements: 1.1, 1.2, 3.3, 3.5_

- [ ]* 6.1 Write property test for deployment fallback
  - **Property 4: Deployment fallback consistency**
  - **Validates: Requirements 2.4**

- [ ]* 6.2 Write unit tests for token validation in deploy step
  - Test deployment fails gracefully with missing token
  - Test deployment fails with clear error for invalid token
  - Test deployment fails with clear error for insufficient scope
  - Test deployment proceeds with valid token
  - _Requirements: 1.1, 1.2, 3.5_


- [ ] 7. Enhance HybridResurrectionWorkflow.stepDeploy() - File Upload
  - After creating GitHub repository, call GitHubFileUploader.uploadFiles()
  - Pass all project files including FRS.md
  - Implement progress callback that logs upload status
  - Handle upload errors and log specific failures
  - Verify all files uploaded before marking deployment successful
  - _Requirements: 1.4, 7.1, 7.2, 7.3, 7.5_

- [ ]* 7.1 Write integration test for complete deployment
  - Test end-to-end deployment with valid token
  - Test all files are uploaded to GitHub
  - Test FRS.md is included in upload
  - Test deployment status is updated correctly
  - _Requirements: 1.3, 1.4, 1.5, 7.1, 7.5_


- [ ] 8. Update error handling in stepDeploy()
  - Parse GitHub API error responses and extract error messages
  - Detect 403 errors and provide specific repo scope guidance
  - Log all errors with HTTP status codes
  - Update resurrection with local file path on deployment failure
  - Store error messages in database for display in UI
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 8.1 Write unit tests for error handling
  - Test 403 error provides repo scope guidance
  - Test GitHub API errors are parsed correctly
  - Test local fallback on deployment failure
  - _Requirements: 2.1, 2.2, 2.3, 2.4_


- [ ] 9. Clean up .env.local file
  - Remove duplicate GITHUB_TOKEN entries
  - Remove malformed entries with spaces in variable names
  - Keep only one valid GITHUB_TOKEN entry
  - Add comments explaining required token scopes
  - _Requirements: 3.1, 3.2_


- [ ] 10. Create GitHub setup guide component
  - Create SetupGuide.tsx component with step-by-step instructions
  - Include instructions for creating GitHub Personal Access Token
  - Specify that repo scope is required
  - Add "Test Token" button that validates configured token
  - Display validation results (success or specific errors)
  - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [ ]* 10.1 Write unit tests for setup guide component
  - Test component renders all required steps
  - Test "repo" scope is mentioned in instructions
  - Test token validation button works
  - _Requirements: 5.3, 5.4, 5.5_


- [ ] 11. Update resurrection details page
  - Add "Download FRS" button that downloads docs/FRS.md
  - Add "View in GitHub" link if GitHub URL exists
  - Display deployment status (GitHub or Local-only)
  - Show deployment error messages if deployment failed
  - Show setup guide link if token is invalid
  - _Requirements: 2.5, 6.5_

- [ ]* 11.1 Write unit tests for resurrection details page
  - Test FRS download button appears
  - Test GitHub link appears when URL exists
  - Test error messages display correctly
  - _Requirements: 2.5, 6.5_


- [ ] 12. Add deployment progress UI
  - Update resurrection status display to show "Deploying to GitHub"
  - Show "Creating repository..." during repo creation
  - Show "Uploading files (X/Y)..." during file upload
  - Update progress bar based on upload progress
  - Show GitHub URL and BAS link on completion
  - Show error message and local path on failure
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [-] 12.1 Write unit tests for deployment progress UI




  - Test status updates correctly
  - Test progress bar updates
  - Test completion displays URLs
  - Test failure displays error and fallback
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_


- [ ] 13. Add monitoring and logging
  - Add structured logging for token validation
  - Add structured logging for FRS generation
  - Add structured logging for file uploads
  - Log GitHub API rate limit status
  - Log deployment success/failure metrics
  - _Requirements: 2.1_


- [ ] 14. Update README with GitHub setup instructions
  - Document required GITHUB_TOKEN environment variable
  - Explain how to create token with repo scope
  - Document fallback to local-only mode
  - Add troubleshooting section for common errors
  - _Requirements: 5.3, 5.4_

- [ ] 15. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.
