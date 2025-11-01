/**
 * HISTORY TAB COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Trade history by round
 * - Traded in vs traded out comparison
 * - Empty state
 * - Loading state
 * - Error logging
 * - Responsive design
 */

import { ArrowRightLeft } from "lucide-react";
import { logger } from "@/lib/error-logger";
import { useEffect } from "react";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type RoundTrade = {
  round: number;
  tradedOut: string[];
  tradedIn: string[];
};

interface HistoryTabProps {
  tradeHistory: RoundTrade[];
  isLoading?: boolean;
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState() {
  return (
    <div className="text-center p-8 bg-gray-900 border border-gray-600 rounded-lg">
      <div className="text-gray-400 mb-4">
        <ArrowRightLeft className="h-16 w-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">No trade history</h3>
      <p className="text-gray-400 text-sm">
        You haven't made any trades yet this season.
      </p>
    </div>
  );
}

// ============================================
// LOADING STATE COMPONENT
// ============================================

function LoadingState() {
  return (
    <div className="text-center p-8 bg-gray-900 border border-gray-600 rounded-lg animate-pulse">
      <div className="h-16 w-16 bg-gray-700 rounded-full mx-auto mb-4"></div>
      <div className="h-6 w-48 bg-gray-700 rounded mx-auto mb-2"></div>
      <div className="h-4 w-64 bg-gray-700 rounded mx-auto"></div>
    </div>
  );
}

// ============================================
// TRADE ROUND COMPONENT
// ============================================

function TradeRound({ round, tradedOut, tradedIn }: RoundTrade) {
  const maxTrades = Math.max(tradedOut.length, tradedIn.length);
  
  return (
    <div className="mb-6">
      {/* Round Header */}
      <div className="flex items-center mb-3">
        <div className="bg-green-500 text-white font-semibold px-3 py-1.5 rounded text-sm">
          Round {round}
        </div>
      </div>
      
      {/* Trade Table */}
      {maxTrades > 0 && (
        <div className="border border-gray-600 rounded-lg overflow-hidden shadow-lg bg-gray-900">
          {/* Table Header */}
          <div className="grid grid-cols-2 bg-gray-800">
            {/* Traded Out Header */}
            <div className="p-3 border-r border-gray-600 border-b border-gray-600">
              <div className="flex items-center">
                <div className="bg-red-900 rounded-full p-1.5">
                  <ArrowRightLeft className="h-4 w-4 text-red-400" />
                </div>
                <span className="ml-2 font-semibold text-red-400 text-sm">TRADED OUT</span>
              </div>
            </div>
            
            {/* Traded In Header */}
            <div className="p-3 border-b border-gray-600">
              <div className="flex items-center">
                <div className="bg-green-900 rounded-full p-1.5">
                  <ArrowRightLeft className="h-4 w-4 text-green-400" />
                </div>
                <span className="ml-2 font-semibold text-green-400 text-sm">TRADED IN</span>
              </div>
            </div>
          </div>
          
          {/* Trade Rows */}
          {Array.from({ length: maxTrades }).map((_, tradeIndex) => {
            const playerOut = tradedOut[tradeIndex];
            const playerIn = tradedIn[tradeIndex];
            
            return (
              <div 
                key={tradeIndex} 
                className="grid grid-cols-2 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 transition-colors"
              >
                {/* Player Out */}
                <div className="p-3 border-r border-gray-600">
                  {playerOut ? (
                    <div className="font-medium text-white text-sm">{playerOut}</div>
                  ) : (
                    <div className="text-sm text-gray-500">-</div>
                  )}
                </div>
                
                {/* Player In */}
                <div className="p-3">
                  {playerIn ? (
                    <div className="font-medium text-white text-sm">{playerIn}</div>
                  ) : (
                    <div className="text-sm text-gray-500">-</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// MAIN HISTORY TAB COMPONENT
// ============================================

export default function HistoryTab({ tradeHistory, isLoading }: HistoryTabProps) {
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    logger.info('HistoryTab', 'Component rendered', {
      tradeCount: tradeHistory.length,
      totalTrades: tradeHistory.reduce((sum, r) => sum + Math.max(r.tradedOut.length, r.tradedIn.length), 0),
      isLoading
    });
  }, [tradeHistory, isLoading]);
  
  // ============================================
  // RENDER: LOADING STATE
  // ============================================
  
  if (isLoading) {
    return (
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4 text-white">Trade History</h3>
        <LoadingState />
      </div>
    );
  }
  
  // ============================================
  // RENDER: EMPTY STATE
  // ============================================
  
  if (tradeHistory.length === 0) {
    logger.info('HistoryTab', 'No trade history available');
    return (
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-4 text-white">Trade History</h3>
        <EmptyState />
      </div>
    );
  }
  
  // ============================================
  // RENDER: TRADE HISTORY
  // ============================================
  
  return (
    <div className="p-4">
      <h3 className="font-semibold text-lg mb-4 text-white">Trade History</h3>
      
      {/* Render each round's trades */}
      {tradeHistory.map((roundData, roundIndex) => (
        <TradeRound
          key={roundIndex}
          round={roundData.round}
          tradedOut={roundData.tradedOut}
          tradedIn={roundData.tradedIn}
        />
      ))}
    </div>
  );
}

/**
 * SKELETON LOADER FOR HISTORY TAB
 */
export function HistoryTabSkeleton() {
  return (
    <div className="p-4 animate-pulse">
      <div className="h-7 w-32 bg-gray-700 rounded mb-4"></div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="mb-6">
          <div className="h-8 w-20 bg-gray-700 rounded mb-3"></div>
          <div className="h-40 bg-gray-800 rounded"></div>
        </div>
      ))}
    </div>
  );
}
