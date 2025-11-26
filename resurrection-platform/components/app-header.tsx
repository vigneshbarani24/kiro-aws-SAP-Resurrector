'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function AppHeader() {
  return (
    <header className="h-16 border-b border-[#5b21b6] bg-[#1a0f2e]/80 backdrop-blur-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#F7F7FF]">SAP Resurrection Platform</h2>
          <p className="text-xs text-[#a78bfa]">Transform legacy ABAP to modern CAP</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Status Badge */}
        <Badge 
          variant="outline" 
          className="bg-[#10B981]/10 text-[#10B981] border-[#10B981]/50"
        >
          <span className="mr-1">●</span> All Systems Operational
        </Badge>

        {/* User Menu */}
        <div className="flex items-center gap-3 px-4 py-2 bg-[#2e1065]/50 rounded-lg border border-[#5b21b6]">
          <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white font-bold">
            D
          </div>
          <div className="text-sm">
            <div className="text-[#F7F7FF] font-medium">Default User</div>
            <div className="text-[#a78bfa] text-xs">default@resurrection.local</div>
          </div>
        </div>
      </div>
    </header>
  );
}
