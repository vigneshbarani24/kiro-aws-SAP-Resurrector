'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Resurrection {
  id: string;
  name: string;
  description?: string;
  status: string;
  module: string;
  githubUrl?: string;
  basUrl?: string;
  originalLOC: number;
  locSaved?: number;
  qualityScore?: number;
  abapObjectCount: number;
  transformationLogCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  total: number;
  completed: number;
  inProgress: number;
  failed: number;
}

export default function DashboardPage() {
  const [resurrections, setResurrections] = useState<Resurrection[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, completed: 0, inProgress: 0, failed: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/resurrections');
      if (response.ok) {
        const data = await response.json();
        setResurrections(data.resurrections || []);
        
        // Calculate stats - map database status to display status
        const total = data.resurrections?.length || 0;
        const completed = data.resurrections?.filter((r: Resurrection) => 
          r.status === 'COMPLETED' || r.status === 'DEPLOYED'
        ).length || 0;
        const inProgress = data.resurrections?.filter((r: Resurrection) => 
          r.status === 'UPLOADED' || r.status === 'ANALYZING' || 
          r.status === 'PLANNING' || r.status === 'GENERATING' || 
          r.status === 'VALIDATING'
        ).length || 0;
        const failed = data.resurrections?.filter((r: Resurrection) => 
          r.status === 'FAILED'
        ).length || 0;
        
        setStats({ total, completed, inProgress, failed });
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'DEPLOYED':
        return 'bg-green-500/20 text-green-400 border-green-500/50';
      case 'UPLOADED':
      case 'ANALYZING':
      case 'PLANNING':
      case 'GENERATING':
      case 'VALIDATING':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'FAILED':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'DEPLOYED':
        return '✅';
      case 'UPLOADED':
        return '📤';
      case 'ANALYZING':
        return '🔍';
      case 'PLANNING':
        return '📋';
      case 'GENERATING':
        return '⚡';
      case 'VALIDATING':
        return '🔬';
      case 'FAILED':
        return '❌';
      default:
        return '⏳';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] via-[#0a0a0f] to-[#1a0f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎃</div>
          <p className="text-[#a78bfa] text-xl">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a0f2e] via-[#0a0a0f] to-[#1a0f2e] relative overflow-hidden">
      {/* Fog Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#2e1065]/20 to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-bold text-[#FF6B35] mb-2">
              🎃 Resurrection Dashboard
            </h1>
            <p className="text-[#a78bfa] text-lg">
              Monitor your ABAP transformations
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/">
              <Button 
                variant="outline"
                className="border-2 border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
              >
                <span className="mr-2">🏠</span>
                Home
              </Button>
            </Link>
            <Link href="/upload">
              <Button 
                className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF] shadow-[0_0_20px_rgba(255,107,53,0.5)]"
              >
                <span className="mr-2">🎃</span>
                New Resurrection
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#a78bfa] text-sm font-medium">
                Total Resurrections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-[#FF6B35]">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-500/50 bg-green-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-green-400 text-sm font-medium">
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-green-400">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-500/50 bg-yellow-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-400 text-sm font-medium">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-yellow-400">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-500/50 bg-red-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-400 text-sm font-medium">
                Failed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-red-400">{stats.failed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Resurrections List */}
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
          <CardHeader>
            <CardTitle className="text-[#FF6B35] text-2xl">
              Recent Resurrections
            </CardTitle>
            <CardDescription className="text-[#a78bfa]">
              View and manage your ABAP transformations
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resurrections.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👻</div>
                <p className="text-[#a78bfa] text-lg mb-6">
                  No resurrections yet. Start by uploading your first ABAP file!
                </p>
                <Link href="/upload">
                  <Button 
                    className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF]"
                  >
                    <span className="mr-2">🎃</span>
                    Upload ABAP
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {resurrections.map((resurrection) => (
                  <Card 
                    key={resurrection.id}
                    className="border border-[#5b21b6] bg-[#1a0f2e]/50 hover:border-[#8b5cf6] transition-all"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-[#F7F7FF] font-semibold text-lg">
                              {resurrection.name}
                            </h3>
                            <Badge 
                              variant="outline"
                              className={getStatusColor(resurrection.status)}
                            >
                              {getStatusIcon(resurrection.status)} {resurrection.status}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className="bg-[#2e1065]/50 text-[#a78bfa] border-[#5b21b6]"
                            >
                              {resurrection.module}
                            </Badge>
                            <Badge 
                              variant="outline"
                              className="bg-[#1a0f2e]/50 text-[#a78bfa] border-[#5b21b6]"
                            >
                              {resurrection.abapObjectCount} objects
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-[#a78bfa] text-sm">
                            <span>Created: {new Date(resurrection.createdAt).toLocaleString()}</span>
                            {resurrection.originalLOC > 0 && (
                              <span>• {resurrection.originalLOC.toLocaleString()} LOC</span>
                            )}
                            {resurrection.qualityScore && (
                              <span>• Quality: {resurrection.qualityScore}%</span>
                            )}
                          </div>
                          {resurrection.description && (
                            <p className="text-[#a78bfa] text-sm mt-2">
                              {resurrection.description}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {resurrection.githubUrl && (
                            <a href={resurrection.githubUrl} target="_blank" rel="noopener noreferrer">
                              <Button 
                                variant="outline"
                                className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
                              >
                                <span className="mr-2">🐙</span>
                                GitHub
                              </Button>
                            </a>
                          )}
                          <Link href={`/resurrections/${resurrection.id}`}>
                            <Button 
                              variant="outline"
                              className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
                            >
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 hover:border-[#8b5cf6] transition-all">
            <CardHeader>
              <div className="text-4xl mb-2">📚</div>
              <CardTitle className="text-[#FF6B35]">Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#a78bfa] mb-4">
                Learn how to use the Resurrection Platform
              </CardDescription>
              <Link href="/docs">
                <Button 
                  variant="outline"
                  className="w-full border-[#5b21b6] text-[#a78bfa]"
                >
                  View Docs
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 hover:border-[#8b5cf6] transition-all">
            <CardHeader>
              <div className="text-4xl mb-2">🎬</div>
              <CardTitle className="text-[#FF6B35]">Demo</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#a78bfa] mb-4">
                See the platform in action with sample ABAP
              </CardDescription>
              <Link href="/demo">
                <Button 
                  variant="outline"
                  className="w-full border-[#5b21b6] text-[#a78bfa]"
                >
                  Try Demo
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/30 hover:border-[#8b5cf6] transition-all">
            <CardHeader>
              <div className="text-4xl mb-2">⚙️</div>
              <CardTitle className="text-[#FF6B35]">Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-[#a78bfa] mb-4">
                Configure your transformation preferences
              </CardDescription>
              <Button 
                variant="outline"
                className="w-full border-[#5b21b6] text-[#a78bfa]"
                disabled
              >
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Floating Ghosts */}
      <div className="fixed top-20 right-20 text-6xl animate-float opacity-20 pointer-events-none">
        👻
      </div>
      <div className="fixed bottom-20 left-20 text-6xl animate-float opacity-20 pointer-events-none" style={{ animationDelay: '1s' }}>
        👻
      </div>
    </div>
  );
}
