# ResurrectionProgress Component Architecture

## Component Structure

```
ResurrectionProgress
├── Background Effects
│   ├── FloatingGhost (x4) - Animated ghosts at random positions
│   └── Fog Effect - Animated gradient overlay
│
├── Header Section
│   ├── PulsingPumpkin - Main loader animation
│   ├── Title - "Resurrection in Progress"
│   └── Subtitle - Current status message
│
├── Main Card (Workflow Steps)
│   ├── Card Header
│   │   ├── Title - "Resurrection Ritual"
│   │   └── Description - Current step description
│   │
│   ├── Card Content
│   │   ├── Step Indicators (x5)
│   │   │   ├── Step Icon (animated circle)
│   │   │   ├── Step Name
│   │   │   ├── Step Description
│   │   │   ├── Status Badge
│   │   │   └── Progress Bar (for current step)
│   │   │
│   │   ├── Overall Progress Section
│   │   │   ├── Progress Label
│   │   │   ├── Percentage Display
│   │   │   └── BatWingProgress Bar
│   │   │
│   │   └── Time Information Grid
│   │       ├── Elapsed Time Card
│   │       └── Estimated Remaining Card
│   │
│   └── Fun Facts Card
│       └── Did you know? section
│
└── Decorations
    └── Spinning Bat - Bottom right corner
```

## State Management

```typescript
// Core State
const [currentStep, setCurrentStep] = useState<WorkflowStep>('ANALYZE');
const [currentStepStatus, setCurrentStepStatus] = useState<Status>('STARTED');
const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set());
const [statusMessage, setStatusMessage] = useState<string>('...');

// Time Tracking
const [elapsedTime, setElapsedTime] = useState(0);
const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(145);
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    ResurrectionProgress                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ useEffect (Polling)                                     │ │
│  │                                                          │ │
│  │  Every 2 seconds:                                       │ │
│  │  1. Fetch /api/resurrections/:id/status                │ │
│  │  2. Parse response                                      │ │
│  │  3. Update currentStep                                  │ │
│  │  4. Update completedSteps                               │ │
│  │  5. Update statusMessage                                │ │
│  │  6. Check if complete/failed                            │ │
│  │  7. Trigger callbacks if needed                         │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ useEffect (Time Tracking)                               │ │
│  │                                                          │ │
│  │  Every 1 second:                                        │ │
│  │  1. Increment elapsedTime                               │ │
│  │  2. Decrement estimatedTimeRemaining                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Render                                                   │ │
│  │                                                          │ │
│  │  1. Calculate progressPercentage                        │ │
│  │  2. Render step indicators with animations              │ │
│  │  3. Update progress bars                                │ │
│  │  4. Display time information                            │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Animation Components

### FloatingGhost
```typescript
<motion.div
  animate={{
    y: [-20, 20, -20],
    x: [0, 10, 0],
    opacity: [0.1, 0.3, 0.1],
  }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
    delay: props.delay,
  }}
>
  👻
</motion.div>
```

### PulsingPumpkin
```typescript
<motion.div
  animate={{
    scale: [1, 1.2, 1],
    filter: [
      'drop-shadow(0 0 0px #FF6B35)',
      'drop-shadow(0 0 30px #FF6B35)',
      'drop-shadow(0 0 0px #FF6B35)',
    ],
  }}
  transition={{
    duration: 2,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
>
  🎃
</motion.div>
```

### BatWingProgress
```typescript
<motion.div
  className="bg-gradient-to-r from-[#8b5cf6] via-[#FF6B35] to-[#FF6B35]"
  initial={{ width: 0 }}
  animate={{ width: `${value}%` }}
  transition={{ duration: 0.5, ease: 'easeOut' }}
>
  <motion.span
    animate={{ rotate: [0, 10, -10, 0] }}
    transition={{ duration: 0.5, repeat: Infinity }}
  >
    🦇
  </motion.span>
</motion.div>
```

### Fog Effect
```typescript
<motion.div
  className="bg-gradient-to-t from-[#2e1065]/20 to-transparent"
  animate={{ opacity: [0.3, 0.6, 0.3] }}
  transition={{
    duration: 4,
    repeat: Infinity,
    ease: 'easeInOut',
  }}
/>
```

## Step Status Logic

```typescript
// Determine step appearance based on status
const isCompleted = completedSteps.has(step.id);
const isCurrent = currentStep === step.id;
const isPending = !isCompleted && !isCurrent;
const isFailed = isCurrent && currentStepStatus === 'FAILED';

// Apply appropriate styling
className={`
  ${isCompleted 
    ? 'border-[#10B981] bg-[#10B981]/20 shadow-green' 
    : isCurrent
    ? 'border-[#FF6B35] bg-[#2e1065] shadow-orange'
    : isFailed
    ? 'border-[#dc2626] bg-[#dc2626]/20 shadow-red'
    : 'border-[#5b21b6] bg-[#1a0f2e]'
  }
`}
```

## Progress Calculation

```typescript
// Calculate overall progress
const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
const progressPercentage = (
  (currentStepIndex + (currentStepStatus === 'COMPLETED' ? 1 : 0.5)) 
  / WORKFLOW_STEPS.length
) * 100;
```

## API Response Mapping

```typescript
// Map API status to workflow step
const statusToStepMap: Record<string, WorkflowStep> = {
  'ANALYZING': 'ANALYZE',
  'PLANNING': 'PLAN',
  'GENERATING': 'GENERATE',
  'VALIDATING': 'VALIDATE',
  'DEPLOYING': 'DEPLOY',
};

// Update completed steps from API
const completed = new Set<WorkflowStep>();
for (const step of resurrection.steps) {
  if (step.status === 'COMPLETED') {
    completed.add(step.name as WorkflowStep);
  }
}
setCompletedSteps(completed);
```

## Cleanup

```typescript
useEffect(() => {
  const pollInterval = setInterval(pollStatus, 2000);
  const timeInterval = setInterval(updateTime, 1000);

  return () => {
    clearInterval(pollInterval);
    clearInterval(timeInterval);
  };
}, [resurrectionId, onComplete, onError]);
```

## Performance Considerations

1. **Polling Interval**: 2 seconds - balances responsiveness with server load
2. **Animation Performance**: Uses `transform` and `opacity` for GPU acceleration
3. **State Updates**: Batched to minimize re-renders
4. **Cleanup**: Intervals cleared on unmount to prevent memory leaks
5. **Conditional Rendering**: Animations only run when visible

## Accessibility

- Semantic HTML structure
- ARIA labels for progress indicators
- Keyboard navigation support (inherited from Shadcn components)
- Screen reader friendly status updates
- High contrast colors for visibility

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires CSS Grid and Flexbox support
- Framer Motion animations require JavaScript
- Graceful degradation for older browsers
