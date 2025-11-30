# Design Document

## Overview

This design addresses three critical issues in the resurrection platform's deployment workflow:

1. **GitHub API Authentication**: Fix 403 errors by validating token scopes before API calls
2. **FRS Documentation Generation**: Create comprehensive Functional Requirements Specification documents for each resurrection
3. **Complete File Deployment**: Push all generated CAP files to GitHub repositories using the Contents API

The solution enhances the existing `HybridResurrectionWorkflow` class with token validation, FRS generation, and batch file upload capabilities while maintaining backward compatibility with local-only deployments.

## Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                  HybridResurrectionWorkflow                  │
├─────────────────────────────────────────────────────────────┤
│  1. ANALYZE (enhanced with FRS generation)                   │
│  2. PLAN                                                     │
│  3. GENERATE (includes FRS.md in output)                     │
│  4. VALIDATE                                                 │
│  5. DEPLOY (enhanced with token validation + file push)     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├──> GitHubTokenValidator
                            │    - validateToken()
                            │    - checkScopes()
                            │
                            ├──> FRSGenerator
                            │    - generateFRS()
                            │    - formatAnalysis()
                            │
                            └──> GitHubFileUploader
                                 - uploadFiles()
                                 - createCommit()
```

### Data Flow

```
ABAP Code Input
      │
      ▼
[ANALYZE] ──> Analysis Result ──> [Generate FRS]
      │                                  │
      ▼                                  ▼
[PLAN] ──> Transformation Plan      FRS.md
      │                                  │
      ▼                                  │
[GENERATE] ──> CAP Project Files ◄──────┘
      │
      ▼
[VALIDATE] ──> Quality Report
      │
      ▼
[DEPLOY] ──> [Validate Token] ──> [Create Repo] ──> [Push Files]
                    │                                      │
                    ▼                                      ▼
            Token Valid?                          All Files Uploaded
                    │                                      │
                    ├─ Yes ──────────────────────────────►│
                    │                                      ▼
                    └─ No ──> Local-Only Mode      GitHub URL + BAS Link
```

## Components and Interfaces

### 1. GitHubTokenValidator

**Purpose**: Validate GitHub Personal Access Tokens before attempting API calls

**Interface**:
```typescript
interface GitHubTokenValidator {
  validateToken(token: string): Promise<TokenValidationResult>;
  checkScopes(token: string): Promise<string[]>;
  sanitizeToken(token: string): string;
}

interface TokenValidationResult {
  valid: boolean;
  scopes: string[];
  username?: string;
  error?: string;
}
```

**Implementation Details**:
- Use GitHub API `/user` endpoint to validate token
- Parse `X-OAuth-Scopes` header to check permissions
- Require `repo` scope for repository creation
- Sanitize tokens by trimming whitespace and removing invalid characters

### 2. FRSGenerator

**Purpose**: Generate comprehensive Functional Requirements Specification documents

**Interface**:
```typescript
interface FRSGenerator {
  generateFRS(analysis: AnalysisResult, resurrection: Resurrection): Promise<string>;
  formatBusinessLogic(logic: string[]): string;
  formatTransformationMapping(analysis: AnalysisResult, plan: any): string;
}

interface FRSContent {
  title: string;
  originalABAP: {
    module: string;
    complexity: number;
    linesOfCode: number;
    tables: string[];
    businessLogic: string[];
    patterns: string[];
  };
  transformation: {
    targetFramework: string;
    entities: string[];
    services: string[];
    mapping: Array<{ from: string; to: string; notes: string }>;
  };
  qualityMetrics: {
    locReduction: number;
    cleanCoreCompliant: boolean;
    testCoverage: number;
  };
}
```

**Implementation Details**:
- Generate markdown document with structured sections
- Include original ABAP analysis (tables, business logic, patterns)
- Document transformation mapping (ABAP → CAP)
- Add quality metrics and recommendations
- Store as `docs/FRS.md` in generated project

### 3. GitHubFileUploader

**Purpose**: Upload all generated CAP files to GitHub repository

**Interface**:
```typescript
interface GitHubFileUploader {
  uploadFiles(
    token: string,
    repoFullName: string,
    files: Array<{ path: string; content: string }>,
    onProgress?: (current: number, total: number) => void
  ): Promise<UploadResult>;
  
  createFile(
    token: string,
    repoFullName: string,
    filePath: string,
    content: string,
    message: string
  ): Promise<void>;
}

