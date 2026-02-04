/**
 * QBC Mode Toggle
 * Visual toggle button to switch between text and glyph modes
 */

import React from 'react';
import { useQBCScriptSafe } from '@/contexts/QBCScriptContext';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Hexagon, Type } from 'lucide-react';

interface QBCModeToggleProps {
  className?: string;
  variant?: 'default' | 'compact' | 'icon';
  showLabel?: boolean;
}

export function QBCModeToggle({ 
  className, 
  variant = 'default',
  showLabel = true,
}: QBCModeToggleProps) {
  const { isQBCMode, toggleMode, isReady } = useQBCScriptSafe();
  
  if (!isReady) {
    return null;
  }
  
  const buttonContent = (
    <Button
      variant="ghost"
      size={variant === 'icon' ? 'icon' : 'sm'}
      onClick={toggleMode}
      className={cn(
        'relative transition-all duration-300',
        isQBCMode && 'text-primary',
        variant === 'icon' && 'h-8 w-8',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {/* Icon with glow effect when active */}
        <div className={cn(
          'relative transition-all duration-300',
          isQBCMode && 'animate-pulse'
        )}>
          {isQBCMode ? (
            <Hexagon className={cn(
              'h-4 w-4 transition-all',
              isQBCMode && 'text-primary drop-shadow-[0_0_8px_hsl(var(--primary))]'
            )} />
          ) : (
            <Type className="h-4 w-4" />
          )}
        </div>
        
        {/* Label */}
        {showLabel && variant !== 'icon' && (
          <span className="text-xs font-medium">
            {isQBCMode ? 'QBC' : 'Text'}
          </span>
        )}
      </div>
      
      {/* Active indicator */}
      {isQBCMode && (
        <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}
    </Button>
  );
  
  if (variant === 'icon') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {buttonContent}
          </TooltipTrigger>
          <TooltipContent>
            <p>{isQBCMode ? 'Switch to Text Mode' : 'Switch to QBC Glyph Mode'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
  
  return buttonContent;
}

/**
 * QBC Mode Toggle with visual indicator bar
 */
export function QBCModeToggleBar({ className }: { className?: string }) {
  const { isQBCMode, toggleMode, isReady } = useQBCScriptSafe();
  
  if (!isReady) return null;
  
  return (
    <div className={cn(
      'flex items-center gap-3 px-3 py-2 rounded-lg border transition-all duration-300',
      isQBCMode 
        ? 'border-primary/30 bg-primary/5' 
        : 'border-border bg-muted/50',
      className
    )}>
      <button
        onClick={toggleMode}
        className="flex items-center gap-3 w-full"
      >
        {/* Text mode indicator */}
        <div className={cn(
          'flex items-center gap-1.5 transition-opacity',
          isQBCMode ? 'opacity-40' : 'opacity-100'
        )}>
          <Type className="h-4 w-4" />
          <span className="text-xs font-medium">Text</span>
        </div>
        
        {/* Toggle slider */}
        <div className="relative flex-1 h-6 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'absolute top-0.5 h-5 w-5 rounded-full transition-all duration-300 flex items-center justify-center',
              isQBCMode 
                ? 'left-[calc(100%-1.375rem)] bg-primary shadow-[0_0_12px_hsl(var(--primary))]' 
                : 'left-0.5 bg-muted-foreground/50'
            )}
          >
            {isQBCMode ? (
              <Hexagon className="h-3 w-3 text-primary-foreground" />
            ) : (
              <Type className="h-3 w-3" />
            )}
          </div>
        </div>
        
        {/* Glyph mode indicator */}
        <div className={cn(
          'flex items-center gap-1.5 transition-opacity',
          isQBCMode ? 'opacity-100' : 'opacity-40'
        )}>
          <Hexagon className={cn(
            'h-4 w-4',
            isQBCMode && 'text-primary'
          )} />
          <span className={cn(
            'text-xs font-medium',
            isQBCMode && 'text-primary'
          )}>QBC</span>
        </div>
      </button>
    </div>
  );
}
