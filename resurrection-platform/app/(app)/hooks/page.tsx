/**
 * Hooks Configuration Page
 * 
 * Provides UI for managing Kiro hooks
 * 
 * Requirements: 11.8
 */

import { HookConfigurationUI } from '@/components/HookConfigurationUI';

export default function HooksPage() {
  return (
    <div className="container mx-auto p-6">
      <HookConfigurationUI />
    </div>
  );
}
