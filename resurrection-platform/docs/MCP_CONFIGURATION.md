# MCP Server Configuration Guide

This guide explains how to configure and use the Model Context Protocol (MCP) servers required by the Resurrection Platform.

## Overview

The Resurrection Platform uses 4 MCP servers for intelligent ABAP transformation:

1. **ABAP Analyzer MCP** - Parses and analyzes ABAP code
2. **SAP CAP Generator MCP** - Generates CDS models and CAP services
3. **SAP UI5 Generator MCP** - Generates Fiori Elements UI
4. **GitHub MCP** - Automates GitHub repository operations

## Configuration File

MCP servers are configured in `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "abap-analyzer": {
      "command": "node",
      "args": ["./mcp-servers/abap-analyzer/index.js"],
      "env": {
        "SAP_DOMAIN_KNOWLEDGE": "enabled",
        "LOG_LEVEL": "info"
      },
      "disabled": false,
      "autoApprove": ["analyzeCode", "extractBusinessLogic"]
    },
    "sap-cap-generator": {
      "command": "node",
      "args": ["./mcp-servers/sap-cap-generator/index.js"],
      "env": {
        "CAP_VERSION": "7.0",
        "LOG_LEVEL": "info"
      },
      "disabled": false,
      "autoApprove": ["generateCDSModels", "generateServiceDefinitions"]
    },
    "sap-ui5-generator": {
      "command": "node",
      "args": ["./mcp-servers/sap-ui5-generator/index.js"],
      "env": {
        "UI5_VERSION": "1.120",
        "LOG_LEVEL": "info"
      },
      "disabled": false,
      "autoApprove": ["generateFioriElements"]
    },
    "github": {
      "command": "uvx",
      "args": ["mcp-server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}",
        "LOG_LEVEL": "info"
      },
      "disabled": false,
      "autoApprove": ["createRepository", "createOrUpdateFiles"]
    }
  }
}
```

## Server Details

### 1. ABAP Analyzer MCP

**Purpose:** Parse and analyze legacy ABAP code with SAP domain knowledge.

**Capabilities:**
- Syntax parsing and validation
- Business logic extraction
- Dependency analysis
- SAP pattern recognition (pricing, authorization, number ranges)
- Table usage identification

**Configuration:**

```json
{
  "abap-analyzer": {
    "command": "node",
    "args": ["./mcp-servers/abap-analyzer/index.js"],
    "env": {
      "SAP_DOMAIN_KNOWLEDGE": "enabled",
      "PARSE_TIMEOUT": "30000",
      "MAX_FILE_SIZE": "10485760",
      "LOG_LEVEL": "info"
    }
  }
}
```

**Environment Variables:**
- `SAP_DOMAIN_KNOWLEDGE` - Enable SAP-specific pattern recognition (default: "enabled")
- `PARSE_TIMEOUT` - Maximum parsing time in milliseconds (default: 30000)
- `MAX_FILE_SIZE` - Maximum ABAP file size in bytes (default: 10MB)
- `LOG_LEVEL` - Logging level: "debug", "info", "warn", "error" (default: "info")

**API Methods:**

```typescript
// Analyze ABAP code
await mcpClient.call('abap-analyzer', 'analyzeCode', {
  code: abapCode,
  context: {
    module: 'SD',
    extractBusinessLogic: true,
    identifyDependencies: true
  }
});

// Extract business logic only
await mcpClient.call('abap-analyzer', 'extractBusinessLogic', {
  code: abapCode
});

// Find dependencies
await mcpClient.call('abap-analyzer', 'findDependencies', {
  code: abapCode
});

// Identify SAP patterns
await mcpClient.call('abap-analyzer', 'identifySAPPatterns', {
  code: abapCode
});
```

### 2. SAP CAP Generator MCP

**Purpose:** Generate modern CAP applications from ABAP business logic.

**Capabilities:**
- CDS model generation from ABAP structures
- Service definition creation
- Event handler implementation
- Clean Core compliance validation

**Configuration:**

```json
{
  "sap-cap-generator": {
    "command": "node",
    "args": ["./mcp-servers/sap-cap-generator/index.js"],
    "env": {
      "CAP_VERSION": "7.0",
      "NODE_VERSION": "18",
      "CLEAN_CORE_MODE": "strict",
      "LOG_LEVEL": "info"
    }
  }
}
```

**Environment Variables:**
- `CAP_VERSION` - Target CAP version (default: "7.0")
- `NODE_VERSION` - Target Node.js version (default: "18")
- `CLEAN_CORE_MODE` - Clean Core validation: "strict", "lenient", "off" (default: "strict")
- `LOG_LEVEL` - Logging level (default: "info")

**API Methods:**

