/**
 * TEAM LINEUP COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Tabbed view by position
 * - Captain/Vice-Captain selection
 * - Responsive player cards
 * - Touch-optimized (44px targets)
 * - Comprehensive error logging
 * - Native app styling
 */

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, formatScore, getPositionColor } from "@/lib/utils";
import { Player as BasePlayer } from "../player-stats/player-table";
import { getTeamGuernsey } from "@/utils/team-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, Star, XCircle } from "lucide-react";
import { logger } from "@/lib/error-logger";

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Extend the Player type to include lineup-specific fields
 */
type Player = BasePlayer & {
  isCaptain?: boolean;
  isViceCaptain?: boolean;
  secondaryPositions?: string[];
  isOnBench?: boolean;
  nextOpponent?: string;
};

interface TeamLineupProps {
  midfielders: Player[];
  forwards: Player[];
  defenders: Player[];
  rucks: Player[];
  onPlayerClick?: (player: Player) => void;
  onRoleUpdate?: (playerName: string, role: 'captain' | 'viceCaptain' | 'none') => void;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Render team logo badge
 */
function renderTeamLogo(team: string) {
  try {
    const guernseyUrl = getTeamGuernsey(team);
    return (
      <div className="h-6 w-6 rounded-full overflow-hidden border border-gray-600 bg-gray-700 flex-shrink-0">
        {guernseyUrl ? (
          <img
            src={guernseyUrl}
            alt={`${team} guernsey`}
            className="w-full h-full object-cover"
            onError={(e) => {
              logger.warning('TeamLineup', 'Failed to load guernsey image', { team, guernseyUrl });
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
            {team.substring(0, 2).toUpperCase()}
          </div>
        )}
      </div>
    );
  } catch (err: any) {
    logger.error('TeamLineup', 'Error rendering team logo', { team, error: err });
    return (
      <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs">
        {team?.substring(0, 2).toUpperCase() || '??'}
      </div>
    );
  }
}

// ============================================
// MAIN TEAM LINEUP COMPONENT
// ============================================

export default function TeamLineup({ 
  midfielders, 
  forwards, 
  defenders, 
  rucks, 
  onPlayerClick,
  onRoleUpdate
}: TeamLineupProps) {
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedPlayerForRole, setSelectedPlayerForRole] = useState<Player | null>(null);
  
  // ============================================
  // ERROR LOGGING & VALIDATION
  // ============================================
  
  useEffect(() => {
    const allPlayers = [...midfielders, ...forwards, ...defenders, ...rucks];
    
    logger.info('TeamLineup', 'Component rendered', {
      totalPlayers: allPlayers.length,
      midfielders: midfielders.length,
      forwards: forwards.length,
      defenders: defenders.length,
      rucks: rucks.length,
      hasCaptain: allPlayers.some(p => p.isCaptain),
      hasViceCaptain: allPlayers.some(p => p.isViceCaptain)
    });
    
    // Validate captain selection
    const captains = allPlayers.filter(p => p.isCaptain);
    if (captains.length > 1) {
      logger.warning('TeamLineup', 'Multiple captains detected', {
        captainCount: captains.length,
        captains: captains.map(p => p.name)
      });
    }
    
    // Validate vice-captain selection
    const viceCaptains = allPlayers.filter(p => p.isViceCaptain);
    if (viceCaptains.length > 1) {
      logger.warning('TeamLineup', 'Multiple vice-captains detected', {
        viceCaptainCount: viceCaptains.length,
        viceCaptains: viceCaptains.map(p => p.name)
      });
    }
  }, [midfielders, forwards, defenders, rucks]);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handlePlayerNameClick = (player: Player, e: React.MouseEvent) => {
    e.stopPropagation();
    logger.info('TeamLineup', 'Player name clicked for role selection', {
      playerName: player.name,
      currentRole: player.isCaptain ? 'captain' : player.isViceCaptain ? 'viceCaptain' : 'none'
    });
    setSelectedPlayerForRole(player);
    setRoleDialogOpen(true);
  };

  const handleRoleSelect = (role: 'captain' | 'viceCaptain' | 'none') => {
    if (selectedPlayerForRole && onRoleUpdate) {
      logger.info('TeamLineup', 'Role selected', {
        playerName: selectedPlayerForRole.name,
        newRole: role,
        previousRole: selectedPlayerForRole.isCaptain ? 'captain' : selectedPlayerForRole.isViceCaptain ? 'viceCaptain' : 'none'
      });
      onRoleUpdate(selectedPlayerForRole.name, role);
    }
    setRoleDialogOpen(false);
    setSelectedPlayerForRole(null);
  };
  
  // ============================================
  // RENDER PLAYER CARD
  // ============================================
  
  const renderPlayerCard = (player: Player) => (
    <Card 
      className={`
        h-full overflow-hidden 
        ${player.isOnBench ? 'bg-gray-700/50' : 'bg-gray-800'} 
        border-gray-600 
        hover:bg-gray-750 
        transition-all duration-200
        cursor-pointer
        active:scale-[0.98]
      `}
      key={player.id}
      onClick={() => {
        logger.info('TeamLineup', 'Player card clicked', { playerName: player.name });
        onPlayerClick && onPlayerClick(player);
      }}
    >
      {/* Position color bar */}
      <div className={`h-1 w-full ${getPositionColor(player.position)}`}></div>
      
      <CardContent className="p-3 pt-2 sm:p-4 sm:pt-3">
        {/* Player header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          {renderTeamLogo(player.team || '')}
          
          <div className="truncate flex-1 min-w-0">
            {/* Player name */}
            <div 
              className="text-xs sm:text-sm font-semibold truncate text-white cursor-pointer hover:text-blue-400 transition-colors"
              onClick={(e) => handlePlayerNameClick(player, e)}
              data-testid={`player-name-${player.id}`}
              style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}
            >
              {player.name}
              {player.isOnBench && <span className="ml-1 text-xs text-gray-400">(Bench)</span>}
            </div>
            
            {/* Player badges */}
            <div className="text-xs text-gray-300 flex items-center flex-wrap gap-1 mt-1">
              {/* Position badge */}
              <span className={`inline-block px-1.5 py-0.5 rounded text-white text-xs font-semibold ${getPositionColor(player.position)}`}>
                {player.position.charAt(0)}
              </span>
              
              {/* Secondary positions */}
              {player.secondaryPositions?.map((pos, idx) => (
                <span key={idx} className="px-1.5 py-0.5 rounded bg-gray-600 text-gray-200 text-xs">
                  {pos}
                </span>
              ))}
              
              {/* Captain badge */}
              {player.isCaptain && (
                <span 
                  className="px-1.5 py-0.5 text-xs bg-yellow-500 text-white rounded font-bold" 
                  data-testid={`captain-badge-${player.id}`}
                  aria-label="Captain"
                >
                  C
                </span>
              )}
              
              {/* Vice-Captain badge */}
              {player.isViceCaptain && (
                <span 
                  className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded font-bold" 
                  data-testid={`vice-captain-badge-${player.id}`}
                  aria-label="Vice Captain"
                >
                  VC
                </span>
              )}
              
              {/* DPP badge */}
              {player.secondaryPositions && player.secondaryPositions.length > 0 && (
                <span className="px-1.5 py-0.5 text-xs bg-gray-600 text-gray-200 rounded">
                  DPP
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Player stats grid */}
        <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 gap-y-1 sm:gap-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Price:</span> 
            <span className="font-medium text-white">{formatCurrency(player.price)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Avg:</span> 
            <span className="font-medium text-white">
              {player.averagePoints?.toFixed(1) || '-'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">BE:</span> 
            <span className={`font-medium ${player.breakEven && player.breakEven < 0 ? 'text-red-400' : 'text-white'}`}>
              {player.breakEven ?? '-'}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-400">Last:</span> 
            <span className="font-medium text-white">{formatScore(player.lastScore)}</span>
          </div>
          
          {player.nextOpponent && (
            <div className="flex justify-between">
              <span className="text-gray-400">Next:</span> 
              <span className="font-medium text-white">{player.nextOpponent}</span>
            </div>
          )}
          
          {player.l3Average && (
            <div className="flex justify-between">
              <span className="text-gray-400">L3 Avg:</span> 
              <span className="font-medium text-white">{player.l3Average.toFixed(1)}</span>
            </div>
          )}
          
          {player.selectionPercentage && (
            <div className="flex justify-between">
              <span className="text-gray-400">Sel %:</span> 
              <span className="font-medium text-white">{player.selectionPercentage.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
  
  // ============================================
  // PREPARE DATA
  // ============================================
  
  const allPlayers = [...midfielders, ...forwards, ...defenders, ...rucks];
  
  // ============================================
  // RENDER: EMPTY STATE
  // ============================================
  
  if (allPlayers.length === 0) {
    logger.warning('TeamLineup', 'No players in lineup');
    
    return (
      <Card className="bg-gray-800 border-gray-600">
        <CardContent className="p-8 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-white">
              No Players in Lineup
            </h3>
            <p className="text-gray-400 text-sm">
              Your team is empty. Start adding players to your lineup.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // ============================================
  // RENDER: MAIN LINEUP
  // ============================================
  
  return (
    <div className="space-y-4">
      <Card className="bg-gray-800 border-gray-600 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">Your Lineup</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="mid">
            {/* Tab List */}
            <TabsList className="grid grid-cols-4 w-full bg-gray-700 border-gray-600">
              <TabsTrigger 
                value="mid" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                style={{ minHeight: '44px' }}
              >
                MID ({midfielders.length})
              </TabsTrigger>
              <TabsTrigger 
                value="fwd" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                style={{ minHeight: '44px' }}
              >
                FWD ({forwards.length})
              </TabsTrigger>
              <TabsTrigger 
                value="def" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                style={{ minHeight: '44px' }}
              >
                DEF ({defenders.length})
              </TabsTrigger>
              <TabsTrigger 
                value="ruck" 
                className="text-gray-300 data-[state=active]:bg-gray-600 data-[state=active]:text-white"
                style={{ minHeight: '44px' }}
              >
                RUCK ({rucks.length})
              </TabsTrigger>
            </TabsList>
            
            {/* Tab Content - Midfielders */}
            <TabsContent value="mid" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {midfielders.map(player => renderPlayerCard(player))}
              </div>
            </TabsContent>
            
            {/* Tab Content - Forwards */}
            <TabsContent value="fwd" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {forwards.map(player => renderPlayerCard(player))}
              </div>
            </TabsContent>
            
            {/* Tab Content - Defenders */}
            <TabsContent value="def" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {defenders.map(player => renderPlayerCard(player))}
              </div>
            </TabsContent>
            
            {/* Tab Content - Rucks */}
            <TabsContent value="ruck" className="mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {rucks.map(player => renderPlayerCard(player))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Role Selection Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent className="bg-gray-800 border-gray-600 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Select Role</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a role for {selectedPlayerForRole?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button
              onClick={() => handleRoleSelect('captain')}
              className="w-full bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white flex items-center justify-center gap-2 transition-colors"
              data-testid="button-set-captain"
              style={{ minHeight: '44px' }}
            >
              <Crown className="h-5 w-5" aria-hidden="true" />
              Set as Captain (C)
            </Button>
            <Button
              onClick={() => handleRoleSelect('viceCaptain')}
              className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center gap-2 transition-colors"
              data-testid="button-set-vice-captain"
              style={{ minHeight: '44px' }}
            >
              <Star className="h-5 w-5" aria-hidden="true" />
              Set as Vice-Captain (VC)
            </Button>
            <Button
              onClick={() => handleRoleSelect('none')}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
              data-testid="button-remove-role"
              style={{ minHeight: '44px' }}
            >
              <XCircle className="h-5 w-5" aria-hidden="true" />
              Remove Role
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/**
 * SKELETON LOADER FOR TEAM LINEUP
 * Used during loading states
 */
export function TeamLineupSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-600 animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-6 w-32 bg-gray-700 rounded"></div>
      </CardHeader>
      <CardContent>
        {/* Tabs skeleton */}
        <div className="h-12 bg-gray-700 rounded mb-4"></div>
        
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-gray-700 border-gray-600 h-40">
              <CardContent className="p-4">
                <div className="h-4 w-20 bg-gray-600 rounded mb-2"></div>
                <div className="h-3 w-full bg-gray-600 rounded mb-1"></div>
                <div className="h-3 w-3/4 bg-gray-600 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
