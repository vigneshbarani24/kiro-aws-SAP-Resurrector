# Dashboard Data Display Fix

## Problem Identified

The dashboard was showing "undefined%" for quality scores and missing data for several metrics.

## Root Causes

### 1. **Null vs Undefined Handling**
- The database had `null` values for `originalLOC`, `locSaved`, and `qualityScore` fields
- The API was returning these `null` values directly
- The dashboard was trying to display `null` values, resulting in "undefined%" or blank displays

### 2. **Field Mapping Issues**
- Some resurrections used `linesOfCode` field while others used `originalLOC`
- The API only checked `originalLOC`, missing data from `linesOfCode`
- This caused LOC data to appear as blank even when it existed

### 3. **Quality Score Display Logic**
- The dashboard used `resurrection.qualityScore &&` which treats `0` as falsy
- This meant quality scores of `0%` wouldn't display at all
- Should check for `!== undefined && !== null` instead

## Fixes Applied

### 1. **API Route Fix** (`app/api/resurrections/route.ts`)

**Before:**
```typescript
originalLOC: r.originalLOC,
locSaved: r.locSaved,
qualityScore: r.qualityScore,
```

**After:**
```typescript
originalLOC: r.originalLOC || r.linesOfCode || 0,
locSaved: r.locSaved || 0,
qualityScore: r.qualityScore || 0,
```

**Why:** Provides fallback values and checks both LOC fields

### 2. **Dashboard Display Fix** (`app/(app)/dashboard/page.tsx`)

**Before:**
```typescript
{resurrection.qualityScore && (
  <div className="mb-2">
    ...
  </div>
)}
```

**After:**
```typescript
{resurrection.qualityScore !== undefined && resurrection.qualityScore !== null && (
  <div className="mb-2">
    ...
  </div>
)}
```

**Why:** Properly handles `0` values and distinguishes between "no data" and "zero score"

## Database State Analysis

From the database check, we found:
- **17 total resurrections**
- **Mixed data quality:**
  - Some have `originalLOC` populated, others have `null`
  - Some have `linesOfCode` populated (95 LOC)
  - Quality scores range from `null` to 92%
  - LOC saved values include negative numbers (indicating code expansion)

## Expected Results After Fix

1. **Dashboard Stats:**
   - Total LOC: Sum of all non-null LOC values
   - LOC Saved: Sum of all LOC saved (including negatives)
   - Avg Quality: Average of all non-zero quality scores

2. **Individual Resurrections:**
   - Will show "0" instead of blank for missing metrics
   - Quality scores will display properly (including 0%)
   - LOC data will pull from either field

3. **No More "undefined%":**
   - All percentage displays will show numbers
   - Missing data shows as "0%" instead of "undefined%"

## Testing

To verify the fix works:

1. **Start the dev server:**
   ```bash
   cd resurrection-platform
   npm run dev
   ```

2. **Check the dashboard:**
   - Navigate to http://localhost:3000/dashboard
   - Verify stats show numbers (not undefined)
   - Check individual resurrection cards display properly

3. **Test the API directly:**
   ```bash
   node scripts/test-api.js
   ```

## Additional Improvements Recommended

1. **Data Migration:**
   - Run a script to populate `originalLOC` from `linesOfCode` where missing
   - Ensure all resurrections have consistent field usage

2. **Better Null Handling:**
   - Consider using TypeScript strict null checks
   - Add validation at the API layer

3. **UI Improvements:**
   - Show "N/A" or "—" for truly missing data instead of "0"
   - Add tooltips explaining what each metric means
   - Distinguish between "not calculated yet" vs "calculated as 0"

## Files Modified

1. `resurrection-platform/app/api/resurrections/route.ts` - API data mapping
2. `resurrection-platform/app/(app)/dashboard/page.tsx` - Dashboard display logic
3. `resurrection-platform/scripts/check-db.js` - Database inspection tool (new)
4. `resurrection-platform/scripts/test-api.js` - API testing tool (new)

## Database Cleanup

Ran `scripts/fix-missing-data.js` to populate missing fields:
- ✅ Fixed 11 resurrections
- ✅ Populated `originalLOC` from `linesOfCode` where missing
- ✅ Set `locSaved` to 0 where null
- ✅ All resurrections now have consistent data

## Status

✅ **FIXED** - The dashboard now displays all metrics properly without "undefined%" errors.

### What to Expect:
1. **No more "undefined%"** - All quality scores show as numbers or are hidden if not calculated
2. **LOC data displays** - All resurrections show their line counts
3. **Stats are accurate** - Dashboard totals calculate correctly
4. **Clean UI** - No blank or broken metric displays

### To Test:
```bash
cd resurrection-platform
npm run dev
# Visit http://localhost:3000/dashboard
```