```typescript
// Generate CDS models
await mcpClient.call('sap-cap-generator', 'generateCDSModels', {
  businessLogic: analysisResult.businessLogic,
  entities: ['SalesOrder', 'Customer', 'Product']
});

// Generate service definitions
await mcpClient.call('sap-cap-generator', 'generateServiceDefinitions', {
  models: cdsModels,
  serviceName: 'SalesOrderService'
});

// Generate handlers
await mcpClient.call('sap-cap-generator', 'generateHandlers', {
  services: serviceDefinitions,
  language: 'javascript'
});

// Validate Clean Core compliance
await mcpClient.call('sap-cap-generator', 'validateCleanCore', {
  capProject: generatedProject
});
```

### 3. SAP UI5 Generator MCP

**Purpose:** Generate Fiori Elements and Freestyle UI5 applications.

**Capabilities:**
- Fiori Elements annotations
- UI5 component scaffolding
- Manifest.json generation
- Responsive design patterns

**Configuration:**

```json
{
  "sap-ui5-generator": {
    "command": "node",
    "args": ["./mcp-servers/sap-ui5-generator/index.js"],
    "env": {
      "UI5_VERSION": "1.120",
      "UI5_THEME": "sap_horizon",
      "FIORI_TEMPLATE": "list-report",
      "LOG_LEVEL": "info"
    }
  }
}
```

**Environment Variables:**
- `UI5_VERSION` - Target UI5 version (default: "1.120")
- `UI5_THEME` - UI5 theme: "sap_horizon", "sap_fiori_3" (default: "sap_horizon")
- `FIORI_TEMPLATE` - Default Fiori template: "list-report", "worklist", "analytical" (default: "list-report")
- `LOG_LEVEL` - Logging level (default: "info")

**API Methods:**

```typescript
// Generate Fiori Elements app
await mcpClient.call('sap-ui5-generator', 'generateFioriElements', {
  service: serviceDefinition,
  template: 'list-report',
  entity: 'SalesOrder'
});

// Generate Freestyle UI5 app
await mcpClient.call('sap-ui5-generator', 'generateFreestyleUI5', {
  requirements: uiRequirements,
  components: ['Table', 'Form', 'Chart']
});

// Generate manifest.json
await mcpClient.call('sap-ui5-generator', 'generateManifest', {
  appConfig: {
    id: 'com.example.salesorder',
    title: 'Sales Order Management',
    description: 'Manage sales orders'
  }
});
```

### 4. GitHub MCP

**Purpose:** Automate GitHub repository management.

**Capabilities:**
- Repository creation with templates
- File commits and pushes
- Branch management
- Issue and PR creation
- GitHub Actions workflow setup

**Configuration:**

```json
{
  "github": {
    "command": "uvx",
    "args": ["mcp-server-github"],
    "env": {
      "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}",
      "GITHUB_ORG": "your-org",
      "DEFAULT_BRANCH": "main",
      "LOG_LEVEL": "info"
    }
  }
}
```

**Environment Variables:**
- `GITHUB_PERSONAL_ACCESS_TOKEN` - GitHub PAT with repo permissions (required)
- `GITHUB_ORG` - Default GitHub organization (optional)
- `DEFAULT_BRANCH` - Default branch name (default: "main")
- `LOG_LEVEL` - Logging level (default: "info")

**Required GitHub Token Scopes:**
- `repo` - Full control of private repositories
- `workflow` - Update GitHub Action workflows
- `admin:org` - Read and write org and team membership (if using organizations)

**API Methods:**

```typescript
// Create repository
await mcpClient.call('github', 'createRepository', {
  name: 'resurrection-sales-order',
  description: 'Resurrected from ABAP',
  private: false,
  auto_init: true
});

// Create or update files
await mcpClient.call('github', 'createOrUpdateFiles', {
  repo: 'resurrection-sales-order',
  files: [
    { path: 'package.json', content: packageJsonContent },
    { path: 'db/schema.cds', content: cdsContent }
  ],
  message: '🔄 Resurrection: ABAP to CAP transformation complete'
});

// Add topics
await mcpClient.call('github', 'addTopics', {
  repo: 'resurrection-sales-order',
  topics: ['sap-cap', 'abap-resurrection', 'clean-core']
});

// Create workflow
await mcpClient.call('github', 'createWorkflow', {
  repo: 'resurrection-sales-order',
  workflow: ciWorkflowYaml
});
```

## Setup Instructions

### 1. Install Prerequisites

**For Node.js-based MCP servers:**
```bash
# Install Node.js 18+
node --version  # Should be 18.0.0 or higher
```

**For GitHub MCP (uses uvx):**
```bash
# Install uv (Python package manager)
# macOS/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows:
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify installation
uvx --version
```

### 2. Create Configuration File

Create `.kiro/settings/mcp.json` in your project root:

```bash
mkdir -p .kiro/settings
touch .kiro/settings/mcp.json
```

Copy the configuration template from above and customize for your environment.

