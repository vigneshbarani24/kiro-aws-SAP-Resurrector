'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface SpecProgressProps {
  specPath: string;
  tasksCompleted: number;
  tasksTotal: number;
  requirementsCount: number;
  propertiesCount: number;
}

export function SpecProgress({
  specPath,
  tasksCompleted,
  tasksTotal,
  requirementsCount,
  propertiesCount,
}: SpecProgressProps) {
  const completionPercentage = tasksTotal > 0 ? (tasksCompleted / tasksTotal) * 100 : 0;

  return (
    <Card className="border-[#5b21b6] bg-[#2e1065]/30">
      <CardHeader>
        <CardTitle className="text-[#FF6B35] flex items-center gap-2">
          <span>📋</span>
          Kiro Spec Progress
        </CardTitle>
        <CardDescription className="text-[#a78bfa]">
          Spec-driven planning and implementation tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Spec Location */}
        <div>
          <p className="text-sm text-[#a78bfa] mb-1">Spec Location</p>
          <code className="text-xs text-[#F7F7FF] bg-[#1a0f2e] px-2 py-1 rounded">
            {specPath}
          </code>
        </div>

        {/* Task Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-[#a78bfa]">Task Completion</p>
            <Badge variant="outline" className="border-[#8b5cf6] text-[#a78bfa]">
              {tasksCompleted} / {tasksTotal}
            </Badge>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <p className="text-xs text-[#a78bfa] mt-1">
            {completionPercentage.toFixed(0)}% complete
          </p>
        </div>

        {/* Spec Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#5b21b6]">
          <div>
            <p className="text-sm text-[#a78bfa] mb-1">Requirements</p>
            <p className="text-2xl font-bold text-[#FF6B35]">{requirementsCount}</p>
          </div>
          <div>
            <p className="text-sm text-[#a78bfa] mb-1">Properties</p>
            <p className="text-2xl font-bold text-[#FF6B35]">{propertiesCount}</p>
          </div>
        </div>

        {/* Spec Files */}
        <div className="pt-4 border-t border-[#5b21b6]">
          <p className="text-sm text-[#a78bfa] mb-2">Spec Documents</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#10B981]">✓</span>
              <span className="text-[#F7F7FF]">requirements.md</span>
              <Badge className="bg-[#10B981] text-white text-xs">Generated</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#10B981]">✓</span>
              <span className="text-[#F7F7FF]">design.md</span>
              <Badge className="bg-[#10B981] text-white text-xs">Generated</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#10B981]">✓</span>
              <span className="text-[#F7F7FF]">tasks.md</span>
              <Badge className="bg-[#10B981] text-white text-xs">Generated</Badge>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-[#5b21b6] flex gap-2">
          <a
            href={`/${specPath}/requirements.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] underline"
          >
            View Requirements
          </a>
          <span className="text-[#5b21b6]">•</span>
          <a
            href={`/${specPath}/design.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] underline"
          >
            View Design
          </a>
          <span className="text-[#5b21b6]">•</span>
          <a
            href={`/${specPath}/tasks.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[#8b5cf6] hover:text-[#a78bfa] underline"
          >
            View Tasks
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
