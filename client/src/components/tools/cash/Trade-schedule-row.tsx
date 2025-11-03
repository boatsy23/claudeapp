/**
 * TRADE SCHEDULE ROW
 * ==================
 * 
 * Displays trades scheduled for a specific round:
 * - Round number header
 * - List of players to trade in
 * - Confidence for each trade
 * - Remaining salary after trades
 * - Warning indicators
 * - Collapsible details
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { ConfidenceIndicatorCompact } from './confidence-indicator';
import { ScheduledTrade, ScheduleWarning } from './buy-sell-types';
import {
  formatPrice,
  formatRound,
  getTeamName
} from './buy-sell-utils';

// ============================================
// TYPES
// ============================================

interface TradeScheduleRowProps {
  round: number;
  trades: ScheduledTrade[];
  warnings?: ScheduleWarning[];
  remainingSalaryBefore: number;
}

// ============================================
// COMPONENT
// ============================================

export default function TradeScheduleRow({
  round,
  trades,
  warnings = [],
  remainingSalaryBefore
}: TradeScheduleRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Calculate remaining salary after all trades in this round
  const totalCost = trades.reduce((sum, trade) => sum + trade.projectedPrice, 0);
  const remainingSalaryAfter = remainingSalaryBefore - totalCost;
  
  // Get warnings for this round
  const roundWarnings = warnings.filter(w => w.round === round);
  const hasErrors = roundWarnings.some(w => w.severity === 'error');
  const hasWarnings = roundWarnings.some(w => w.severity === 'warning');
  
  // Calculate average confidence for this round
  const avgConfidence = trades.length > 0
    ? Math.round(trades.reduce((sum, t) => sum + t.affordability.confidence, 0) / trades.length)
    : 0;
  
  return (
    <Card className={`
      bg-gray-800 
      border 
      ${hasErrors ? 'border-red-600/50' : hasWarnings ? 'border-yellow-600/50' : 'border-gray-700'}
      overflow-hidden
    `}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-750 transition-colors text-left"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Round Number */}
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white font-bold rounded-full w-10 h-10 flex items-center justify-center text-sm">
              {round}
            </div>
            <div>
              <p className="text-white font-semibold">
                {formatRound(round)}
              </p>
              <p className="text-xs text-gray-400">
                {trades.length} trade{trades.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Quick Summary */}
          <div className="hidden md:flex items-center gap-4 flex-1">
            {/* Players Trading In */}
            <div className="flex -space-x-2">
              {trades.slice(0, 3).map((trade, idx) => (
                <div
                  key={idx}
                  className="bg-gray-700 border-2 border-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold text-white"
                  title={trade.playerName}
                >
                  {trade.playerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
              ))}
              {trades.length > 3 && (
                <div className="bg-gray-700 border-2 border-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-xs font-semibold text-white">
                  +{trades.length - 3}
                </div>
              )}
            </div>
            
            {/* Average Confidence */}
            <ConfidenceIndicatorCompact
              confidence={avgConfidence}
              size="sm"
            />
            
            {/* Cost */}
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-gray-400" />
              <span className="text-gray-400">Cost:</span>
              <span className="text-white font-semibold">
                {formatPrice(totalCost, true)}
              </span>
            </div>
          </div>
          
          {/* Status Icon */}
          <div className="ml-auto mr-2">
            {hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-red-400" />
            ) : hasWarnings ? (
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
            ) : (
              <CheckCircle className="h-5 w-5 text-green-400" />
            )}
          </div>
        </div>
        
        {/* Expand Icon */}
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </button>
      
      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 space-y-4">
          {/* Warnings */}
          {roundWarnings.length > 0 && (
            <div className="space-y-2">
              {roundWarnings.map((warning, idx) => (
                <Alert
                  key={idx}
                  variant={warning.severity === 'error' ? 'destructive' : 'default'}
                  className={
                    warning.severity === 'error' ? '' :
                    warning.severity === 'warning' ? 'bg-yellow-900/20 border-yellow-600/50 text-yellow-100' :
                    'bg-blue-900/20 border-blue-600/50 text-blue-100'
                  }
                >
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <span className="font-semibold">{warning.issue}</span>
                    {warning.suggestion && (
                      <span className="block text-sm mt-1 opacity-90">
                        💡 {warning.suggestion}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
          
          {/* Trade Details */}
          <div className="space-y-3">
            {trades.map((trade, idx) => (
              <div
                key={idx}
                className="bg-gray-900/50 rounded-lg p-3 border border-gray-700"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-white">
                        {trade.playerName}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {trade.position}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-400 text-xs">Projected Price</p>
                        <p className="text-white font-semibold">
                          {formatPrice(trade.projectedPrice, true)}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-xs">Remaining After</p>
                        <p className={`font-semibold ${
                          trade.affordability.remainingSalaryAfterTrade < 0 
                            ? 'text-red-400' 
                            : 'text-white'
                        }`}>
                          {formatPrice(trade.affordability.remainingSalaryAfterTrade, true)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <ConfidenceIndicatorCompact
                      confidence={trade.affordability.confidence}
                      size="sm"
                    />
                  </div>
                </div>
                
                {/* Affordability Breakdown */}
                {trade.affordability.breakdown.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-xs font-semibold text-gray-400 mb-2">
                      Affordability Details:
                    </p>
                    <div className="space-y-1">
                      {trade.affordability.breakdown.map((item, bIdx) => (
                        <p key={bIdx} className="text-xs text-gray-500">
                          • {item}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="bg-gray-900/70 rounded-lg p-3 border border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs mb-1">Salary Before</p>
                <p className="text-white font-semibold">
                  {formatPrice(remainingSalaryBefore, true)}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 text-xs mb-1">Total Cost</p>
                <p className="text-white font-semibold">
                  {formatPrice(totalCost, true)}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 text-xs mb-1">Salary After</p>
                <p className={`font-semibold ${
                  remainingSalaryAfter < 0 ? 'text-red-400' : 'text-green-400'
                }`}>
                  {formatPrice(remainingSalaryAfter, true)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
