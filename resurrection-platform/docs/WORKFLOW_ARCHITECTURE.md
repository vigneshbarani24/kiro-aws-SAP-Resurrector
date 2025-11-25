# Workflow Architecture

This document describes the 5-step resurrection workflow that transforms legacy ABAP code into modern SAP CAP applications.

## Overview

The Resurrection Platform uses an orchestrated multi-step workflow where each step combines LLM intelligence with specialized MCP servers. The workflow is:

1. **User-Initiated**: Users explicitly trigger each resurrection
2. **Transparent**: Real-time progress updates for each step
3. **Controllable**: Can pause, retry, or skip steps on errors
4. **Auditable**: Full logs of each step's inputs/outputs

## Workflow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Resurrection Workflow                         │
│                  (User-Initiated, LLM-Orchestrated)              │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 1: ANALYZE                                                  │
│ ├─ Input: ABAP code                                             │
│ ├─ Process: ABAP Analyzer MCP + LLM                             │
│ ├─ Output: Business logic, dependencies, metadata               │
│ └─ Duration: ~30 seconds                                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 2: PLAN                                                     │
│ ├─ Input: Analysis results                                      │
│ ├─ Process: LLM + Kiro Specs knowledge                          │
│ ├─ Output: Transformation plan, CDS models, architecture        │
│ └─ Duration: ~20 seconds                                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 3: GENERATE                                                 │
│ ├─ Input: Transformation plan                                   │
│ ├─ Process: CAP Generator MCP + UI5 Generator MCP + LLM         │
│ ├─ Output: Complete CAP project (CDS, services, UI, configs)    │
│ └─ Duration: ~60 seconds                                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 4: VALIDATE                                                 │
│ ├─ Input: Generated CAP project                                 │
│ ├─ Process: Kiro Hooks (syntax, structure, Clean Core)          │
│ ├─ Output: Quality report, validation results                   │
│ └─ Duration: ~15 seconds                                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│ Step 5: DEPLOY                                                   │
│ ├─ Input: Validated CAP project                                 │
│ ├─ Process: GitHub MCP (create repo, commit files)              │
│ ├─ Output: GitHub repository URL, BAS deep link                 │
│ └─ Duration: ~20 seconds                                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                    ✅ Resurrection Complete
                    📦 GitHub Repo Created
                    💬 Slack Notification Sent
