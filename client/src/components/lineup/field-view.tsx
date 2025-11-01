/**
 * FIELD VIEW COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Table layout for all 22 players
 * - Organized by position (DEF, MID, RUC, FWD)
 * - Expandable/collapsible sections
 * - Captain/VC highlighting
 * - Responsive design
 * - Error logging
 * - Touch-optimized
 */

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { formatCurrency, formatScore } from "@/lib/utils";
import { logger } from "@/lib/error-logger";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type TeamPlayer = {
  id: number;
  name: string;
  position: string;
  team?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  price?: number;
  breakEven?: number;
  lastScore?: number;
  averagePoints?: number;
  liveScore?: number;
  secondaryPositions?: string[];
  isOnBench?: boolean;
  projScore?: number;
  nextOpponent?: string;
  l3Average?: number;
  roundsPlayed?: number;
};

interface FieldViewProps {
  midfielders: TeamPlayer[];
  forwards: TeamPlayer[];
  defenders: TeamPlayer[];
  rucks: TeamPlayer[];
  utility?: TeamPlayer[];
  onPlayerClick?: (player: TeamPlayer) => void;
  onPlayerNameClick?: (player: TeamPlayer, e: React.MouseEvent) => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map team codes to guernsey image filenames
 */
const TEAM_GUERNSEY_MAP: Record<string, string> = {
  'ADE': 'adelaide',
  'BRI': 'brisbane',
  'CAR': 'carlton',
  'COL': 'collingwood',
  'ESS': 'essendon',
  'FRE': 'fremantle',
  'GEE': 'geelong',
  'GCS': 'gold_coast',
  'GWS': 'gws',
  'HAW': 'hawthorn',
  'MEL': 'melbourne',
  'NTH': 'north_melbourne',
  'PTA': 'port_adelaide',
  'RIC': 'richmond',
  'STK': 'st_kilda',
  'SYD': 'sydney',
  'WCE': 'west_coast',
  'WBD': 'western_bulldogs'
};

/**
 * Format player name as first initial + last name
 */
const formatPlayerName = (fullName: string): string => {
  const parts = fullName.trim().split(' ');
  if (parts.length === 1) return fullName;
  const firstInitial = parts[0][0].toUpperCase();
  const lastName = parts.slice(1).join(' ');
  return `${firstInitial}. ${lastName}`;
};

/**
 * Get guernsey image path for team code
 */
const getGuernseyPath = (teamCode?: string): string | null => {
  if (!teamCode) return null;
  const fileName = TEAM_GUERNSEY_MAP[teamCode.toUpperCase()];
  return fileName ? `/guernseys/${fileName}.png` : null;
};

/**
 * Create placeholder players when not enough actual players are available
 */
const getPlaceholders = (position: string, count: number, startId: number): TeamPlayer[] => {
  return Array(count).fill(null).map((_, i) => ({
    id: startId + i,
    name: `Player ${String.fromCharCode(65 + i)}`,
    position,
    team: "TBD",
    price: 500000,
    breakEven: 80,
    lastScore: 70,
    averagePoints: 75,
    liveScore: 0,
    isOnBench: false,
    nextOpponent: "BYE",
    l3Average: 72,
    roundsPlayed: 6
  }));
};

// ============================================
// POSITION SECTION COMPONENT
// ============================================

type PositionSectionProps = {
  title: string;
  shortCode: string;
  fieldPlayers: TeamPlayer[];
  benchPlayers: TeamPlayer[];
  requiredFieldCount: number;
  requiredBenchCount: number;
  color: string;
  hasBorder?: boolean;
  onPlayerClick?: (player: TeamPlayer) => void;
  onPlayerNameClick?: (player: TeamPlayer, e: React.MouseEvent) => void;
};

function PositionSection({
  title,
  shortCode,
  fieldPlayers,
  benchPlayers,
  requiredFieldCount,
  requiredBenchCount,
  color,
  hasBorder = true,
  onPlayerClick,
  onPlayerNameClick
}: PositionSectionProps) {
  const [expanded, setExpanded] = useState(true);
  
  // ============================================
  // PAD WITH PLACEHOLDERS
  // ============================================
  
  const paddedFieldPlayers = [...fieldPlayers];
  const paddedBenchPlayers = [...benchPlayers];
  
  if (paddedFieldPlayers.length < requiredFieldCount) {
    paddedFieldPlayers.push(...getPlaceholders(shortCode, requiredFieldCount - paddedFieldPlayers.length, 10000 + paddedFieldPlayers.length));
  }
  
  if (paddedBenchPlayers.length < requiredBenchCount) {
    paddedBenchPlayers.push(...getPlaceholders(shortCode, requiredBenchCount - paddedBenchPlayers.length, 20000 + paddedBenchPlayers.length));
  }
  
  const displayFieldPlayers = paddedFieldPlayers.slice(0, requiredFieldCount);
  const displayBenchPlayers = paddedBenchPlayers.slice(0, requiredBenchCount);
  
  // ============================================
  // RENDER PLAYER ROW
  // ============================================
  
  const renderPlayerRow = (player: TeamPlayer, isBench: boolean = false) => {
    const formattedName = formatPlayerName(player.name);
    const guernseyPath = getGuernseyPath(player.team);
    const rowBgClass = player.isCaptain 
      ? 'bg-yellow-500/20 hover:bg-yellow-500/30' 
      : player.isViceCaptain 
      ? 'bg-blue-500/20 hover:bg-blue-500/30' 
      : isBench
      ? 'bg-gray-800/50 hover:bg-gray-800'
      : 'hover:bg-gray-800';
    
    return (
      <div 
        key={player.id} 
        className={`grid grid-cols-11 gap-1 items-center border-b border-gray-700 py-2 px-2 ${rowBgClass} text-white transition-colors cursor-pointer`}
        onClick={() => onPlayerClick && onPlayerClick(player)}
        data-testid={`row-player-${player.id}`}
        data-is-captain={player.isCaptain ? 'true' : 'false'}
        data-is-vice-captain={player.isViceCaptain ? 'true' : 'false'}
        style={{ minHeight: '44px' }}
      >
        {/* Player Name Column */}
        <div className="col-span-3 flex items-center gap-2 pl-1">
          {/* Team Guernsey */}
          {guernseyPath && (
            <img 
              src={guernseyPath} 
              alt={player.team || ''} 
              className="w-6 h-6 object-contain flex-shrink-0"
              data-testid={`img-guernsey-${player.team}`}
              onError={(e) => {
                logger.warning('FieldView', 'Failed to load guernsey', { team: player.team });
                e.currentTarget.style.display = 'none';
              }}
            />
          )}
          
          {/* Player Info */}
          <div className="min-w-0 flex-1">
            <div 
              className="font-medium cursor-pointer hover:text-blue-400 text-sm leading-tight transition-colors truncate"
              onClick={(e) => {
                e.stopPropagation();
                onPlayerNameClick && onPlayerNameClick(player, e);
              }}
              data-testid={`button-player-name-${player.id}`}
            >
              {formattedName}
              {isBench && <span className="ml-1 text-xs text-gray-400">(B)</span>}
            </div>
            <div className="text-xs text-gray-300 leading-tight" data-testid={`text-position-${player.id}`}>
              {player.secondaryPositions?.length ? (
                <span className="text-blue-400 font-medium">
                  {shortCode}/{player.secondaryPositions.join('/')}
                </span>
              ) : (
                <span>{shortCode}</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Next Opponent */}
        <div className="col-span-1 text-center text-xs font-medium border-l border-gray-600 pl-1" data-testid={`text-next-opponent-${player.id}`}>
          {player.nextOpponent || '-'}
        </div>
        
        {/* Live Score */}
        <div className="col-span-1 text-center text-xs font-medium border-l border-gray-600 pl-1" data-testid={`text-live-score-${player.id}`}>
          {player.liveScore || '-'}
        </div>
        
        {/* Average */}
        <div className="col-span-1 text-center text-xs font-medium border-l border-gray-600 pl-1" data-testid={`text-avg-points-${player.id}`}>
          {player.averagePoints?.toFixed(1) || '-'}
        </div>
        
        {/* L3 Average */}
        <div className="col-span-1 text-center text-xs font-medium border-l border-gray-600 pl-1" data-testid={`text-l3-avg-${player.id}`}>
          {player.l3Average?.toFixed(1) || '-'}
        </div>
        
        {/* Break Even */}
        <div className="col-span-1 text-center text-xs font-medium border-l border-gray-600 pl-1" data-testid={`text-breakeven-${player.id}`}>
          {player.breakEven ?? '-'}
        </div>
        
        {/* Last Score */}
        <div className="col-span-1 text-center text-xs font-medium border-l border-gray-600 pl-1" data-testid={`text-last-score-${player.id}`}>
          {formatScore(player.lastScore)}
        </div>
        
        {/* Price */}
        <div className="col-span-1 text-right text-xs font-medium border-l border-gray-600 pr-1" data-testid={`text-price-${player.id}`}>
          {formatCurrency(player.price || 0)}
        </div>
      </div>
    );
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className={`${hasBorder ? 'border-b border-gray-700 pb-3 mb-3' : 'mb-3'}`}>
      {/* Section Header (Collapsible) */}
      <button 
        className="w-full flex items-center justify-between font-medium p-2 cursor-pointer rounded-t-md text-white transition-colors active:opacity-80"
        style={{ backgroundColor: color, minHeight: '44px' }}
        onClick={() => setExpanded(!expanded)}
        data-testid={`button-toggle-${shortCode.toLowerCase()}`}
      >
        <h3 className="font-medium text-sm" data-testid={`text-position-${shortCode.toLowerCase()}`}>
          {title}
        </h3>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      
      {/* Section Content */}
      {expanded && (
        <>
          {/* Field Players Table */}
          <div className="bg-gray-900 border-2 rounded-lg overflow-hidden" style={{ borderColor: color }}>
            {/* Table Header */}
            <div className="grid grid-cols-11 gap-1 items-center border-b border-gray-700 py-2 px-2 bg-gray-800 text-xs font-medium text-white sticky top-0">
              <div className="col-span-3 pl-1">Player</div>
              <div className="col-span-1 text-center border-l border-gray-600 pl-1">Next</div>
              <div className="col-span-1 text-center border-l border-gray-600 pl-1">Live</div>
              <div className="col-span-1 text-center border-l border-gray-600 pl-1">Avg</div>
              <div className="col-span-1 text-center border-l border-gray-600 pl-1">L3</div>
              <div className="col-span-1 text-center border-l border-gray-600 pl-1">BE</div>
              <div className="col-span-1 text-center border-l border-gray-600 pl-1">Last</div>
              <div className="col-span-1 text-right border-l border-gray-600 pr-1">Price</div>
            </div>
            
            {/* Field Players */}
            {displayFieldPlayers.map(player => renderPlayerRow(player, false))}
          </div>
          
          {/* Bench Players */}
          {displayBenchPlayers.length > 0 && (
            <div className="mt-2 bg-gray-900 border-2 border-gray-600 rounded-lg overflow-hidden">
              {/* Bench Header */}
              <div className="grid grid-cols-11 gap-1 items-center border-b border-gray-700 py-2 px-2 bg-gray-700 text-xs font-medium text-white">
                <div className="col-span-3 pl-1">Bench</div>
                <div className="col-span-1 text-center border-l border-gray-600 pl-1">Next</div>
                <div className="col-span-1 text-center border-l border-gray-600 pl-1">Live</div>
                <div className="col-span-1 text-center border-l border-gray-600 pl-1">Avg</div>
                <div className="col-span-1 text-center border-l border-gray-600 pl-1">L3</div>
                <div className="col-span-1 text-center border-l border-gray-600 pl-1">BE</div>
                <div className="col-span-1 text-center border-l border-gray-600 pl-1">Last</div>
                <div className="col-span-1 text-right border-l border-gray-600 pr-1">Price</div>
              </div>
              
              {/* Bench Players */}
              {displayBenchPlayers.map(player => renderPlayerRow(player, true))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// MAIN FIELD VIEW COMPONENT
// ============================================

export default function FieldView({
  midfielders,
  forwards,
  defenders,
  rucks,
  utility = [],
  onPlayerClick,
  onPlayerNameClick
}: FieldViewProps) {
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    const allPlayers = [...defenders, ...midfielders, ...rucks, ...forwards, ...utility];
    const fieldPlayers = allPlayers.filter(p => !p.isOnBench);
    const benchPlayers = allPlayers.filter(p => p.isOnBench);
    
    logger.info('FieldView', 'Component rendered', {
      totalPlayers: allPlayers.length,
      fieldPlayers: fieldPlayers.length,
      benchPlayers: benchPlayers.length,
      defenders: defenders.length,
      midfielders: midfielders.length,
      rucks: rucks.length,
      forwards: forwards.length,
      utility: utility.length,
      hasCaptain: allPlayers.some(p => p.isCaptain),
      hasViceCaptain: allPlayers.some(p => p.isViceCaptain)
    });
    
    // Validate captain selection
    const captains = allPlayers.filter(p => p.isCaptain);
    if (captains.length > 1) {
      logger.warning('FieldView', 'Multiple captains detected', {
        captainCount: captains.length,
        captains: captains.map(p => p.name)
      });
    }
  }, [defenders, midfielders, rucks, forwards, utility]);
  
  // ============================================
  // SEPARATE FIELD AND BENCH PLAYERS
  // ============================================
  
  const separatePlayers = (players: TeamPlayer[]) => {
    const field = players.filter(p => !p.isOnBench);
    const bench = players.filter(p => p.isOnBench);
    return { field, bench };
  };
  
  const def = separatePlayers(defenders);
  const mid = separatePlayers(midfielders);
  const ruck = separatePlayers(rucks);
  const fwd = separatePlayers(forwards);
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="space-y-0">
      {/* Defenders */}
      <PositionSection
        title="Defenders"
        shortCode="DEF"
        fieldPlayers={def.field}
        benchPlayers={def.bench}
        requiredFieldCount={6}
        requiredBenchCount={2}
        color="#f97316"
        onPlayerClick={onPlayerClick}
        onPlayerNameClick={onPlayerNameClick}
      />
      
      {/* Midfielders */}
      <PositionSection
        title="Midfielders"
        shortCode="MID"
        fieldPlayers={mid.field}
        benchPlayers={mid.bench}
        requiredFieldCount={8}
        requiredBenchCount={2}
        color="#3b82f6"
        onPlayerClick={onPlayerClick}
        onPlayerNameClick={onPlayerNameClick}
      />
      
      {/* Rucks */}
      <PositionSection
        title="Rucks"
        shortCode="RUCK"
        fieldPlayers={ruck.field}
        benchPlayers={ruck.bench}
        requiredFieldCount={2}
        requiredBenchCount={1}
        color="#10b981"
        onPlayerClick={onPlayerClick}
        onPlayerNameClick={onPlayerNameClick}
      />
      
      {/* Forwards */}
      <PositionSection
        title="Forwards"
        shortCode="FWD"
        fieldPlayers={fwd.field}
        benchPlayers={fwd.bench}
        requiredFieldCount={6}
        requiredBenchCount={2}
        color="#8b5cf6"
        hasBorder={false}
        onPlayerClick={onPlayerClick}
        onPlayerNameClick={onPlayerNameClick}
      />
      
      {/* Utility (if any) */}
      {utility.length > 0 && (
        <PositionSection
          title="Utility"
          shortCode="UTIL"
          fieldPlayers={[]}
          benchPlayers={utility}
          requiredFieldCount={0}
          requiredBenchCount={utility.length}
          color="#6b7280"
          hasBorder={false}
          onPlayerClick={onPlayerClick}
          onPlayerNameClick={onPlayerNameClick}
        />
      )}
    </div>
  );
}

/**
 * SKELETON LOADER FOR FIELD VIEW
 */
export function FieldViewSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <div key={i}>
          <div className="h-10 bg-gray-700 rounded-t-md mb-2"></div>
          <div className="border-2 border-gray-700 rounded-lg overflow-hidden">
            <div className="h-10 bg-gray-800"></div>
            {[1, 2, 3].map((j) => (
              <div key={j} className="h-12 bg-gray-900 border-b border-gray-700"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
