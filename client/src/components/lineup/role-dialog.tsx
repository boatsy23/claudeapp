/**
 * ROLE DIALOG COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Captain selection
 * - Vice-Captain selection
 * - Role removal
 * - Player profile view
 * - Touch-optimized (44px buttons)
 * - Error logging
 */

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Crown, Star, XCircle, Info } from "lucide-react";
import { logger } from "@/lib/error-logger";
import { useEffect } from "react";

// ============================================
// TYPE DEFINITIONS
// ============================================

type Player = {
  id: number;
  name: string;
  position?: string;
  team?: string;
  isCaptain?: boolean;
  isViceCaptain?: boolean;
};

interface RoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player: Player | null;
  onRoleSelect: (role: 'captain' | 'viceCaptain' | 'none') => void;
  onPlayerProfileClick?: () => void;
}

// ============================================
// MAIN ROLE DIALOG COMPONENT
// ============================================

export default function RoleDialog({
  open,
  onOpenChange,
  player,
  onRoleSelect,
  onPlayerProfileClick
}: RoleDialogProps) {
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    if (open && player) {
      logger.info('RoleDialog', 'Dialog opened', {
        playerName: player.name,
        currentRole: player.isCaptain ? 'captain' : player.isViceCaptain ? 'viceCaptain' : 'none'
      });
    }
  }, [open, player]);
  
  // ============================================
  // EVENT HANDLERS
  // ============================================
  
  const handleRoleSelect = (role: 'captain' | 'viceCaptain' | 'none') => {
    if (!player) return;
    
    logger.info('RoleDialog', 'Role selected', {
      playerName: player.name,
      newRole: role,
      previousRole: player.isCaptain ? 'captain' : player.isViceCaptain ? 'viceCaptain' : 'none'
    });
    
    onRoleSelect(role);
  };
  
  const handlePlayerProfile = () => {
    if (!player) return;
    
    logger.info('RoleDialog', 'Player profile clicked', {
      playerName: player.name
    });
    
    onOpenChange(false);
    onPlayerProfileClick?.();
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  if (!player) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800 border-gray-600 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-lg">Select Role</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a role for {player.name}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {/* Captain Button */}
          <Button
            onClick={() => handleRoleSelect('captain')}
            className="w-full bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 text-white flex items-center justify-center gap-2 transition-colors"
            data-testid="button-set-captain"
            style={{ minHeight: '44px' }}
          >
            <Crown className="h-5 w-5" aria-hidden="true" />
            <span>Set as Captain (C)</span>
          </Button>
          
          {/* Vice-Captain Button */}
          <Button
            onClick={() => handleRoleSelect('viceCaptain')}
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white flex items-center justify-center gap-2 transition-colors"
            data-testid="button-set-vice-captain"
            style={{ minHeight: '44px' }}
          >
            <Star className="h-5 w-5" aria-hidden="true" />
            <span>Set as Vice-Captain (VC)</span>
          </Button>
          
          {/* Remove Role Button */}
          <Button
            onClick={() => handleRoleSelect('none')}
            className="w-full bg-red-900 hover:bg-red-800 active:bg-red-700 text-white flex items-center justify-center gap-2 transition-colors"
            data-testid="button-remove-role"
            style={{ minHeight: '44px' }}
          >
            <XCircle className="h-5 w-5" aria-hidden="true" />
            <span>Remove Role</span>
          </Button>
          
          {/* Player Profile Button (Optional) */}
          {onPlayerProfileClick && (
            <Button
              onClick={handlePlayerProfile}
              variant="outline"
              className="w-full border-gray-600 text-gray-300 hover:bg-gray-700 active:bg-gray-600 flex items-center justify-center gap-2 transition-colors"
              data-testid="button-player-profile"
              style={{ minHeight: '44px' }}
            >
              <Info className="h-5 w-5" aria-hidden="true" />
              <span>Player Profile</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
