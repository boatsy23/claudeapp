/**
 * PERFORMANCE CHART COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Responsive chart design
 * - Multiple view modes (score, rank, team value)
 * - Touch-optimized interactions
 * - Comprehensive error logging
 * - Native app styling
 */

import { Card, CardContent } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  TooltipProps
} from "recharts";
import { 
  NameType, 
  ValueType 
} from "recharts/types/component/DefaultTooltipContent";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { logger } from "@/lib/error-logger";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type RoundData = {
  round: number;
  actualScore: number;
  projectedScore: number;
  rank: number;
  teamValue: number;
};

type PerformanceChartProps = {
  data: RoundData[];
};

type ChartView = "score" | "rank" | "teamValue";

// ============================================
// CUSTOM TOOLTIP COMPONENT
// ============================================

const CustomTooltip = ({ 
  active, 
  payload, 
  label, 
  viewType 
}: TooltipProps<ValueType, NameType> & { viewType: ChartView }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  try {
    return (
      <div className="bg-gray-800/95 backdrop-blur-sm border border-gray-600 shadow-2xl rounded-lg p-3 text-sm">
        {/* Round number */}
        <div className="font-semibold mb-2 text-white border-b border-gray-600 pb-1">
          Round {label}
        </div>
        
        {/* Data entries */}
        <div className="space-y-1">
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-3" style={{ color: entry.color as string }}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-2.5 h-2.5 rounded-full" 
                  style={{ backgroundColor: entry.color as string }}
                  aria-hidden="true"
                ></div>
                <span className="font-medium">{entry.name}:</span>
              </div>
              <span className="font-bold">
                {viewType === "teamValue" 
                  ? `$${((entry.value as number) / 1000000).toFixed(1)}M`
                  : entry.value?.toLocaleString()
                }
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (err: any) {
    logger.error('PerformanceChart', 'Error rendering tooltip', err);
    return null;
  }
};

// ============================================
// MAIN PERFORMANCE CHART COMPONENT
// ============================================

export default function PerformanceChart({ data }: PerformanceChartProps) {
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [viewType, setViewType] = useState<ChartView>("score");
  
  // ============================================
  // ERROR LOGGING & VALIDATION
  // ============================================
  
  useEffect(() => {
    logger.info('PerformanceChart', 'Component rendered', {
      dataPoints: data.length,
      viewType
    });
    
    // Validate data
    if (!data || data.length === 0) {
      logger.warning('PerformanceChart', 'No data provided to chart');
    }
    
    // Check for data integrity
    const hasValidData = data.some(d => 
      d.actualScore > 0 || d.projectedScore > 0 || d.rank > 0 || d.teamValue > 0
    );
    
    if (!hasValidData) {
      logger.warning('PerformanceChart', 'All data points are zero or empty');
    }
  }, [data, viewType]);
  
  // ============================================
  // DATA PROCESSING
  // ============================================
  
  // Sort data by round in ascending order
  const chartData = [...data].sort((a, b) => a.round - b.round);
  
  /**
   * Calculate Y-axis domain based on view type
   */
  const getDomain = (): [number, number] => {
    try {
      if (viewType === "score") {
        const scores = chartData.flatMap(d => [d.actualScore, d.projectedScore]);
        const maxScore = Math.max(...scores);
        return [0, Math.ceil(maxScore * 1.1)];
      } else if (viewType === "rank") {
        const maxRank = Math.max(...chartData.map(d => d.rank));
        return [0, Math.ceil(maxRank * 1.1)];
      } else {
        const maxValue = Math.max(...chartData.map(d => d.teamValue));
        return [0, Math.ceil(maxValue * 1.1)];
      }
    } catch (err: any) {
      logger.error('PerformanceChart', 'Error calculating domain', err);
      return [0, 100]; // Fallback
    }
  };
  
  /**
   * Get data keys based on view type
   */
  const getDataKeys = () => {
    if (viewType === "score") {
      return { 
        actual: "actualScore", 
        projected: "projectedScore", 
        actualLabel: "Actual Score", 
        projectedLabel: "Projected Score" 
      };
    } else if (viewType === "rank") {
      return { 
        actual: "rank", 
        projected: null, 
        actualLabel: "Rank", 
        projectedLabel: null 
      };
    } else {
      return { 
        actual: "teamValue", 
        projected: null, 
        actualLabel: "Team Value", 
        projectedLabel: null 
      };
    }
  };
  
  const dataKeys = getDataKeys();
  const domain = getDomain();
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleViewChange = (value: string) => {
    const newView = value as ChartView;
    logger.info('PerformanceChart', 'View type changed', {
      from: viewType,
      to: newView
    });
    setViewType(newView);
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <Card className="bg-gray-800/95 backdrop-blur-sm border-2 border-red-500 relative overflow-hidden shadow-xl">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent pointer-events-none"></div>
      
      <CardContent className="p-3 md:p-4 relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
          {/* Title */}
          <h2 className="text-base md:text-lg font-semibold text-white">
            Performance Over 24 Rounds
          </h2>
          
          {/* View selector */}
          <Select value={viewType} onValueChange={handleViewChange}>
            <SelectTrigger 
              className="w-full sm:w-[180px] bg-gray-700/80 border-gray-600 text-white hover:bg-gray-700 transition-colors" 
              data-testid="select-chart-view"
              style={{ minHeight: '44px' }} // Touch target
            >
              <SelectValue placeholder="Select view" />
            </SelectTrigger>
            <SelectContent className="bg-gray-700 border-gray-600">
              <SelectItem 
                value="score" 
                className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Score
              </SelectItem>
              <SelectItem 
                value="rank" 
                className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Rank
              </SelectItem>
              <SelectItem 
                value="teamValue" 
                className="text-white hover:bg-gray-600 focus:bg-gray-600 cursor-pointer"
                style={{ minHeight: '44px' }}
              >
                Team Value
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Chart */}
        <div className="h-[250px] sm:h-[300px] md:h-[350px] relative">
          {/* Background gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-red-500/10 to-transparent rounded-lg pointer-events-none"></div>
          
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 30,
                bottom: 20,
              }}
            >
              {/* Gradients and filters for visual effects */}
              <defs>
                <linearGradient id="redGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.05}/>
                </linearGradient>
                <linearGradient id="greenGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                </linearGradient>
                <filter id="redGlowFilter">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <filter id="greenGlowFilter">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge> 
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              
              {/* Grid */}
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#374151" 
                opacity={0.3} 
                vertical={false}
              />
              
              {/* X Axis - Rounds */}
              <XAxis 
                dataKey="round"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                interval="preserveStartEnd"
                tickFormatter={(value) => `R${value}`}
                height={30}
              />
              
              {/* Y Axis - Values */}
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 11 }}
                domain={domain}
                tickFormatter={(value) => {
                  if (viewType === "teamValue") {
                    return `$${(value / 1000000).toFixed(1)}M`;
                  }
                  return value.toLocaleString();
                }}
                width={60}
              />
              
              {/* Tooltip */}
              <Tooltip
                content={(props) => <CustomTooltip {...props} viewType={viewType} />}
                cursor={{ stroke: '#6b7280', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
              
              {/* Actual data line */}
              <Line
                type="monotone"
                dataKey={dataKeys.actual}
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ 
                  fill: '#ef4444', 
                  strokeWidth: 2, 
                  r: 4, 
                  stroke: '#1f2937'
                }}
                activeDot={{ 
                  r: 6, 
                  fill: '#ef4444', 
                  stroke: '#ffffff', 
                  strokeWidth: 2 
                }}
                name={dataKeys.actualLabel}
                connectNulls={true}
              />
              
              {/* Projected data line (if applicable) */}
              {dataKeys.projected && (
                <Line
                  type="monotone"
                  dataKey={dataKeys.projected}
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  strokeDasharray="5 5"
                  dot={{ 
                    fill: '#22c55e', 
                    strokeWidth: 2, 
                    r: 4,
                    stroke: '#1f2937'
                  }}
                  activeDot={{ 
                    r: 6, 
                    fill: '#22c55e', 
                    stroke: '#ffffff', 
                    strokeWidth: 2 
                  }}
                  name={dataKeys.projectedLabel || undefined}
                  connectNulls={false}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend (mobile-friendly) */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-300">{dataKeys.actualLabel}</span>
          </div>
          {dataKeys.projected && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-0.5 bg-green-500" style={{ width: '20px' }}></div>
              <span className="text-gray-300">{dataKeys.projectedLabel}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SKELETON LOADER FOR PERFORMANCE CHART
 * Used during loading states
 */
export function PerformanceChartSkeleton() {
  return (
    <Card className="bg-gray-800 border-2 border-gray-700 animate-pulse">
      <CardContent className="p-3 md:p-4">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-4">
          <div className="h-6 w-48 bg-gray-700 rounded"></div>
          <div className="h-10 w-40 bg-gray-700 rounded"></div>
        </div>
        
        {/* Chart skeleton */}
        <div className="h-[300px] bg-gray-700/50 rounded"></div>
      </CardContent>
    </Card>
  );
}
