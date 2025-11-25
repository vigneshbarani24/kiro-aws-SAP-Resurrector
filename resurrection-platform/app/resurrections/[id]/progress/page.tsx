'use client';

import { useParams, useRouter } from 'next/navigation';
import { ResurrectionProgress } from '@/components/ResurrectionProgress';
import { halloweenToast } from '@/lib/toast';

/**
 * Resurrection Progress Page
 * 
 * Displays live progress tracking for an ongoing resurrection workflow.
 * This page shows the 5-step transformation process with Halloween-themed animations.
 * 
 * Requirements: 3.7, 8.9, 17.10
 */
export default function ResurrectionProgressPage() {
  const params = useParams();
  const router = useRouter();
  const resurrectionId = params.id as string;

  const handleComplete = () => {
    halloweenToast.resurrection.completed('');
    // Navigate to the results page
    router.push(`/resurrections/${resurrectionId}`);
  };

  const handleError = (error: string) => {
    halloweenToast.resurrection.failed(error);
    // Navigate to the results page to show error details
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
