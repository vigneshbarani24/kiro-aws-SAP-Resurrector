'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

// Workflow step types
export type WorkflowStep = 'ANALYZE' | 'PLAN' | 'GENERATE' | 'VALIDATE' | 'DEPLOY';

export interface ProgressUpdate {
  resurrectionId: string;
  step: WorkflowStep;
  status: 'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  message?: string;
  timestamp: Date;
}

interface ResurrectionProgressProps {
  resurrectionId: string;
  onComplete?: () => void;
  onError?: (error: string) => void;
}

// Workflow steps configuration with Halloween theme
const WORKFLOW_STEPS = [
  {
    id: 'ANALYZE' as WorkflowStep,
    name: 'Spectral Analysis',
    icon: '👻',
    description: 'Parsing ABAP code and extracting business logic',
    estimatedTime: 30,
  },
  {
    id: 'PLAN' as WorkflowStep,
    name: 'Ritual Planning',
    icon: '🔮',
    description: 'Creating AI-powered transformation architecture',
    estimatedTime: 20,
  },
  {
    id: 'GENERATE' as WorkflowStep,
    name: 'Code Summoning',
    icon: '⚡',
    description: 'Generating CAP models, services, and Fiori UI',
    estimatedTime: 60,
  },
  {
    id: 'VALIDATE' as WorkflowStep,
    name: 'Exorcise Bugs',
    icon: '✨',
    description: 'Validating quality and Clean Core compliance',
    estimatedTime: 15,
  },
  {
    id: 'DEPLOY' as WorkflowStep,
    name: 'Release Spirit',
    icon: '🚀',
    description: 'Creating GitHub repository and BAS link',
    estimatedTime: 20,
  },
];

// Floating ghost animation component
function FloatingGhost({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute text-6xl opacity-20 pointer-events-none"
      initial={{ y: 0, x: 0, opacity: 0 }}
      animate={{
        y: [-20, 20, -20],
        x: [0, 10, 0],
        opacity: [0.1, 0.3, 0.1],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: 'easeInOut',
        delay,
      }}
      style={{
        left: `${Math.random() * 80 + 10}%`,
        top: `${Math.random() * 80 + 10}%`,
      }}
    >
      👻
    </motion.div>
  );
}

// Bat-wing style progress bar
function BatWingProgress({ value }: { value: number }) {
  return (
    <div className="relative w-full h-4 bg-[#1a0f2e] border-2 border-[#5b21b6] rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-[#8b5cf6] via-[#FF6B35] to-[#FF6B35] shadow-[0_0_20px_rgba(255,107,53,0.6)]"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* Bat wing decorations */}
      <div className="absolute inset-0 flex items-center justify-end pr-1">
        <motion.span
          className="text-xs"
          animate={{
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
          }}
        >
          🦇
        </motion.span>
      </div>
    </div>
  );
}

// Pulsing pumpkin loader
function PulsingPumpkin() {
  return (
    <motion.div
      className="text-8xl"
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
  );
}

