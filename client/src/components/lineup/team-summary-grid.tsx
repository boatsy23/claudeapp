/**
 * TEAM SUMMARY GRID COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Compact 3x2 stats grid
 * - Responsive design (mobile-first)
 * - Touch-optimized
 * - Error logging
 * - Native app styling
 */

import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Trophy, Activity, Coins, Tag } from "lucide-react";
import { logger } from "@/lib/error-logger";
import { useEffect } from "react";

// ============================================
// TYPE DEFINITIONS
// ============================================

type TeamSummaryGridProps = {
  liveScore: number;
  projectedScore: number;
  teamValue: number;
  remainingSalary: number;
  tradesLeft: number;
  overallRank: number;
};

// ============================================
// STAT CARD COMPONENT
// ============================================

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  borderColor: string;
  iconColor: string;
  testId?: string;
};

function StatCard({ title, value, icon, borderColor, iconColor, testId }: StatCardProps) {
  return (
    <Card className={`bg-gray-900 border-2 ${borderColor} shadow-lg hover:shadow-xl transition-shadow h-[90px] sm:h-[100px]`}>
      <CardContent className="p-2 sm:p-3 h-full flex flex-col items-center justify-center">
        {/* Title */}
        <div className="text-gray-300 text-xs sm:text-sm font-medium text-center leading-tight">
          {title}
        </div>
        
        {/* Value with Icon */}
        <div className={`flex items-center gap-1 ${iconColor} mt-1`}>
          <div className="flex-shrink-0">{icon}</div>
          <span 
            className="text-xl sm:text-2xl font-bold text-white"
            data-testid={testId}
          >
            {value}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN TEAM SUMMARY GRID COMPONENT
// ============================================

export default function TeamSummaryGrid({
  liveScore,
  projectedScore,
  teamValue,
  remainingSalary,
  tradesLeft,
  overallRank
}: TeamSummaryGridProps) {
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    logger.info('TeamSummaryGrid', 'Component rendered', {
      liveScore,
      projectedScore,
      teamValue,
      remainingSalary,
      tradesLeft,
      overallRank
    });
    
    // Validate data
    if (teamValue <= 0) {
      logger.warning('TeamSummaryGrid', 'Invalid team value', { teamValue });
    }
    if (overallRank <= 0) {
      logger.warning('TeamSummaryGrid', 'Invalid rank', { overallRank });
    }
  }, [liveScore, projectedScore, teamValue, remainingSalary, tradesLeft, overallRank]);
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {/* Row 1 */}
      <StatCard
        title="Projected Score"
        value={projectedScore}
        icon={<Activity className="h-4 w-4" aria-hidden="true" />}
        borderColor="border-blue-500"
        iconColor="text-blue-400"
        testId="stat-projected-score"
      />
      
      <StatCard
        title="Live Score"
        value={liveScore}
        icon={<Activity className="h-4 w-4" aria-hidden="true" />}
        borderColor="border-green-500"
        iconColor="text-green-400"
        testId="stat-live-score"
      />
      
      <StatCard
        title="Team Value"
        value={formatCurrency(teamValue)}
        icon={<Coins className="h-4 w-4" aria-hidden="true" />}
        borderColor="border-purple-500"
        iconColor="text-purple-400"
        testId="stat-team-value"
      />
      
      {/* Row 2 */}
      <StatCard
        title="Remaining Salary"
        value={formatCurrency(remainingSalary)}
        icon={<Tag className="h-4 w-4 flex-shrink-0" aria-hidden="true" />}
        borderColor="border-green-500"
        iconColor="text-green-400"
        testId="stat-remaining-salary"
      />
      
      <StatCard
        title="Trades Left"
        value={tradesLeft}
        icon={<TrendingUp className="h-4 w-4" aria-hidden="true" />}
        borderColor="border-orange-500"
        iconColor="text-orange-400"
        testId="stat-trades-left"
      />
      
      <StatCard
        title="Overall Rank"
        value={overallRank.toLocaleString()}
        icon={<Trophy className="h-4 w-4" aria-hidden="true" />}
        borderColor="border-blue-500"
        iconColor="text-blue-400"
        testId="stat-overall-rank"
      />
    </div>
  );
}

/**
 * SKELETON LOADER FOR TEAM SUMMARY GRID
 * Used during loading states
 */
export function TeamSummaryGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 mb-6 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="bg-gray-900 border-2 border-gray-700 h-[90px] sm:h-[100px]">
          <CardContent className="p-2 sm:p-3 h-full flex flex-col items-center justify-center">
            <div className="h-3 w-20 bg-gray-700 rounded mb-2"></div>
            <div className="h-6 w-16 bg-gray-700 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
