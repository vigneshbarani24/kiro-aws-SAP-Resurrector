# MCP Logging Complete ✅

## Overview

All MCP server interactions are now **captured, logged, and streamed** into both:
1. **MCP Logs** (dedicated MCP log table)
2. **Transformation Logs** (workflow step logs)

This provides complete visibility into MCP operations for debugging, monitoring, and auditing.

---

## What Gets Logged

### Every MCP Call Captures:

1. **Timestamp** - When the call was made
2. **Server Name** - Which MCP server (abap-analyzer, sap-cap, sap-ui5, etc.)
3. **Tool Name** - Which tool/method was called
4. **Parameters** - Input parameters (sanitized/truncated)
5. **Response** - Output data (sanitized/truncated)
6. **Duration** - How long the call took (milliseconds)
7. **Status** - Success or error
8. **Error Message** - If the call failed

### Example Log Entry:

```json
{
  "id": "mcp_1234567890_abc123",
  "resurrectionId": "uuid-here",
  "serverName": "abap-analyzer",
  "toolName": "analyzeCode",
  "params": {
    "codeLength": 1250,
    "preview": "REPORT z_sales_order..."
  },
  "response": {
    "businessLogic": ["Pricing calculation", "Credit check"],
    "tables": ["VBAK", "VBAP", "KNA1"],
    "complexity": 6
  },
  "durationMs": 2340,
  "calledAt": "2024-01-15T10:30:45.123Z"
}
```

---

## Where Logs Are Stored

### 1. Database (MCPLog Table)

**Schema:**
```prisma
model MCPLog {
  id             String       @id @default(uuid())
  resurrectionId String?
  resurrection   Resurrection? @relation(...)
  
  serverName     String       // abap-analyzer, sap-cap, sap-ui5
  toolName       String       // analyzeCode, search_docs, create_ui5_app
  params         Json?        // Input parameters
  response       Json?        // Output data
  error          String?      // Error message if failed
  durationMs     Int?         // Duration in milliseconds
  calledAt       DateTime     @default(now())
  
  @@index([resurrectionId])
  @@index([serverName])
  @@index([calledAt])
}
```

**Query Examples:**
```sql
-- Get all MCP logs for a resurrection
SELECT * FROM "MCPLog" 
WHERE "resurrectionId" = 'uuid-here' 
ORDER BY "calledAt" DESC;

-- Get failed MCP calls
SELECT * FROM "MCPLog" 
WHERE error IS NOT NULL 
ORDER BY "calledAt" DESC;

-- Get average duration by server
SELECT "serverName", AVG("durationMs") as avg_duration
FROM "MCPLog"
GROUP BY "serverName";
```

### 2. Transformation Logs

MCP calls also appear in the transformation logs:

```json
{
  "step": "MCP_ABAP_ANALYZER",
  "status": "COMPLETED",
  "duration": 2340,
  "response": {
    "tool": "analyzeCode",
    "params": { "codeLength": 1250 },
    "success": true
  }
}
```

This integrates MCP operations into the overall workflow timeline.

---

## Console Output

### Successful MCP Call:

```
[MCP] Calling abap-analyzer.analyzeCode...
[MCP] 2024-01-15T10:30:45.123Z | abap-analyzer.analyzeCode | ✅ SUCCESS | 2340ms
[HybridWorkflow] ✅ ABAP Analyzer MCP analysis complete
```

### Failed MCP Call:

```
[MCP] Calling sap-ui5.create_ui5_app...
[MCP] 2024-01-15T10:32:10.456Z | sap-ui5.create_ui5_app | ❌ ERROR | 1200ms
[MCP] Error: Connection timeout
[HybridWorkflow] ⚠️ UI5 app creation failed (non-critical): Connection timeout
```

### Debug Mode (Full Details):

```
[MCP] Calling abap-analyzer.analyzeCode...
[MCP] Params: { codeLength: 1250, preview: "REPORT z_sales_order..." }
[MCP] 2024-01-15T10:30:45.123Z | abap-analyzer.analyzeCode | ✅ SUCCESS | 2340ms
[MCP] Response: {
  businessLogic: ["Pricing calculation", "Credit check"],
  tables: ["VBAK", "VBAP", "KNA1"],
  complexity: 6
}
```

Enable debug mode:
```bash
MCP_DEBUG_MODE=true npm run dev
```

---

## Code Implementation

### Logging Wrapper Method

