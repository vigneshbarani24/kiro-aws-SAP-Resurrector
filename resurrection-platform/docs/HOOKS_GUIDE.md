# Kiro Hooks Guide

## Overview

Kiro Hooks provide automated workflows for resurrection lifecycle events. Hooks can trigger Slack notifications, GitHub actions, quality validations, and more.

## Hook Triggers

Available triggers for resurrection lifecycle:

| Trigger | When It Fires | Use Cases |
|---------|---------------|-----------|
| `resurrection.started` | Resurrection workflow begins | Team notifications, logging |
| `resurrection.completed` | Resurrection workflow completes | Quality validation, celebrations |
| `resurrection.failed` | Resurrection workflow fails | Error alerts, issue creation |
| `quality.validation.passed` | Quality checks pass | Success notifications, proceed to deploy |
| `quality.validation.failed` | Quality checks fail | Alert team, create GitHub issues |
| `github.repository.created` | GitHub repo is created | Setup CI/CD, configure webhooks |
| `deployment.succeeded` | Deployment to BTP succeeds | Celebrations, create releases |
| `deployment.failed` | Deployment to BTP fails | Error alerts, rollback triggers |

## Hook Actions

Hooks can perform three types of actions:

### 1. MCP Call
Call an MCP server (Slack, GitHub, etc.)

```json
{
  "type": "mcp-call",
  "server": "slack",
  "method": "postMessage",
  "params": {
    "channel": "#resurrections",
    "text": "🚀 Resurrection started: {{resurrection.name}}"
  }
}
```

### 2. Agent Execution
Trigger a Kiro agent task

```json
{
  "type": "agent-execution",
  "message": "Validate quality for resurrection {{resurrection.id}}"
}
```

### 3. Shell Command
Execute a shell command

```json
{
  "type": "shell-command",
  "command": "npm run validate-cap {{resurrection.githubRepo}}"
}
```

## Template Variables

Use template variables in hook actions to access context data:

| Variable | Description | Example |
|----------|-------------|---------|
| `{{resurrection.id}}` | Resurrection ID | `abc-123-def` |
| `{{resurrection.name}}` | Resurrection name | `sd-pricing-logic` |
| `{{resurrection.githubUrl}}` | GitHub repository URL | `https://github.com/...` |
| `{{resurrection.githubRepo}}` | GitHub repo name | `resurrection-sd-pricing` |
| `{{resurrection.basUrl}}` | SAP BAS deep link | `https://bas.eu10...` |
| `{{resurrection.module}}` | SAP module | `SD`, `MM`, `FI` |
| `{{resurrection.locSaved}}` | Lines of code saved | `1200` |
| `{{resurrection.qualityScore}}` | Quality score | `95` |
| `{{deployment.url}}` | Deployment URL | `https://app.cfapps...` |
| `{{validation.errors}}` | Validation errors | Array of errors |

## Managing Hooks

### Via UI

1. Navigate to `/hooks` page
2. View all configured hooks
3. Enable/disable hooks with toggle
4. Edit hook configuration
5. Create new custom hooks
6. Delete hooks

### Via API

```bash
# List all hooks
GET /api/hooks

# Get specific hook
GET /api/hooks/:id

# Create hook
POST /api/hooks
{
  "id": "my-custom-hook",
  "name": "My Custom Hook",
  "trigger": "resurrection.completed",
  "enabled": true,
  "actions": [...]
}

# Update hook
PATCH /api/hooks/:id
{
  "enabled": false
}

# Delete hook
DELETE /api/hooks/:id

# Manually trigger hook
POST /api/hooks/:id/trigger
{
  "resurrectionId": "abc-123",
  "resurrection": {...}
}
```

### Via Configuration File

Edit `.kiro/hooks/resurrection-hooks.json`:

```json
{
  "hooks": [
    {
      "id": "my-hook",
      "name": "My Custom Hook",
      "trigger": "resurrection.completed",
      "enabled": true,
      "actions": [
        {
          "type": "mcp-call",
          "server": "slack",
          "method": "postMessage",
          "params": {
            "channel": "#my-channel",
            "text": "Custom message"
          }
        }
      ]
    }
  ]
}
```

## Default Hooks

The platform comes with 6 pre-configured hooks:

### 1. on-resurrection-start
- **Trigger**: `resurrection.started`
- **Action**: Send Slack notification
- **Purpose**: Notify team when resurrection begins

### 2. on-resurrection-complete
- **Trigger**: `resurrection.completed`
- **Action**: Run quality validation
- **Purpose**: Ensure CAP project meets quality standards

### 3. on-quality-validation-passed
- **Trigger**: `quality.validation.passed`
- **Action**: Send success notification
- **Purpose**: Celebrate quality success

### 4. on-quality-failure
- **Trigger**: `quality.validation.failed`
- **Actions**:
  - Send Slack alert
  - Create GitHub issue
- **Purpose**: Alert team and track quality issues

