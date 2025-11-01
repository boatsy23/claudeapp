/**
 * PLAYER DVP GRAPH - INDIVIDUAL PLAYER VIEW
 * Production-ready PWA/TWA implementation
 * 
 * Shows DVP ratings for INDIVIDUAL PLAYERS
 * - Search for players
 * - Filter by position
 * - Shows player's next opponent DVP
 * - Bar chart visualization
 * - Uses /api/dvp/player-ratings
 */

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  ResponsiveContainer, 
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search } from "lucide-react";
import { logger } from "@/lib/error-logger";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface PlayerDvpRating {
  playerId: number;
  playerName: string;
  position: string;
  team: string;
  nextOpponent: string;
  dvpRating: number;           // 0-10 scale
  positionAverage: number;     // Average for position
  recentForm: number[];        // Last 5 scores
  projectedScore: number;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

const getDifficultyLabel = (rating: number): string => {
  if (rating <= 3) return "Very Easy";
  if (rating <= 4) return "Easy";
  if (rating <= 6) return "Moderate";
  if (rating <= 7) return "Hard";
  return "Very Hard";
};

const getDVPColor = (rating: number): string => {
  if (rating <= 3) return "#22c55e"; // Green - easy matchup
  if (rating <= 4) return "#84cc16"; // Lime
  if (rating <= 6) return "#eab308"; // Yellow
  if (rating <= 7) return "#f97316"; // Orange
  return "#ef4444"; // Red - hard matchup
};

// ============================================
// CUSTOM TOOLTIP
// ============================================

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-700 text-white p-3 rounded-md text-xs">
        <p className="text-blue-400 font-bold mb-1">{data.playerName}</p>
        <p className="text-gray-300">{data.team} {data.position}</p>
        <p className="text-gray-300 mt-1">vs {data.nextOpponent}</p>
        <p className="mt-2">
          <span className="font-semibold">DVP Rating:</span>{" "}
          <span style={{ color: getDVPColor(data.dvpRating) }}>
            {data.dvpRating.toFixed(1)} - {getDifficultyLabel(data.dvpRating)}
          </span>
        </p>
        <p className="text-gray-400">
          Projected: {data.projectedScore}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function PlayerDvpGraph() {
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("ALL");

  // ============================================
  // DATA FETCHING
  // ============================================
  
  const { data: playerRatings = [], isLoading, error } = useQuery<PlayerDvpRating[]>({
    queryKey: ['/api/dvp/player-ratings'],
    queryFn: async () => {
      logger.info('PlayerDvpGraph', 'Fetching player DVP ratings');
      
      try {
        const response = await fetch('/api/dvp/player-ratings');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        logger.info('PlayerDvpGraph', 'Player ratings loaded', {
          playerCount: data.length
        });
        
        return data;
      } catch (err) {
        logger.error('PlayerDvpGraph', 'Failed to fetch player ratings', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    logger.info('PlayerDvpGraph', 'Component rendered', {
      playerCount: playerRatings.length,
      positionFilter,
      searchQuery: searchQuery ? 'active' : 'none'
    });
  }, [playerRatings, positionFilter, searchQuery]);

  // ============================================
  // DATA PROCESSING
  // ============================================
  
  const filteredPlayers = playerRatings
    .filter(player => {
      const matchesSearch = player.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           player.team.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPosition = positionFilter === "ALL" || player.position === positionFilter;
      return matchesSearch && matchesPosition;
    })
    .sort((a, b) => b.dvpRating - a.dvpRating) // Sort by hardest matchups first
    .slice(0, 20); // Show top 20 players

  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  
  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-300">Loading player DVP data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ============================================
  // RENDER: ERROR STATE
  // ============================================
  
  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardContent className="p-8">
          <p className="text-red-400 text-center">
            Failed to load player DVP data. Please try again.
          </p>
        </CardContent>
      </Card>
    );
  }

  // ============================================
  // RENDER: MAIN UI
  // ============================================
  
  return (
    <Card className="bg-gray-900 border-gray-700 text-white overflow-hidden">
      <div className="p-3 border-b border-gray-700">
        <h3 className="text-lg font-bold text-blue-400">PLAYER DVP RATINGS</h3>
        <p className="text-xs text-gray-400 mt-1">Individual player matchup difficulty vs next opponent</p>
      </div>
      <CardContent className="px-3 pt-4 pb-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search players or teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
              style={{ minHeight: '44px' }}
            />
          </div>
          
          {/* Position Filter */}
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger 
              className="bg-gray-800 border-gray-700 text-white"
              style={{ minHeight: '44px' }}
            >
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="ALL" className="text-white">All Positions</SelectItem>
              <SelectItem value="DEF" className="text-white">Defenders</SelectItem>
              <SelectItem value="MID" className="text-white">Midfielders</SelectItem>
              <SelectItem value="FWD" className="text-white">Forwards</SelectItem>
              <SelectItem value="RUCK" className="text-white">Rucks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Results Info */}
        <div className="text-xs text-gray-400 mb-3">
          Showing {filteredPlayers.length} players
          {searchQuery && ` matching "${searchQuery}"`}
          {positionFilter !== "ALL" && ` (${positionFilter})`}
        </div>

        {/* Chart */}
        {filteredPlayers.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            No players found. Try adjusting your filters.
          </p>
        ) : (
          <div className="h-[400px] md:h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={filteredPlayers}
                layout="horizontal"
                margin={{ top: 5, right: 20, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
                <XAxis 
                  type="number" 
                  domain={[0, 10]}
                  tick={{ fill: '#888', fontSize: 11 }}
                  axisLine={{ stroke: '#555' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="playerName" 
                  tick={{ fill: '#fff', fontSize: 10 }}
                  axisLine={{ stroke: '#555' }}
                  width={75}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#333' }} />
                <Bar dataKey="dvpRating" radius={[0, 4, 4, 0]}>
                  {filteredPlayers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getDVPColor(entry.dvpRating)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 justify-center text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#22c55e" }}></div>
            <span className="text-gray-300">Very Easy (0-3)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#84cc16" }}></div>
            <span className="text-gray-300">Easy (4)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#eab308" }}></div>
            <span className="text-gray-300">Moderate (5-6)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#f97316" }}></div>
            <span className="text-gray-300">Hard (7)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: "#ef4444" }}></div>
            <span className="text-gray-300">Very Hard (8-10)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
