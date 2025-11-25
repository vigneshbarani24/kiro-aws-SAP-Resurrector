# MCP Quick Start Guide 🚀

## TL;DR - Get MCP Servers Running

### Already Working ✅
- ABAP Analyzer MCP
- SAP CAP Generator MCP  
- SAP UI5 Generator MCP

### Need Setup 🔧

#### GitHub MCP (5 minutes)

1. **Install uvx:**
   ```bash
   # macOS/Linux
   curl -LsSf https://astral.sh/uv/install.sh | sh
   
   # Windows
   powershell -c "irm https://astral.sh/uv/install.ps1 | iex"
   ```

2. **Get GitHub Token:**
   - Visit: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Select: `repo`, `workflow`, `admin:org`
   - Copy token

3. **Add to .env:**
   ```bash
   GITHUB_TOKEN="ghp_xxxxxxxxxxxxx"
   ```

#### Slack MCP (10 minutes)

1. **Create Slack App:**
   - Visit: https://api.slack.com/apps
   - Click "Create New App" → "From scratch"
   - Name: "Resurrection Platform"

2. **Add Scopes:**
   - Go to "OAuth & Permissions"
   - Add: `chat:write`, `chat:write.public`, `files:write`, `channels:read`, `users:read`

3. **Install & Get Token:**
   - Click "Install to Workspace"
   - Copy "Bot User OAuth Token" (starts with `xoxb-`)
   - Get Team ID from workspace settings

4. **Add to .env:**
   ```bash
   SLACK_BOT_TOKEN="xoxb-xxxxxxxxxxxxx"
   SLACK_TEAM_ID="T01234567"
   ```

5. **Invite bot to channels:**
   ```
   /invite @Resurrection Platform
   ```

### Verify Setup

1. Restart Kiro
2. Open MCP Server view
3. Check all 5 servers show 🟢 Connected

### Test It

Try asking Kiro:
- "Parse this ABAP code using the ABAP Analyzer"
- "Generate a CAP service for this data model"
- "Create a GitHub repository for this project"
- "Send a Slack message to #resurrections"

## Full Documentation

See `.kiro/settings/MCP_CONFIGURATION.md` for complete setup guide.

## Need Help?

Check the troubleshooting section in `MCP_CONFIGURATION.md`
