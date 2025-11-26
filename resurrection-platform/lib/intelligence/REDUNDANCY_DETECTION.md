# Redundancy Detection Service

## Overview

The Redundancy Detection Service identifies duplicate and similar ABAP code using AI-powered embeddings and similarity algorithms. It provides consolidation recommendations and calculates potential savings from reducing code duplication.

**Implements Requirement 6.6:** WHEN redundant code is detected THEN the system SHALL show similarity scores and consolidation recommendations

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  Redundancy Detection Flow                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Fetch ABAP Objects from Database                        │
│     - Filter by user, IDs, or get all                       │
│     - Convert to ABAPObject format                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Generate Embeddings (OpenAI)                            │
│     - Use text-embedding-3-small model                      │
│     - Process in batches (10 at a time)                     │
│     - Rate limiting (1 second between batches)              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Calculate Similarity (Cosine Similarity)                │
│     - Compare all pairs of embeddings                       │
│     - Filter by threshold (default 0.85)                    │
│     - Sort by similarity (highest first)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Generate Recommendations (LLM)                          │
│     - Use GPT-4 for consolidation advice                    │
│     - Provide actionable steps                              │
│     - Estimate effort (Low/Medium/High)                     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Calculate Savings                                        │
│     - LOC savings (60% of smaller file)                     │
│     - Effort estimation                                      │
│     - Cost analysis (ROI, break-even)                       │
│     - Complexity reduction                                   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  6. Return Results                                           │
│     - Redundancies list                                      │
│     - Statistics                                             │
│     - Consolidation plan                                     │
│     - Savings projection                                     │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. RedundancyDetector (`redundancy-detector.ts`)

Core service for detecting code redundancies.

**Key Methods:**
- `findRedundancies(files)` - Find all duplicate and similar code
- `findClusters(files)` - Group similar files into clusters
- `getStatistics(redundancies)` - Calculate overview metrics
- `generateConsolidationPlan(redundancies)` - Create prioritized action plan

**Similarity Algorithm:**
- Uses OpenAI `text-embedding-3-small` for embeddings
- Cosine similarity for comparison
- Configurable threshold (default 0.85)

**Thresholds:**
- Very High: ≥ 0.95 (95%+ similar)
- High: 0.85 - 0.94 (85-94% similar)
- Medium: 0.75 - 0.84 (75-84% similar)

### 2. SavingsCalculator (`savings-calculator.ts`)

Calculates potential savings from consolidation.

**Key Methods:**
- `calculateProjection(redundancies, totalLOC)` - Comprehensive savings projection
- `calculateDetailedSavings(redundancies, statistics)` - Breakdown by module/type
- `identifyQuickWins(redundancies)` - High-value, low-effort opportunities
- `rankByPriority(redundancies)` - Sort by priority score

**Savings Calculation:**
- LOC Savings: 60% of smaller file
- Effort: Low (2h), Medium (4h), High (8h)
- Cost: $75/hour developer rate
- Maintenance: 0.5 hours per LOC per year

**Priority Score:**
```
Priority = LOC Savings + (Similarity × 100) - (Effort Hours × 10)
```

### 3. API Endpoint (`/api/intelligence/redundancy`)

REST API for redundancy detection.

**POST /api/intelligence/redundancy**

Request:
```json
{
  "userId": "user-123",
  "abapObjectIds": ["obj-1", "obj-2"],
  "threshold": 0.85
}
```

Response:
```json
{
  "redundancies": [...],
  "statistics": {
    "totalRedundancies": 15,
    "highSimilarity": 5,
    "mediumSimilarity": 10,
    "totalPotentialSavings": 1200,
    "byModule": { "SD": 8, "MM": 7 },
    "byType": { "FUNCTION": 10, "REPORT": 5 }
  },
  "consolidationPlan": {
    "priority": "high",
    "items": [...],
    "totalSavings": 1200,
    "estimatedEffort": "30 hours"
  },
  "savingsProjection": {
    "linesOfCode": {
      "current": 5000,
      "afterConsolidation": 3800,
      "savings": 1200,
      "percentageReduction": 24
    },
    "effort": {
      "consolidationHours": 30,
      "maintenanceHoursSavedPerYear": 600,
      "breakEvenMonths": 0.6
    },
    "cost": {
      "consolidationCost": 2250,
      "annualMaintenanceSavings": 45000,
      "threeYearROI": 5900
    }
  },
  "quickWins": [...],
  "savingsSummary": "..."
}
```