### 5. on-deployment-success
- **Trigger**: `deployment.succeeded`
- **Actions**:
  - Send Slack celebration
  - Create GitHub release
- **Purpose**: Celebrate successful deployment

### 6. setup-ci-cd
- **Trigger**: `github.repository.created`
- **Action**: Create GitHub Actions workflow
- **Purpose**: Automate CI/CD setup

## Quality Validation

The quality validation hook performs 7 checks:

1. **CDS Syntax**: Validates CDS model syntax
2. **CAP Structure**: Ensures db/, srv/, app/ folders exist
3. **Clean Core Compliance**: Checks for SAP best practices
4. **Package.json**: Validates dependencies (@sap/cds, @sap/xssec)
5. **MTA Configuration**: Validates mta.yaml structure
6. **Security Configuration**: Validates xs-security.json
7. **Documentation**: Checks README completeness

Quality score: 0-100% based on passed checks.

## CI/CD Templates

Available GitHub Actions workflow templates:

### 1. ci.yml
Basic CI workflow:
- Build CAP project
- Run tests
- Lint code
- Validate CDS models

### 2. cd.yml
Deployment workflow:
- Build MTA
- Deploy to SAP BTP
- Cloud Foundry integration

### 3. quality.yml
Quality checks workflow:
- ESLint
- Prettier
- Security audit
- CDS validation

### 4. complete.yml (Recommended)
Combined CI/CD pipeline:
- Build, test, quality checks
- Deploy to SAP BTP on main branch
- Halloween-themed with emoji indicators

## Hook Execution History

View hook execution history:

```bash
GET /api/resurrections/:id/hooks/executions
```

Returns:
- Hook name and trigger
- Execution status (completed, failed, running)
- Duration in milliseconds
- Execution logs
- Timestamp

## Best Practices

1. **Start with defaults**: Use pre-configured hooks as templates
2. **Test hooks**: Use manual trigger API to test before enabling
3. **Monitor executions**: Check execution history for failures
4. **Use template variables**: Make hooks reusable across resurrections
5. **Keep actions simple**: One hook = one responsibility
6. **Handle failures gracefully**: Don't block workflow on hook failures
7. **Log everything**: Execution logs help debug issues

## Troubleshooting

### Hook not triggering
- Check if hook is enabled
- Verify trigger matches lifecycle event
- Check hook execution history for errors

### MCP call failing
- Verify MCP server is configured and running
- Check MCP server health: `GET /api/mcp/servers`
- Verify credentials (Slack token, GitHub token)

### Template variables not working
- Ensure variable exists in context
- Check spelling and case sensitivity
- Use `{{resurrection.id}}` not `{{id}}`

### Quality validation failing
- Review quality report in execution logs
- Check specific failed checks
- Follow recommendations to fix issues

## Examples

### Custom Slack Notification

```json
{
  "id": "custom-slack",
  "name": "Custom Slack Notification",
  "trigger": "resurrection.completed",
  "enabled": true,
  "actions": [
    {
      "type": "mcp-call",
      "server": "slack",
      "method": "postMessage",
      "params": {
        "channel": "#my-team",
        "text": "🎉 {{resurrection.name}} is ready!\n📊 Quality: {{resurrection.qualityScore}}%\n🔗 GitHub: {{resurrection.githubUrl}}"
      }
    }
  ]
}
```

### Auto-create GitHub Issue on Failure

```json
{
  "id": "github-issue-on-fail",
  "name": "Create Issue on Failure",
  "trigger": "resurrection.failed",
  "enabled": true,
  "actions": [
    {
      "type": "mcp-call",
      "server": "github",
      "method": "createIssue",
      "params": {
        "repo": "{{resurrection.githubRepo}}",
        "title": "🔴 Resurrection Failed: {{resurrection.name}}",
        "body": "Resurrection workflow failed. Please investigate.\n\nError: {{error.message}}",
        "labels": ["bug", "resurrection-failure"],
        "assignees": ["{{resurrection.owner}}"]
      }
    }
  ]
}
```

### Run Custom Validation Script

```json
{
  "id": "custom-validation",
  "name": "Run Custom Validation",
  "trigger": "quality.validation.passed",
  "enabled": true,
  "actions": [
    {
      "type": "shell-command",
      "command": "cd {{resurrection.githubRepo}} && npm run custom-validate"
    }
  ]
}
```

## Integration with Workflow

Hooks are automatically triggered by the ResurrectionWorkflow:

```typescript
// Workflow triggers hooks at key points
await hookManager.trigger('resurrection.started', { resurrectionId, resurrection });
await hookManager.trigger('resurrection.completed', { resurrectionId, resurrection, capProject });
await hookManager.trigger('quality.validation.passed', { resurrectionId, resurrection, validation });
await hookManager.trigger('github.repository.created', { resurrectionId, resurrection, githubRepo });
```

No manual integration needed - hooks work automatically!

---

**For more information, see the [Hook Manager source code](../lib/hooks/hook-manager.ts) or visit the Hooks UI at `/hooks`.**
