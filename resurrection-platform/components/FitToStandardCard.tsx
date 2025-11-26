/**
 * Fit-to-Standard Recommendation Card
 * 
 * Displays a single fit-to-standard recommendation with Halloween theme.
 */

'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useState } from 'react';

interface FitToStandardRecommendation {
  id: string;
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
}

interface FitToStandardCardProps {
  recommendation: FitToStandardRecommendation;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  onViewGuide?: (id: string) => void;
}

export function FitToStandardCard({ 
  recommendation, 
  onAccept, 
  onReject, 
  onViewGuide 
}: FitToStandardCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  
  // Confidence color
  const confidenceColor = 
    recommendation.confidence >= 0.8 ? 'text-mystical-green' :
    recommendation.confidence >= 0.5 ? 'text-pumpkin-orange' :
    'text-fog-gray';
  
  // Effort badge variant
  const effortVariant = 
    recommendation.effort === 'LOW' ? 'default' :
    recommendation.effort === 'MEDIUM' ? 'secondary' :
    'destructive';
  
  // Type icon
  const typeIcon = 
    recommendation.standardType === 'BAPI' ? '🔮' :
    recommendation.standardType === 'TRANSACTION' ? '⚡' :
    recommendation.standardType === 'PATTERN' ? '🕸️' :
    '✨';
  
  return (
    <Card className="border-spooky-purple-700 bg-gradient-to-b from-spooky-purple-950 to-graveyard-black hover:shadow-purple-glow transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-pumpkin-orange flex items-center gap-2">
              <span>{typeIcon}</span>
              <span>{recommendation.standardAlternative}</span>
            </CardTitle>
            <CardDescription className="text-ghost-white/70 mt-2">
              {recommendation.description}
            </CardDescription>
          </div>
          <Badge variant={effortVariant} className="ml-2">
            {recommendation.effort} Effort
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Confidence Score */}
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-ghost-white/70">Confidence</span>
            <span className={`font-bold ${confidenceColor}`}>
              {Math.round(recommendation.confidence * 100)}%
            </span>
          </div>
          <Progress 
            value={recommendation.confidence * 100} 
            className="h-2"
          />
        </div>
        
        {/* Potential Savings */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-graveyard-black/50 rounded p-2">
            <div className="text-2xl font-bold text-pumpkin-orange">
              {recommendation.potentialSavings.locReduction}
            </div>
            <div className="text-xs text-ghost-white/70">LOC Saved</div>
          </div>
          <div className="bg-graveyard-black/50 rounded p-2">
            <div className="text-2xl font-bold text-mystical-green">
              {recommendation.potentialSavings.maintenanceReduction}%
            </div>
            <div className="text-xs text-ghost-white/70">Less Maintenance</div>
          </div>
          <div className="bg-graveyard-black/50 rounded p-2">
            <div className="text-2xl font-bold text-spooky-purple-400">
              {recommendation.potentialSavings.complexityReduction}%
            </div>
            <div className="text-xs text-ghost-white/70">Less Complex</div>
          </div>
        </div>
        
        {/* Benefits */}
        {showDetails && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-ghost-white">Benefits:</h4>
            <ul className="space-y-1">
              {recommendation.benefits.map((benefit, index) => (
                <li key={index} className="text-sm text-ghost-white/80 flex items-start gap-2">
                  <span className="text-mystical-green">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Code Example */}
        {showDetails && recommendation.codeExample && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-ghost-white">Code Example:</h4>
            <pre className="bg-graveyard-black/70 p-3 rounded text-xs text-ghost-white/90 overflow-x-auto">
              {recommendation.codeExample}
            </pre>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="text-ghost-white hover:text-pumpkin-orange"
        >
          {showDetails ? '👻 Hide Details' : '🔍 Show Details'}
        </Button>
        
        {recommendation.implementationGuide && onViewGuide && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewGuide(recommendation.id)}
            className="text-ghost-white hover:text-spooky-purple-400"
          >
            📖 Implementation Guide
          </Button>
        )}
        
        {onAccept && (
          <Button
            variant="default"
            size="sm"
            onClick={() => onAccept(recommendation.id)}
            className="bg-mystical-green hover:bg-mystical-green/80 text-graveyard-black"
          >
            ✅ Accept
          </Button>
        )}
        
        {onReject && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReject(recommendation.id)}
            className="text-ghost-white/70 hover:text-haunted-red"
          >
            ❌ Reject
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
