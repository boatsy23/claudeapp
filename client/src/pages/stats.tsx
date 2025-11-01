/**
 * STATS PAGE - REFACTORED
 * Production-ready PWA/TWA implementation
 * 
 * Changes from original:
 * - Removed NewPlayerStats from /legacy/
 * - Added SimplePlayerTable (production-ready)
 * - Added error logging
 * - Removed complex data mapping (not needed)
 * - Simplified code structure
 */

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";
import { logger } from "@/lib/error-logger";

// Import production-ready components
import SimplePlayerTable from "@/components/player-stats/simple-player-table";
import PlayerValueAnalysis from "@/components/player-stats/player-value-analysis";
import DVPAnalysis from "@/components/player-stats/dvp-analysis";
import PlayerDvpGraph from "@/components/player-stats/player-dvp-graph";
import InjuryReports from "@/components/player-stats/injury-reports";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function StatsPage() {
  
  // ============================================
  // DATA FETCHING - Master Player Data
  // ============================================
  
  const { data: combinedData, isLoading: combinedLoading, error: dataError } = useQuery({
    queryKey: ['/api/master-stats/players', 'v2'], // v2 = includes role stats
    staleTime: 0, // Force fresh fetch to get latest role stats
    refetchOnMount: 'always',
    queryFn: async () => {
      logger.info('StatsPage', 'Fetching player data from API');
      
      try {
        const response = await fetch('/api/master-stats/players?v=v2');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        logger.info('StatsPage', 'Player data loaded successfully', {
          playerCount: data?.length || 0,
          timestamp: new Date().toISOString()
        });
        
        return data;
      } catch (err) {
        logger.error('StatsPage', 'Failed to fetch player data', err);
        throw err;
      }
    }
  });

  // ============================================
  // DATA FETCHING - Projected Scores
  // ============================================
  
  const { data: projectedScores, isLoading: projectionsLoading } = useQuery({
    queryKey: ['/api/score-projection/all-players'],
    queryFn: async () => {
      logger.info('StatsPage', 'Fetching score projections');
      
      try {
        const response = await fetch('/api/score-projection/all-players?round=20');
        
        if (!response.ok) {
          logger.warning('StatsPage', 'Projections API failed', {
            status: response.status
          });
          return [];
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          logger.info('StatsPage', 'Projections loaded', {
            count: result.data.length
          });
          return result.data;
        }
        
        return [];
      } catch (err) {
        logger.warning('StatsPage', 'Failed to fetch projections (non-critical)', err);
        return []; // Non-critical, return empty array
      }
    },
    enabled: !!combinedData && Array.isArray(combinedData),
    staleTime: 1000 * 60 * 10, // Cache for 10 minutes
  });

  // ============================================
  // DATA ENHANCEMENT - Merge Projections
  // ============================================
  
  const enhancedData = useMemo(() => {
    if (!combinedData || !Array.isArray(combinedData)) {
      logger.warning('StatsPage', 'No player data available for enhancement');
      return [];
    }
    
    // Create projection lookup map
    const projectionMap = new Map();
    if (projectedScores && Array.isArray(projectedScores)) {
      projectedScores.forEach((proj: any) => {
        projectionMap.set(proj.playerName, proj.projectedScore);
      });
    }
    
    // Merge projections with player data
    const enhanced = combinedData.map((player: any) => ({
      ...player,
      projectedScore: projectionMap.get(player.name) || 0
    }));
    
    logger.info('StatsPage', 'Data enhancement complete', {
      totalPlayers: enhanced.length,
      withProjections: projectedScores?.length || 0
    });
    
    return enhanced;
  }, [combinedData, projectedScores]);
  
  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  
  if (combinedLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="text-gray-300">Loading player statistics...</p>
      </div>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================
  
  if (dataError) {
    logger.error('StatsPage', 'Rendering error state', dataError);
    
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="ml-2">
            <p className="font-semibold mb-2">Failed to load player statistics</p>
            <p className="text-sm">
              Unable to connect to the stats API. Please check your connection and try again.
            </p>
            <p className="text-xs mt-2 opacity-75">
              Error: {dataError instanceof Error ? dataError.message : 'Unknown error'}
            </p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // ============================================
  // RENDER: STATS PAGE
  // ============================================
  
  return (
    <div className="container mx-auto py-3 px-2">
      <div className="space-y-4">
        
        {/* Player Stats Table */}
        <div className="w-full">
          <div className="p-4 bg-gray-900 rounded-lg shadow-xl">
            <SimplePlayerTable 
              players={enhancedData}
              isLoading={combinedLoading || projectionsLoading}
            />
          </div>
        </div>

        {/* DVP Analysis Charts */}
        <div className="w-full">
          <DVPAnalysis />
        </div>

        {/* Player DVP Graph */}
        <div className="w-full">
          <PlayerDvpGraph />
        </div>

        {/* Player Value Analysis */}
        <div className="w-full">
          <PlayerValueAnalysis />
        </div>

        {/* Injury Reports */}
        <div className="w-full">
          <InjuryReports />
        </div>
        
      </div>
    </div>
  );
}