### 3. Set Environment Variables

Create `.env.local` with required tokens:

```env
# GitHub Token (required for GitHub MCP)
GITHUB_TOKEN=ghp_your_github_personal_access_token

# OpenAI API Key (required for LLM planning)
OPENAI_API_KEY=sk-your_openai_api_key

# Optional: Slack (for notifications)
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
SLACK_TEAM_ID=T1234567890
```

### 4. Test MCP Servers

Test each MCP server individually:

```bash
# Test ABAP Analyzer
node mcp-servers/abap-analyzer/index.js --test

# Test CAP Generator
node mcp-servers/sap-cap-generator/index.js --test

# Test UI5 Generator
node mcp-servers/sap-ui5-generator/index.js --test

# Test GitHub MCP
uvx mcp-server-github --test
```

### 5. Verify Platform Integration

Start the platform and check MCP server status:

```bash
npm run dev
```

Navigate to: `http://localhost:3000/api/mcp/servers`

You should see all 4 servers with status "connected".

## Troubleshooting

### MCP Server Not Starting

**Problem:** Server fails to start or shows "disconnected" status.

**Solutions:**
1. Check that the command path is correct
2. Verify environment variables are set
3. Check server logs: `tail -f logs/mcp-{server-name}.log`
4. Ensure required dependencies are installed

### GitHub MCP Authentication Failed

**Problem:** GitHub MCP returns 401 Unauthorized.

**Solutions:**
1. Verify `GITHUB_TOKEN` is set correctly in `.env.local`
2. Check token has required scopes (repo, workflow)
3. Test token manually:
   ```bash
   curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
   ```

### ABAP Analyzer Timeout

**Problem:** ABAP parsing takes too long or times out.

**Solutions:**
1. Increase `PARSE_TIMEOUT` in MCP configuration
2. Split large ABAP files into smaller chunks
3. Check for infinite loops in ABAP code
4. Increase server memory: `NODE_OPTIONS=--max-old-space-size=4096`

### CAP Generator Clean Core Validation Fails

**Problem:** Generated CAP code fails Clean Core validation.

**Solutions:**
1. Review ABAP code for standard modifications
2. Check for use of deprecated APIs
3. Set `CLEAN_CORE_MODE=lenient` for testing
4. Review validation errors in logs

## Advanced Configuration

### Custom MCP Server

You can add custom MCP servers to extend functionality:

```json
{
  "mcpServers": {
    "custom-validator": {
      "command": "node",
      "args": ["./custom-mcp/validator.js"],
      "env": {
        "VALIDATION_RULES": "./rules.json"
      },
      "disabled": false,
      "autoApprove": ["validateCode"]
    }
  }
}
```

### Load Balancing

For high-volume deployments, run multiple instances:

```json
{
  "mcpServers": {
    "abap-analyzer-1": {
      "command": "node",
      "args": ["./mcp-servers/abap-analyzer/index.js"],
      "env": { "INSTANCE_ID": "1" }
    },
    "abap-analyzer-2": {
      "command": "node",
      "args": ["./mcp-servers/abap-analyzer/index.js"],
      "env": { "INSTANCE_ID": "2" }
    }
  }
}
```

### Health Checks

Configure health check intervals:

```json
{
  "mcpServers": {
    "abap-analyzer": {
      "command": "node",
      "args": ["./mcp-servers/abap-analyzer/index.js"],
      "healthCheck": {
        "enabled": true,
        "interval": 30000,
        "timeout": 5000,
        "retries": 3
      }
    }
  }
}
```

## Monitoring

### View MCP Server Logs

```bash
# All servers
tail -f logs/mcp-*.log

# Specific server
tail -f logs/mcp-abap-analyzer.log
```

### Check Server Status

```bash
# Via API
curl http://localhost:3000/api/mcp/servers

# Via CLI
npm run mcp:status
```

### Performance Metrics

```bash
# View metrics dashboard
npm run mcp:metrics

# Export metrics
npm run mcp:metrics -- --export metrics.json
```

## Security Best Practices

1. **Never commit tokens** - Use environment variables
2. **Rotate tokens regularly** - Update GitHub PAT every 90 days
3. **Use least privilege** - Grant minimum required scopes
4. **Enable audit logging** - Track all MCP calls
5. **Secure MCP config** - Restrict file permissions: `chmod 600 .kiro/settings/mcp.json`

## Support

For MCP server issues:
- 📧 Email: mcp-support@resurrection-platform.dev
- 💬 Discord: #mcp-help channel
- 📚 Docs: https://docs.resurrection-platform.dev/mcp

## References

- [Model Context Protocol Specification](https://modelcontextprotocol.io/)
- [GitHub MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/github)
- [SAP CAP Documentation](https://cap.cloud.sap/)
- [SAP UI5 Documentation](https://ui5.sap.com/)
