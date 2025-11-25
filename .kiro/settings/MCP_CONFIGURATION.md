# MCP Server Configuration Guide

This document explains the MCP (Model Context Protocol) server configuration for the Resurrection Platform.

## Overview

The platform uses 5 MCP servers for specialized AI capabilities:

1. **ABAP Analyzer** - Parse and analyze legacy ABAP code
2. **SAP CAP Generator** - Generate modern CAP applications
3. **SAP UI5 Generator** - Generate Fiori UIs
4. **GitHub** - Automate repository management
5. **Slack** - Send team notifications

## Configuration File

Location: `.kiro/settings/mcp.json`

## MCP Servers

### 1. ABAP Analyzer MCP

**Purpose:** Parse and analyze legacy ABAP code with SAP domain knowledge

**Command:** `python3 .kiro/mcp/abap-analyzer.py`

**Capabilities:**
- Parse ABAP syntax
- Extract business logic
- Identify dependencies
- Detect SAP patterns (pricing, authorization, number ranges)
- Analyze table usage

**Auto-approved Tools:**
- `parse_abap` - Parse ABAP code structure
- `detect_sap_patterns` - Identify SAP-specific patterns
- `extract_data_model` - Extract data model from ABAP

**Environment Variables:**
- `PYTHONUNBUFFERED=1` - Ensure real-time output

---

### 2. SAP CAP Generator MCP

**Purpose:** Generate modern SAP CAP applications from business logic

**Command:** `npx -y @cap-js/mcp-server`

**Capabilities:**
- Generate CDS models from ABAP structures
- Create service definitions
- Generate event handlers
- Validate Clean Core compliance

**Auto-approved Tools:**
- `cap_lookup_pattern` - Look up CAP patterns
- `cap_validate_cds` - Validate CDS syntax
- `cap_get_service_template` - Get service templates

**Environment Variables:**
- `NODE_ENV=production` - Production mode

---

### 3. SAP UI5 Generator MCP

**Purpose:** Generate Fiori Elements and Freestyle UI5 applications

**Command:** `npx -y @ui5/mcp-server`

**Capabilities:**
- Generate Fiori Elements annotations
- Create UI5 component scaffolding
- Generate manifest.json
- Apply responsive design patterns

**Auto-approved Tools:**
- `ui5_get_component` - Get UI5 component templates
- `ui5_lookup_control` - Look up UI5 controls
- `ui5_generate_view` - Generate UI5 views

**Environment Variables:**
- `NODE_ENV=production` - Production mode

---

### 4. GitHub MCP

**Purpose:** Automate GitHub repository management

**Command:** `uvx mcp-server-github`

**Prerequisites:**
- Install `uv` and `uvx`: https://docs.astral.sh/uv/getting-started/installation/
- Generate GitHub Personal Access Token with repo permissions

**Capabilities:**
- Create repositories with templates
- Commit and push files
- Create issues and PRs
- Set up GitHub Actions workflows
- Add repository topics
- Manage branches

**Auto-approved Tools:**
- `create_repository` - Create new GitHub repository
- `create_or_update_file` - Create or update files in repo
- `push_files` - Push multiple files at once
- `create_issue` - Create GitHub issue
- `add_repository_topics` - Add topics to repository

**Environment Variables:**
- `GITHUB_PERSONAL_ACCESS_TOKEN` - GitHub PAT with repo permissions

**Setup Instructions:**

1. **Generate GitHub Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select scopes: `repo`, `workflow`, `admin:org`
   - Copy the token

2. **Add to environment:**
   ```bash
   # In resurrection-platform/.env
   GITHUB_TOKEN="ghp_your_token_here"
   ```

3. **Test the connection:**
   ```bash
   # The MCP server will auto-connect when Kiro starts
   # Check MCP Server view in Kiro to verify status
   ```

---

### 5. Slack MCP

**Purpose:** Send team notifications and enable collaboration

**Command:** `npx -y @modelcontextprotocol/server-slack`

**Prerequisites:**
- Create Slack App: https://api.slack.com/apps
- Install app to workspace
- Get Bot Token and Team ID

**Capabilities:**
- Post messages to channels
- Send direct messages
- Create threaded conversations
- Upload files
- Interactive message buttons
- User mentions

**Auto-approved Tools:**
- `post_message` - Post message to channel
- `post_message_with_attachments` - Post rich message with attachments
- `create_thread` - Reply in thread
- `upload_file` - Upload file to channel

**Environment Variables:**
- `SLACK_BOT_TOKEN` - Slack Bot User OAuth Token
- `SLACK_TEAM_ID` - Slack Team/Workspace ID

**Setup Instructions:**

1. **Create Slack App:**
   - Go to: https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: "Resurrection Platform"
   - Select your workspace

2. **Configure Bot Token Scopes:**
   - Go to "OAuth & Permissions"
   - Add Bot Token Scopes:
     - `chat:write` - Send messages
     - `chat:write.public` - Send to public channels
     - `files:write` - Upload files
     - `channels:read` - List channels
     - `users:read` - Read user info

3. **Install App to Workspace:**
   - Click "Install to Workspace"
   - Authorize the app
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)

4. **Get Team ID:**
   - Go to workspace settings
   - Team ID is in the URL or workspace settings