```

## Step 1: ANALYZE

### Purpose
Parse ABAP code and extract business logic, dependencies, and metadata.

### Process

1. **ABAP Parsing**
   - Call ABAP Analyzer MCP with uploaded code
   - Parse syntax and validate structure
   - Extract function modules, classes, reports

2. **Business Logic Extraction**
   - Identify pricing calculations
   - Extract validation rules
   - Find authorization checks
   - Detect number range patterns

3. **Dependency Analysis**
   - Identify table dependencies (VBAK, VBAP, etc.)
   - Find function module calls
   - Detect BAPI usage
   - Map data flow

4. **SAP Pattern Recognition**
   - Identify SAP-specific patterns
   - Recognize pricing procedures
   - Detect standard transactions
   - Find authorization objects

### Input

```typescript
{
  abapCode: string,
  context: {
    module: 'SD' | 'MM' | 'FI' | 'CO' | 'HR' | 'PP',
    extractBusinessLogic: boolean,
    identifyDependencies: boolean,
    detectPatterns: boolean
  }
}
```

### Output

```typescript
{
  syntax: {
    valid: boolean,
    errors: Array<{ line: number, message: string }>,
    warnings: Array<{ line: number, message: string }>
  },
  businessLogic: {
    calculations: Array<{
      name: string,
      formula: string,
      variables: string[]
    }>,
    validations: Array<{
      rule: string,
      condition: string,
      errorMessage: string
    }>,
    workflows: Array<{
      name: string,
      steps: string[]
    }>
  },
  dependencies: {
    tables: Array<{ name: string, usage: 'read' | 'write' }>,
    functions: Array<{ name: string, type: 'BAPI' | 'RFC' | 'custom' }>,
    includes: string[]
  },
  metadata: {
    linesOfCode: number,
    complexity: number,
    module: string,
    author: string,
    created: string
  }
}
```

### Error Handling

- **Syntax Errors**: Return detailed error messages with line numbers
- **Timeout**: Retry with increased timeout or split file
- **MCP Unavailable**: Queue for later processing

## Step 2: PLAN

### Purpose
Create a transformation plan with CDS models and architecture design.

### Process

1. **LLM Planning**
   - Analyze business logic from Step 1
   - Design CDS entity models
   - Plan service architecture
   - Define UI requirements

2. **CDS Model Design**
   - Map ABAP tables to CDS entities
   - Define associations and compositions
   - Add annotations for Fiori Elements
   - Plan data types and validations

3. **Service Architecture**
   - Design service boundaries
   - Plan API endpoints
   - Define event handlers
   - Map business logic to handlers

4. **UI Design**
   - Choose Fiori template (List Report, Worklist, etc.)
   - Plan UI annotations
   - Design navigation
   - Define actions and buttons

### Input

```typescript
{
  analysisResult: AnalysisResult,
  preferences: {
    capVersion: '7.0',
    uiTemplate: 'list-report' | 'worklist' | 'analytical',
    language: 'javascript' | 'typescript'
  }
}
```

### Output

```typescript
{
  cdsModels: {
    entities: Array<{
      name: string,
      fields: Array<{ name: string, type: string, key?: boolean }>,
      associations: Array<{ name: string, target: string, cardinality: string }>
    }>
  },
  services: {
    name: string,
    entities: string[],
    actions: Array<{ name: string, parameters: any[], returns: string }>,
    events: Array<{ name: string, payload: any }>
  },
  handlers: {
    businessLogic: Array<{
      entity: string,
      event: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE',
      handler: string
    }>
  },
  uiDesign: {
    template: string,
    annotations: any,
    navigation: any
  }
}
```

### Error Handling

- **Incomplete Analysis**: Request additional information
- **Complex Logic**: Break into smaller services
- **LLM Timeout**: Retry with simplified prompt

## Step 3: GENERATE

### Purpose
Generate complete CAP project with CDS models, services, handlers, and UI.

### Process

1. **Generate CDS Models**
   - Call CAP Generator MCP
   - Create db/schema.cds
   - Add sample data (CSV files)
   - Generate database procedures if needed

2. **Generate Services**
   - Create srv/service.cds
   - Generate service implementations (JS/TS)
   - Add business logic handlers
   - Implement validations

3. **Generate UI**
   - Call UI5 Generator MCP
   - Create Fiori Elements app
   - Generate manifest.json
   - Add UI5 annotations

4. **Generate Supporting Files**
   - Create package.json with dependencies
   - Generate mta.yaml for BTP deployment
   - Create xs-security.json for XSUAA
   - Add .gitignore and README.md

### Input

```typescript
{
  transformationPlan: TransformationPlan,
  options: {
    includeTests: boolean,
    includeSampleData: boolean,
    includeCI: boolean
  }
}
```

### Output

```typescript
{
  db: {
    'schema.cds': string,
    'data/SalesOrders.csv': string,
    'data/Customers.csv': string
  },
  srv: {
    'service.cds': string,
    'service.js': string,
    'handlers/pricing.js': string,
    'handlers/validation.js': string
  },
  app: {
    'orders/webapp/manifest.json': string,
    'orders/webapp/annotations.cds': string,
    'orders/package.json': string
  },
  root: {
    'package.json': string,
    'mta.yaml': string,
    'xs-security.json': string,
    '.gitignore': string,
    'README.md': string,
    'RESURRECTION.md': string
  }
}
```

### Error Handling

- **Generation Failure**: Retry individual components
- **Invalid CDS**: Validate and fix syntax
- **Missing Dependencies**: Add to package.json

## Step 4: VALIDATE

### Purpose
Validate generated code for syntax, structure, and Clean Core compliance.

### Process

1. **CDS Syntax Validation**
   - Parse all .cds files
   - Check for syntax errors
   - Validate entity definitions
   - Verify associations

2. **CAP Structure Validation**
   - Check folder structure (db/, srv/, app/)
   - Verify package.json completeness
   - Validate mta.yaml structure
   - Check xs-security.json

3. **Clean Core Compliance**
   - No standard modifications
   - Only released APIs used
   - Cloud-native patterns
   - Standard integration

4. **Business Logic Preservation**
   - Compare with original ABAP
   - Verify calculations preserved
   - Check validations intact
   - Confirm workflows maintained

### Input

```typescript
{
  capProject: CAPProject,
  originalABAP: string,
  validationRules: {
    strictCleanCore: boolean,
    requireTests: boolean,
    checkBusinessLogic: boolean
  }
}
```

### Output

```typescript
{
  passed: boolean,
  syntaxValid: boolean,
  structureValid: boolean,
  cleanCoreCompliant: boolean,
  businessLogicPreserved: boolean,
  errors: Array<{
    severity: 'error' | 'warning',
    file: string,
    line: number,
    message: string
  }>,
  warnings: Array<{
    file: string,
    line: number,
    message: string
  }>,
  metrics: {
    linesOfCode: number,
    complexity: number,
    testCoverage: number,
    qualityScore: number
  }
}
```

### Error Handling

- **Validation Failure**: Provide detailed error report
- **Clean Core Violation**: Suggest fixes
- **Business Logic Mismatch**: Highlight differences

## Step 5: DEPLOY

### Purpose
Create GitHub repository and commit all generated files.

### Process

1. **Create GitHub Repository**
   - Call GitHub MCP
   - Generate unique repo name
   - Initialize with README
   - Set repository topics

2. **Commit Files**
   - Commit all CAP project files
   - Use structured commit message
   - Create initial release tag
   - Add LICENSE file

3. **Setup CI/CD**
   - Create .github/workflows/ci.yml
   - Configure build and test jobs
   - Add deployment workflow
   - Setup branch protection

4. **Generate Links**
   - Create BAS deep link
   - Generate deployment instructions
   - Add to resurrection record
   - Send notifications

### Input

```typescript
{
  resurrectionId: string,
  capProject: CAPProject,
  options: {
    private: boolean,
    setupCI: boolean,
    addTopics: string[]
  }
}
```

### Output

```typescript
{
  githubUrl: string,
  basUrl: string,
  repoName: string,
  commitSha: string,
  topics: string[],
  ciConfigured: boolean
}
```

### Error Handling

- **Repo Name Conflict**: Append timestamp
- **Rate Limit**: Queue and retry
- **Permission Error**: Request user to provide repo URL

## Workflow Engine Implementation

### ResurrectionWorkflow Class

```typescript
export class ResurrectionWorkflow {
  private mcpOrchestrator: MCPOrchestrator;
  private llmService: LLMService;
  private hookManager: HookManager;
  
