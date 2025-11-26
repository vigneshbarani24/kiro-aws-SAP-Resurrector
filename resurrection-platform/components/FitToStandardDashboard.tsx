/**
 * Fit-to-Standard Dashboard Component
 * 
 * Displays fit-to-standard recommendations with filtering and actions
 * Implements Requirement 6.7: show fit-to-standard recommendations
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { FitToStandardCard } from '@/components/FitToStandardCard';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Sparkles, Search, Filter } from 'lucide-react';

interface FitToStandardRecommendation {
  id: string;
  abapObjectId: string;
  abapObjectName: string;
  standardAlternative: string;
  standardType: 'BAPI' | 'TRANSACTION' | 'PATTERN' | 'API';
  confidence: number;
  description: string;
  benefits: string[];
  effort: 'LOW' | 'MEDIUM' | 'HIGH';
  potentialSavings: {
    locReduction: number;
    maintenanceReduction: number;
    complexityReduction: number;
  };
  implementationGuide?: string;
  codeExample?: string;
  status: 'RECOMMENDED' | 'ACCEPTED' | 'REJECTED' | 'IMPLEMENTED';
}

interface FitToStandardDashboardProps {
  userId?: string;
  abapObjectIds?: string[];
}

export function FitToStandardDashboard({ userId, abapObjectIds }: FitToStandardDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<FitToStandardRecommendation[]>([]);
  const [filteredRecommendations, setFilteredRecommendations] = useState<FitToStandardRecommendation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [effortFilter, setEffortFilter] = useState<string>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<string>('all');
  const [showGuideModal, setShowGuideModal] = useState<string | null>(null);

  const analyzeCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/intelligence/fit-to-standard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          abapObjectIds,
          minConfidence: 0.5,
          maxRecommendations: 20
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze code');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
      setFilteredRecommendations(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...recommendations];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(r =>
        r.abapObjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.standardAlternative.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => r.standardType === typeFilter);
    }

    // Effort filter
    if (effortFilter !== 'all') {
      filtered = filtered.filter(r => r.effort === effortFilter);
    }

    // Confidence filter
    if (confidenceFilter !== 'all') {
      if (confidenceFilter === 'high') {
        filtered = filtered.filter(r => r.confidence >= 0.8);
      } else if (confidenceFilter === 'medium') {
        filtered = filtered.filter(r => r.confidence >= 0.5 && r.confidence < 0.8);
      } else if (confidenceFilter === 'low') {
        filtered = filtered.filter(r => r.confidence < 0.5);
      }
    }

    setFilteredRecommendations(filtered);
  };

  // Apply filters whenever filter values change
  useState(() => {
    applyFilters();
  });

  const handleAccept = async (id: string) => {
    try {
      const response = await fetch(`/api/intelligence/fit-to-standard/${id}/accept`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setRecommendations(prev =>
          prev.map(r => r.id === id ? { ...r, status: 'ACCEPTED' as const } : r)
        );
        applyFilters();
      }
    } catch (error) {
      console.error('Error accepting recommendation:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/intelligence/fit-to-standard/${id}/reject`, {
        method: 'POST',
      });

      if (response.ok) {
        // Update local state
        setRecommendations(prev =>
          prev.map(r => r.id === id ? { ...r, status: 'REJECTED' as const } : r)
        );
        applyFilters();
      }
    } catch (error) {
      console.error('Error rejecting recommendation:', error);
    }
  };

  const handleViewGuide = (id: string) => {
    setShowGuideModal(id);
  };

  // Calculate summary stats
  const totalSavings = recommendations.reduce(
    (sum, r) => sum + r.potentialSavings.locReduction,
    0
  );
  const avgConfidence = recommendations.length > 0
    ? Math.round(
        (recommendations.reduce((sum, r) => sum + r.confidence, 0) / recommendations.length) * 100
      )
    : 0;
  const highConfidenceCount = recommendations.filter(r => r.confidence >= 0.8).length;

  return (
    <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-[#FF6B35] text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Fit-to-Standard Recommendations
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              AI-powered recommendations for SAP standard alternatives
            </CardDescription>
          </div>
          <Button
            onClick={analyzeCode}
            disabled={loading}
            className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Code
              </>
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

        {recommendations.length > 0 && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-lg border border-[#5b21b6] bg-[#1a0f2e]/50 p-4">
                <p className="text-sm text-[#a78bfa]">Total Recommendations</p>
                <p className="text-3xl font-bold text-[#FF6B35]">{recommendations.length}</p>
              </div>
              <div className="rounded-lg border border-[#5b21b6] bg-[#1a0f2e]/50 p-4">
                <p className="text-sm text-[#a78bfa]">High Confidence</p>
                <p className="text-3xl font-bold text-green-400">{highConfidenceCount}</p>
              </div>
              <div className="rounded-lg border border-[#5b21b6] bg-[#1a0f2e]/50 p-4">
                <p className="text-sm text-[#a78bfa]">Avg Confidence</p>
                <p className="text-3xl font-bold text-[#a78bfa]">{avgConfidence}%</p>
              </div>
              <div className="rounded-lg border border-[#5b21b6] bg-[#1a0f2e]/50 p-4">
                <p className="text-sm text-[#a78bfa]">Potential Savings</p>
                <p className="text-3xl font-bold text-green-400">{totalSavings} LOC</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#a78bfa]" />
                <Input
                  placeholder="Search recommendations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    applyFilters();
                  }}
                  className="pl-10 bg-[#2e1065]/30 border-[#5b21b6] text-[#F7F7FF] placeholder:text-[#a78bfa]"
                />
              </div>

              <Select value={typeFilter} onValueChange={(value) => {
                setTypeFilter(value);
                applyFilters();
              }}>
                <SelectTrigger className="w-[180px] bg-[#2e1065]/30 border-[#5b21b6] text-[#F7F7FF]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-[#5b21b6]">
                  <SelectItem value="all" className="text-[#F7F7FF]">All Types</SelectItem>
                  <SelectItem value="BAPI" className="text-[#F7F7FF]">BAPI</SelectItem>
                  <SelectItem value="TRANSACTION" className="text-[#F7F7FF]">Transaction</SelectItem>
                  <SelectItem value="PATTERN" className="text-[#F7F7FF]">Pattern</SelectItem>
                  <SelectItem value="API" className="text-[#F7F7FF]">API</SelectItem>
                </SelectContent>
              </Select>

              <Select value={effortFilter} onValueChange={(value) => {
                setEffortFilter(value);
                applyFilters();
              }}>
                <SelectTrigger className="w-[180px] bg-[#2e1065]/30 border-[#5b21b6] text-[#F7F7FF]">
                  <SelectValue placeholder="Filter by effort" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-[#5b21b6]">
                  <SelectItem value="all" className="text-[#F7F7FF]">All Efforts</SelectItem>
                  <SelectItem value="LOW" className="text-[#F7F7FF]">Low</SelectItem>
                  <SelectItem value="MEDIUM" className="text-[#F7F7FF]">Medium</SelectItem>
                  <SelectItem value="HIGH" className="text-[#F7F7FF]">High</SelectItem>
                </SelectContent>
              </Select>

              <Select value={confidenceFilter} onValueChange={(value) => {
                setConfidenceFilter(value);
                applyFilters();
              }}>
                <SelectTrigger className="w-[180px] bg-[#2e1065]/30 border-[#5b21b6] text-[#F7F7FF]">
                  <SelectValue placeholder="Filter by confidence" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a0f2e] border-[#5b21b6]">
                  <SelectItem value="all" className="text-[#F7F7FF]">All Confidence</SelectItem>
                  <SelectItem value="high" className="text-[#F7F7FF]">High (≥80%)</SelectItem>
                  <SelectItem value="medium" className="text-[#F7F7FF]">Medium (50-80%)</SelectItem>
                  <SelectItem value="low" className="text-[#F7F7FF]">Low (&lt;50%)</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || typeFilter !== 'all' || effortFilter !== 'all' || confidenceFilter !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('all');
                    setEffortFilter('all');
                    setConfidenceFilter('all');
                    applyFilters();
                  }}
                  className="border-[#5b21b6] text-[#a78bfa]"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Recommendations Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#F7F7FF]">
                  Recommendations ({filteredRecommendations.length})
                </h3>
              </div>

              {filteredRecommendations.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#5b21b6] rounded-lg">
                  <Filter className="h-12 w-12 text-[#a78bfa] mx-auto mb-4" />
                  <p className="text-[#a78bfa] text-lg">
                    No recommendations match your filters
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setTypeFilter('all');
                      setEffortFilter('all');
                      setConfidenceFilter('all');
                      applyFilters();
                    }}
                    className="mt-4 border-[#5b21b6] text-[#a78bfa]"
                  >
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredRecommendations.map((recommendation) => (
                    <FitToStandardCard
                      key={recommendation.id}
                      recommendation={recommendation}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onViewGuide={handleViewGuide}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {!loading && recommendations.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-[#5b21b6] rounded-lg">
            <div className="text-6xl mb-4">✨</div>
            <p className="text-[#a78bfa] text-lg mb-4">
              No fit-to-standard analysis yet
            </p>
            <p className="text-[#a78bfa] text-sm mb-6">
              Click "Analyze Code" to discover SAP standard alternatives for your custom code
            </p>
            <Button
              onClick={analyzeCode}
              className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF]"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Analyze Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