5. **Add to environment:**
   ```bash
   # In resurrection-platform/.env
   SLACK_BOT_TOKEN="xoxb-your-token-here"
   SLACK_TEAM_ID="T01234567"
   ```

6. **Invite bot to channels:**
   ```
   /invite @Resurrection Platform
   ```
   Do this for channels you want to send notifications to (e.g., #resurrections)

---

## Environment Variables Reference

All environment variables should be set in `resurrection-platform/.env`:

```bash
# GitHub MCP
GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"

# Slack MCP
SLACK_BOT_TOKEN="xoxb-xxxxxxxxxxxxx"
SLACK_TEAM_ID="T01234567"
```

**Security Notes:**
- Never commit `.env` file to Git
- Use `.env.example` for documentation
- Rotate tokens regularly
- Use minimal required permissions

---

## Testing MCP Servers

### Test ABAP Analyzer
```bash
# The MCP server should auto-start when Kiro loads
# Check the MCP Server view in Kiro to see status
```

### Test SAP CAP Generator
```bash
# Auto-starts via npx when needed
# No manual installation required
```

### Test SAP UI5 Generator
```bash
# Auto-starts via npx when needed
# No manual installation required
```

### Test GitHub MCP
```bash
# Requires uv/uvx to be installed
# Install: https://docs.astral.sh/uv/getting-started/installation/

# On macOS/Linux:
curl -LsSf https://astral.sh/uv/install.sh | sh

# On Windows:
powershell -c "irm https://astral.sh/uv/install.ps1 | iex"

# Verify installation:
uvx --version
```

### Test Slack MCP
```bash
# Auto-starts via npx when needed
# Verify bot is in channels:
# 1. Go to Slack
# 2. Type: /invite @Resurrection Platform
# 3. Check bot appears in channel members
```

---

## Troubleshooting

### GitHub MCP Issues

**Error: "uvx: command not found"**
- Install uv: https://docs.astral.sh/uv/getting-started/installation/
- Restart terminal after installation

**Error: "Bad credentials"**
- Check GITHUB_TOKEN is set correctly
- Verify token has `repo` scope
- Generate new token if expired

**Error: "Repository already exists"**
- Platform will auto-append timestamp to make unique
- Or manually delete existing repo

### Slack MCP Issues

**Error: "not_authed"**
- Check SLACK_BOT_TOKEN is correct
- Verify token starts with `xoxb-`
- Reinstall app to workspace if needed

**Error: "channel_not_found"**
- Invite bot to channel: `/invite @Resurrection Platform`
- Verify channel name is correct (include #)
- Check bot has access to channel

**Error: "missing_scope"**
- Add required scopes in Slack App settings
- Reinstall app to workspace
- Update SLACK_BOT_TOKEN

### General MCP Issues

**MCP Server shows "Disconnected"**
- Check environment variables are set
- Restart Kiro
- Check MCP Server view for error messages

**MCP Server shows "Unknown"**
- Server may be starting up
- Wait 10-20 seconds
- Check logs in MCP Server view

---

## MCP Server Status

You can check MCP server status in Kiro:

1. Open Kiro feature panel
2. Click "MCP Servers" view
3. See status of all configured servers:
   - 🟢 Connected - Server is running
   - 🔴 Disconnected - Server failed to start
   - ⚪ Unknown - Server status unknown

---

## Reconnecting MCP Servers

MCP servers automatically reconnect when:
- Configuration file changes
- Environment variables change
- Kiro restarts

To manually reconnect:
1. Open MCP Server view
2. Click "Reconnect" button next to server
3. Or restart Kiro

---

## Adding Custom MCP Servers

To add additional MCP servers:

1. Edit `.kiro/settings/mcp.json`
2. Add new server configuration:
   ```json
   {
     "mcpServers": {
       "my-custom-server": {
         "command": "node",
         "args": ["./path/to/server.js"],
         "env": {
           "API_KEY": "${MY_API_KEY}"
         },
         "disabled": false,
         "autoApprove": ["tool1", "tool2"]
       }
     }
   }
   ```
3. Add environment variables to `.env`
4. Restart Kiro or reconnect from MCP Server view

---

## Best Practices

1. **Security:**
   - Never commit tokens to Git
   - Use environment variables for secrets
   - Rotate tokens regularly
   - Use minimal required permissions

2. **Performance:**
   - Enable autoApprove for trusted tools
   - Disable unused servers with `"disabled": true`
   - Monitor MCP call logs for debugging

3. **Reliability:**
   - Test each MCP server after configuration
   - Monitor server health in MCP Server view
   - Have fallback strategies for MCP failures

4. **Development:**
   - Use separate tokens for dev/prod
   - Test MCP calls in isolation first
   - Log all MCP interactions for debugging

---

## Support

For MCP-related issues:
- Check Kiro MCP documentation
- Review MCP Server logs in Kiro
- Test individual MCP servers
- Verify environment variables
- Check network connectivity

For server-specific issues:
- **ABAP Analyzer:** Check Python installation
- **SAP CAP/UI5:** Check Node.js/npm installation
- **GitHub:** Check uv/uvx installation and token
- **Slack:** Check bot installation and permissions
