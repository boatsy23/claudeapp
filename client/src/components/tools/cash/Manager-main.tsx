/**
 * WISHLIST MANAGER - TAB 3 COMPLETE
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, AlertCircle, DollarSign } from 'lucide-react';
import WishlistItem from './wishlist-item';
import TradeScheduleRow from './trade-schedule-row';
import PlayerSearchAutocomplete from './search-autocomplete';
import { getWishlistSchedule } from './buy-sell-api';
import { WishlistPlayer, PlayerSearchResult, WishlistScheduleResponse } from './buy-sell-types';
import { formatPrice } from './buy-sell-utils';

const logger = {
  info: (a: string, d?: any) => console.log(`ℹ️ [WishlistManager] ${a}`, d || ''),
  error: (a: string, e: any) => console.error(`❌ [WishlistManager] ${a}`, e)
};

export default function WishlistManagerMain() {
  const [wishlist, setWishlist] = useState<WishlistPlayer[]>([]);
  const [schedule, setSchedule] = useState<WishlistScheduleResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [remainingSalary] = useState(850000);
  const [currentRound] = useState(6);
  
  useEffect(() => {
    if (wishlist.length > 0) fetchSchedule();
    else setSchedule(null);
  }, [wishlist]);
  
  const fetchSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWishlistSchedule({
        playerIds: wishlist.map(p => p.playerId),
        currentRound,
        remainingSalary,
        currentTeam: { rookies: [] }
      });
      setSchedule(data);
    } catch (err: any) {
      setError(err?.message || 'Failed');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPlayer = (player: PlayerSearchResult) => {
    if (wishlist.some(p => p.playerId === player.playerId)) {
      alert(`${player.name} already in wishlist`);
      return;
    }
    setWishlist(prev => [...prev, {
      playerId: player.playerId,
      name: player.name,
      position: player.position,
      team: player.team,
      currentPrice: player.currentPrice,
      addedAt: new Date().toISOString()
    }]);
    setShowAddPlayer(false);
  };
  
  const handleRemovePlayer = (playerId: number) => {
    setWishlist(prev => prev.filter(p => p.playerId !== playerId));
  };
  
  const getPlayerSchedule = (playerId: number) => {
    if (!schedule) return undefined;
    for (const rs of schedule.schedule) {
      const t = rs.trades.find(tr => tr.playerId === playerId);
      if (t) return {
        round: rs.round,
        projectedPrice: t.projectedPrice,
        confidence: t.affordability.confidence,
        breakdown: t.affordability.breakdown
      };
    }
    return undefined;
  };
  
  if (wishlist.length === 0) {
    return (
      <div className="space-y-4">
        {showAddPlayer ? (
          <Card className="bg-gray-800 border-gray-700 p-4">
            <PlayerSearchAutocomplete onPlayerSelect={handleAddPlayer} placeholder="Search..." />
            <Button onClick={() => setShowAddPlayer(false)} variant="ghost" className="mt-2 w-full">Cancel</Button>
          </Card>
        ) : (
          <>
            <Button onClick={() => setShowAddPlayer(true)} className="w-full bg-green-600 hover:bg-green-700 min-h-[44px]">
              <Plus className="h-4 w-4 mr-2" />Add Players to Wishlist
            </Button>
            <Card className="bg-gray-800/50 border-gray-700 p-12">
              <div className="text-center space-y-4">
                <div className="text-6xl">⭐</div>
                <h3 className="text-xl font-semibold text-white">Your Wishlist is Empty</h3>
                <p className="text-gray-400 max-w-md mx-auto">
                  Add players to see optimal trade schedule with confidence ratings
                </p>
              </div>
            </Card>
          </>
        )}
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {showAddPlayer ? (
        <Card className="bg-gray-800 border-gray-700 p-4">
          <PlayerSearchAutocomplete onPlayerSelect={handleAddPlayer} placeholder="Search..." />
          <Button onClick={() => setShowAddPlayer(false)} variant="ghost" className="mt-2 w-full">Cancel</Button>
        </Card>
      ) : (
        <Button onClick={() => setShowAddPlayer(true)} className="w-full bg-green-600 hover:bg-green-700 min-h-[44px]">
          <Plus className="h-4 w-4 mr-2" />Add More Players
        </Button>
      )}
      
      <Card className="bg-gray-800 border-gray-700 p-4">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <span>⭐</span>My Wishlist ({wishlist.length} players)
        </h3>
        <div className="space-y-3">
          {wishlist.map(p => {
            const s = getPlayerSchedule(p.playerId);
            return <WishlistItem key={p.playerId} player={p} scheduledRound={s?.round} projectedPrice={s?.projectedPrice} confidence={s?.confidence} confidenceBreakdown={s?.breakdown} onRemove={handleRemovePlayer} />;
          })}
        </div>
      </Card>
      
      {isLoading && <Card className="bg-gray-800 border-gray-700 p-4"><Skeleton className="h-32 w-full" /></Card>}
      {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
      
      {schedule && !isLoading && (
        <>
          <Card className="bg-gray-800 border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Trade Summary</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-3"><p className="text-xs text-gray-400 mb-1">Total</p><p className="text-xl font-bold text-white">{schedule.summary.totalPlayers}</p></div>
              <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-3"><p className="text-xs text-green-400 mb-1">Feasible</p><p className="text-xl font-bold text-green-300">{schedule.summary.feasibleTrades}</p></div>
              <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-3"><p className="text-xs text-red-400 mb-1">Infeasible</p><p className="text-xl font-bold text-red-300">{schedule.summary.infeasibleTrades}</p></div>
              <div className="bg-blue-900/20 border border-blue-600/30 rounded-lg p-3"><p className="text-xs text-blue-400 mb-1">Avg Confidence</p><p className="text-xl font-bold text-blue-300">{schedule.summary.avgConfidence}%</p></div>
            </div>
          </Card>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Trade Schedule</h3>
            <div className="space-y-3">
              {schedule.schedule.map((rs, i) => (
                <TradeScheduleRow key={rs.round} round={rs.round} trades={rs.trades} warnings={schedule.warnings} remainingSalaryBefore={remainingSalary - (i * 100000)} />
              ))}
            </div>
          </div>
          
          {schedule.cashGenerationPlan && (
            <Card className="bg-yellow-900/20 border border-yellow-600/50 p-4">
              <div className="flex items-start gap-3 mb-4">
                <DollarSign className="h-5 w-5 text-yellow-400" />
                <div>
                  <h3 className="text-lg font-semibold text-yellow-100 mb-1">Cash Generation Needed</h3>
                  <p className="text-sm text-yellow-200/80">Need {formatPrice(schedule.cashGenerationPlan.needed)} more</p>
                </div>
              </div>
              <div className="space-y-2">
                {schedule.cashGenerationPlan.plan.map((step, i) => (
                  <div key={i} className="bg-yellow-900/30 rounded-lg p-3">
                    <p className="text-sm font-semibold text-yellow-100 mb-2">R{step.round}: {step.action}</p>
                    {step.playersToSell.map((pl, j) => (
                      <p key={j} className="text-xs text-yellow-200/80">• Sell {pl.name} ({formatPrice(pl.sellPrice, true)})</p>
                    ))}
                    <p className="text-xs text-yellow-400 mt-2 font-semibold">+{formatPrice(step.cashGenerated, true)}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
