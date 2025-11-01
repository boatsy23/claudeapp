/**
 * TEAM STRUCTURE COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Responsive position breakdowns
 * - Multiple view modes (overall, breakdown, team value)
 * - Touch-optimized interactions
 * - Comprehensive error logging
 * - Native app styling
 */

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { logger } from "@/lib/error-logger";

// ============================================
// TYPE DEFINITIONS
// ============================================

type Player = {
  playerName: string;
  position: string;
  priceRaw: number;
  score: number;
  projectedScore?: number;
  actualScore?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  fieldStatus?: string;
};

type FantasyRoundData = {
  round: number;
  timestamp?: string;
  roundScore: number;
  overallRank: number;
  teamValue: number;
  defenders: Player[];
  midfielders: Player[];
  rucks: Player[];
  forwards: Player[];
  bench?: {
    defenders: Player[];
    midfielders: Player[];
    rucks: Player[];
    forwards: Player[];
    utility: Player[];
  };
  captain?: string;
  viceCaptain?: string;
};

type FantasyTeamData = {
  teamName: string;
  totalPlayers: number;
  currentRound?: FantasyRoundData;
  historicalRounds?: FantasyRoundData[];
};

type PositionCategoryData = {
  count: number;
  label: string;
  value?: string;
};

type PositionGroupData = {
  premium: PositionCategoryData;
  midPricer: PositionCategoryData;
  rookie: PositionCategoryData;
};

type TeamStructureProps = {
  midfield: PositionGroupData;
  forward: PositionGroupData;
  defense: PositionGroupData;
  ruck: PositionGroupData;
  teamValue: string;
  fantasyData?: FantasyTeamData;
};

type ValueViewMode = "overall" | "breakdown" | "team-value";

// ============================================
// POSITION CATEGORY COMPONENT
// ============================================

type PositionCategoryProps = {
  label: string;
  count: number;
  total: number;
  percentage: number;
  color: string;
  value?: string;
};

function PositionCategory({ 
  label, 
  count, 
  total, 
  percentage, 
  color, 
  value 
}: PositionCategoryProps) {
  return (
    <div className="mb-3">
      {/* Label row */}
      <div className="flex justify-between items-center text-xs md:text-sm mb-1">
        <span className={cn("font-medium", color)}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {value && (
            <span className="text-gray-400 text-xs">
              {value}
            </span>
          )}
          <span className="text-white font-semibold">
            {count}/{total}
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div 
          className="bg-gradient-to-r from-blue-500 to-red-500 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(percentage, 100)}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        ></div>
      </div>
    </div>
  );
}

// ============================================
// POSITION GROUP COMPONENT
// ============================================

type PositionGroupProps = {
  title: string;
  playerCount: number;
  categories: PositionGroupData;
  positionValue?: string;
};

function PositionGroup({ 
  title, 
  playerCount, 
  categories, 
  positionValue 
}: PositionGroupProps) {
  
  // Calculate percentages
  const premiumPercentage = (categories.premium.count / playerCount) * 100;
  const midPricerPercentage = (categories.midPricer.count / playerCount) * 100;
  const rookiePercentage = (categories.rookie.count / playerCount) * 100;

  return (
    <div className="mb-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-white text-sm md:text-base">
          {title}
        </h3>
        <div className="flex items-center gap-2 text-xs md:text-sm">
          {positionValue && (
            <span className="text-gray-400 font-medium">
              {positionValue}
            </span>
          )}
          <span className="text-gray-400">
            {playerCount} players
          </span>
        </div>
      </div>
      
      {/* Categories */}
      <PositionCategory 
        label={categories.premium.label}
        count={categories.premium.count}
        total={playerCount}
        percentage={premiumPercentage}
        color="text-red-500 font-semibold"
        value={categories.premium.value}
      />
      
      <PositionCategory 
        label={categories.midPricer.label}
        count={categories.midPricer.count}
        total={playerCount}
        percentage={midPricerPercentage}
        color="text-yellow-500 font-semibold"
        value={categories.midPricer.value}
      />
      
      <PositionCategory 
        label={categories.rookie.label}
        count={categories.rookie.count}
        total={playerCount}
        percentage={rookiePercentage}
        color="text-blue-500 font-semibold"
        value={categories.rookie.value}
      />
    </div>
  );
}

