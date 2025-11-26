'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

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
  createdAt: string;
}

export default function ResurrectionsPage() {
  const [resurrections, setResurrections] = useState<Resurrection[]>([]);
  const [filteredResurrections, setFilteredResurrections] = useState<Resurrection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadResurrections();
  }, []);

  useEffect(() => {
    filterResurrections();
  }, [searchQuery, statusFilter, resurrections]);

  const loadResurrections = async () => {
    try {
      const response = await fetch('/api/resurrections');
      if (response.ok) {
        const data = await response.json();
        setResurrections(data.resurrections || []);
      }
    } catch (error) {
      console.error('Failed to load resurrections:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResurrections = () => {
    let filtered = resurrections;

    if (searchQuery) {
      filtered = filtered.filter(r => 
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.module.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(r => r.status === statusFilter);
    }

    setFilteredResurrections(filtered);
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
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-pulse">🎃</div>
          <p className="text-[#a78bfa] text-xl">Loading resurrections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-[#FF6B35] mb-2">
            All Resurrections
          </h1>
          <p className="text-[#a78bfa] text-lg">
            {filteredResurrections.length} transformation{filteredResurrections.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/upload">
          <Button 
            className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF] shadow-[0_0_20px_rgba(255,107,53,0.5)]"
          >
            <span className="mr-2">🎃</span>
            New Resurrection
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Input
          placeholder="Search by name or module..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md bg-[#2e1065]/30 border-[#5b21b6] text-[#F7F7FF] placeholder:text-[#a78bfa]"
        />
        
        <div className="flex gap-2">
          {['all', 'COMPLETED', 'ANALYZING', 'PLANNING', 'GENERATING', 'FAILED'].map((status) => (
            <Button
              key={status}
              variant="outline"
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={`border-[#5b21b6] ${
                statusFilter === status
                  ? 'bg-[#2e1065] text-[#FF6B35]'
                  : 'text-[#a78bfa] hover:bg-[#2e1065]/50'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </Button>
          ))}
        </div>
      </div>

      {/* Resurrections List */}
      {filteredResurrections.length === 0 ? (
        <Card className="border-2 border-[#5b21b6] bg-[#2e1065]/20">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">👻</div>
            <p className="text-[#a78bfa] text-lg mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'No resurrections match your filters'
                : 'No resurrections yet. Start by uploading your first ABAP file!'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link href="/upload">
                <Button 
                  className="bg-[#FF6B35] hover:bg-[#E85A2A] text-[#F7F7FF]"
                >
                  <span className="mr-2">🎃</span>
                  Upload ABAP
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredResurrections.map((resurrection) => (
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
                      {resurrection.locSaved && (
                        <span>• Saved: {resurrection.locSaved.toLocaleString()} LOC</span>
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
                          size="sm"
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
                        size="sm"
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
    </div>
  );
}
