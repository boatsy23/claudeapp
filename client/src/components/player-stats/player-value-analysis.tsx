/**
 * PLAYER VALUE ANALYSIS
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Scatter plot showing Price vs Points per Dollar
 * - Filter by team and position
 * - Shows best value in Premium/Mid-price/Rookie tiers
 * - Top 20 value players highlighted
 * - Uses /api/players/value-stats
 */

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ZAxis,
  Legend
} from "recharts";
import { Loader2, TrendingUp } from "lucide-react";
import { logger } from "@/lib/error-logger";
import { formatCurrency } from "@/lib/utils";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface PlayerData {
  name: string;
  price: number;
  averagePoints: number;
  position: string;
  team: string;
  breakEven: number;
  lastScore: number;
  projectedScore: number;
  l3Average: number;
  valueRating: string;
  ppd: number; // Points per dollar
}

interface ValuePlayer {
  name: string;
  price: number;
  ppd: number;
  position: string;
  team: string;
  breakEven: number;
  lastScore: number;
  projectedScore: number;
  l3Average: number;
  valueRating: string;
}

// ============================================
// CUSTOM TOOLTIP
// ============================================

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const player = payload[0].payload;
    return (
      <div className="bg-gray-800 border border-gray-700 text-white p-3 rounded-md text-xs">
        <p className="text-blue-400 font-bold mb-1">{player.name}</p>
        <p className="text-gray-300">{player.team} {player.position}</p>
        <p className="mt-2">
          <span className="text-gray-400">Price:</span>{" "}
          <span className="font-semibold">{formatCurrency(player.price)}</span>
        </p>
        <p>
          <span className="text-gray-400">Points/Dollar:</span>{" "}
          <span className="font-semibold text-green-400">{player.ppd.toFixed(4)}</span>
        </p>
        <p>
          <span className="text-gray-400">Avg:</span> {player.l3Average.toFixed(1)}
        </p>
        <p>
          <span className="text-gray-400">Projected:</span> {player.projectedScore}
        </p>
      </div>
    );
  }
  return null;
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function PlayerValueAnalysis() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [selectedPosition, setSelectedPosition] = useState<string>("all");

  // ============================================
  // DATA FETCHING
  // ============================================
  
  const { data: playersData = [], isLoading, error } = useQuery<PlayerData[]>({
    queryKey: ['/api/players/value-stats'],
    queryFn: async () => {
      logger.info('PlayerValueAnalysis', 'Fetching value stats');
      
      try {
        const response = await fetch('/api/players/value-stats');
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        logger.info('PlayerValueAnalysis', 'Value stats loaded', {
          playerCount: data.length
        });
        
        return data;
      } catch (err) {
        logger.error('PlayerValueAnalysis', 'Failed to fetch value stats', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    logger.info('PlayerValueAnalysis', 'Component rendered', {
      playerCount: playersData.length,
      selectedTeam,
      selectedPosition
    });
  }, [playersData, selectedTeam, selectedPosition]);

  // ============================================
  // DATA PROCESSING
  // ============================================
  
  const uniqueTeams = Array.from(new Set(playersData.map((p) => p.team)))
    .filter((team) => team)
    .sort();

  const valueData: ValuePlayer[] = playersData
    .filter((player) => player.price > 0 && player.averagePoints > 0)
    .map((player) => ({
      name: player.name,
      price: player.price,
      ppd: player.ppd || 0,
      position: player.position,
      team: player.team,
      breakEven: player.breakEven || 0,
      lastScore: player.lastScore || 0,
      projectedScore: player.projectedScore || 0,
      l3Average: player.l3Average || 0,
      valueRating: player.valueRating || '-'
    }))
    .filter((player) => player.ppd > 0);

  const filteredData = valueData.filter((player) => {
    const teamMatch = selectedTeam === "all" || player.team === selectedTeam;
    const positionMatch = selectedPosition === "all" || player.position === selectedPosition;
    return teamMatch && positionMatch;
  });

  // Get top 20 best value players for scatter graph
  const top20ValuePlayers = [...filteredData]
    .sort((a, b) => b.ppd - a.ppd)
    .slice(0, 20);

  // Best value in each tier
  const premiumPlayer = filteredData
    .filter((player) => player.price >= 550000)
    .sort((a, b) => b.ppd - a.ppd)[0];

  const midpricerPlayer = filteredData
    .filter((player) => player.price >= 300000 && player.price < 550000)
    .sort((a, b) => b.ppd - a.ppd)[0];

  const rookiePlayer = filteredData
    .filter((player) => player.price < 300000)
    .sort((a, b) => b.ppd - a.ppd)[0];

  // ============================================
  // POSITION COLORS
  // ============================================
  
  const getPositionColor = (position: string) => {
    switch (position) {
      case "DEF": return "#22c55e";
      case "MID": return "#3b82f6";
      case "FWD": return "#ef4444";
      case "RUCK": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  
  if (isLoading) {
    return (
      <Card className="bg-gray-900 border-gray-700 text-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
            <span className="ml-2 text-gray-300">Loading value analysis...</span>
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
            Failed to load value analysis. Please try again.
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
        <h3 className="text-lg font-bold text-blue-400 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          PLAYER VALUE ANALYSIS
        </h3>
        <p className="text-xs text-gray-400 mt-1">Best value players by price tier (Points per Dollar)</p>
      </div>
      <CardContent className="px-3 pt-4 pb-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger 
              className="bg-gray-800 border-gray-700 text-white"
              style={{ minHeight: '44px' }}
            >
              <SelectValue placeholder="All Teams" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white">All Teams</SelectItem>
              {uniqueTeams.map((team) => (
                <SelectItem key={team} value={team} className="text-white">
                  {team}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger 
              className="bg-gray-800 border-gray-700 text-white"
              style={{ minHeight: '44px' }}
            >
              <SelectValue placeholder="All Positions" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="all" className="text-white">All Positions</SelectItem>
              <SelectItem value="DEF" className="text-white">Defenders</SelectItem>
              <SelectItem value="MID" className="text-white">Midfielders</SelectItem>
              <SelectItem value="FWD" className="text-white">Forwards</SelectItem>
              <SelectItem value="RUCK" className="text-white">Rucks</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Best Value Players by Tier */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Premium */}
          {premiumPlayer && (
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
              <div className="text-xs text-purple-400 font-semibold mb-1">BEST PREMIUM</div>
              <div className="text-sm font-bold text-white">{premiumPlayer.name}</div>
              <div className="text-xs text-gray-400">{premiumPlayer.team} {premiumPlayer.position}</div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-400">Price:</span>
                <span className="text-white font-semibold">{formatCurrency(premiumPlayer.price)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Value:</span>
                <span className="text-green-400 font-semibold">{premiumPlayer.ppd.toFixed(4)}</span>
              </div>
            </div>
          )}

          {/* Mid-pricer */}
          {midpricerPlayer && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
              <div className="text-xs text-blue-400 font-semibold mb-1">BEST MID-PRICER</div>
              <div className="text-sm font-bold text-white">{midpricerPlayer.name}</div>
              <div className="text-xs text-gray-400">{midpricerPlayer.team} {midpricerPlayer.position}</div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-400">Price:</span>
                <span className="text-white font-semibold">{formatCurrency(midpricerPlayer.price)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Value:</span>
                <span className="text-green-400 font-semibold">{midpricerPlayer.ppd.toFixed(4)}</span>
              </div>
            </div>
          )}

          {/* Rookie */}
          {rookiePlayer && (
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
              <div className="text-xs text-green-400 font-semibold mb-1">BEST ROOKIE</div>
              <div className="text-sm font-bold text-white">{rookiePlayer.name}</div>
              <div className="text-xs text-gray-400">{rookiePlayer.team} {rookiePlayer.position}</div>
              <div className="mt-2 flex justify-between text-xs">
                <span className="text-gray-400">Price:</span>
                <span className="text-white font-semibold">{formatCurrency(rookiePlayer.price)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Value:</span>
                <span className="text-green-400 font-semibold">{rookiePlayer.ppd.toFixed(4)}</span>
              </div>
            </div>
          )}
        </div>

        {/* Scatter Chart */}
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                type="number" 
                dataKey="price" 
                name="Price"
                tick={{ fill: '#888', fontSize: 11 }}
                axisLine={{ stroke: '#555' }}
                label={{ value: 'Price', position: 'insideBottom', offset: -10, fill: '#888' }}
              />
              <YAxis 
                type="number" 
                dataKey="ppd" 
                name="Points/Dollar"
                tick={{ fill: '#888', fontSize: 11 }}
                axisLine={{ stroke: '#555' }}
                label={{ value: 'Value (Points/$)', angle: -90, position: 'insideLeft', fill: '#888' }}
              />
              <ZAxis range={[60, 400]} />
              <RechartsTooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Legend wrapperStyle={{ color: '#fff' }} />
              
              {/* Position-based scatter plots */}
              {["DEF", "MID", "FWD", "RUCK"].map((pos) => (
                <Scatter
                  key={pos}
                  name={pos}
                  data={top20ValuePlayers.filter(p => p.position === pos)}
                  fill={getPositionColor(pos)}
                  opacity={0.7}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Results Info */}
        <div className="text-xs text-gray-400 mt-4 text-center">
          Showing top 20 value players
          {selectedTeam !== "all" && ` from ${selectedTeam}`}
          {selectedPosition !== "all" && ` (${selectedPosition})`}
        </div>
      </CardContent>
    </Card>
  );
}