  async execute(resurrectionId: string, abapCode: string): Promise<ResurrectionResult> {
    try {
      // Step 1: ANALYZE
      await this.updateStatus(resurrectionId, 'ANALYZING');
      const analysis = await this.stepAnalyze(abapCode);
      await this.logStep(resurrectionId, 'ANALYZE', analysis);
      
      // Step 2: PLAN
      await this.updateStatus(resurrectionId, 'PLANNING');
      const plan = await this.stepPlan(analysis);
      await this.logStep(resurrectionId, 'PLAN', plan);
      
      // Step 3: GENERATE
      await this.updateStatus(resurrectionId, 'GENERATING');
      const capProject = await this.stepGenerate(plan);
      await this.logStep(resurrectionId, 'GENERATE', capProject);
      
      // Step 4: VALIDATE
      await this.updateStatus(resurrectionId, 'VALIDATING');
      const validation = await this.stepValidate(capProject);
      await this.logStep(resurrectionId, 'VALIDATE', validation);
      
      if (!validation.passed) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Step 5: DEPLOY
      await this.updateStatus(resurrectionId, 'DEPLOYING');
      const deployment = await this.stepDeploy(resurrectionId, capProject);
      await this.logStep(resurrectionId, 'DEPLOY', deployment);
      
      // Mark complete
      await this.updateStatus(resurrectionId, 'COMPLETED');
      await this.hookManager.trigger('on-resurrection-complete', { resurrectionId });
      
      return { analysis, plan, capProject, validation, deployment };
      
    } catch (error) {
      await this.updateStatus(resurrectionId, 'FAILED');
      await this.hookManager.trigger('on-resurrection-failed', { resurrectionId, error });
      throw error;
    }
  }
}
```

## Real-Time Progress Updates

### WebSocket Events

```typescript
// Client subscribes to resurrection progress
socket.on('resurrection:progress', (data) => {
  console.log(`Step: ${data.step}, Status: ${data.status}, Progress: ${data.progress}%`);
});

