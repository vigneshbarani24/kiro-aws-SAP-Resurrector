/**
 * Redundancy Card Component
 * 
 * Displays redundancy detection results with consolidation recommendations
 * Implements requirement 6.6: show similarity scores and consolidation recommendations
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Loader2, AlertTriangle, CheckCircle2, TrendingDown } from 'lucide-react';

interface Redundancy {
  file1: {
    id: string;
    name: string;
    type: string;
    module: string;
    linesOfCode: number;
  };
  file2: {
    id: string;
    name: string;
    type: string;
    module: string;
    linesOfCode: number;
  };
  similarity: number;
  recommendation: string;
  potentialSavings: {
    linesOfCode: number;
    effort: 'Low' | 'Medium' | 'High';
  };
}

interface RedundancyStatistics {
  totalRedundancies: number;
  highSimilarity: number;
  mediumSimilarity: number;
  totalPotentialSavings: number;
  byModule: Record<string, number>;
  byType: Record<string, number>;
}

interface ConsolidationPlan {
  priority: 'high' | 'medium' | 'low';
  items: Array<{
    files: string[];
    similarity: number;
    effort: string;
    savings: number;
    action: string;
  }>;
  totalSavings: number;
  estimatedEffort: string;
}

interface RedundancyCardProps {
  userId?: string;
  abapObjectIds?: string[];
}

export function RedundancyCard({ userId, abapObjectIds }: RedundancyCardProps) {
  const [loading, setLoading] = useState(false);
  const [redundancies, setRedundancies] = useState<Redundancy[]>([]);
  const [statistics, setStatistics] = useState<RedundancyStatistics | null>(null);
  const [consolidationPlan, setConsolidationPlan] = useState<ConsolidationPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectRedundancies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/intelligence/redundancy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          abapObjectIds,
          threshold: 0.85
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to detect redundancies');
      }

      const data = await response.json();
      setRedundancies(data.redundancies || []);
      setStatistics(data.statistics);
      setConsolidationPlan(data.consolidationPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getSimilarityColor = (similarity: number) => {
    if (similarity >= 0.95) return 'text-red-600 dark:text-red-400';
    if (similarity >= 0.85) return 'text-orange-600 dark:text-orange-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };

  const getSimilarityBadge = (similarity: number) => {
    if (similarity >= 0.95) return <Badge variant="destructive">Very High</Badge>;
    if (similarity >= 0.85) return <Badge className="bg-orange-500">High</Badge>;
    return <Badge className="bg-yellow-500">Medium</Badge>;
  };

  const getEffortBadge = (effort: string) => {
    if (effort === 'High') return <Badge variant="destructive">{effort}</Badge>;
    if (effort === 'Medium') return <Badge className="bg-orange-500">{effort}</Badge>;
    return <Badge variant="secondary">{effort}</Badge>;
  };

  const getPriorityIcon = (priority: string) => {
    if (priority === 'high') return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (priority === 'medium') return <AlertTriangle className="h-5 w-5 text-orange-600" />;
    return <CheckCircle2 className="h-5 w-5 text-green-600" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Redundancy Detection
            </CardTitle>
            <CardDescription>
              Find duplicate and similar ABAP code to reduce complexity
            </CardDescription>
          </div>
          <Button
            onClick={detectRedundancies}
            disabled={loading}
            variant="default"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Detect Redundancies'
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-800 dark:text-red-200">
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total Redundancies</p>
              <p className="text-2xl font-bold">{statistics.totalRedundancies}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">High Similarity</p>
              <p className="text-2xl font-bold text-red-600">{statistics.highSimilarity}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Medium Similarity</p>
              <p className="text-2xl font-bold text-orange-600">{statistics.mediumSimilarity}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Potential Savings</p>
              <p className="text-2xl font-bold text-green-600">{statistics.totalPotentialSavings} LOC</p>
            </div>
          </div>
        )}

        {consolidationPlan && (
          <div className="rounded-lg border p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                {getPriorityIcon(consolidationPlan.priority)}
                Consolidation Plan
              </h3>
              <Badge variant={consolidationPlan.priority === 'high' ? 'destructive' : 'secondary'}>
                {consolidationPlan.priority.toUpperCase()} Priority
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Savings</p>
                <p className="text-xl font-bold text-green-600">{consolidationPlan.totalSavings} LOC</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated Effort</p>
                <p className="text-xl font-bold">{consolidationPlan.estimatedEffort}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Top Consolidation Opportunities</h4>
              {consolidationPlan.items.slice(0, 5).map((item, index) => (
                <div key={index} className="rounded-lg bg-muted p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm">{item.files[0]}</span>
                      <span className="text-muted-foreground">↔</span>
                      <span className="font-mono text-sm">{item.files[1]}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSimilarityBadge(item.similarity)}
                      {getEffortBadge(item.effort)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.action}</p>
                  <p className="text-sm font-semibold text-green-600">
                    Potential savings: {item.savings} LOC
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {redundancies.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">All Redundancies ({redundancies.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {redundancies.map((redundancy, index) => (
                <div key={index} className="rounded-lg border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{redundancy.file1.name}</span>
                        <Badge variant="outline">{redundancy.file1.type}</Badge>
                        <Badge variant="outline">{redundancy.file1.module}</Badge>
                        <span className="text-sm text-muted-foreground">{redundancy.file1.linesOfCode} LOC</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-semibold">{redundancy.file2.name}</span>
                        <Badge variant="outline">{redundancy.file2.type}</Badge>
                        <Badge variant="outline">{redundancy.file2.module}</Badge>
                        <span className="text-sm text-muted-foreground">{redundancy.file2.linesOfCode} LOC</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className={`text-2xl font-bold ${getSimilarityColor(redundancy.similarity)}`}>
                        {(redundancy.similarity * 100).toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground">similarity</p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-semibold mb-1">Recommendation:</p>
                    <p className="text-sm text-muted-foreground">{redundancy.recommendation}</p>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Effort:</span>
                      {getEffortBadge(redundancy.potentialSavings.effort)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Potential savings:</span>
                      <span className="font-semibold text-green-600">
                        {redundancy.potentialSavings.linesOfCode} LOC
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!loading && redundancies.length === 0 && statistics && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
            <p className="font-semibold">No redundancies detected!</p>
            <p className="text-sm">Your ABAP code is well-organized with minimal duplication.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
