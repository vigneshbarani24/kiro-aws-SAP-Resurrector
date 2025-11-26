'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RedundancyCard } from '@/components/RedundancyCard';
import { DependencyGraph } from '@/components/DependencyGraph';
import { FitToStandardDashboard } from '@/components/FitToStandardDashboard';
import { 
  Code2, 
  FileCode, 
  TrendingDown, 
  Sparkles, 
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface IntelligenceMetrics {
  totalObjects: number;
  totalLOC: number;
  redundancies: number;
  fitToStandardOpportunities: number;
  byModule: Record<string, number>;
  byType: Record<string, number>;
}

export default function IntelligenceDashboardPage() {
  const [metrics, setMetrics] = useState<IntelligenceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/intelligence/metrics');
      if (!response.ok) {
        throw new Error('Failed to load intelligence metrics');
      }
      
      const data = await response.json();
      setMetrics(data.metrics);
    } catch (err) {
      console.error('Error loading metrics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#FF6B35] mx-auto mb-4" />
          <p className="text-[#a78bfa] text-xl">Loading intelligence dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-2 border-red-500/50 bg-red-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 text-red-400">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <p className="font-semibold">Error loading dashboard</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
            <Button 
              onClick={loadMetrics} 
              className="mt-4 bg-red-500 hover:bg-red-600"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#FF6B35] mb-2 flex items-center gap-3">
            <Sparkles className="h-10 w-10" />
            Intelligence Dashboard
          </h1>
          <p className="text-[#a78bfa] text-lg">
            Explore your ABAP code landscape with AI-powered insights
          </p>
        </div>
        <Button 
          onClick={loadMetrics}
          variant="outline"
          className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
        >
          <span className="mr-2">🔄</span>
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-2 border-[#5b21b6] bg-gradient-to-br from-[#2e1065]/50 to-[#1a0f2e]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#a78bfa] text-sm font-medium">
                Total Objects
              </CardTitle>
              <FileCode className="h-5 w-5 text-[#FF6B35]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#FF6B35]">
              {metrics?.totalObjects || 0}
            </div>
            <p className="text-xs text-[#a78bfa] mt-2">
              ABAP objects analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-[#5b21b6] bg-gradient-to-br from-[#2e1065]/50 to-[#1a0f2e]/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[#a78bfa] text-sm font-medium">
                Lines of Code
              </CardTitle>
              <Code2 className="h-5 w-5 text-[#FF6B35]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-[#FF6B35]">
              {(metrics?.totalLOC || 0).toLocaleString()}
            </div>
            <p className="text-xs text-[#a78bfa] mt-2">
              Total lines analyzed
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-500/50 bg-gradient-to-br from-orange-500/20 to-[#1a0f2e]/50 hover:shadow-[0_0_20px_rgba(255,107,53,0.5)] transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-orange-400 text-sm font-medium">
                Redundancies
              </CardTitle>
              <TrendingDown className="h-5 w-5 text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-orange-400">
              {metrics?.redundancies || 0}
            </div>
            <p className="text-xs text-[#a78bfa] mt-2">
              Duplicate code detected
            </p>
            {metrics && metrics.redundancies > 0 && (
              <Button 
                size="sm" 
                className="mt-3 w-full bg-orange-500 hover:bg-orange-600 text-white"
                onClick={() => {
                  const element = document.getElementById('redundancy-tab');
                  element?.click();
                }}
              >
                View Redundancies
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 border-green-500/50 bg-gradient-to-br from-green-500/20 to-[#1a0f2e]/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-400 text-sm font-medium">
                Fit-to-Standard
              </CardTitle>
              <CheckCircle2 className="h-5 w-5 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-400">
              {metrics?.fitToStandardOpportunities || 0}
            </div>
            <p className="text-xs text-[#a78bfa] mt-2">
              Standard alternatives found
            </p>
            {metrics && metrics.fitToStandardOpportunities > 0 && (
              <Button 
                size="sm" 
                className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white"
                onClick={() => {
                  const element = document.getElementById('fit-to-standard-tab');
                  element?.click();
                }}
              >
                View Recommendations
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Module Breakdown with Interactive Filtering */}
      {metrics && Object.keys(metrics.byModule).length > 0 && (
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
          <CardHeader>
            <CardTitle className="text-[#FF6B35] text-xl">
              Objects by Module
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Click a module to filter analysis by that module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(metrics.byModule)
                .sort(([, a], [, b]) => b - a)
                .map(([module, count]) => (
                  <Badge 
                    key={module}
                    variant="outline"
                    className="bg-[#2e1065]/50 text-[#F7F7FF] border-[#5b21b6] px-4 py-2 text-base cursor-pointer hover:bg-[#FF6B35] hover:text-[#F7F7FF] transition-colors"
                    onClick={() => {
                      // Future: Filter by module
                      console.log('Filter by module:', module);
                    }}
                  >
                    <span className="font-semibold">{module}</span>
                    <span className="ml-2 text-[#FF6B35]">({count})</span>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Type Breakdown with Interactive Filtering */}
      {metrics && Object.keys(metrics.byType).length > 0 && (
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
          <CardHeader>
            <CardTitle className="text-[#FF6B35] text-xl">
              Objects by Type
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              Click a type to filter analysis by that object type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(metrics.byType)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => (
                  <Badge 
                    key={type}
                    variant="outline"
                    className="bg-[#1a0f2e]/50 text-[#F7F7FF] border-[#5b21b6] px-4 py-2 text-base cursor-pointer hover:bg-[#a78bfa] hover:text-[#F7F7FF] transition-colors"
                    onClick={() => {
                      // Future: Filter by type
                      console.log('Filter by type:', type);
                    }}
                  >
                    <span className="font-semibold">{type}</span>
                    <span className="ml-2 text-[#a78bfa]">({count})</span>
                  </Badge>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Detailed Analysis */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-[#2e1065]/50 border border-[#5b21b6]">
          <TabsTrigger 
            value="overview"
            className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-[#F7F7FF]"
          >
            <span className="mr-2">📊</span>
            Overview
          </TabsTrigger>
          <TabsTrigger 
            id="redundancy-tab"
            value="redundancy"
            className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-[#F7F7FF]"
          >
            <span className="mr-2">🔍</span>
            Redundancy Detection
          </TabsTrigger>
          <TabsTrigger 
            id="fit-to-standard-tab"
            value="fit-to-standard"
            className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-[#F7F7FF]"
          >
            <span className="mr-2">✨</span>
            Fit-to-Standard
          </TabsTrigger>
          <TabsTrigger 
            value="dependencies"
            className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-[#F7F7FF]"
          >
            <span className="mr-2">🕸️</span>
            Dependencies
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
            <CardHeader>
              <CardTitle className="text-[#FF6B35] text-2xl">
                Intelligence Overview
              </CardTitle>
              <CardDescription className="text-[#a78bfa]">
                AI-powered insights into your ABAP codebase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-[#F7F7FF] font-semibold text-lg flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-orange-400" />
                    Redundancy Analysis
                  </h3>
                  <p className="text-[#a78bfa]">
                    Identify duplicate and similar code to reduce complexity and maintenance burden.
                    Our AI analyzes code similarity using advanced embeddings.
                  </p>
                  <Button 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => {
                      const element = document.getElementById('redundancy-tab');
                      element?.click();
                    }}
                  >
                    Analyze Redundancies
                  </Button>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[#F7F7FF] font-semibold text-lg flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-400" />
                    Fit-to-Standard Recommendations
                  </h3>
                  <p className="text-[#a78bfa]">
                    Discover SAP standard alternatives (BAPIs, transactions, patterns) that can replace
                    custom code, reducing TCO and improving Clean Core compliance.
                  </p>
                  <Button 
                    className="bg-green-500 hover:bg-green-600 text-white"
                    onClick={() => {
                      const element = document.getElementById('fit-to-standard-tab');
                      element?.click();
                    }}
                  >
                    View Recommendations
                  </Button>
                </div>
              </div>

              {(!metrics || metrics.totalObjects === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-[#5b21b6] rounded-lg">
                  <div className="text-6xl mb-4">👻</div>
                  <p className="text-[#a78bfa] text-lg mb-4">
                    No ABAP objects analyzed yet
                  </p>
                  <p className="text-[#a78bfa] text-sm mb-6">
                    Upload ABAP files to start analyzing your code landscape
                  </p>
                  <Button 
                    className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF]"
                    onClick={() => window.location.href = '/upload'}
                  >
                    <span className="mr-2">📤</span>
                    Upload ABAP Files
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="redundancy" className="mt-6">
          <RedundancyCard />
        </TabsContent>

        <TabsContent value="fit-to-standard" className="mt-6">
          <FitToStandardDashboard />
        </TabsContent>

        <TabsContent value="dependencies" className="mt-6">
          <DependencyGraph />
        </TabsContent>
      </Tabs>
    </div>
  );
}
