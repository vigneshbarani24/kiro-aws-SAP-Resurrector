'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'purple' | 'green' | 'yellow' | 'red' | 'blue';
  delay?: number;
}

const colorClasses = {
  purple: 'from-purple-500/20 to-purple-600/20 border-purple-500/50 text-purple-400',
  green: 'from-green-500/20 to-green-600/20 border-green-500/50 text-green-400',
  yellow: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-400',
  red: 'from-red-500/20 to-red-600/20 border-red-500/50 text-red-400',
  blue: 'from-blue-500/20 to-blue-600/20 border-blue-500/50 text-blue-400',
};

export function StatCard({ title, value, icon: Icon, trend, color = 'purple', delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className="h-full"
    >
      <Card className={`border-2 bg-gradient-to-br ${colorClasses[color]} relative overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-${color}-500/20`}>
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
        
        {/* Icon decoration */}
        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <Icon className="w-16 h-16" />
        </div>
        
        <CardHeader className="pb-2 relative z-10">
          <CardTitle className="text-xs font-medium flex items-center gap-2 text-[#a78bfa]">
            <Icon className="w-4 h-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-bold">{value}</div>
            {trend && (
              <div className={`text-sm flex items-center gap-1 ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                <span>{trend.isPositive ? '↑' : '↓'}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