interface UploadResult {
  success: boolean;
  filesUploaded: number;
  totalFiles: number;
  errors: Array<{ file: string; error: string }>;
}
```

**Implementation Details**:
- Use GitHub Contents API: `PUT /repos/{owner}/{repo}/contents/{path}`
- Base64 encode file contents
- Upload files sequentially to avoid rate limits
- Create directory structure (db/, srv/, docs/)
- Report progress for UI updates
- Handle errors gracefully (retry logic for transient failures)

### 4. Enhanced HybridResurrectionWorkflow

**Changes to existing workflow**:

```typescript
export class HybridResurrectionWorkflow {
  private tokenValidator: GitHubTokenValidator;
  private frsGenerator: FRSGenerator;
  private fileUploader: GitHubFileUploader;
  
  constructor() {
    // ... existing code ...
    this.tokenValidator = new GitHubTokenValidator();
    this.frsGenerator = new FRSGenerator();
    this.fileUploader = new GitHubFileUploader();
  }
  
  // Enhanced stepAnalyze - now generates FRS
  private async stepAnalyze(resurrectionId: string, abapCode: string): Promise<AnalysisResult> {
    // ... existing analysis code ...
    
    // NEW: Generate FRS document
    const resurrection = await prisma.resurrection.findUnique({ where: { id: resurrectionId } });
    const frsContent = await this.frsGenerator.generateFRS(analysis, resurrection);
    
    // Store FRS for later inclusion in project
    analysis.frsDocument = frsContent;
    
    return analysis;
  }
  
  // Enhanced stepGenerate - includes FRS.md
  private async stepGenerate(...): Promise<CAPProject> {
    // ... existing generation code ...
    
    // NEW: Add FRS document to project
    const docsDir = join(projectPath, 'docs');
    await mkdir(docsDir, { recursive: true });
    const frsPath = join(docsDir, 'FRS.md');
    await writeFile(frsPath, analysis.frsDocument);
    
    return { path: projectPath, files };
  }
  
  // Enhanced stepDeploy - validates token and pushes files
  private async stepDeploy(resurrectionId: string, capProject: CAPProject): Promise<void> {
    // ... existing setup code ...
    
    // NEW: Validate token before attempting deployment
    if (!this.githubToken) {
      throw new Error('GITHUB_TOKEN not configured. See setup guide.');
    }
    
    const sanitizedToken = this.tokenValidator.sanitizeToken(this.githubToken);
    const validation = await this.tokenValidator.validateToken(sanitizedToken);
    
    if (!validation.valid) {
      throw new Error(`GitHub token invalid: ${validation.error}`);
    }
    
    if (!validation.scopes.includes('repo')) {
      throw new Error('GitHub token missing required "repo" scope. Please create a new token with repo permissions.');
    }
    
    // Create repository (existing code)
    const repo = await this.createGitHubRepo(sanitizedToken, repoName, resurrection);
    
    // NEW: Upload all files
    console.log(`[HybridWorkflow] Uploading ${capProject.files.length} files...`);
    const uploadResult = await this.fileUploader.uploadFiles(
      sanitizedToken,
      repo.full_name,
      capProject.files,
      (current, total) => {
        console.log(`[HybridWorkflow] Uploading files: ${current}/${total}`);
      }
    );
    
    if (!uploadResult.success) {
      throw new Error(`File upload failed: ${uploadResult.errors.length} errors`);
    }
    
    console.log(`[HybridWorkflow] Successfully uploaded ${uploadResult.filesUploaded} files`);
    
    // ... rest of existing code ...
  }
}
```

## Data Models

### Extended AnalysisResult

```typescript
interface AnalysisResult {
  businessLogic: string[];
  dependencies: string[];
  tables: string[];
  patterns: string[];
  module: string;
  complexity: number;
  documentation: string;
  frsDocument?: string;  // NEW: FRS markdown content
}
```

### GitHub API Models

```typescript
interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  clone_url: string;
  default_branch: string;
}

interface GitHubFileContent {
  path: string;
  message: string;
  content: string;  // Base64 encoded
  branch?: string;
}

