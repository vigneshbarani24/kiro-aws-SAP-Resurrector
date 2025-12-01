# Workflow Not Starting - Fix Guide

## Problem

After uploading ABAP files and creating a resurrection, the workflow doesn't start automatically.

**Symptoms:**
- Resurrection created successfully (status: `analyzing`)
- Console shows: `POST /api/resurrections/{id}/start 404`
- Resurrection detail page shows "analyzing" but nothing happens
- No workflow logs appear

## Root Cause

The `/api/resurrections/[id]/start` endpoint exists but Next.js hasn't registered it properly. This can happen when:

1. **Dev server needs restart** - Route files added/modified while server running
2. **Build cache issue** - Next.js `.next` directory has stale cache
3. **Route file not detected** - Next.js hasn't picked up the dynamic route

## Solution

### Quick Fix 1: Restart Dev Server

```bash
# Stop the dev server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

### Quick Fix 2: Clear Next.js Cache

```bash
# Stop the dev server
# Delete the .next directory
rm -rf .next

# Restart
npm run dev
```

### Quick Fix 3: Manual Workflow Start

If the automatic start still doesn't work, you can manually trigger the workflow:

1. **Go to resurrection detail page:**
   ```
   http://localhost:3000/resurrections/{resurrection-id}
   ```

2. **Open browser console** (F12)

3. **Run this command:**
   ```javascript
   fetch(`/api/resurrections/{resurrection-id}/start`, {
     method: 'POST'
   }).then(r => r.json()).then(console.log)
   ```

4. **Refresh the page** to see workflow progress

### Quick Fix 4: Check Route File

Verify the route file exists:
```bash
ls -la app/api/resurrections/[id]/start/route.ts
```

Should show:
```
app/api/resurrections/[id]/start/route.ts
```

## Verification

After applying the fix, test the endpoint:

### Test 1: Check Route Registration

Visit: `http://localhost:3000/api/resurrections/test-id/start`

**Expected:** 404 with JSON error (route exists but ID not found)
```json
{
  "error": "Resurrection not found"
}
```

**Bad:** HTML 404 page (route not registered)

### Test 2: Upload and Start

1. Upload an ABAP file
2. Check console logs
3. Should see:
   ```
   POST /api/resurrections/{id}/start 202
   ```
   (202 = Accepted, workflow started)

### Test 3: Check Workflow Logs

After starting, check console for:
```
[HybridWorkflow] Starting workflow for resurrection {id}
[HybridWorkflow] Step 1: ANALYZE
[HybridWorkflow] Step 2: PLAN
...
```

## Common Issues

### Issue 1: Route Returns 404 (HTML)

**Symptom:** HTML 404 page instead of JSON error

**Cause:** Next.js hasn't registered the route

**Fix:**
```bash
# Clear cache and restart
rm -rf .next
npm run dev
```

### Issue 2: Route Returns 404 (JSON)

**Symptom:** JSON error: `"Resurrection not found"`

**Cause:** Route works, but resurrection ID is wrong

**Fix:** Check the resurrection ID in the URL

### Issue 3: Workflow Starts But Fails Immediately

**Symptom:** Status changes to `FAILED` right away

**Cause:** Missing dependencies or configuration

**Check:**
1. OpenAI API key configured?
2. CAP CLI installed? (`cds --version`)
3. Check console for error messages

### Issue 4: Workflow Hangs on "ANALYZING"

**Symptom:** Status stays on `ANALYZING` forever

**Cause:** Workflow crashed silently

**Fix:**
1. Check console logs for errors
2. Check database for transformation logs:
   ```sql
   SELECT * FROM "TransformationLog" 
   WHERE "resurrectionId" = 'your-id' 
   ORDER BY "createdAt" DESC;
   ```

## Manual Workflow Trigger

If automatic start keeps failing, you can manually trigger workflows:

### Create Manual Start Button

Add this to the resurrection detail page:

```typescript
const handleManualStart = async () => {
  try {
    const response = await fetch(`/api/resurrections/${resurrectionId}/start`, {
      method: 'POST'
    });
    
    if (response.ok) {
      alert('Workflow started!');
      window.location.reload();
    } else {
      const error = await response.json();
      alert(`Failed: ${error.message}`);
    }
  } catch (error) {
    alert(`Error: ${error.message}`);
  }
};

// Add button to UI
<Button onClick={handleManualStart}>
  🎃 Start Transformation
</Button>
```

## Debug Mode

Enable detailed logging:

### 1. Add Debug Logging to Start Endpoint

Edit `app/api/resurrections/[id]/start/route.ts`:

```typescript
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('[START ENDPOINT] Called!');
  console.log('[START ENDPOINT] Request URL:', request.url);
  
  try {
    const { id } = await params;
    console.log('[START ENDPOINT] Resurrection ID:', id);
    
    // ... rest of code
  } catch (error) {
    console.error('[START ENDPOINT] Error:', error);
    throw error;
  }
}
```

### 2. Check Console Output

After upload, you should see:
```
[START ENDPOINT] Called!
[START ENDPOINT] Request URL: http://localhost:3000/api/resurrections/xxx/start
[START ENDPOINT] Resurrection ID: xxx
```

If you don't see these logs, the route isn't being called.

## Alternative: Use Different Workflow

If the hybrid workflow keeps failing, you can switch to a simpler workflow:

### Edit Upload Page

Change `app/upload/page.tsx`:

```typescript
// Instead of calling /start endpoint, use direct workflow
import { SimplifiedResurrectionWorkflow } from '@/lib/workflow/simplified-workflow';

// After creating resurrection:
const workflow = new SimplifiedResurrectionWorkflow();
workflow.execute(resurrectionId, combinedABAPCode)
  .catch(error => console.error('Workflow failed:', error));
```

## Prevention

To avoid this issue in the future:

1. **Always restart after route changes** - When adding/modifying API routes
2. **Clear cache regularly** - Delete `.next` directory when things act weird
3. **Check route registration** - Test endpoints after restart
4. **Use manual triggers** - Add manual start buttons as backup

## Related Files

- `app/api/resurrections/[id]/start/route.ts` - Start endpoint
- `app/upload/page.tsx` - Upload page that calls start
- `lib/workflow/hybrid-workflow.ts` - Workflow implementation
- `.next/` - Next.js build cache (delete to fix issues)

## Status

This is a **Next.js routing issue**, not a code bug. The endpoint exists and works correctly once Next.js registers it.

---

**Quick Fix:** Restart the dev server with `npm run dev`
