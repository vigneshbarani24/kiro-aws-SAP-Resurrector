# 🚨 Quick Fix: GitHub 403 Error

## The Problem
```
🔴 GitHub API error: 403 - Resource not accessible by personal access token
```

## The Solution (2 minutes)

### Step 1: Create GitHub Token
Visit: **https://github.com/settings/tokens/new**

### Step 2: Configure Token
- **Note:** `Resurrection Platform`
- **Expiration:** `90 days`
- **Scopes:** ✅ Check **`repo`** (Full control of private repositories)

### Step 3: Generate & Copy
Click "Generate token" → Copy the token (starts with `ghp_`)

### Step 4: Add to .env.local
Create or edit `resurrection-platform/.env.local`:

```bash
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 5: Restart
```bash
# Stop the dev server (Ctrl+C)
npm run dev
```

## Done! ✅

Your next resurrection will automatically create a GitHub repository.

---

## Alternative: Skip GitHub

Don't want GitHub integration? Just leave `GITHUB_TOKEN` empty.

Resurrections will save locally to:
```
resurrection-platform/temp/resurrections/
```

---

## Still Not Working?

See detailed guide: `GITHUB_TOKEN_FIX.md`