// Server emits progress updates
io.to(resurrectionId).emit('resurrection:progress', {
  step: 'ANALYZE',
  status: 'in_progress',
  progress: 30,
  message: 'Parsing ABAP syntax...',
  timestamp: new Date()
});
```

### Progress Calculation

```typescript
const STEP_WEIGHTS = {
  ANALYZE: 20,   // 20% of total
  PLAN: 15,      // 15% of total
  GENERATE: 40,  // 40% of total
  VALIDATE: 10,  // 10% of total
  DEPLOY: 15     // 15% of total
};

function calculateProgress(currentStep: string, stepProgress: number): number {
  const completedSteps = STEPS.slice(0, STEPS.indexOf(currentStep));
  const completedWeight = completedSteps.reduce((sum, step) => sum + STEP_WEIGHTS[step], 0);
  const currentWeight = STEP_WEIGHTS[currentStep] * (stepProgress / 100);
  return completedWeight + currentWeight;
}
```

## Error Recovery

### Retry Strategy

```typescript
async function executeStepWithRetry(
  step: string,
  fn: () => Promise<any>,
  maxRetries: number = 3
): Promise<any> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      
      const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
      await sleep(delay);
    }
  }
}
```

### Checkpoint and Resume

```typescript
// Save checkpoint after each step
await saveCheckpoint(resurrectionId, {
  step: 'ANALYZE',
  result: analysisResult,
  timestamp: new Date()
});

// Resume from checkpoint
const checkpoint = await loadCheckpoint(resurrectionId);
if (checkpoint) {
  return await resumeFromStep(checkpoint.step, checkpoint.result);
}
```

## Performance Optimization

### Parallel Processing

```typescript
// Generate CDS, services, and UI in parallel
const [cdsModels, services, ui] = await Promise.all([
  mcpOrchestrator.generateCDS(plan.cdsModels),
  mcpOrchestrator.generateServices(plan.services),
  mcpOrchestrator.generateUI(plan.uiDesign)
]);
```

### Caching

```typescript
// Cache analysis results for similar ABAP code
const cacheKey = hashABAPCode(abapCode);
const cached = await cache.get(cacheKey);
if (cached) return cached;

const result = await analyzeABAP(abapCode);
await cache.set(cacheKey, result, { ttl: 3600 });
return result;
```

## Monitoring and Logging

### Structured Logging

```typescript
logger.info('Workflow step started', {
  resurrectionId,
  step: 'ANALYZE',
  timestamp: new Date(),
  metadata: { linesOfCode: 1234 }
});
```

### Metrics Collection

```typescript
metrics.recordDuration('workflow.step.analyze', duration);
metrics.increment('workflow.step.analyze.success');
metrics.gauge('workflow.active_resurrections', activeCount);
```

## Testing

### Unit Tests

```typescript
describe('ResurrectionWorkflow', () => {
  it('should execute all 5 steps in sequence', async () => {
    const workflow = new ResurrectionWorkflow();
    const result = await workflow.execute(resurrectionId, abapCode);
    
    expect(result.analysis).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.capProject).toBeDefined();
    expect(result.validation.passed).toBe(true);
    expect(result.deployment.githubUrl).toBeDefined();
  });
});
```

### Integration Tests

```typescript
describe('End-to-End Workflow', () => {
  it('should transform sample ABAP to CAP', async () => {
    const abapCode = fs.readFileSync('samples/sales-order.abap', 'utf-8');
    const result = await workflow.execute(resurrectionId, abapCode);
    
    // Verify GitHub repo was created
    const repo = await github.getRepository(result.deployment.repoName);
    expect(repo).toBeDefined();
    
    // Verify all files are present
    const files = await github.getFiles(repo.name);
    expect(files).toContain('package.json');
    expect(files).toContain('db/schema.cds');
    expect(files).toContain('srv/service.cds');
  });
});
```

## References

- [SAP CAP Documentation](https://cap.cloud.sap/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [OpenAI API Documentation](https://platform.openai.com/docs)