```typescript
/**
 * Log MCP call with timing and results
 */
private async logMCPCall<T>(
  resurrectionId: string,
  serverName: string,
  toolName: string,
  params: any,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    console.log(`[MCP] Calling ${serverName}.${toolName}...`);
    const result = await operation();
    const duration = Date.now() - startTime;
    
    // Log to MCP logger
    await mcpLogger.logCall(
      resurrectionId,
      serverName,
      toolName,
      params,
      result,
      undefined,
      duration
    );
    
    // Also log to transformation logs
    await this.logStep(resurrectionId, `MCP_${serverName.toUpperCase()}`, 'COMPLETED', duration, {
      tool: toolName,
      params: this.sanitizeForLog(params),
      success: true
    });
    
    console.log(`[MCP] ✅ ${serverName}.${toolName} completed in ${duration}ms`);
    return result;
    
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log error to MCP logger
    await mcpLogger.logCall(
      resurrectionId,
      serverName,
      toolName,
      params,
      undefined,
      errorMessage,
      duration
    );
    
    // Also log to transformation logs
    await this.logStep(resurrectionId, `MCP_${serverName.toUpperCase()}`, 'FAILED', duration, null, errorMessage);
    
    console.error(`[MCP] ❌ ${serverName}.${toolName} failed after ${duration}ms:`, errorMessage);
    throw error;
  }
}
```

### Usage in Workflow

```typescript
// ABAP Analysis with logging
const mcpAnalysis = await this.logMCPCall(
  resurrectionId,
  'abap-analyzer',
  'analyzeCode',
  { codeLength: abapCode.length, preview: abapCode.substring(0, 100) },
  () => this.mcpClient.analyzeABAP(abapCode)
);

// CAP Docs Search with logging
const capDocs = await this.logMCPCall(
  resurrectionId,
  'sap-cap',
  'search_docs',
  { query: searchQuery },
  () => this.mcpClient.searchCAPDocs(searchQuery)
);

// UI5 App Creation with logging
await this.logMCPCall(
  resurrectionId,
  'sap-ui5',
  'create_ui5_app',
  {
    appNamespace: ui5Config.appNamespace,
    framework: ui5Config.framework,
    typescript: ui5Config.typescript
  },
  () => this.mcpClient.createUI5App(ui5Config)
);
```

---

## Querying MCP Logs

### Via API

**Get logs for a resurrection:**
```typescript
GET /api/resurrections/{id}/logs?type=mcp
```

**Response:**
```json
{
  "logs": [
    {
      "id": "mcp_1234567890_abc123",
      "serverName": "abap-analyzer",
      "toolName": "analyzeCode",
      "durationMs": 2340,
      "status": "success",
      "calledAt": "2024-01-15T10:30:45.123Z"
    },
    {
      "id": "mcp_1234567891_def456",
      "serverName": "sap-cap",
      "toolName": "search_docs",
      "durationMs": 850,
      "status": "success",
      "calledAt": "2024-01-15T10:30:48.456Z"
    }
  ],
  "stats": {
    "totalCalls": 2,
    "successfulCalls": 2,
    "failedCalls": 0,
    "averageDuration": 1595
  }
}
```

### Via MCPLogger Service

```typescript
import { mcpLogger } from '@/lib/mcp/mcp-logger';

// Get logs for a resurrection
const logs = await mcpLogger.getLogsForResurrection(resurrectionId);

// Get log statistics
const stats = await mcpLogger.getLogStats(resurrectionId);

// Search logs
const searchResults = await mcpLogger.searchLogs('VBAK', {
  resurrectionId,
  serverName: 'abap-analyzer'
});

// Export logs as JSON
const jsonExport = await mcpLogger.exportLogsAsJSON({
  resurrectionId,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-31')
});
```

---

## Log Statistics

### Available Metrics

```typescript
const stats = await mcpLogger.getLogStats(resurrectionId);

console.log(stats);
// {
//   totalCalls: 5,
//   successfulCalls: 4,
//   failedCalls: 1,
//   averageDuration: 1850,
//   callsByServer: {
//     'abap-analyzer': 1,
//     'sap-cap': 2,
//     'sap-ui5': 2
//   },
//   callsByTool: {
//     'analyzeCode': 1,
//     'search_docs': 2,
//     'create_ui5_app': 2
//   }
// }
```

### Performance Analysis

```sql
-- Slowest MCP calls
SELECT "serverName", "toolName", "durationMs"
FROM "MCPLog"
WHERE "resurrectionId" = 'uuid-here'
ORDER BY "durationMs" DESC
LIMIT 10;

-- MCP call frequency by hour
SELECT 
  DATE_TRUNC('hour', "calledAt") as hour,
  COUNT(*) as call_count
FROM "MCPLog"
WHERE "resurrectionId" = 'uuid-here'
GROUP BY hour
ORDER BY hour;

-- Error rate by server
SELECT 
  "serverName",
  COUNT(*) as total_calls,
  SUM(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) as failed_calls,
  ROUND(100.0 * SUM(CASE WHEN error IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as error_rate
FROM "MCPLog"
GROUP BY "serverName";
```

---

## Data Sanitization

### Automatic Truncation

Large parameters and responses are automatically truncated:

