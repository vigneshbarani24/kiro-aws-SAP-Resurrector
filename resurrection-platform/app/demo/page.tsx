'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { halloweenToast } from '@/lib/toast';
import { LoadingState, SkeletonLoader, CardSkeleton, ResurrectionLoader, Spinner } from '@/components/LoadingState';

/**
 * Demo page showcasing Halloween-themed loading states and error messages
 * This page demonstrates all the UI components for task 17.1
 */
export default function DemoPage() {
  const [showFullScreenLoader, setShowFullScreenLoader] = useState(false);
  const [showResurrectionLoader, setShowResurrectionLoader] = useState(false);
  const [resurrectionStep, setResurrectionStep] = useState<string>('ANALYZE');
  const [resurrectionProgress, setResurrectionProgress] = useState(20);
  const [isLoading, setIsLoading] = useState(false);

  const simulateResurrection = () => {
    setShowResurrectionLoader(true);
    const steps = ['ANALYZE', 'PLAN', 'GENERATE', 'VALIDATE', 'DEPLOY'];
    let currentIndex = 0;
    let progress = 0;

    const interval = setInterval(() => {
      if (currentIndex < steps.length) {
        setResurrectionStep(steps[currentIndex]);
        progress += 20;
        setResurrectionProgress(progress);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setShowResurrectionLoader(false);
          halloweenToast.resurrection.completed('https://github.com/user/resurrection-demo');
        }, 1000);
      }
    }, 2000);
  };

  const throwError = () => {
    throw new Error('This is a test error to demonstrate the Error Boundary');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] via-[#0a0a0f] to-[#1a0f2e] p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-[#FF6B35] mb-4">
            🎃 Halloween UI Demo
          </h1>
          <p className="text-xl text-[#a78bfa]">
            Showcasing loading states, error messages, and spooky notifications
          </p>
        </div>

        {/* Toast Notifications Section */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FF6B35]">
              👻 Toast Notifications
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Halloween-themed toast messages for user feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                onClick={() => halloweenToast.success('Success!', 'Your spell was cast successfully')}
                className="bg-[#10B981] hover:bg-[#059669]"
              >
                ✨ Success
              </Button>
              <Button
                onClick={() => halloweenToast.error('Error!', 'Dark magic has failed')}
                className="bg-[#DC2626] hover:bg-[#B91C1C]"
              >
                🦇 Error
              </Button>
              <Button
                onClick={() => halloweenToast.warning('Warning!', 'Proceed with caution')}
                className="bg-[#FF6B35] hover:bg-[#E85A2A]"
              >
                ⚠️ Warning
              </Button>
              <Button
                onClick={() => halloweenToast.info('Info', 'The spirits are watching')}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed]"
              >
                👻 Info
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t border-[#5b21b6]">
              <h4 className="text-[#F7F7FF] font-semibold mb-4">Resurrection-Specific Toasts:</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Button
                  onClick={() => halloweenToast.resurrection.started('My ABAP Project')}
                  variant="outline"
                  className="border-[#5b21b6] text-[#a78bfa]"
                >
                  🎃 Started
                </Button>
                <Button
                  onClick={() => halloweenToast.resurrection.analyzing()}
                  variant="outline"
                  className="border-[#5b21b6] text-[#a78bfa]"
                >
                  🔮 Analyzing
                </Button>
                <Button
                  onClick={() => halloweenToast.resurrection.generating()}
                  variant="outline"
                  className="border-[#5b21b6] text-[#a78bfa]"
                >
                  ⚡ Generating
                </Button>
                <Button
                  onClick={() => halloweenToast.resurrection.completed('https://github.com/user/repo')}
                  variant="outline"
                  className="border-[#5b21b6] text-[#a78bfa]"
                >
                  ⚰️ Completed
                </Button>
                <Button
                  onClick={() => halloweenToast.resurrection.failed('Connection timeout')}
                  variant="outline"
                  className="border-[#5b21b6] text-[#a78bfa]"
                >
                  🦇 Failed
                </Button>
                <Button
                  onClick={() => halloweenToast.validation.passed()}
                  variant="outline"
                  className="border-[#5b21b6] text-[#a78bfa]"
                >
                  ✅ Validated
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading States Section */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FF6B35]">
              🕸️ Loading States
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Spooky loading animations and progress indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Basic Loaders */}
            <div>
              <h4 className="text-[#F7F7FF] font-semibold mb-4">Basic Loaders:</h4>
              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#1a0f2e] border border-[#5b21b6] rounded-lg p-6">
                  <LoadingState
                    message="Loading..."
                    size="sm"
                    variant="ghost"
                  />
                </div>
                <div className="bg-[#1a0f2e] border border-[#5b21b6] rounded-lg p-6">
                  <LoadingState
                    message="Processing..."
                    size="md"
                    variant="pumpkin"
                  />
                </div>
                <div className="bg-[#1a0f2e] border border-[#5b21b6] rounded-lg p-6">
                  <LoadingState
                    message="Summoning..."
                    size="sm"
                    variant="ritual"
                  />
                </div>
              </div>
            </div>

            {/* Skeleton Loaders */}
            <div>
              <h4 className="text-[#F7F7FF] font-semibold mb-4">Skeleton Loaders:</h4>
              <div className="grid grid-cols-2 gap-4">
                <CardSkeleton />
                <CardSkeleton />
              </div>
            </div>

            {/* Button with Spinner */}
            <div>
              <h4 className="text-[#F7F7FF] font-semibold mb-4">Button Loading States:</h4>
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    setIsLoading(true);
                    setTimeout(() => setIsLoading(false), 3000);
                  }}
                  disabled={isLoading}
                  className="bg-[#FF6B35] hover:bg-[#E85A2A]"
                >
                  {isLoading ? (
                    <>
                      <Spinner className="w-4 h-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">🎃</span>
                      Click to Load
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Full Screen Loader Demo */}
            <div>
              <h4 className="text-[#F7F7FF] font-semibold mb-4">Full Screen Loader:</h4>
              <Button
                onClick={() => {
                  setShowFullScreenLoader(true);
                  setTimeout(() => setShowFullScreenLoader(false), 3000);
                }}
                className="bg-[#8b5cf6] hover:bg-[#7c3aed]"
              >
                <span className="mr-2">🔮</span>
                Show Full Screen Loader
              </Button>
            </div>

            {/* Resurrection Loader Demo */}
            <div>
              <h4 className="text-[#F7F7FF] font-semibold mb-4">Resurrection Progress:</h4>
              <Button
                onClick={simulateResurrection}
                disabled={showResurrectionLoader}
                className="bg-[#FF6B35] hover:bg-[#E85A2A]"
              >
                <span className="mr-2">⚰️</span>
                Simulate Resurrection
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Error Boundary Section */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FF6B35]">
              🦇 Error Boundary
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Graceful error handling with spooky UI
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[#F7F7FF] mb-4">
              Click the button below to trigger an error and see the Error Boundary in action:
            </p>
            <Button
              onClick={throwError}
              className="bg-[#DC2626] hover:bg-[#B91C1C]"
            >
              <span className="mr-2">💥</span>
              Trigger Error
            </Button>
            <p className="text-sm text-[#a78bfa] mt-4">
              Note: This will show a full-screen error UI with recovery options
            </p>
          </CardContent>
        </Card>

        {/* Resurrection Progress Component Section */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-[#FF6B35]">
              🔮 Resurrection Progress Screen
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Full-featured progress tracking with live workflow updates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-[#F7F7FF] mb-4">
              The ResurrectionProgress component provides real-time tracking of the 5-step workflow
              with Halloween-themed animations, floating ghosts, and bat-wing progress bars.
            </p>
            <div className="bg-[#1a0f2e] border border-[#5b21b6] rounded-lg p-4 mb-4">
              <h4 className="text-[#FF6B35] font-semibold mb-2">Features:</h4>
              <ul className="space-y-2 text-sm text-[#a78bfa]">
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B35]">•</span>
                  <span>Live polling of resurrection status every 2 seconds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B35]">•</span>
                  <span>Animated workflow steps: ANALYZE → PLAN → GENERATE → VALIDATE → DEPLOY</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B35]">•</span>
                  <span>Floating ghost animations and fog effects</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B35]">•</span>
                  <span>Bat-wing style progress bar with pulsing animations</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B35]">•</span>
                  <span>Real-time elapsed time and estimated time remaining</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#FF6B35]">•</span>
                  <span>Pulsing pumpkin loader with glow effects</span>
                </li>
              </ul>
            </div>
            <p className="text-sm text-[#a78bfa]">
              Note: To see this component in action, start a resurrection from the upload page.
              The progress screen will automatically display during the transformation process.
            </p>
          </CardContent>
        </Card>

        {/* Back Button */}
        <div className="text-center">
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
          >
            ← Back to Home
          </Button>
        </div>
      </div>

      {/* Full Screen Loader Overlay */}
      {showFullScreenLoader && (
        <LoadingState
          message="Summoning spirits..."
          description="Please wait while we perform dark magic"
          size="lg"
          variant="ghost"
          fullScreen
        />
      )}

      {/* Resurrection Loader Overlay */}
      {showResurrectionLoader && (
        <div className="fixed inset-0 bg-[#0a0a0f]/95 z-50 flex items-center justify-center p-4">
          <ResurrectionLoader
            currentStep={resurrectionStep}
            progress={resurrectionProgress}
          />
        </div>
      )}
    </div>
  );
}
