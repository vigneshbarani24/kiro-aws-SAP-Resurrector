'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, Github, Download, Trash2, Clock, Code2, Sparkles } from 'lucide-react';

interface ResurrectionCardProps {
  resurrection: {
    id: string;
    name: string;
    description?: string;
    status: string;
    module: string;
    githubUrl?: string;
    originalLOC: number;
    locSaved?: number;
    qualityScore?: number;
    abapObjectCount: number;
    createdAt: string;
  };
  onDelete: (id: string, name: string) => void;
  onExport: (id: string) => void;
  index: number;
}

const statusConfig: Record<string, { icon: string; color: string; bgColor: string }> = {
  COMPLETED: { icon: '✅', color: 'text-green-400', bgColor: 'bg-green-500/20 border-green-500/50' },
  DEPLOYED: { icon: '🚀', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/50' },
  ANALYZING: { icon: '🔍', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/50' },
  PLANNING: { icon: '📋', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/50' },
  GENERATING: { icon: '⚡', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/50' },
  VALIDATING: { icon: '🔬', color: 'text-yellow-400', bgColor: 'bg-yellow-500/20 border-yellow-500/50' },
  FAILED: { icon: '❌', color: 'text-red-400', bgColor: 'bg-red-500/20 border-red-500/50' },
  UPLOADED: { icon: '📤', color: 'text-blue-400', bgColor: 'bg-blue-500/20 border-blue-500/50' },
};

export function ResurrectionCard({ resurrection, onDelete, onExport, index }: ResurrectionCardProps) {
  const config = statusConfig[resurrection.status] || statusConfig.UPLOADED;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="border-2 border-[#5b21b6] bg-gradient-to-br from-[#1a0f2e]/80 to-[#0a0a0f]/80 hover:border-[#8b5cf6] transition-all duration-300 relative overflow-hidden group backdrop-blur-sm">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#8b5cf6] to-transparent" />
        </div>

        <CardContent className="p-6 relative z-10">
          <div className="flex items-start justify-between gap-4">
            {/* Left side - Info */}
            <div className="flex-1 space-y-3">
              {/* Title and badges */}
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-[#F7F7FF] font-semibold text-lg flex items-center gap-2 group-hover:text-[#FF6B35] transition-colors">
                  <span className="text-2xl">⚰️</span>
                  {resurrection.name}
                </h3>
                <Badge variant="outline" className={`${config.bgColor} ${config.color} border`}>
                  {config.icon} {resurrection.status}
                </Badge>
                <Badge variant="outline" className="bg-[#2e1065]/50 text-[#a78bfa] border-[#5b21b6]">
                  <Code2 className="w-3 h-3 mr-1" />
                  {resurrection.module}
                </Badge>
                <Badge variant="outline" className="bg-[#1a0f2e]/50 text-[#a78bfa] border-[#5b21b6]">
                  <Sparkles className="w-3 h-3 mr-1" />
                  {resurrection.abapObjectCount} objects
                </Badge>
              </div>

              {/* Description */}
              {resurrection.description && (
                <p className="text-[#a78bfa] text-sm line-clamp-2">
                  {resurrection.description}
                </p>
              )}

              {/* Quality score progress */}
              {resurrection.qualityScore !== undefined && resurrection.qualityScore !== null && resurrection.qualityScore > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[#a78bfa]">Quality Score</span>
                    <span className="text-[#FF6B35] font-bold">{resurrection.qualityScore}%</span>
                  </div>
                  <Progress 
                    value={resurrection.qualityScore} 
                    className="h-2 bg-[#1a0f2e] border border-[#5b21b6]"
                  />
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-4 text-[#a78bfa] text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(resurrection.createdAt).toLocaleDateString()}
                </span>
                {resurrection.originalLOC > 0 && (
                  <span className="flex items-center gap-1">
                    <Code2 className="w-4 h-4" />
                    {resurrection.originalLOC.toLocaleString()} LOC
                  </span>
                )}
                {resurrection.locSaved && resurrection.locSaved > 0 && (
                  <span className="flex items-center gap-1 text-green-400">
                    💾 Saved: {resurrection.locSaved.toLocaleString()} LOC
                  </span>
                )}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex flex-col gap-2">
              <Link href={`/resurrections/${resurrection.id}`}>
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50 hover:text-[#FF6B35] transition-all w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View
                </Button>
              </Link>

              {resurrection.githubUrl && (
                <a href={resurrection.githubUrl} target="_blank" rel="noopener noreferrer">
                  <Button 
                    variant="outline"
                    size="sm"
                    className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50 w-full"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    GitHub
                  </Button>
                </a>
              )}

              {(resurrection.status === 'COMPLETED' || resurrection.status === 'DEPLOYED') && (
                <Button 
                  variant="outline"
                  size="sm"
                  className="border-[#5b21b6] text-[#a78bfa] hover:bg-[#2e1065]/50"
                  onClick={() => onExport(resurrection.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}

              <Button 
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
                onClick={() => onDelete(resurrection.id, resurrection.name)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
