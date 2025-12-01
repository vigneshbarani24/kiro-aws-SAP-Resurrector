# API Resurrection Creation Fix

## Problem

The upload page was failing with error:
```
🔴 Haunted error: abapCode is required and must be a non-empty string
```

## Root Cause

**API-Frontend Mismatch:**
- The API expected `abapCode` (raw ABAP code string)
- The upload page was sending `abapObjectIds` (array of uploaded object IDs)
- The API rejected requests without `abapCode`, even when valid object IDs were provided

## Solution

Updated the API to support **two workflows**:

### 1. Direct Code Upload
```json
{
  "name": "My Resurrection",
  "description": "Direct ABAP code",
  "module": "SD",
  "abapCode": "REPORT z_sales_order...",
  "userId": "optional-user-id"
}
```

### 2. File Upload (via ABAP Objects)
```json
{
  "name": "My Resurrection",
  "description": "Uploaded files",
  "module": "CUSTOM",
  "abapObjectIds": ["uuid-1", "uuid-2", "uuid-3"],
  "userId": "optional-user-id"
}
```

## Changes Made

### API Route (`app/api/resurrections/route.ts`)

**1. Updated Validation:**
```typescript
// Before: Required abapCode
if (!abapCode || typeof abapCode !== 'string' || abapCode.trim().length === 0) {
  return error;
}

// After: Accept either abapCode OR abapObjectIds
if (!abapCode && (!abapObjectIds || !Array.isArray(abapObjectIds) || abapObjectIds.length === 0)) {
  return error;
}
```

**2. Added Object Fetching:**
```typescript
if (abapObjectIds && abapObjectIds.length > 0) {
  // Fetch ABAP objects from database
  const abapObjects = await prisma.aBAPObject.findMany({
    where: { id: { in: abapObjectIds } }
  });
  
  // Combine their code
  finalAbapCode = abapObjects.map(obj => obj.content).join('\n\n');
  linesOfCode = abapObjects.reduce((sum, obj) => sum + obj.linesOfCode, 0);
}
```

**3. Link Objects to Resurrection:**
```typescript
// After creating resurrection, link the ABAP objects
if (abapObjectIds && abapObjectIds.length > 0) {
  await prisma.aBAPObject.updateMany({
    where: { id: { in: abapObjectIds } },
    data: { resurrectionId: resurrection.id }
  });
}
```

**4. Set originalLOC:**
```typescript
// Now sets originalLOC during creation
originalLOC: linesOfCode,
```

## Benefits

1. ✅ **Supports both workflows** - Direct code or file upload
2. ✅ **Proper object linking** - ABAP objects are associated with resurrection
3. ✅ **Accurate LOC tracking** - Combines LOC from all uploaded objects
4. ✅ **Better validation** - Clear error messages for invalid requests
5. ✅ **Consistent data** - Sets originalLOC from the start

## Testing

### Test Direct Upload:
```bash
curl -X POST http://localhost:3000/api/resurrections \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Direct",
    "abapCode": "REPORT z_test.\nWRITE: / '\''Hello World'\''."
  }'
```

### Test File Upload:
1. Upload ABAP files via `/upload` page
2. Files are saved as ABAP objects
3. Resurrection is created with `abapObjectIds`
4. API fetches objects and combines their code

## Impact

- **Upload page** - Now works correctly ✅
- **Direct API calls** - Still supported ✅
- **Existing resurrections** - Not affected ✅
- **Dashboard** - Shows correct LOC data ✅

## Related Fixes

This fix works together with:
- `DASHBOARD_FIX_SUMMARY.md` - Dashboard data display
- `scripts/fix-missing-data.js` - Database cleanup

## Status

✅ **FIXED** - Upload page now creates resurrections successfully with proper ABAP object linking.