```typescript
// Original (5000 characters)
{
  abapCode: "REPORT z_sales_order...[5000 chars]..."
}

// Logged (500 characters)
{
  _truncated: true,
  _size: 5000,
  _preview: "REPORT z_sales_order...[500 chars]..."
}
```

### Sensitive Data Removal

Sensitive fields are automatically sanitized:
- API keys
- Passwords
- Tokens
- Personal information

---

## Log Archival

### Automatic Cleanup

Old logs are automatically archived:

```typescript
// Archive logs older than 30 days
const archivedCount = await mcpLogger.archiveOldLogs(30);
console.log(`Archived ${archivedCount} old logs`);
```

### Manual Export

Export logs before archival:

```typescript
// Export all logs for a resurrection
const jsonExport = await mcpLogger.exportLogsAsJSON({
  resurrectionId: 'uuid-here'
});

// Save to file
await fs.writeFile('mcp-logs-export.json', jsonExport);
```

---

## Debug Mode

### Enable Full Logging

```bash
# In .env.local
MCP_DEBUG_MODE=true
```

**Debug mode includes:**
- Full request parameters (not truncated)
- Full response data (not truncated)
- Detailed error stack traces
- Timing breakdowns

**Console output in debug mode:**
```
[MCP] Calling abap-analyzer.analyzeCode...
[MCP] Params: {
  code: "REPORT z_sales_order.\n\nDATA: lv_order TYPE vbeln...",
  options: {
    extractBusinessLogic: true,
    identifyDependencies: true
  }
}
[MCP] 2024-01-15T10:30:45.123Z | abap-analyzer.analyzeCode | ✅ SUCCESS | 2340ms
[MCP] Response: {
  businessLogic: [
    "Pricing calculation using KONV table",
    "Credit limit check against KNA1",
    "Availability check via ATP_CHECK"
  ],
  tables: ["VBAK", "VBAP", "KNA1", "KONV"],
  dependencies: ["BAPI_SALESORDER_CREATEFROMDAT2"],
  metadata: {
    module: "SD",
    complexity: 6,
    linesOfCode: 95
  }
}
```

---

## Benefits

### 1. Complete Visibility
- See every MCP interaction
- Track performance over time
- Identify bottlenecks

### 2. Debugging
- Reproduce issues with exact parameters
- See what data was sent/received
- Trace errors to specific MCP calls

### 3. Monitoring
- Track MCP server health
- Monitor response times
- Alert on failures

### 4. Auditing
- Complete audit trail
- Who called what, when
- Compliance and security

### 5. Optimization
- Identify slow MCP calls
- Optimize parameters
- Cache frequently-used results

---

## Example Workflow Logs

### Complete Resurrection with MCP Logs

```
[HybridWorkflow] Starting workflow for resurrection abc-123
[HybridWorkflow] Step 1: ANALYZE - Using MCP Servers
[HybridWorkflow] Initializing MCP connections...
[UnifiedMCPClient] ✅ All MCP servers initialized successfully

[MCP] Calling abap-analyzer.analyzeCode...
[MCP] 2024-01-15T10:30:45.123Z | abap-analyzer.analyzeCode | ✅ SUCCESS | 2340ms
[HybridWorkflow] ✅ ABAP Analyzer MCP analysis complete
[HybridWorkflow]   - Tables: 4
[HybridWorkflow]   - Business Logic: 5 patterns
[HybridWorkflow]   - Complexity: 6

[MCP] Calling sap-cap.search_docs...
[MCP] 2024-01-15T10:30:48.456Z | sap-cap.search_docs | ✅ SUCCESS | 850ms
[HybridWorkflow] ✅ Found 10 CAP documentation results

[HybridWorkflow] Step 2: PLAN
[HybridWorkflow] Step 3: GENERATE - Using REAL CAP CLI

[MCP] Calling sap-ui5.create_ui5_app...
[MCP] 2024-01-15T10:32:10.789Z | sap-ui5.create_ui5_app | ✅ SUCCESS | 15200ms
[HybridWorkflow] ✅ UI5 Fiori app created successfully

[HybridWorkflow] Step 4: VALIDATE
[HybridWorkflow] Step 5: DEPLOY
[HybridWorkflow] Workflow completed successfully

[HybridWorkflow] Disconnecting MCP clients...
[UnifiedMCPClient] ✅ Disconnected from all MCP servers
```

**Database contains:**
- 3 MCP log entries (analyzeCode, search_docs, create_ui5_app)
- 3 transformation log entries (MCP_ABAP_ANALYZER, MCP_SAP_CAP, MCP_SAP_UI5)
- Complete timing and parameter data

---

## Status

✅ **MCP Logging Complete**

- All MCP calls are logged with timing
- Logs stored in both MCPLog table and TransformationLog
- Console output shows MCP operations
- Debug mode available for detailed logging
- Automatic data sanitization and truncation
- Query and export capabilities
- Log archival for old data

**Every MCP interaction is now fully visible, traceable, and auditable!**
