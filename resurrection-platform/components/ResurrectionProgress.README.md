# ResurrectionProgress Component

A Halloween-themed progress tracking component for the 5-step resurrection workflow.

## Features

- **Live Progress Tracking**: Polls resurrection status every 2 seconds
- **5-Step Workflow Visualization**: ANALYZE → PLAN → GENERATE → VALIDATE → DEPLOY
- **Halloween Animations**:
  - Floating ghosts in the background
  - Pulsing pumpkin loader with glow effects
  - Bat-wing style progress bar
  - Fog effects with opacity animations
  - Spinning bat decoration
- **Real-time Metrics**:
  - Elapsed time counter
  - Estimated time remaining
  - Overall progress percentage
- **Step Status Indicators**:
  - Animated icons for each step
  - Status badges (In Progress, Complete, Failed)
  - Individual step progress bars

## Usage

### Basic Usage

```tsx
import { ResurrectionProgress } from '@/components/ResurrectionProgress';

function MyPage() {
  const resurrectionId = 'your-resurrection-id';

  return (
    <ResurrectionProgress
      resurrectionId={resurrectionId}
      onComplete={() => console.log('Resurrection complete!')}
      onError={(error) => console.error('Resurrection failed:', error)}
    />
  );
}
```

### With Navigation

```tsx
import { useRouter } from 'next/navigation';
import { ResurrectionProgress } from '@/components/ResurrectionProgress';
import { halloweenToast } from '@/lib/toast';

function ResurrectionProgressPage() {
  const router = useRouter();
  const resurrectionId = 'your-resurrection-id';

  const handleComplete = () => {
    halloweenToast.resurrection.completed('');
    router.push(`/resurrections/${resurrectionId}`);
  };

  const handleError = (error: string) => {
    halloweenToast.resurrection.failed(error);
    router.push(`/resurrections/${resurrectionId}`);
  };

  return (
    <ResurrectionProgress
      resurrectionId={resurrectionId}
      onComplete={handleComplete}
      onError={handleError}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `resurrectionId` | `string` | Yes | The ID of the resurrection to track |
| `onComplete` | `() => void` | No | Callback fired when resurrection completes successfully |
| `onError` | `(error: string) => void` | No | Callback fired when resurrection fails |

## API Integration

The component expects the following API endpoint to be available:

### GET `/api/resurrections/:id/status`

**Response Format:**
```json
{
  "success": true,
  "resurrection": {
    "id": "string",
    "name": "string",
    "status": "ANALYZING" | "PLANNING" | "GENERATING" | "VALIDATING" | "DEPLOYING" | "COMPLETED" | "FAILED",
    "isComplete": boolean,
    "isFailed": boolean,
    "isInProgress": boolean,
    "progressPercentage": number,
    "currentStep": number,
    "steps": [
      {
        "name": "ANALYZE" | "PLAN" | "GENERATE" | "VALIDATE" | "DEPLOY",
        "status": "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED"
      }
    ],
    "recentLogs": [
      {
        "step": "ANALYZE",
        "status": "COMPLETED",
        "duration": number,
        "errorMessage": string | null,
        "createdAt": string
      }
    ]
  }
}
```

## Workflow Steps

The component tracks these 5 steps:

1. **ANALYZE** (Spectral Analysis)
   - Parsing ABAP code and extracting business logic
   - Estimated time: ~30 seconds

2. **PLAN** (Ritual Planning)
   - Creating AI-powered transformation architecture
   - Estimated time: ~20 seconds

3. **GENERATE** (Code Summoning)
   - Generating CAP models, services, and Fiori UI
   - Estimated time: ~60 seconds

4. **VALIDATE** (Exorcise Bugs)
   - Validating quality and Clean Core compliance
   - Estimated time: ~15 seconds

5. **DEPLOY** (Release Spirit)
   - Creating GitHub repository and BAS link
   - Estimated time: ~20 seconds

**Total estimated time: ~145 seconds (2.5 minutes)**

## Styling

The component uses the Halloween theme with these key colors:

- **Primary Orange**: `#FF6B35` (pumpkin-orange)
- **Purple**: `#8b5cf6` (spooky-purple)
- **Background**: `#1a0f2e` to `#0a0a0f` gradient
- **Text**: `#F7F7FF` (ghost-white)
- **Accent**: `#a78bfa` (light purple)

## Dependencies

- `framer-motion`: For animations
- `@/components/ui/card`: Shadcn UI Card component
- `@/components/ui/progress`: Shadcn UI Progress component
- `@/components/ui/badge`: Shadcn UI Badge component

## Requirements Validation

This component satisfies the following requirements:

- **3.7**: Display real-time progress with step name, status, and streaming output
- **8.9**: Show animated "Resurrection in Progress" with live MCP streaming updates
- **17.10**: Halloween-themed data visualizations with bat-wing progress bars

## Example Integration

See the example page at `/app/resurrections/[id]/progress/page.tsx` for a complete integration example.

## Demo

Visit `/demo` to see all Halloween-themed UI components including a section about this progress component.
