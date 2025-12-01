# GitHub Token 403 Error - Fix Guide

## Problem

GitHub deployment failing with:
```
🔴 GitHub API error: 403 - {"message":"Resource not accessible by personal access token"}
```

## Root Cause

The GitHub Personal Access Token (PAT) **does not have the required permissions** to create repositories.

### Why This Happens

1. **Missing "repo" scope** - Token doesn't have permission to create repositories
2. **Fine-grained token with wrong permissions** - New GitHub fine-grained tokens need explicit repository permissions
3. **Classic token without repo scope** - Old-style tokens need the "repo" checkbox selected

## Solution

You need to create a new GitHub Personal Access Token with the correct permissions.

### Option 1: Classic Personal Access Token (Recommended for Development)

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens/new
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Create New Token:**
   - **Note:** "Resurrection Platform - Repo Creation"
   - **Expiration:** 90 days (or your preference)
   - **Select scopes:**
     - ✅ **repo** (Full control of private repositories)
       - This includes: repo:status, repo_deployment, public_repo, repo:invite, security_events

3. **Generate Token:**
   - Click "Generate token"
   - **IMPORTANT:** Copy the token immediately (you won't see it again!)

4. **Add to .env.local:**
   ```bash
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Restart the dev server:**
   ```bash
   npm run dev
   ```

### Option 2: Fine-Grained Personal Access Token (More Secure)

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/personal-access-tokens/new
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens

2. **Create New Token:**
   - **Token name:** "Resurrection Platform"
   - **Expiration:** 90 days
   - **Repository access:** "All repositories" or "Only select repositories"
   
3. **Permissions:**
   - **Repository permissions:**
     - ✅ **Contents:** Read and write
     - ✅ **Metadata:** Read-only (automatically selected)
     - ✅ **Administration:** Read and write (needed to create repos)

4. **Generate Token:**
   - Click "Generate token"
   - Copy the token (starts with `github_pat_`)

5. **Add to .env.local:**
   ```bash
   GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

6. **Restart the dev server:**
   ```bash
   npm run dev
   ```

## Verification

After setting up your token, verify it works:

### 1. Check Token Format

Your token should look like:
- **Classic:** `ghp_` followed by 36 characters (40 total)
- **Fine-grained:** `github_pat_` followed by 82+ characters

### 2. Test Token Validation

The platform automatically validates your token when you start a resurrection. Check the console logs:

```
[HybridWorkflow] Sanitizing GitHub token...
[HybridWorkflow] Token sanitized: ghp_****
[HybridWorkflow] Validating GitHub token...
[HybridWorkflow] Token validated successfully for user: your-username
[HybridWorkflow] Token scopes: repo, ...
[HybridWorkflow] Token has required "repo" scope
```

### 3. Test Repository Creation

Try uploading an ABAP file and starting a resurrection. If successful, you'll see:

```
[HybridWorkflow] Creating GitHub repo: resurrection-xxx-xxx
[HybridWorkflow] Repo created: https://github.com/your-username/resurrection-xxx-xxx
```

## Common Issues

### Issue 1: Token Not Found

**Error:** `GITHUB_TOKEN not configured`

**Fix:**
1. Create `.env.local` file in `resurrection-platform/` directory
2. Add: `GITHUB_TOKEN=your_token_here`
3. Restart dev server

### Issue 2: Invalid Token Format

**Error:** `Token format is invalid`

**Fix:**
- Make sure you copied the entire token
- No spaces or newlines
- No quotes around the token
- Should start with `ghp_` or `github_pat_`

### Issue 3: Token Expired

**Error:** `Token is invalid or expired`

**Fix:**
- Generate a new token (old one expired)
- Update `.env.local` with new token
- Restart dev server

### Issue 4: Missing Repo Scope

**Error:** `Token missing required "repo" scope`

**Fix:**
- Delete old token
- Create new token with "repo" scope checked
- Update `.env.local`
- Restart dev server

## Alternative: Skip GitHub Deployment

If you don't want to use GitHub integration, the platform will still work:

1. **Don't set GITHUB_TOKEN** - Leave it empty or remove from `.env.local`

2. **Local-only mode** - Resurrections will be saved locally:
   ```
   resurrection-platform/temp/resurrections/resurrection-xxx-xxx/
   ```

3. **Manual GitHub upload** - You can manually create a GitHub repo and push the generated code later

## Security Best Practices

1. **Never commit tokens** - `.env.local` is in `.gitignore`
2. **Use fine-grained tokens** - More secure, limited scope
3. **Set expiration** - Tokens should expire (30-90 days)
4. **Rotate regularly** - Generate new tokens periodically
5. **Revoke unused tokens** - Delete old tokens from GitHub settings

## Testing Your Setup

### Quick Test Script

Create `test-github-token.js`:

```javascript
const token = process.env.GITHUB_TOKEN;

async function testToken() {
  if (!token) {
    console.error('❌ GITHUB_TOKEN not set');
    return;
  }

  console.log(`✅ Token found: ${token.substring(0, 4)}****`);

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github+json'
      }
    });

    if (response.ok) {
      const user = await response.json();
      console.log(`✅ Token valid for user: ${user.login}`);
      
      const scopes = response.headers.get('X-OAuth-Scopes');
      console.log(`✅ Scopes: ${scopes || 'fine-grained token'}`);
    } else {
      console.error(`❌ Token invalid: ${response.status}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testToken();
```

Run:
```bash
node test-github-token.js
```

## Platform Behavior

### With Valid Token:
- ✅ Creates GitHub repository
- ✅ Generates SAP BAS URL
- ✅ Logs GitHub activity
- ✅ Marks resurrection as COMPLETED

### Without Token or Invalid Token:
- ⚠️ Skips GitHub deployment (non-critical)
- ✅ Saves files locally
- ✅ Marks resurrection as COMPLETED
- ℹ️ GitHub URL shows local path: `file://...`

## Need Help?

1. **Check logs** - Look for `[HybridWorkflow]` messages in console
2. **Verify token** - Use test script above
3. **Check GitHub** - Visit https://github.com/settings/tokens
4. **Review permissions** - Make sure "repo" scope is selected

## Related Files

- `lib/workflow/hybrid-workflow.ts` - Workflow implementation
- `lib/github/token-validator.ts` - Token validation logic
- `.env.local` - Environment variables (create if missing)
- `.env.example` - Example environment file

## Status

This is a **configuration issue**, not a bug. The platform works correctly once the token is properly configured.

---

**Quick Fix:** Create a new GitHub token with "repo" scope and add it to `.env.local` as `GITHUB_TOKEN=your_token_here`