### 4. UI Component (`RedundancyCard.tsx`)

React component for displaying redundancy results.

**Features:**
- Statistics dashboard (total, high/medium similarity, savings)
- Consolidation plan with priority
- Detailed redundancy list with recommendations
- Visual similarity indicators
- Effort badges

## Usage

### Backend (API)

```typescript
import { RedundancyDetector, SavingsCalculator } from '@/lib/intelligence';

// Initialize detector
const detector = new RedundancyDetector(0.85);

// Find redundancies
const redundancies = await detector.findRedundancies(abapObjects);

// Get statistics
const stats = detector.getStatistics(redundancies);

// Calculate savings
const calculator = new SavingsCalculator();
const projection = calculator.calculateProjection(redundancies, totalLOC);
```

### Frontend (React)

```tsx
import { RedundancyCard } from '@/components/RedundancyCard';

export default function IntelligencePage() {
  return (
    <div>
      <RedundancyCard userId="user-123" />
    </div>
  );
}
```

### API Call

```typescript
const response = await fetch('/api/intelligence/redundancy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    threshold: 0.85
  })
});

const data = await response.json();
console.log(`Found ${data.redundancies.length} redundancies`);
console.log(`Potential savings: ${data.statistics.totalPotentialSavings} LOC`);
```

## Performance Considerations

### Batch Processing
- Embeddings generated in batches of 10
- 1 second delay between batches to avoid rate limits
- Parallel processing within batches

### Rate Limits
- OpenAI embeddings: 3,000 requests/minute
- With batching: ~600 files/minute
- Recommended: Process max 100 files at a time

### Caching
- Consider caching embeddings in database
- Reuse embeddings for unchanged files
- Cache similarity calculations

### Optimization Tips
1. **Pre-filter files**: Only analyze files likely to have duplicates
2. **Incremental analysis**: Only check new/modified files
3. **Threshold tuning**: Higher threshold = fewer comparisons
4. **Parallel processing**: Use worker threads for large datasets

## Cost Estimation

### OpenAI Costs
- Embeddings: $0.00002 per 1K tokens
- GPT-4 recommendations: $0.03 per 1K tokens
- Average cost per file: ~$0.001
- 100 files: ~$0.10

### Example Analysis
```
100 ABAP files
- Embeddings: 100 × $0.001 = $0.10
- Recommendations: 20 redundancies × $0.01 = $0.20
- Total: $0.30

Savings: 2,000 LOC
Value: $75,000/year in maintenance
ROI: 250,000%
```

## Testing

### Unit Tests
```bash
cd resurrection-platform
npm test lib/intelligence/redundancy-detector.test.ts
npm test lib/intelligence/savings-calculator.test.ts
```

### Integration Tests
```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/intelligence/redundancy \
  -H "Content-Type: application/json" \
  -d '{"userId": "test-user", "threshold": 0.85}'
```

### Manual Testing
1. Upload sample ABAP files
2. Navigate to Intelligence Dashboard
3. Click "Detect Redundancies"
4. Verify results display correctly

## Troubleshooting

### No redundancies found
- Check similarity threshold (try lowering to 0.75)
- Verify ABAP objects have content
- Ensure at least 2 files uploaded

### API timeout
- Reduce number of files analyzed
- Increase timeout in API route
- Use background job for large datasets

### High costs
- Implement embedding caching
- Reduce recommendation generation
- Use cheaper models for embeddings

### Inaccurate similarity
- Adjust threshold
- Normalize code before embedding
- Remove comments/whitespace

## Future Enhancements

1. **Embedding Cache**: Store embeddings in database
2. **Background Jobs**: Process large datasets asynchronously
3. **Real-time Updates**: WebSocket for live progress
4. **Advanced Clustering**: Use DBSCAN or hierarchical clustering
5. **Code Normalization**: Remove comments, standardize formatting
6. **Semantic Analysis**: Understand code logic, not just text
7. **Automated Consolidation**: Generate merged code automatically
8. **Version Control**: Track consolidation history
9. **Team Collaboration**: Assign consolidation tasks
10. **Metrics Dashboard**: Track progress over time

## References

- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Cosine Similarity](https://en.wikipedia.org/wiki/Cosine_similarity)
- [Code Clone Detection](https://en.wikipedia.org/wiki/Duplicate_code)
- [SAP Clean Core](https://www.sap.com/products/technology-platform/clean-core.html)

## Support

For issues or questions:
1. Check this documentation
2. Review test files for examples
3. Check API logs for errors
4. Contact development team