// ============================================
// MAIN TEAM STRUCTURE COMPONENT
// ============================================

export default function TeamStructure({
  midfield,
  forward,
  defense,
  ruck,
  teamValue,
  fantasyData
}: TeamStructureProps) {
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [valueView, setValueView] = useState<ValueViewMode>("overall");
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    logger.info('TeamStructure', 'Component rendered', {
      valueView,
      teamValue,
      hasFantasyData: !!fantasyData
    });
    
    // Validate props
    if (!midfield || !forward || !defense || !ruck) {
      logger.warning('TeamStructure', 'Missing position data', {
        hasMidfield: !!midfield,
        hasForward: !!forward,
        hasDefense: !!defense,
        hasRuck: !!ruck
      });
    }
  }, [valueView, midfield, forward, defense, ruck, fantasyData, teamValue]);
  
  // ============================================
  // CALCULATE POSITION VALUES
  // ============================================
  
  const calculatePositionValue = (players: Player[]): string => {
    try {
      if (!players || players.length === 0) return "$0M";
      const totalValue = players.reduce((sum, player) => sum + (player.priceRaw || 0), 0);
      return `$${(totalValue / 1000000).toFixed(1)}M`;
    } catch (err: any) {
      logger.error('TeamStructure', 'Error calculating position value', err);
      return "$0M";
    }
  };
  
  const calculatePositionProjectedScore = (players: Player[]): number => {
    try {
      if (!players || players.length === 0) return 0;
      return players.reduce((sum, player) => {
        return sum + (player.projectedScore || player.score || 0);
      }, 0);
    } catch (err: any) {
      logger.error('TeamStructure', 'Error calculating projected score', err);
      return 0;
    }
  };
  
  // Calculate values for each position
  const defenseValue = fantasyData?.currentRound ? calculatePositionValue(fantasyData.currentRound.defenders) : "$0M";
  const midfieldValue = fantasyData?.currentRound ? calculatePositionValue(fantasyData.currentRound.midfielders) : "$0M";
  const ruckValue = fantasyData?.currentRound ? calculatePositionValue(fantasyData.currentRound.rucks) : "$0M";
  const forwardValue = fantasyData?.currentRound ? calculatePositionValue(fantasyData.currentRound.forwards) : "$0M";
  
  // Calculate projected scores
  const defenseProjectedScore = fantasyData?.currentRound ? calculatePositionProjectedScore(fantasyData.currentRound.defenders) : 0;
  const midfieldProjectedScore = fantasyData?.currentRound ? calculatePositionProjectedScore(fantasyData.currentRound.midfielders) : 0;
  const ruckProjectedScore = fantasyData?.currentRound ? calculatePositionProjectedScore(fantasyData.currentRound.rucks) : 0;
  const forwardProjectedScore = fantasyData?.currentRound ? calculatePositionProjectedScore(fantasyData.currentRound.forwards) : 0;
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleViewChange = (value: string) => {
    const newView = value as ValueViewMode;
    logger.info('TeamStructure', 'View mode changed', {
      from: valueView,
      to: newView
    });
    setValueView(newView);
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <Card className="bg-gray-800/95 backdrop-blur-sm border-2 border-yellow-500 shadow-xl">
      <CardContent className="p-3 md:p-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          {/* Title */}
          <h2 className="text-base md:text-lg font-semibold text-white">
            Team Structure
          </h2>
          
          {/* View selector */}
          <Select value={valueView} onValueChange={handleViewChange}>
            <SelectTrigger 
              className="w-full sm:w-[180px] bg-gray-700/80 border-gray-600 text-white hover:bg-gray-700 transition-colors"
              style={{ minHeight: '44px' }}
            >
              <SelectValue placeholder="Value Display" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem 
                value="overall" 
                className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Overall Value
              </SelectItem>
              <SelectItem 
                value="breakdown" 
                className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Value Breakdown
              </SelectItem>
              <SelectItem 
                value="team-value" 
                className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Team Value
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Position Groups */}
        <div className="space-y-4">
          <PositionGroup 
            title="Midfield"
            playerCount={10}
            categories={{
              premium: {
                ...midfield.premium,
                value: valueView === "team-value" ? "$1,800,000" : undefined 
              },
              midPricer: {
                ...midfield.midPricer,
                value: valueView === "team-value" ? "$1,050,000" : undefined
              },
              rookie: {
                ...midfield.rookie,
                value: valueView === "team-value" ? "$350,000" : undefined
              }
            }}
            positionValue={valueView === "breakdown" ? midfieldValue : `Projected: ${midfieldProjectedScore} pts`}
          />
          
          <PositionGroup 
            title="Forward"
            playerCount={6}
            categories={{
              premium: {
                ...forward.premium,
                value: valueView === "team-value" ? "$1,200,000" : undefined
              },
              midPricer: {
                ...forward.midPricer,
                value: valueView === "team-value" ? "$450,000" : undefined
              },
              rookie: {
                ...forward.rookie,
                value: valueView === "team-value" ? "$200,000" : undefined
              }
            }}
            positionValue={valueView === "breakdown" ? forwardValue : `Projected: ${forwardProjectedScore} pts`}
          />
          
          <PositionGroup 
            title="Defense"
            playerCount={6}
            categories={{
              premium: {
                ...defense.premium,
                value: valueView === "team-value" ? "$1,000,000" : undefined
              },
              midPricer: {
                ...defense.midPricer,
                value: valueView === "team-value" ? "$500,000" : undefined
              },
              rookie: {
                ...defense.rookie,
                value: valueView === "team-value" ? "$200,000" : undefined
              }
            }}
            positionValue={valueView === "breakdown" ? defenseValue : `Projected: ${defenseProjectedScore} pts`}
          />
          
          <PositionGroup 
            title="Ruck"
            playerCount={2}
            categories={{
              premium: {
                ...ruck.premium,
                value: valueView === "team-value" ? "$750,000" : undefined
              },
              midPricer: {
                ...ruck.midPricer,
                value: valueView === "team-value" ? "$200,000" : undefined
              },
              rookie: {
                ...ruck.rookie,
                value: undefined
              }
            }}
            positionValue={valueView === "breakdown" ? ruckValue : `Projected: ${ruckProjectedScore} pts`}
          />
        </div>
        
        {/* Total Team Value */}
        <div className="mt-6 pt-4 border-t border-gray-600/50">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-white text-sm md:text-base">
              Total Team Value
            </span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg md:text-xl text-white">
                {teamValue}
              </span>
              <TrendingUp className="h-5 w-5 text-green-400" aria-hidden="true" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SKELETON LOADER FOR TEAM STRUCTURE
 * Used during loading states
 */
export function TeamStructureSkeleton() {
  return (
    <Card className="bg-gray-800 border-2 border-gray-700 animate-pulse">
      <CardContent className="p-3 md:p-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-32 bg-gray-700 rounded"></div>
          <div className="h-10 w-40 bg-gray-700 rounded"></div>
        </div>
        
        {/* Position groups skeleton */}
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="mb-6">
            <div className="h-5 w-24 bg-gray-700 rounded mb-3"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j}>
                  <div className="h-4 w-full bg-gray-700 rounded mb-1"></div>
                  <div className="h-2 w-full bg-gray-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {/* Total value skeleton */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="h-6 w-full bg-gray-700 rounded"></div>
        </div>
      </CardContent>
    </Card>
  );
}
