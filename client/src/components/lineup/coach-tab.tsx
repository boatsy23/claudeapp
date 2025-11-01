/**
 * COACH TAB COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Most traded in players
 * - Most traded out players
 * - Injury updates
 * - Responsive design
 * - Error logging
 * - Loading states
 */

import { formatCurrency } from "@/lib/utils";
import { logger } from "@/lib/error-logger";
import { useEffect } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type CoachChoice = {
  id: number;
  name: string;
  team: string;
  position: string;
  price?: number;
  avgScore?: number;
  trend: string;
};

export type InjuryStatus = {
  id: number;
  name: string;
  team: string;
  position: string;
  status: 'Out' | 'Test' | 'Questionable';
  details: string;
};

export type CoachData = {
  mostTradedIn: CoachChoice[];
  mostTradedOut: CoachChoice[];
  injuries: InjuryStatus[];
};

interface CoachTabProps {
  coachData: CoachData;
  isLoading?: boolean;
}

// ============================================
// PLAYER ROW COMPONENT
// ============================================

function PlayerRow({ player, type }: { player: CoachChoice; type: 'in' | 'out' }) {
  return (
    <div className="p-3 hover:bg-gray-800 transition-colors flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm truncate">{player.name}</div>
        <div className="text-xs text-gray-400">{player.team} | {player.position}</div>
      </div>
      <div className="text-right ml-3 flex-shrink-0">
        <div className="font-medium text-white text-sm">{formatCurrency(player.price)}</div>
        <div className={`text-xs font-medium flex items-center justify-end gap-1 ${type === 'in' ? 'text-green-400' : 'text-red-400'}`}>
          {type === 'in' ? (
            <>
              <TrendingUp className="h-3 w-3" />
              <span>Avg: {player.avgScore}</span>
            </>
          ) : (
            <>
              <TrendingDown className="h-3 w-3" />
              <span>Avg: {player.avgScore}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// INJURY ROW COMPONENT
// ============================================

function InjuryRow({ injury }: { injury: InjuryStatus }) {
  const statusColors = {
    'Out': 'text-red-400',
    'Test': 'text-amber-400',
    'Questionable': 'text-orange-400'
  };
  
  return (
    <div className="p-3 hover:bg-gray-800 transition-colors flex items-center justify-between">
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-sm truncate">{injury.name}</div>
        <div className="text-xs text-gray-400">{injury.team} | {injury.position}</div>
      </div>
      <div className="text-right ml-3 flex-shrink-0">
        <div className={`font-medium text-sm ${statusColors[injury.status]}`}>
          {injury.status}
        </div>
        <div className="text-xs text-gray-400">
          {injury.details}
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOADING STATE COMPONENT
// ============================================

function LoadingState() {
  return (
    <div className="animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 flex items-center justify-between border-b border-gray-700">
          <div className="flex-1">
            <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-24 bg-gray-700 rounded"></div>
          </div>
          <div className="text-right">
            <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 w-16 bg-gray-700 rounded"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================

function EmptyState({ type }: { type: string }) {
  return (
    <div className="p-6 text-center">
      <p className="text-gray-400 text-sm">No {type} data available</p>
    </div>
  );
}

// ============================================
// MAIN COACH TAB COMPONENT
// ============================================

export default function CoachTab({ coachData, isLoading }: CoachTabProps) {
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    logger.info('CoachTab', 'Component rendered', {
      tradedInCount: coachData.mostTradedIn.length,
      tradedOutCount: coachData.mostTradedOut.length,
      injuriesCount: coachData.injuries.length,
      isLoading
    });
  }, [coachData, isLoading]);
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="p-4 space-y-6">
      <h3 className="font-semibold text-lg text-white">Coach's Corner</h3>
      
      {/* Most Traded In */}
      <div>
        <h4 className="font-semibold text-base mb-3 text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-400" />
          Most Traded In
        </h4>
        
        <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
          <div className="bg-gray-700 text-white p-2 font-medium text-sm">
            Popular Picks This Week
          </div>
          <div className="divide-y divide-gray-700">
            {isLoading ? (
              <LoadingState />
            ) : coachData.mostTradedIn.length > 0 ? (
              coachData.mostTradedIn.map(player => (
                <PlayerRow key={player.id} player={player} type="in" />
              ))
            ) : (
              <EmptyState type="traded in players" />
            )}
          </div>
        </div>
      </div>
      
      {/* Most Traded Out */}
      <div>
        <h4 className="font-semibold text-base mb-3 text-white flex items-center gap-2">
          <TrendingDown className="h-5 w-5 text-red-400" />
          Most Traded Out
        </h4>
        
        <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
          <div className="bg-gray-700 text-white p-2 font-medium text-sm">
            Players on the Move
          </div>
          <div className="divide-y divide-gray-700">
            {isLoading ? (
              <LoadingState />
            ) : coachData.mostTradedOut.length > 0 ? (
              coachData.mostTradedOut.map(player => (
                <PlayerRow key={player.id} player={player} type="out" />
              ))
            ) : (
              <EmptyState type="traded out players" />
            )}
          </div>
        </div>
      </div>
      
      {/* Injury Update */}
      <div>
        <h4 className="font-semibold text-base mb-3 text-white">Injury Update</h4>
        
        <div className="border border-gray-600 rounded-lg overflow-hidden bg-gray-900">
          <div className="bg-gray-700 text-white p-2 font-medium text-sm">
            Latest Injury News
          </div>
          <div className="divide-y divide-gray-700">
            {isLoading ? (
              <LoadingState />
            ) : coachData.injuries.length > 0 ? (
              coachData.injuries.map(injury => (
                <InjuryRow key={injury.id} injury={injury} />
              ))
            ) : (
              <EmptyState type="injury updates" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * SKELETON LOADER FOR COACH TAB
 */
export function CoachTabSkeleton() {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      <div className="h-7 w-32 bg-gray-700 rounded"></div>
      {[1, 2, 3].map((i) => (
        <div key={i}>
          <div className="h-6 w-40 bg-gray-700 rounded mb-3"></div>
          <div className="border border-gray-700 rounded-lg overflow-hidden">
            <div className="h-10 bg-gray-800"></div>
            <div className="divide-y divide-gray-700">
              {[1, 2, 3].map((j) => (
                <div key={j} className="p-3 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-32 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 w-24 bg-gray-700 rounded"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-20 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 w-16 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