interface GitHubUser {
  login: string;
  id: number;
  type: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Token validation prevents invalid API calls

*For any* GitHub token, if the token lacks the `repo` scope, then the system should reject it before attempting to create a repository and provide clear error messaging about the missing scope.

**Validates: Requirements 1.1, 1.2**

### Property 2: FRS generation completeness

*For any* resurrection with valid analysis results, the generated FRS document should contain all required sections (original ABAP details, transformation mapping, quality metrics) and be stored in the docs/ directory.

**Validates: Requirements 6.1, 6.2, 6.3, 6.4**

### Property 3: File upload completeness

*For any* CAP project with N generated files, after successful GitHub deployment, the repository should contain exactly N files in the correct directory structure.

**Validates: Requirements 7.1, 7.2, 7.3, 7.5**

### Property 4: Deployment fallback consistency

*For any* resurrection where GitHub deployment fails, the system should still mark the resurrection as COMPLETED with a local file path and log the specific error reason.

**Validates: Requirements 2.4**

### Property 5: Token sanitization idempotence

*For any* GitHub token string, sanitizing it multiple times should produce the same result as sanitizing it once.

**Validates: Requirements 3.3**

### Property 6: Progress reporting accuracy

*For any* file upload operation with N files, the progress callback should be invoked exactly N times with monotonically increasing current values from 1 to N.

**Validates: Requirements 4.3**

## Error Handling

### Token Validation Errors

```typescript
class GitHubTokenError extends Error {
  constructor(
    message: string,
    public code: 'MISSING' | 'INVALID' | 'INSUFFICIENT_SCOPE',
    public requiredScopes?: string[]
  ) {
    super(message);
  }
}
```

**Handling Strategy**:
- `MISSING`: Skip GitHub deployment, use local-only mode
- `INVALID`: Show error in UI with setup instructions
- `INSUFFICIENT_SCOPE`: Show specific message about missing `repo` scope

### File Upload Errors

```typescript
interface FileUploadError {
  file: string;
  error: string;
  retryable: boolean;
}
```

**Handling Strategy**:
- Retry transient errors (rate limits, network issues) up to 3 times
- Log non-retryable errors (authentication, file too large)
- Continue uploading remaining files even if some fail
- Report all errors in final upload result

### API Rate Limiting

**Strategy**:
- Check `X-RateLimit-Remaining` header
- If < 10 requests remaining, delay uploads
- Implement exponential backoff for 429 responses
- Log rate limit status for monitoring

## Testing Strategy

### Unit Tests

**Token Validation**:
- Test sanitization removes whitespace and invalid characters
- Test validation detects missing tokens
- Test validation detects invalid tokens
- Test scope checking identifies missing `repo` scope

**FRS Generation**:
- Test FRS contains all required sections
- Test markdown formatting is valid
- Test transformation mapping is accurate

**File Upload**:
- Test Base64 encoding is correct
- Test directory structure creation
- Test progress reporting
- Test error handling and retries

### Integration Tests

**End-to-End Workflow**:
- Test complete resurrection with valid GitHub token
- Test resurrection with invalid token falls back to local-only
- Test resurrection with missing token skips GitHub
- Test FRS document is included in generated project
- Test all files are uploaded to GitHub repository

### Property-Based Tests

We will use **fast-check** (TypeScript property testing library) for property-based testing.

**Property Test 1: Token Sanitization Idempotence**
```typescript
import fc from 'fast-check';

test('token sanitization is idempotent', () => {
  fc.assert(
    fc.property(fc.string(), (token) => {
      const validator = new GitHubTokenValidator();
      const once = validator.sanitizeToken(token);
      const twice = validator.sanitizeToken(once);
      return once === twice;
    })
  );
});
```

**Property Test 2: File Upload Count Consistency**
```typescript
test('uploaded file count matches input', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ path: fc.string(), content: fc.string() })),
      async (files) => {
        const uploader = new GitHubFileUploader();
        const result = await uploader.uploadFiles(mockToken, mockRepo, files);
        return result.filesUploaded + result.errors.length === files.length;
      }
    )
  );
});
```

**Property Test 3: Progress Reporting Monotonicity**
```typescript
test('progress values are monotonically increasing', () => {
  fc.assert(
    fc.property(
      fc.array(fc.record({ path: fc.string(), content: fc.string() }), { minLength: 1 }),
      async (files) => {
        const progressValues: number[] = [];
        const uploader = new GitHubFileUploader();
        
        await uploader.uploadFiles(
          mockToken,
          mockRepo,
          files,
          (current) => progressValues.push(current)
        );
        
        // Check monotonically increasing
        for (let i = 1; i < progressValues.length; i++) {
          if (progressValues[i] <= progressValues[i - 1]) return false;
        }
        return true;
      }
    )
  );
});
```

## Security Considerations

### Token Storage

- Never log full GitHub tokens
- Mask tokens in error messages (show only first 4 chars)
- Store tokens only in environment variables, never in database
- Validate token format before making API calls

### API Security

- Use HTTPS for all GitHub API calls
- Validate response status codes
- Sanitize user input in repository names and descriptions
- Limit file upload size to prevent abuse

### Error Messages

- Don't expose internal paths in error messages
- Sanitize GitHub API error responses before displaying to users
- Log detailed errors server-side, show user-friendly messages in UI

## Performance Considerations

### File Upload Optimization

- Upload files sequentially to avoid rate limits (not parallel)
- Batch small files together if possible
- Use compression for large files
- Cache repository metadata to reduce API calls

### FRS Generation

- Generate FRS during ANALYZE step (already computed)
- Cache FRS content in memory during workflow
- Write FRS to disk only once during GENERATE step

### Token Validation

- Validate token once at start of DEPLOY step
- Cache validation result for workflow duration
- Don't re-validate on retry attempts

## Deployment Strategy

### Environment Variables

Required in `.env.local`:
```bash
GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"  # Must have 'repo' scope
```

### Migration Path

1. Deploy new code with enhanced workflow
2. Existing resurrections continue to work (backward compatible)
3. New resurrections automatically get FRS and full GitHub deployment
4. Users with invalid tokens see setup instructions

### Rollback Plan

If issues arise:
1. GitHub deployment failures fall back to local-only mode
2. FRS generation errors don't block workflow
3. File upload errors are logged but don't fail resurrection
4. All changes are additive, no breaking changes to existing functionality

## Monitoring and Observability

### Metrics to Track

- GitHub token validation success rate
- File upload success rate
- Average files uploaded per resurrection
- GitHub API rate limit usage
- FRS generation time
- Deployment step duration

### Logging

```typescript
// Token validation
console.log('[GitHubTokenValidator] Validating token...');
console.log('[GitHubTokenValidator] Token valid, scopes:', scopes);

// FRS generation
console.log('[FRSGenerator] Generating FRS document...');
console.log('[FRSGenerator] FRS generated, size:', frsContent.length);

// File upload
console.log('[GitHubFileUploader] Uploading file:', filePath);
console.log('[GitHubFileUploader] Upload complete:', filesUploaded, '/', totalFiles);
```

### Error Tracking

- Log all GitHub API errors with status codes
- Track token validation failures
- Monitor file upload retry attempts
- Alert on high failure rates

## UI/UX Enhancements

### Setup Guide Component

Display when token is missing or invalid:

```
┌─────────────────────────────────────────────────────────┐
│  GitHub Integration Setup                                │
├─────────────────────────────────────────────────────────┤
│  To enable automatic GitHub deployment:                  │
│                                                          │
│  1. Go to GitHub Settings → Developer Settings →        │
│     Personal Access Tokens → Tokens (classic)           │
│                                                          │
│  2. Click "Generate new token (classic)"                │
│                                                          │
│  3. Select the "repo" scope (required)                  │
│                                                          │
│  4. Copy the token and add to .env.local:               │
│     GITHUB_TOKEN="ghp_xxxxxxxxxxxx"                     │
│                                                          │
│  5. Restart the application                             │
│                                                          │
│  [View Documentation] [Test Token]                      │
└─────────────────────────────────────────────────────────┘
```

### Deployment Progress

Show real-time progress during DEPLOY step:

```
┌─────────────────────────────────────────────────────────┐
│  Deploying to GitHub                                     │
├─────────────────────────────────────────────────────────┤
│  ✓ Validating GitHub token                              │
│  ✓ Creating repository: resurrection-sales-order-123    │
│  ⏳ Uploading files (8/15)...                           │
│     - package.json                                       │
│     - db/schema.cds                                      │
│     - srv/service.cds                                    │
│     - srv/service.js                                     │
│     - docs/FRS.md                                        │
│     - README.md                                          │
│     - .gitignore                                         │
│     - app/index.html (uploading...)                     │
│                                                          │
│  [████████░░░░░░░] 53%                                  │
└─────────────────────────────────────────────────────────┘
```

### Resurrection Details Page

Add FRS download link:

```
┌─────────────────────────────────────────────────────────┐
│  Resurrection: Sales Order Processing                    │
├─────────────────────────────────────────────────────────┤
│  Status: COMPLETED                                       │
│  Module: SD (Sales & Distribution)                       │
│  Complexity: 7/10                                        │
│                                                          │
│  📄 Documentation:                                       │
│     [Download FRS] [View in GitHub]                     │
│                                                          │
│  🔗 Links:                                              │
│     GitHub: github.com/user/resurrection-sales-123      │
│     BAS: Open in SAP Business Application Studio        │
│                                                          │
│  📊 Quality Score: 90/100                               │
└─────────────────────────────────────────────────────────┘
```

## Future Enhancements

### Phase 2 (Post-MVP)

1. **Batch File Upload**: Use GitHub Tree API for faster uploads
2. **Git History**: Create meaningful commit history with multiple commits
3. **Branch Protection**: Set up branch protection rules automatically
4. **CI/CD Integration**: Add GitHub Actions workflows to generated repos
5. **FRS Templates**: Allow customizable FRS templates per organization

### Phase 3 (Advanced)

1. **GitHub App**: Replace PAT with GitHub App for better security
2. **Organization Support**: Deploy to organization repositories
3. **Team Permissions**: Automatically configure team access
4. **Webhook Integration**: Notify external systems on deployment
5. **Analytics Dashboard**: Track deployment success rates and trends
