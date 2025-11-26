/**
 * Savings Calculator Service
 * 
 * Calculates potential savings from redundancy consolidation
 * Implements requirement 6.6: calculate potential savings
 */

import { Redundancy, RedundancyStatistics } from './redundancy-detector';

export interface SavingsProjection {
  linesOfCode: {
    current: number;
    afterConsolidation: number;
    savings: number;
    percentageReduction: number;
  };
  effort: {
    consolidationHours: number;
    maintenanceHoursSavedPerYear: number;
    breakEvenMonths: number;
  };
  cost: {
    consolidationCost: number;
    annualMaintenanceSavings: number;
    threeYearROI: number;
  };
  complexity: {
    currentComplexity: number;
    reducedComplexity: number;
    complexityReduction: number;
  };
}

export interface DetailedSavings {
  byModule: Record<string, {
    redundancies: number;
    locSavings: number;
    effortHours: number;
  }>;
  byType: Record<string, {
    redundancies: number;
    locSavings: number;
    effortHours: number;
  }>;
  bySimilarity: {
    veryHigh: { count: number; savings: number };
    high: { count: number; savings: number };
    medium: { count: number; savings: number };
  };
}

export class SavingsCalculator {
  // Cost assumptions (can be configured)
  private readonly DEVELOPER_HOURLY_RATE = 75; // USD per hour
  private readonly LOC_MAINTENANCE_HOURS_PER_YEAR = 0.5; // Hours per LOC per year
  private readonly COMPLEXITY_FACTOR = 1.2; // Multiplier for complex code
  
  /**
   * Calculate comprehensive savings projection
   */
  calculateProjection(
    redundancies: Redundancy[],
    totalLOC: number
  ): SavingsProjection {
    // Calculate LOC savings
    const locSavings = redundancies.reduce(
      (sum, r) => sum + r.potentialSavings.linesOfCode,
      0
    );
    const afterConsolidation = totalLOC - locSavings;
    const percentageReduction = (locSavings / totalLOC) * 100;
    
    // Calculate effort
    const consolidationHours = this.calculateConsolidationEffort(redundancies);
    const maintenanceHoursSavedPerYear = locSavings * this.LOC_MAINTENANCE_HOURS_PER_YEAR;
    const breakEvenMonths = (consolidationHours / maintenanceHoursSavedPerYear) * 12;
    
    // Calculate costs
    const consolidationCost = consolidationHours * this.DEVELOPER_HOURLY_RATE;
    const annualMaintenanceSavings = maintenanceHoursSavedPerYear * this.DEVELOPER_HOURLY_RATE;
    const threeYearROI = ((annualMaintenanceSavings * 3 - consolidationCost) / consolidationCost) * 100;
    
    // Calculate complexity reduction
    const currentComplexity = this.calculateComplexity(totalLOC, redundancies.length);
    const reducedComplexity = this.calculateComplexity(afterConsolidation, 0);
    const complexityReduction = ((currentComplexity - reducedComplexity) / currentComplexity) * 100;
    
    return {
      linesOfCode: {
        current: totalLOC,
        afterConsolidation,
        savings: locSavings,
        percentageReduction
      },
      effort: {
        consolidationHours,
        maintenanceHoursSavedPerYear,
        breakEvenMonths
      },
      cost: {
        consolidationCost,
        annualMaintenanceSavings,
        threeYearROI
      },
      complexity: {
        currentComplexity,
        reducedComplexity,
        complexityReduction
      }
    };
  }
  
