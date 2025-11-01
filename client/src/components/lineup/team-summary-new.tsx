/**
 * TEAM SUMMARY NEW COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Three tabs: Field / Coach / History
 * - Field view shows all 22 players in table format
 * - Coach view shows recommendations and injuries
 * - History view shows trade history
 * - Captain/VC selection dialog
 * - Responsive design
 * - Error logging
 */

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { logger } from "@/lib/error-logger";

// Import sub-components
import FieldView, { TeamPlayer, FieldViewSkeleton } from "./field-view";
import CoachTab, { CoachData, CoachTabSkeleton } from "./coach-tab";
import HistoryTab, { RoundTrade, HistoryTabSkeleton } from "./history-tab";
import RoleDialog from "./role-dialog";

// ============================================
// TYPE DEFINITIONS
// ============================================

interface TeamSummaryNewProps {
  midfielders: TeamPlayer[];
  forwards: TeamPlayer[];
  defenders: TeamPlayer[];
  rucks: TeamPlayer[];
  utility?: TeamPlayer[];
  tradesAvailable?: number;
  onMakeTrade?: (playerOut: TeamPlayer, playerIn: TeamPlayer) => void;
  onPlayerClick?: (player: TeamPlayer) => void;
  onRoleUpdate?: (playerName: string, role: 'captain' | 'viceCaptain' | 'none') => void;
}

// ============================================
// NO MOCK DATA - ALL DATA FROM API
// ============================================

// ============================================
// MAIN TEAM SUMMARY NEW COMPONENT
// ============================================

export default function TeamSummaryNew({
  midfielders,
  forwards,
  defenders,
  rucks,
  utility = [],
  tradesAvailable = 0,
  onMakeTrade,
  onPlayerClick,
  onRoleUpdate
}: TeamSummaryNewProps) {
  
  // ============================================
  // STATE MANAGEMENT
  // ============================================
  
  const [activeTab, setActiveTab] = useState<"field" | "coach" | "history">("field");
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedPlayerForRole, setSelectedPlayerForRole] = useState<TeamPlayer | null>(null);
  
  // ============================================
  // DATA FETCHING (Coach Recommendations)
  // ============================================
  
  const { data: coachData, isLoading: isLoadingCoach } = useQuery<CoachData>({
    queryKey: ['coachRecommendations'],
    queryFn: async () => {
      logger.info('TeamSummaryNew', 'Fetching coach recommendations from API');
      const response = await fetch('/api/coach/recommendations');
      if (!response.ok) {
        throw new Error(`Failed to fetch coach data: ${response.status}`);
      }
      return response.json();
    },
    enabled: activeTab === 'coach', // Only fetch when coach tab is active
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // ============================================
  // DATA FETCHING (Trade History)
  // ============================================
  
  const { data: tradeHistory = [], isLoading: isLoadingTrades } = useQuery<RoundTrade[]>({
    queryKey: ['tradeHistory'],
    queryFn: async () => {
      logger.info('TeamSummaryNew', 'Fetching trade history from API');
      const response = await fetch('/api/trades/history');
      if (!response.ok) {
        throw new Error(`Failed to fetch trade history: ${response.status}`);
      }
      return response.json();
    },
    enabled: activeTab === 'history', // Only fetch when history tab is active
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    const allPlayers = [...defenders, ...midfielders, ...rucks, ...forwards, ...utility];
    
    logger.info('TeamSummaryNew', 'Component rendered', {
      totalPlayers: allPlayers.length,
      defenders: defenders.length,
      midfielders: midfielders.length,
      rucks: rucks.length,
      forwards: forwards.length,
      utility: utility.length,
      activeTab,
      tradesAvailable
    });
  }, [defenders, midfielders, rucks, forwards, utility, activeTab, tradesAvailable]);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handlePlayerNameClick = (player: TeamPlayer, e: React.MouseEvent) => {
    e.stopPropagation();
    logger.info('TeamSummaryNew', 'Player name clicked for role selection', {
      playerName: player.name,
      currentRole: player.isCaptain ? 'captain' : player.isViceCaptain ? 'viceCaptain' : 'none'
    });
    setSelectedPlayerForRole(player);
    setRoleDialogOpen(true);
  };
  
  const handleRoleSelect = (role: 'captain' | 'viceCaptain' | 'none') => {
    if (selectedPlayerForRole && onRoleUpdate) {
      logger.info('TeamSummaryNew', 'Role selected', {
        playerName: selectedPlayerForRole.name,
        newRole: role
      });
      onRoleUpdate(selectedPlayerForRole.name, role);
    }
    setRoleDialogOpen(false);
    setSelectedPlayerForRole(null);
  };
  
  const handlePlayerProfileClick = () => {
    if (selectedPlayerForRole && onPlayerClick) {
      logger.info('TeamSummaryNew', 'Player profile clicked from role dialog', {
        playerName: selectedPlayerForRole.name
      });
      onPlayerClick(selectedPlayerForRole);
    }
  };
  
  const handleTabChange = (tab: string) => {
    logger.info('TeamSummaryNew', 'Tab changed', { newTab: tab });
    setActiveTab(tab as "field" | "coach" | "history");
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <>
      <Card className="bg-gray-800 border-gray-600 shadow-xl">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          {/* Tab List */}
          <TabsList className="grid grid-cols-3 w-full bg-gray-700 border-b border-gray-600 rounded-none">
            <TabsTrigger 
              value="field"
              className="text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 transition-colors"
              style={{ minHeight: '44px' }}
            >
              Field
            </TabsTrigger>
            <TabsTrigger 
              value="coach"
              className="text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 transition-colors"
              style={{ minHeight: '44px' }}
            >
              Coach
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="text-gray-300 data-[state=active]:bg-gray-800 data-[state=active]:text-white rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 transition-colors"
              style={{ minHeight: '44px' }}
            >
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Field Tab Content */}
          <TabsContent value="field" className="p-4 mt-0">
            <FieldView
              defenders={defenders}
              midfielders={midfielders}
              rucks={rucks}
              forwards={forwards}
              utility={utility}
              onPlayerClick={onPlayerClick}
              onPlayerNameClick={handlePlayerNameClick}
            />
          </TabsContent>
          
          {/* Coach Tab Content */}
          <TabsContent value="coach" className="mt-0">
            {activeTab === 'coach' && (
              <CoachTab
                coachData={coachData}
                isLoading={isLoadingCoach}
              />
            )}
          </TabsContent>
          
          {/* History Tab Content */}
          <TabsContent value="history" className="mt-0">
            {activeTab === 'history' && (
              <HistoryTab
                tradeHistory={tradeHistory}
                isLoading={isLoadingTrades}
              />
            )}
          </TabsContent>
        </Tabs>
      </Card>
      
      {/* Role Selection Dialog */}
      <RoleDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        player={selectedPlayerForRole}
        onRoleSelect={handleRoleSelect}
        onPlayerProfileClick={onPlayerClick ? handlePlayerProfileClick : undefined}
      />
    </>
  );
}

/**
 * SKELETON LOADER FOR TEAM SUMMARY NEW
 */
export function TeamSummaryNewSkeleton() {
  return (
    <Card className="bg-gray-800 border-gray-600 animate-pulse">
      {/* Tabs skeleton */}
      <div className="h-12 bg-gray-700 border-b border-gray-600"></div>
      
      {/* Content skeleton */}
      <div className="p-4">
        <FieldViewSkeleton />
      </div>
    </Card>
  );
}
