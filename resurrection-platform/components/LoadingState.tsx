'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  message?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'pumpkin' | 'ritual';
  fullScreen?: boolean;
  className?: string;
}

/**
 * Halloween-themed loading states
 */
export function LoadingState({
  message = 'Loading...',
  description,
  size = 'md',
  variant = 'ghost',
  fullScreen = false,
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  };

  const animations = {
    ghost: 'animate-float',
    pumpkin: 'animate-pulse-glow',
    ritual: 'animate-spin-slow',
  };

  const icons = {
    ghost: '👻',
    pumpkin: '🎃',
    ritual: '🔮',
  };

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div className={cn(sizeClasses[size], animations[variant])}>
        {icons[variant]}
      </div>
      
      {message && (
        <p className="text-[#F7F7FF] text-xl font-semibold text-center">
          {message}
        </p>
      )}
      
      {description && (
        <p className="text-[#a78bfa] text-sm text-center max-w-md">
          {description}
        </p>
      )}
      
      {/* Animated dots */}
      <div className="flex gap-2">
        <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-2 h-2 bg-[#FF6B35] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] via-[#0a0a0f] to-[#1a0f2e] flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Skeleton loader with Halloween theme
 */
export function SkeletonLoader({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-[#2e1065] via-[#5b21b6] to-[#2e1065] rounded-lg',
        className
      )}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    />
  );
}

/**
 * Card skeleton with Halloween theme
 */
export function CardSkeleton() {
  return (
    <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30">
      <CardContent className="p-6 space-y-4">
        <SkeletonLoader className="h-6 w-3/4" />
        <SkeletonLoader className="h-4 w-full" />
        <SkeletonLoader className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <SkeletonLoader className="h-8 w-24" />
          <SkeletonLoader className="h-8 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Resurrection progress loader
 */
interface ResurrectionLoaderProps {
  currentStep?: string;
  progress?: number;
}

export function ResurrectionLoader({ currentStep, progress }: ResurrectionLoaderProps) {
  const steps = [
    { icon: '🔍', name: 'ANALYZE', label: 'Spectral Analysis' },
    { icon: '📋', name: 'PLAN', label: 'Crafting Plan' },
    { icon: '⚡', name: 'GENERATE', label: 'Summoning Code' },
    { icon: '✅', name: 'VALIDATE', label: 'Exorcising Bugs' },
    { icon: '🚀', name: 'DEPLOY', label: 'Releasing Spirit' },
  ];

  const currentStepIndex = steps.findIndex(s => s.name === currentStep);

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Main loader */}
      <div className="text-center">
        <div className="text-8xl animate-float mb-4">👻</div>
        <h2 className="text-3xl font-bold text-[#FF6B35] mb-2">
          Resurrection in Progress
        </h2>
        <p className="text-[#a78bfa]">
          {currentStep ? steps[currentStepIndex]?.label : 'Preparing ritual...'}
        </p>
      </div>

      {/* Progress bar */}
      {progress !== undefined && (
        <div className="relative">
          <div className="h-3 bg-[#2e1065] rounded-full border-2 border-[#5b21b6] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF6B35] to-[#8b5cf6] transition-all duration-500 shadow-[0_0_20px_rgba(255,107,53,0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-[#a78bfa] text-sm mt-2">
            {progress}% Complete
          </p>
        </div>
      )}

      {/* Step indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div
            key={step.name}
            className={cn(
              'flex flex-col items-center transition-all',
              index <= currentStepIndex ? 'opacity-100' : 'opacity-30'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all',
                index < currentStepIndex
                  ? 'border-[#10B981] bg-[#2e1065] shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                  : index === currentStepIndex
                  ? 'border-[#FF6B35] bg-[#2e1065] shadow-[0_0_20px_rgba(255,107,53,0.5)] animate-pulse'
                  : 'border-[#5b21b6] bg-[#1a0f2e]'
              )}
            >
              {step.icon}
            </div>
            <span className="text-xs text-[#a78bfa] mt-2 text-center">
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Floating ghosts */}
      <div className="flex justify-center gap-8 opacity-20">
        <span className="text-4xl animate-float">👻</span>
        <span className="text-4xl animate-float" style={{ animationDelay: '0.5s' }}>👻</span>
        <span className="text-4xl animate-float" style={{ animationDelay: '1s' }}>👻</span>
      </div>
    </div>
  );
}

/**
 * Inline spinner for buttons
 */
export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin', className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