export function ResurrectionProgress({
  resurrectionId,
  onComplete,
  onError,
}: ResurrectionProgressProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('ANALYZE');
  const [currentStepStatus, setCurrentStepStatus] = useState<'STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'>('STARTED');
  const [completedSteps, setCompletedSteps] = useState<Set<WorkflowStep>>(new Set());
  const [statusMessage, setStatusMessage] = useState<string>('Initializing resurrection ritual...');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState(145); // Total estimated time in seconds

  // Calculate progress percentage
  const currentStepIndex = WORKFLOW_STEPS.findIndex(s => s.id === currentStep);
  const progressPercentage = ((currentStepIndex + (currentStepStatus === 'COMPLETED' ? 1 : 0.5)) / WORKFLOW_STEPS.length) * 100;

  // Poll for resurrection status
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeInterval: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/resurrections/${resurrectionId}/status`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch resurrection status');
        }

        const data = await response.json();
        const resurrection = data.resurrection;
        
        // Update current step based on status
        const statusToStepMap: Record<string, WorkflowStep> = {
          'ANALYZING': 'ANALYZE',
          'PLANNING': 'PLAN',
          'GENERATING': 'GENERATE',
          'VALIDATING': 'VALIDATE',
          'DEPLOYING': 'DEPLOY',
        };

        const newStep = statusToStepMap[resurrection.status];
        if (newStep) {
          setCurrentStep(newStep);
          setCurrentStepStatus('IN_PROGRESS');
          
          // Update completed steps based on API response
          const completed = new Set<WorkflowStep>();
          for (const step of resurrection.steps) {
            if (step.status === 'COMPLETED') {
              completed.add(step.name as WorkflowStep);
            }
          }
          setCompletedSteps(completed);
        }

        // Update status message from latest log
        if (resurrection.recentLogs && resurrection.recentLogs.length > 0) {
          const latestLog = resurrection.recentLogs[0];
          const stepConfig = WORKFLOW_STEPS.find(s => s.id === latestLog.step);
          if (stepConfig) {
            setStatusMessage(stepConfig.description);
          }
        } else if (newStep) {
          const stepConfig = WORKFLOW_STEPS.find(s => s.id === newStep);
          if (stepConfig) {
            setStatusMessage(stepConfig.description);
          }
        }

        // Check if completed
        if (resurrection.isComplete) {
          setCurrentStepStatus('COMPLETED');
          setCompletedSteps(new Set(WORKFLOW_STEPS.map(s => s.id)));
          clearInterval(pollInterval);
          clearInterval(timeInterval);
          
          if (onComplete) {
            setTimeout(() => onComplete(), 2000); // Delay to show completion animation
          }
        }

        // Check if failed
        if (resurrection.isFailed) {
          setCurrentStepStatus('FAILED');
          clearInterval(pollInterval);
          clearInterval(timeInterval);
          
          if (onError) {
            const errorLog = resurrection.recentLogs?.find((log: any) => log.errorMessage);
            onError(errorLog?.errorMessage || 'Resurrection failed');
          }
        }
      } catch (error) {
        console.error('Error polling resurrection status:', error);
      }
    };

    // Start polling every 2 seconds
    pollStatus(); // Initial poll
    pollInterval = setInterval(pollStatus, 2000);

    // Update elapsed time every second
    timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      setEstimatedTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(timeInterval);
    };
  }, [resurrectionId, onComplete, onError]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] to-[#0a0a0f] p-8 relative overflow-hidden">
      {/* Floating ghosts background */}
      <FloatingGhost delay={0} />
      <FloatingGhost delay={1} />
      <FloatingGhost delay={2} />
      <FloatingGhost delay={3} />

      {/* Fog effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-[#2e1065]/20 to-transparent pointer-events-none"
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex justify-center mb-6">
            <PulsingPumpkin />
          </div>
          
          <h1 className="text-5xl font-bold text-[#FF6B35] mb-4">
            Resurrection in Progress
          </h1>
          
          <p className="text-xl text-[#a78bfa]">
            Transforming your legacy ABAP into modern SAP CAP...
          </p>
        </motion.div>

        {/* Workflow Steps */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-8 shadow-[0_0_40px_rgba(139,92,246,0.3)]">
          <CardHeader>
            <CardTitle className="text-[#FF6B35] text-2xl flex items-center gap-2">
              <span>🔮</span>
              Resurrection Ritual
            </CardTitle>
            <CardDescription className="text-[#a78bfa] text-lg">
              {statusMessage}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Step indicators */}
            <div className="space-y-6">
              {WORKFLOW_STEPS.map((step, index) => {
                const isCompleted = completedSteps.has(step.id);
                const isCurrent = currentStep === step.id;
                const isPending = !isCompleted && !isCurrent;
                const isFailed = isCurrent && currentStepStatus === 'FAILED';

                return (
                  <motion.div
                    key={step.id}
                    className="relative"
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Step icon */}
                      <motion.div
                        className={`
                          w-16 h-16 rounded-full flex items-center justify-center text-3xl
                          border-2 transition-all duration-300 flex-shrink-0
                          ${isCompleted 
                            ? 'border-[#10B981] bg-[#10B981]/20 shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                            : isCurrent
                            ? 'border-[#FF6B35] bg-[#2e1065] shadow-[0_0_20px_rgba(255,107,53,0.5)]'
                            : isFailed
                            ? 'border-[#dc2626] bg-[#dc2626]/20 shadow-[0_0_20px_rgba(220,38,38,0.5)]'
                            : 'border-[#5b21b6] bg-[#1a0f2e]'
                          }
                        `}
                        animate={isCurrent ? {
                          scale: [1, 1.1, 1],
                        } : {}}
                        transition={{
                          duration: 2,
                          repeat: isCurrent ? Infinity : 0,
                        }}
                      >
                        {isCompleted ? '✅' : isFailed ? '❌' : step.icon}
                      </motion.div>

                      {/* Step details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className={`
                            text-lg font-semibold
                            ${isCompleted ? 'text-[#10B981]' : isCurrent ? 'text-[#FF6B35]' : isFailed ? 'text-[#dc2626]' : 'text-[#6B7280]'}
                          `}>
                            {step.name}
                          </h3>
                          
                          {isCurrent && (
                            <Badge className="bg-[#FF6B35] text-white animate-pulse-glow">
                              In Progress
                            </Badge>
                          )}
                          
                          {isCompleted && (
                            <Badge className="bg-[#10B981] text-white">
                              Complete
                            </Badge>
                          )}
                          
                          {isFailed && (
                            <Badge className="bg-[#dc2626] text-white">
                              Failed
                            </Badge>
                          )}
                        </div>
                        
                        <p className={`
                          text-sm
                          ${isCompleted || isCurrent ? 'text-[#a78bfa]' : 'text-[#6B7280]'}
                        `}>
                          {step.description}
                        </p>

                        {isCurrent && (
                          <motion.div
                            className="mt-2"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <Progress value={50} className="h-1" />
                          </motion.div>
                        )}
                      </div>

                      {/* Estimated time */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm text-[#6B7280]">
                          ~{step.estimatedTime}s
                        </p>
                      </div>
                    </div>

                    {/* Connector line */}
                    {index < WORKFLOW_STEPS.length - 1 && (
                      <div className="ml-8 h-8 w-0.5 bg-[#5b21b6] my-2" />
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Overall progress */}
            <div className="pt-6 border-t border-[#5b21b6]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#a78bfa] font-semibold">Overall Progress</span>
                <span className="text-[#FF6B35] font-bold text-lg">
                  {Math.round(progressPercentage)}%
                </span>
              </div>
              <BatWingProgress value={progressPercentage} />
            </div>

            {/* Time information */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#5b21b6]">
              <div className="text-center p-4 bg-[#1a0f2e] border border-[#5b21b6] rounded-lg">
                <p className="text-sm text-[#a78bfa] mb-1">Elapsed Time</p>
                <p className="text-2xl font-bold text-[#F7F7FF]">
                  {formatTime(elapsedTime)}
                </p>
              </div>
              <div className="text-center p-4 bg-[#1a0f2e] border border-[#5b21b6] rounded-lg">
                <p className="text-sm text-[#a78bfa] mb-1">Est. Remaining</p>
                <p className="text-2xl font-bold text-[#FF6B35]">
                  {formatTime(estimatedTimeRemaining)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fun facts / tips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <span className="text-3xl">💡</span>
                <div>
                  <h4 className="text-[#FF6B35] font-semibold mb-2">
                    Did you know?
                  </h4>
                  <p className="text-[#a78bfa] text-sm">
                    Your resurrection is using AI-powered MCP servers to analyze ABAP patterns,
                    generate Clean Core-compliant CAP code, and create a production-ready
                    GitHub repository. All business logic is preserved with 100% accuracy! 🎃
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Spinning bat decoration */}
      <motion.div
        className="fixed bottom-10 right-10 text-6xl opacity-30"
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        🦇
      </motion.div>
    </div>
  );
}
