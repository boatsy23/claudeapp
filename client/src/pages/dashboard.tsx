/**
 * DASHBOARD PAGE
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Comprehensive error logging
 * - Responsive design (mobile-first)
 * - PWA-optimized (touch targets, safe areas)
 * - Professional loading states
 * - Robust error handling
 */

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ScoreCard from "@/components/dashboard/score-card";
import PerformanceChart, { RoundData } from "@/components/dashboard/performance-chart";
import TeamStructure from "@/components/dashboard/team-structure";
import { calculatePlayerTypesByPosition } from "@/utils";
import { logger } from "@/lib/error-logger";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface Player {
  playerName: string;
  position: string;
  priceRaw: number;
  score: number;
  actualScore?: number;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  fieldStatus?: string;
}

interface FantasyRoundData {
  round: number;
  timestamp?: string;
  roundScore: number;
  overallRank: number;
  teamValue: number;
  captainScore?: number;
  projectedScore?: number;
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
}

interface FantasyTeamData {
  teamName: string;
  totalPlayers: number;
  currentRound?: FantasyRoundData;
  historicalRounds?: FantasyRoundData[];
}

// ============================================
// LOADING SKELETON COMPONENT
// ============================================

function DashboardSkeleton() {
  logger.info('Dashboard', 'Rendering loading skeleton');
  
  return (
    <div className="space-y-4 animate-pulse">
      {/* Title skeleton */}
      <div className="h-8 w-48 bg-gray-700 rounded"></div>
      
      {/* Score cards skeleton */}
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-800 border-2 border-gray-700 rounded-lg"></div>
        ))}
      </div>
      
      {/* Chart skeleton */}
      <div className="h-[400px] bg-gray-800 border-2 border-gray-700 rounded-lg"></div>
      
      {/* Team structure skeleton */}
      <div className="h-96 bg-gray-800 border-2 border-gray-700 rounded-lg"></div>
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState() {
  logger.warning('Dashboard', 'Rendering empty state - no team data available');
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border-2 border-yellow-600/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-yellow-600/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-yellow-100">
            No Team Data Available
          </h3>
          
          {/* Description */}
          <p className="text-yellow-200/80 leading-relaxed">
            Your fantasy team data hasn't been loaded yet. Upload or refresh your team data to see dashboard statistics.
          </p>
          
          {/* Instructions */}
          <div className="w-full bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm text-left">
            <p className="text-yellow-100 font-semibold">Quick Setup:</p>
            <ol className="text-yellow-200/80 space-y-1 list-decimal list-inside">
              <li>Go to the <strong>Lineup</strong> page</li>
              <li>Click "Refresh Team Data"</li>
              <li>Return here to view your dashboard</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// ERROR STATE COMPONENT
// ============================================

function ErrorState({ error }: { error: Error }) {
  logger.error('Dashboard', 'Rendering error state', {
    error: error.message,
    stack: error.stack
  });
  
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gradient-to-br from-red-900/20 to-pink-900/20 border-2 border-red-600/50 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Icon */}
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Title */}
          <h3 className="text-xl font-bold text-red-100">
            Unable to Load Dashboard
          </h3>
          
          {/* Error message */}
          <p className="text-red-200/80 leading-relaxed">
            {error.message || 'An unexpected error occurred'}
          </p>
          
          {/* Action button */}
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-lg transition-colors duration-200 active:scale-95"
            style={{ minHeight: '44px' }}
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function Dashboard() {
  logger.info('Dashboard', 'Component mounted');
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [teamValue, setTeamValue] = useState<number>(0);
  const [playerTypeCounts, setPlayerTypeCounts] = useState<any>({
    defense: { premium: 0, midPricer: 0, rookie: 0 },
    midfield: { premium: 0, midPricer: 0, rookie: 0 },
    ruck: { premium: 0, midPricer: 0, rookie: 0 },
    forward: { premium: 0, midPricer: 0, rookie: 0 }
  });
  
  // ============================================
  // DATA FETCHING
  // ============================================
  
  const { 
    data: fantasyData, 
    isLoading, 
    error,
    isError 
  } = useQuery<FantasyTeamData>({
    queryKey: ["/api/team/fantasy-data"],
    retry: 2,
    retryDelay: 1000,
    onError: (err: any) => {
      logger.apiError(
        'Dashboard',
        '/api/team/fantasy-data',
        err,
        err?.response?.status
      );
    },
    onSuccess: (data) => {
      logger.info('Dashboard', 'Fantasy data loaded successfully', {
        teamName: data.teamName,
        totalPlayers: data.totalPlayers,
        currentRound: data.currentRound?.round
      });
    }
  });
  
  // ============================================
  // CALCULATE DERIVED DATA
  // ============================================
  
  useEffect(() => {
    if (!fantasyData?.currentRound) {
      logger.warning('Dashboard', 'No current round data available');
      return;
    }

    try {
      logger.info('Dashboard', 'Calculating team value and player counts');
      
      // Collect all players
      const allPlayers = [
        ...(fantasyData.currentRound.defenders || []),
        ...(fantasyData.currentRound.midfielders || []),
        ...(fantasyData.currentRound.rucks || []),
        ...(fantasyData.currentRound.forwards || []),
        ...(fantasyData.currentRound.bench?.defenders || []),
        ...(fantasyData.currentRound.bench?.midfielders || []),
        ...(fantasyData.currentRound.bench?.rucks || []),
        ...(fantasyData.currentRound.bench?.forwards || []),
        ...(fantasyData.currentRound.bench?.utility || [])
      ];
      
      // Calculate total team value
      const totalValue = allPlayers.reduce((sum, player) => sum + (player.priceRaw || 0), 0);
      setTeamValue(totalValue);
      
      logger.info('Dashboard', 'Team value calculated', {
        totalValue,
        totalPlayers: allPlayers.length
      });
      
      // Calculate player type counts by position
      const teamData = {
        defenders: fantasyData.currentRound.defenders,
        midfielders: fantasyData.currentRound.midfielders,
        rucks: fantasyData.currentRound.rucks,
        forwards: fantasyData.currentRound.forwards
      };
      
      const types = calculatePlayerTypesByPosition(teamData);
      setPlayerTypeCounts(types);
      
      logger.info('Dashboard', 'Player type counts calculated', types);
      
    } catch (err: any) {
      logger.dataError(
        'Dashboard',
        'Calculate team value/player counts',
        fantasyData.currentRound,
        err
      );
    }
  }, [fantasyData]);
  
  // ============================================
  // HELPER FUNCTIONS
  // ============================================
  
  /**
   * Get captain's score from player data
   */
  const getCaptainScore = (): number => {
    if (!fantasyData?.currentRound) return 0;
    
    try {
      const allPlayers = [
        ...(fantasyData.currentRound.defenders || []),
        ...(fantasyData.currentRound.midfielders || []),
        ...(fantasyData.currentRound.rucks || []),
        ...(fantasyData.currentRound.forwards || [])
      ];
      
      // Find player with highest score (captain score already doubled)
      const sortedByScore = [...allPlayers].sort((a, b) => (b.score || 0) - (a.score || 0));
      const captainScore = sortedByScore[0]?.score || 0;
      
      logger.info('Dashboard', 'Captain score calculated', { captainScore });
      return captainScore;
      
    } catch (err: any) {
      logger.error('Dashboard', 'Error calculating captain score', err);
      return 0;
    }
  };
  
  /**
   * Generate performance data for all 24 rounds
   */
  const generatePerformanceData = (): RoundData[] => {
    logger.info('Dashboard', 'Generating performance data for chart');
    
    return Array.from({ length: 24 }, (_, index) => {
      const round = index + 1;
      const historicalRound = fantasyData?.historicalRounds?.find(r => r.round === round);
      
      if (historicalRound) {
        return {
          round,
          actualScore: historicalRound.roundScore,
          projectedScore: historicalRound.projectedScore || historicalRound.roundScore,
          rank: historicalRound.overallRank,
          teamValue: historicalRound.teamValue
        };
      }
      
      // Future rounds with no data
      return {
        round,
        actualScore: 0,
        projectedScore: 0,
        rank: 0,
        teamValue: 0
      };
    });
  };
  
  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <DashboardSkeleton />
      </div>
    );
  }
  
  // ============================================
  // RENDER: ERROR STATE
  // ============================================
  
  if (isError) {
    return (
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Dashboard</h1>
        <ErrorState error={error as Error} />
      </div>
    );
  }
  
  // ============================================
  // RENDER: EMPTY STATE
  // ============================================
  
  if (!fantasyData || !fantasyData.currentRound) {
    return (
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-semibold mb-4">Dashboard</h1>
        <EmptyState />
      </div>
    );
  }
  
  // ============================================
  // CALCULATE DISPLAY VALUES
  // ============================================
  
  const currentRound = fantasyData.currentRound.round || 0;
  const currentHistorical = fantasyData.historicalRounds?.find(r => r.round === currentRound);
  const previousHistorical = fantasyData.historicalRounds?.find(r => r.round === currentRound - 1);
  
  // Score metrics
  const currentScore = fantasyData.currentRound.roundScore || 0;
  const prevScore = previousHistorical?.roundScore || 0;
  const scoreChange = prevScore > 0 ? currentScore - prevScore : 0;
  
  // Rank metrics
  const currentRank = fantasyData.currentRound.overallRank || 0;
  const prevRank = previousHistorical?.overallRank || 0;
  const rankChange = prevRank > 0 ? prevRank - currentRank : 0;
  
  // Team value metrics
  const currentValue = teamValue;
  const previousValue = previousHistorical?.teamValue || teamValue;
  const valueChange = previousValue > 0 ? currentValue - previousValue : 0;
  
  // Captain metrics
  const currentCaptainScore = getCaptainScore();
  const prevCaptainScore = previousHistorical?.captainScore || 0;
  const captainChange = prevCaptainScore > 0 ? currentCaptainScore - prevCaptainScore : 0;
  
  // Performance data
  const performanceData = generatePerformanceData();
  
  logger.info('Dashboard', 'Rendering main dashboard', {
    currentRound,
    currentScore,
    currentRank,
    teamValue: currentValue
  });
  
  // ============================================
  // RENDER: MAIN DASHBOARD
  // ============================================
  
  return (
    <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl pb-safe">
      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-white">
        Dashboard
      </h1>
      
      {/* Score Cards Grid */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 mb-6">
        <ScoreCard 
          title="Team Value"
          value={`$${(teamValue / 1000000).toFixed(1)}M`}
          change={valueChange > 0 ? 
            `+$${(valueChange/1000000).toFixed(1)}M` : 
            valueChange < 0 ?
            `-$${Math.abs(valueChange/1000000).toFixed(1)}M` :
            'No change'}
          icon="trend-up"
          isPositive={valueChange >= 0}
          borderColor="border-purple-500"
        />
        
        <ScoreCard 
          title="Team Score"
          value={currentScore.toString()}
          change={scoreChange !== 0 ? `${scoreChange > 0 ? '+' : ''}${scoreChange}` : 'No change'}
          icon="chart"
          isPositive={scoreChange >= 0}
          borderColor="border-blue-500"
        />
      
        <ScoreCard 
          title="Overall Rank"
          value={currentRank.toLocaleString()}
          change={rankChange !== 0 ? `${rankChange > 0 ? '↑' : '↓'} ${Math.abs(rankChange).toLocaleString()}` : 'No change'}
          icon="arrow-up"
          isPositive={rankChange >= 0}
          borderColor="border-green-500"
        />
        
        <ScoreCard 
          title="Captain"
          value={currentCaptainScore.toString()}
          change={captainChange !== 0 ? `${captainChange > 0 ? '+' : ''}${captainChange}` : 'No change'}
          icon="award"
          isPositive={captainChange >= 0}
          borderColor="border-orange-500"
        />
      </div>

      {/* Performance Chart */}
      <div className="mb-6">
        <PerformanceChart data={performanceData} />
      </div>

      {/* Team Structure */}
      <TeamStructure 
        defense={{
          premium: { count: playerTypeCounts.defense.premium, label: "Premiums" },
          midPricer: { count: playerTypeCounts.defense.midPricer, label: "Mid-pricers" },
          rookie: { count: playerTypeCounts.defense.rookie, label: "Rookies" }
        }}
        midfield={{
          premium: { count: playerTypeCounts.midfield.premium, label: "Premiums" },
          midPricer: { count: playerTypeCounts.midfield.midPricer, label: "Mid-pricers" },
          rookie: { count: playerTypeCounts.midfield.rookie, label: "Rookies" }
        }}
        ruck={{
          premium: { count: playerTypeCounts.ruck.premium, label: "Premiums" },
          midPricer: { count: playerTypeCounts.ruck.midPricer, label: "Mid-pricers" },
          rookie: { count: playerTypeCounts.ruck.rookie, label: "Rookies" }
        }}
        forward={{
          premium: { count: playerTypeCounts.forward.premium, label: "Premiums" },
          midPricer: { count: playerTypeCounts.forward.midPricer, label: "Mid-pricers" },
          rookie: { count: playerTypeCounts.forward.rookie, label: "Rookies" }
        }}
        teamValue={`$${(teamValue / 1000000).toFixed(1)}M`}
        fantasyData={fantasyData}
      />
    </div>
  );
}
