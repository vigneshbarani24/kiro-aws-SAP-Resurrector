'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ABAPObject {
  id: string;
  name: string;
  type: string;
  linesOfCode: number;
  complexity: number;
  dependencies: string[];
}

interface ResurrectionWizardProps {
  open: boolean;
  onClose: () => void;
  abapObjects: ABAPObject[];
  onStartResurrection: (config: ResurrectionConfig) => void;
}

interface ResurrectionConfig {
  selectedObjects: string[];
  projectName: string;
  template: 'fiori-list' | 'fiori-object' | 'api-only';
}

type WizardStep = 'select' | 'configure' | 'name' | 'summary';

const TEMPLATES = [
  {
    id: 'fiori-list' as const,
    name: 'Fiori Elements List Report',
    description: 'List/detail view with search and filters',
    icon: '📋',
  },
  {
    id: 'fiori-object' as const,
    name: 'Fiori Elements Object Page',
    description: 'Single object view with sections',
    icon: '📄',
  },
  {
    id: 'api-only' as const,
    name: 'API-Only (No UI)',
    description: 'Backend services only',
    icon: '🔌',
  },
];

export function ResurrectionWizard({ open, onClose, abapObjects, onStartResurrection }: ResurrectionWizardProps) {
  const [currentStep, setCurrentStep] = useState<WizardStep>('select');
  const [selectedObjects, setSelectedObjects] = useState<Set<string>>(new Set());
  const [projectName, setProjectName] = useState('');
  const [template, setTemplate] = useState<'fiori-list' | 'fiori-object' | 'api-only'>('fiori-list');

  const steps: { id: WizardStep; name: string; icon: string }[] = [
    { id: 'select', name: 'Select Objects', icon: '📜' },
    { id: 'configure', name: 'Configure', icon: '⚙️' },
    { id: 'name', name: 'Name Project', icon: '🏷️' },
    { id: 'summary', name: 'Summary', icon: '✨' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const toggleObject = (objectId: string) => {
    const newSelected = new Set(selectedObjects);
    if (newSelected.has(objectId)) {
      newSelected.delete(objectId);
    } else {
      newSelected.add(objectId);
    }
    setSelectedObjects(newSelected);
  };

  const handleNext = () => {
    const stepOrder: WizardStep[] = ['select', 'configure', 'name', 'summary'];
    const nextIndex = stepOrder.indexOf(currentStep) + 1;
    if (nextIndex < stepOrder.length) {
      setCurrentStep(stepOrder[nextIndex]);
    }
  };

  const handleBack = () => {
    const stepOrder: WizardStep[] = ['select', 'configure', 'name', 'summary'];
    const prevIndex = stepOrder.indexOf(currentStep) - 1;
    if (prevIndex >= 0) {
      setCurrentStep(stepOrder[prevIndex]);
    }
  };

  const handleStart = () => {
    onStartResurrection({
      selectedObjects: Array.from(selectedObjects),
      projectName,
      template,
    });
  };

  const canProceed = () => {
    switch (currentStep) {
      case 'select':
        return selectedObjects.size > 0;
      case 'configure':
        return true;
      case 'name':
        return projectName.trim().length > 0 && /^[a-z0-9-]+$/.test(projectName);
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  const totalLOC = abapObjects
    .filter(obj => selectedObjects.has(obj.id))
    .reduce((sum, obj) => sum + obj.linesOfCode, 0);

  const estimatedTime = Math.ceil(totalLOC / 400); // ~400 LOC per minute

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-[#1a0f2e] border-2 border-[#5b21b6]">
        <DialogHeader>
          <DialogTitle className="text-3xl text-[#FF6B35] flex items-center gap-2">
            <span className="animate-pulse-glow">🔮</span>
            Resurrection Ritual
          </DialogTitle>
          <DialogDescription className="text-[#a78bfa] text-lg">
            Configure your ABAP transformation into modern SAP CAP
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="mb-6">
          <div className="flex justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center flex-1 ${
                  index <= currentStepIndex ? 'opacity-100' : 'opacity-40'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl border-2 transition-all duration-300 ${
                    index <= currentStepIndex
                      ? 'border-[#FF6B35] bg-[#2e1065] shadow-[0_0_20px_rgba(255,107,53,0.4)]'
                      : 'border-[#5b21b6] bg-[#1a0f2e]'
                  }`}
                >
                  {step.icon}
                </div>
                <span className="mt-2 text-xs text-[#a78bfa] text-center">{step.name}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 'select' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-[#FF6B35]">
                  Select ABAP Objects to Resurrect
                </h3>
                <Badge variant="outline" className="border-[#8b5cf6] text-[#a78bfa]">
                  {selectedObjects.size} selected
                </Badge>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {abapObjects.map((obj) => {
                  const isSelected = selectedObjects.has(obj.id);
                  const hasAutoDeps = obj.dependencies.length > 0;

                  return (
                    <Card
                      key={obj.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'border-[#FF6B35] bg-[#2e1065]/50 shadow-[0_0_15px_rgba(255,107,53,0.3)]'
                          : 'border-[#5b21b6] hover:border-[#8b5cf6] hover:bg-[#2e1065]/30'
                      }`}
                      onClick={() => toggleObject(obj.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-lg">{isSelected ? '✅' : '⬜'}</span>
                              <h4 className="font-semibold text-[#F7F7FF]">{obj.name}</h4>
                              <Badge variant="secondary" className="text-xs">
                                {obj.type}
                              </Badge>
                            </div>
                            <div className="flex gap-4 text-sm text-[#a78bfa] ml-8">
                              <span>📏 {obj.linesOfCode} LOC</span>
                              <span>🧩 Complexity: {obj.complexity}</span>
                              {hasAutoDeps && (
                                <span className="text-[#FF6B35]">
                                  🔗 {obj.dependencies.length} dependencies
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && obj.complexity < 5 && (
                            <Badge className="bg-[#10B981] text-white">
                              ⭐ Recommended
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {currentStep === 'configure' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#FF6B35] mb-4">
                Choose Your Template
              </h3>

              <div className="grid gap-4">
                {TEMPLATES.map((tmpl) => (
                  <Card
                    key={tmpl.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      template === tmpl.id
                        ? 'border-[#FF6B35] bg-[#2e1065]/50 shadow-[0_0_15px_rgba(255,107,53,0.3)]'
                        : 'border-[#5b21b6] hover:border-[#8b5cf6] hover:bg-[#2e1065]/30'
                    }`}
                    onClick={() => setTemplate(tmpl.id)}
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-[#F7F7FF]">
                        <span className="text-3xl">{tmpl.icon}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            {tmpl.name}
                            {template === tmpl.id && (
                              <span className="text-[#FF6B35]">✓</span>
                            )}
                          </div>
                          <CardDescription className="text-[#a78bfa] font-normal">
                            {tmpl.description}
                          </CardDescription>
                        </div>
                      </CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {currentStep === 'name' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#FF6B35] mb-4">
                Name Your Resurrection Project
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name" className="text-[#F7F7FF] mb-2 block">
                    Project Name
                  </Label>
                  <Input
                    id="project-name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="resurrection-sd-pricing"
                    className="bg-[#2e1065] border-[#5b21b6] text-[#F7F7FF] placeholder:text-[#6B7280]"
                  />
                  <p className="text-sm text-[#a78bfa] mt-2">
                    Use lowercase letters, numbers, and hyphens only
                  </p>
                </div>

                {projectName && (
                  <Card className="border-[#5b21b6] bg-[#2e1065]/30">
                    <CardContent className="p-4">
                      <h4 className="text-[#FF6B35] font-semibold mb-2">
                        GitHub Repository Preview
                      </h4>
                      <div className="space-y-1 text-sm text-[#a78bfa]">
                        <p>📦 Repository: <span className="text-[#F7F7FF]">{projectName}</span></p>
                        <p>🔗 URL: <span className="text-[#F7F7FF]">github.com/your-org/{projectName}</span></p>
                        <p>💻 BAS Link: Will be generated after creation</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}

          {currentStep === 'summary' && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold text-[#FF6B35] mb-4">
                Ready to Resurrect! 🎃
              </h3>

              <Card className="border-[#5b21b6] bg-[#2e1065]/30">
                <CardHeader>
                  <CardTitle className="text-[#FF6B35]">Resurrection Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-[#F7F7FF] font-semibold mb-2">Selected Objects</h4>
                    <div className="flex flex-wrap gap-2">
                      {abapObjects
                        .filter(obj => selectedObjects.has(obj.id))
                        .map(obj => (
                          <Badge key={obj.id} variant="outline" className="border-[#8b5cf6] text-[#a78bfa]">
                            {obj.name}
                          </Badge>
                        ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#5b21b6]">
                    <div>
                      <p className="text-[#a78bfa] text-sm">Total Lines of Code</p>
                      <p className="text-2xl font-bold text-[#FF6B35]">{totalLOC.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[#a78bfa] text-sm">Estimated Time</p>
                      <p className="text-2xl font-bold text-[#FF6B35]">~{estimatedTime} min</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#5b21b6]">
                    <p className="text-[#a78bfa] text-sm mb-1">Template</p>
                    <p className="text-[#F7F7FF] font-semibold">
                      {TEMPLATES.find(t => t.id === template)?.name}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-[#5b21b6]">
                    <p className="text-[#a78bfa] text-sm mb-1">Project Name</p>
                    <p className="text-[#F7F7FF] font-semibold">{projectName}</p>
                  </div>

                  <div className="pt-4 border-t border-[#5b21b6] bg-[#2e1065]/50 p-4 rounded-lg">
                    <h4 className="text-[#FF6B35] font-semibold mb-2 flex items-center gap-2">
                      <span>🔮</span>
                      What happens next?
                    </h4>
                    <ul className="space-y-2 text-sm text-[#a78bfa]">
                      <li className="flex items-start gap-2">
                        <span className="text-[#FF6B35]">1.</span>
                        <span>ANALYZE: Parse ABAP code and extract business logic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#FF6B35]">2.</span>
                        <span>PLAN: Create transformation architecture</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#FF6B35]">3.</span>
                        <span>GENERATE: Create CAP models, services, and UI</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#FF6B35]">4.</span>
                        <span>VALIDATE: Check quality and compliance</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#FF6B35]">5.</span>
                        <span>DEPLOY: Create GitHub repository and BAS link</span>
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6 border-t border-[#5b21b6]">
          <Button
            onClick={handleBack}
            disabled={currentStep === 'select'}
            variant="outline"
            className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
          >
            ← Back
          </Button>

          <div className="flex gap-2">
            <Button
              onClick={onClose}
              variant="outline"
              className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
            >
              Cancel
            </Button>

            {currentStep !== 'summary' ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF]"
              >
                Next →
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF] shadow-[0_0_20px_rgba(255,107,53,0.5)]"
              >
                <span className="mr-2">🎃</span>
                Start Resurrection!
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