  /**
   * Calculate detailed savings breakdown
   */
  calculateDetailedSavings(
    redundancies: Redundancy[],
    statistics: RedundancyStatistics
  ): DetailedSavings {
    // By module
    const byModule: Record<string, { redundancies: number; locSavings: number; effortHours: number }> = {};
    redundancies.forEach(r => {
      const module = r.file1.module;
      if (!byModule[module]) {
        byModule[module] = { redundancies: 0, locSavings: 0, effortHours: 0 };
      }
      byModule[module].redundancies++;
      byModule[module].locSavings += r.potentialSavings.linesOfCode;
      byModule[module].effortHours += this.getEffortHours(r.potentialSavings.effort);
    });
    
    // By type
    const byType: Record<string, { redundancies: number; locSavings: number; effortHours: number }> = {};
    redundancies.forEach(r => {
      const type = r.file1.type;
      if (!byType[type]) {
        byType[type] = { redundancies: 0, locSavings: 0, effortHours: 0 };
      }
      byType[type].redundancies++;
      byType[type].locSavings += r.potentialSavings.linesOfCode;
      byType[type].effortHours += this.getEffortHours(r.potentialSavings.effort);
    });
    
    // By similarity
    const veryHigh = redundancies.filter(r => r.similarity >= 0.95);
    const high = redundancies.filter(r => r.similarity >= 0.85 && r.similarity < 0.95);
    const medium = redundancies.filter(r => r.similarity >= 0.75 && r.similarity < 0.85);
    
    return {
      byModule,
      byType,
      bySimilarity: {
        veryHigh: {
          count: veryHigh.length,
          savings: veryHigh.reduce((sum, r) => sum + r.potentialSavings.linesOfCode, 0)
        },
        high: {
          count: high.length,
          savings: high.reduce((sum, r) => sum + r.potentialSavings.linesOfCode, 0)
        },
        medium: {
          count: medium.length,
          savings: medium.reduce((sum, r) => sum + r.potentialSavings.linesOfCode, 0)
        }
      }
    };
  }
  
  /**
   * Calculate total consolidation effort in hours
   */
  private calculateConsolidationEffort(redundancies: Redundancy[]): number {
    return redundancies.reduce((total, r) => {
      return total + this.getEffortHours(r.potentialSavings.effort);
    }, 0);
  }
  
  /**
   * Convert effort level to hours
   */
  private getEffortHours(effort: 'Low' | 'Medium' | 'High'): number {
    switch (effort) {
      case 'Low':
        return 2;
      case 'Medium':
        return 4;
      case 'High':
        return 8;
      default:
        return 2;
    }
  }
  
  /**
   * Calculate code complexity score
   * Higher score = more complex
   */
  private calculateComplexity(loc: number, redundancies: number): number {
    // Base complexity from LOC
    const baseComplexity = Math.log10(loc + 1) * 100;
    
    // Add complexity from redundancies
    const redundancyComplexity = redundancies * 10;
    
    return Math.round(baseComplexity + redundancyComplexity);
  }
  
  /**
   * Generate savings summary text
   */
  generateSummary(projection: SavingsProjection): string {
    const { linesOfCode, effort, cost } = projection;
    
    return `
Consolidating redundant code will save ${linesOfCode.savings.toLocaleString()} lines of code (${linesOfCode.percentageReduction.toFixed(1)}% reduction).

This requires ${effort.consolidationHours.toFixed(0)} hours of effort (${cost.consolidationCost.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}) but will save ${effort.maintenanceHoursSavedPerYear.toFixed(0)} hours per year in maintenance.

Break-even point: ${effort.breakEvenMonths.toFixed(1)} months
3-year ROI: ${cost.threeYearROI.toFixed(0)}%
Annual savings: ${cost.annualMaintenanceSavings.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
    `.trim();
  }
  
  /**
   * Calculate quick wins (high savings, low effort)
   */
  identifyQuickWins(redundancies: Redundancy[]): Redundancy[] {
    return redundancies
      .filter(r => 
        r.potentialSavings.effort === 'Low' && 
        r.potentialSavings.linesOfCode >= 50
      )
      .sort((a, b) => b.potentialSavings.linesOfCode - a.potentialSavings.linesOfCode)
      .slice(0, 5);
  }
  
  /**
   * Calculate priority score for each redundancy
   * Higher score = higher priority
   */
  calculatePriorityScore(redundancy: Redundancy): number {
    const savingsScore = redundancy.potentialSavings.linesOfCode;
    const similarityScore = redundancy.similarity * 100;
    const effortPenalty = this.getEffortHours(redundancy.potentialSavings.effort) * 10;
    
    return savingsScore + similarityScore - effortPenalty;
  }
  
  /**
   * Rank redundancies by priority
   */
  rankByPriority(redundancies: Redundancy[]): Redundancy[] {
    return [...redundancies].sort((a, b) => {
      const scoreA = this.calculatePriorityScore(a);
      const scoreB = this.calculatePriorityScore(b);
      return scoreB - scoreA;
    });
  }
}
