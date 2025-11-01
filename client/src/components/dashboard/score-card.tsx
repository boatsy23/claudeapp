/**
 * SCORE CARD COMPONENT
 * Production-ready PWA/TWA implementation
 * 
 * Features:
 * - Responsive design (mobile-first)
 * - Touch-optimized (44x44px minimum)
 * - Native app styling
 * - Error logging
 * - Smooth animations
 */

import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, Award, BarChart2, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { logger } from "@/lib/error-logger";
import { useEffect } from "react";

// ============================================
// TYPE DEFINITIONS
// ============================================

export type ScoreCardProps = {
  title: string;
  value: string;
  change?: string;
  icon?: "chart" | "award" | "trend-up" | "arrow-up";
  isPositive?: boolean;
  className?: string;
  borderColor?: string;
};

// ============================================
// ICON MAPPING
// ============================================

const ICONS = {
  chart: BarChart2,
  award: Award,
  "trend-up": TrendingUp,
  "arrow-up": ArrowUp,
} as const;

// ============================================
// SCORE CARD COMPONENT
// ============================================

export default function ScoreCard({ 
  title, 
  value, 
  change, 
  icon = "trend-up",
  isPositive = true,
  className,
  borderColor = "border-blue-500"
}: ScoreCardProps) {
  
  // ============================================
  // ERROR LOGGING
  // ============================================
  
  useEffect(() => {
    // Log render for debugging
    logger.info('ScoreCard', 'Rendered', {
      title,
      value,
      change,
      icon,
      isPositive
    });
    
    // Validate props
    if (!title || !value) {
      logger.warning('ScoreCard', 'Missing required props', {
        hasTitle: !!title,
        hasValue: !!value
      });
    }
  }, [title, value, change, icon, isPositive]);
  
  // ============================================
  // GET ICON COMPONENT
  // ============================================
  
  const IconComponent = ICONS[icon] || TrendingUp;
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <Card 
      className={cn(
        // Base styles
        "h-full bg-gray-800/95 backdrop-blur-sm",
        "border-2 shadow-lg",
        "transition-all duration-200",
        "hover:shadow-xl hover:scale-[1.02]",
        "active:scale-[0.98]",
        // PWA optimizations
        "prevent-shift", // Prevent layout shift
        "touch-action-manipulation", // Fast tap response
        // Border color
        borderColor,
        // Custom className
        className
      )}
    >
      <CardContent className="p-3 md:p-4">
        {/* Header: Title & Icon */}
        <div className="flex justify-between items-start mb-2">
          {/* Title */}
          <h2 className="text-sm md:text-base font-medium text-white leading-tight">
            {title}
          </h2>
          
          {/* Icon */}
          <div className="text-gray-400 flex-shrink-0 ml-2">
            <IconComponent className="h-4 w-4 md:h-5 md:w-5" aria-hidden="true" />
          </div>
        </div>
        
        {/* Value */}
        <div className="text-2xl md:text-3xl font-bold text-white mb-1 break-words">
          {value}
        </div>
        
        {/* Change Indicator */}
        {change && (
          <div 
            className={cn(
              "text-xs md:text-sm font-medium mt-1",
              isPositive ? "text-green-400" : "text-red-400"
            )}
            aria-live="polite"
          >
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * SKELETON LOADER FOR SCORE CARD
 * Used during loading states
 */
export function ScoreCardSkeleton({ borderColor = "border-gray-700" }: { borderColor?: string }) {
  return (
    <Card className={cn("h-full bg-gray-800 border-2 animate-pulse", borderColor)}>
      <CardContent className="p-3 md:p-4">
        {/* Title skeleton */}
        <div className="flex justify-between items-start mb-2">
          <div className="h-4 w-20 bg-gray-700 rounded"></div>
          <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
        </div>
        
        {/* Value skeleton */}
        <div className="h-8 w-24 bg-gray-700 rounded mb-1"></div>
        
        {/* Change skeleton */}
        <div className="h-4 w-16 bg-gray-700 rounded"></div>
      </CardContent>
    </Card>
  );
}
