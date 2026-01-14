/**
 * QBC Virtual Keyboard
 * Touch-friendly character input with glyph previews
 */

import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Delete, Space, CornerDownLeft } from 'lucide-react';
import { encodeText } from '@/lib/qbc/encoder';
import { renderPathToSVG } from '@/lib/qbc/renderer2d';
import { LatticeAnchors2D, LatticeRules } from '@/lib/qbc/types';

// Default anchors for preview
const DEFAULT_ANCHORS: LatticeAnchors2D = new Map([
  ['A', { x: 0.5, y: 0 }], ['B', { x: 0.75, y: 0.125 }], ['C', { x: 0.875, y: 0.375 }],
  ['D', { x: 0.875, y: 0.625 }], ['E', { x: 0.75, y: 0.875 }], ['F', { x: 0.5, y: 1 }],
  ['G', { x: 0.25, y: 0.875 }], ['H', { x: 0.125, y: 0.625 }], ['I', { x: 0.125, y: 0.375 }],
  ['J', { x: 0.25, y: 0.125 }], ['K', { x: 0.5, y: 0.25 }], ['L', { x: 0.625, y: 0.5 }],
  ['M', { x: 0.5, y: 0.75 }], ['N', { x: 0.375, y: 0.5 }], ['O', { x: 0.5, y: 0.5 }],
  ['P', { x: 0.35, y: 0.25 }], ['Q', { x: 0.65, y: 0.25 }], ['R', { x: 0.75, y: 0.5 }],
  ['S', { x: 0.65, y: 0.75 }], ['T', { x: 0.35, y: 0.75 }], ['U', { x: 0.25, y: 0.5 }],
  ['V', { x: 0.4, y: 0.35 }], ['W', { x: 0.6, y: 0.35 }], ['X', { x: 0.6, y: 0.65 }],
  ['Y', { x: 0.4, y: 0.65 }], ['Z', { x: 0.5, y: 0.4 }],
  ['0', { x: 0.45, y: 0.45 }], ['1', { x: 0.55, y: 0.45 }], ['2', { x: 0.55, y: 0.55 }],
  ['3', { x: 0.45, y: 0.55 }], ['4', { x: 0.3, y: 0.35 }], ['5', { x: 0.7, y: 0.35 }],
  ['6', { x: 0.7, y: 0.65 }], ['7', { x: 0.3, y: 0.65 }], ['8', { x: 0.4, y: 0.5 }],
  ['9', { x: 0.6, y: 0.5 }], [' ', { x: 0.5, y: 0.5 }],
]);

const DEFAULT_RULES: LatticeRules = {
  enableTick: true,
  tickLengthFactor: 0.08,
  insideBoundaryPreference: true,
  nodeSpacing: 0.2,
};

interface VirtualKeyboardProps {
  value: string;
  onChange: (value: string) => void;
  onEnter?: () => void;
  showPreview?: boolean;
  className?: string;
}

// Keyboard layouts
const QWERTY_LAYOUT = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
];

const NUMBER_ROW = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

// Cache for character glyphs
const glyphCache = new Map<string, string>();

function getCharGlyph(char: string): string {
  if (glyphCache.has(char)) {
    return glyphCache.get(char)!;
  }
  
  try {
    const path = encodeText(char, DEFAULT_ANCHORS, DEFAULT_RULES);
    const svg = renderPathToSVG(path, DEFAULT_ANCHORS, {
      width: 24,
      height: 24,
      strokeColor: 'currentColor',
      strokeWidth: 1.5,
      showNodes: false,
      showBackground: false,
      padding: 2,
    });
    glyphCache.set(char, svg);
    return svg;
  } catch {
    return '';
  }
}

export function VirtualKeyboard({
  value,
  onChange,
  onEnter,
  showPreview = true,
  className,
}: VirtualKeyboardProps) {
  const [showNumbers, setShowNumbers] = useState(false);
  const [showGlyphs, setShowGlyphs] = useState(true);
  
  const handleKeyPress = useCallback((char: string) => {
    onChange(value + char);
  }, [value, onChange]);
  
  const handleBackspace = useCallback(() => {
    onChange(value.slice(0, -1));
  }, [value, onChange]);
  
  const handleSpace = useCallback(() => {
    onChange(value + ' ');
  }, [value, onChange]);
  
  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);
  
  // Pre-render glyphs for all keys
  const glyphs = useMemo(() => {
    const result: Record<string, string> = {};
    [...NUMBER_ROW, ...QWERTY_LAYOUT.flat()].forEach(char => {
      result[char] = getCharGlyph(char);
    });
    return result;
  }, []);
  
  return (
    <div className={cn('space-y-2', className)}>
      {/* Toggle Row */}
      <div className="flex gap-2 justify-center mb-2">
        <Button
          size="sm"
          variant={showNumbers ? 'default' : 'outline'}
          onClick={() => setShowNumbers(!showNumbers)}
        >
          123
        </Button>
        <Button
          size="sm"
          variant={showGlyphs ? 'default' : 'outline'}
          onClick={() => setShowGlyphs(!showGlyphs)}
        >
          {showGlyphs ? 'ABC' : 'QBC'}
        </Button>
      </div>
      
      {/* Number Row (optional) */}
      {showNumbers && (
        <div className="flex justify-center gap-1">
          {NUMBER_ROW.map(char => (
            <KeyButton
              key={char}
              char={char}
              glyph={showGlyphs ? glyphs[char] : undefined}
              onClick={() => handleKeyPress(char)}
            />
          ))}
        </div>
      )}
      
      {/* Letter Rows */}
      {QWERTY_LAYOUT.map((row, rowIndex) => (
        <div key={rowIndex} className="flex justify-center gap-1">
          {row.map(char => (
            <KeyButton
              key={char}
              char={char}
              glyph={showGlyphs ? glyphs[char] : undefined}
              onClick={() => handleKeyPress(char)}
            />
          ))}
        </div>
      ))}
      
      {/* Control Row */}
      <div className="flex justify-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="w-16"
          onClick={handleClear}
        >
          Clear
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 max-w-[200px]"
          onClick={handleSpace}
        >
          <Space className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-12"
          onClick={handleBackspace}
        >
          <Delete className="h-4 w-4" />
        </Button>
        {onEnter && (
          <Button
            size="sm"
            className="w-16"
            onClick={onEnter}
          >
            <CornerDownLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      {/* Preview */}
      {showPreview && value && (
        <div className="mt-4 p-3 bg-muted rounded-lg text-center">
          <p className="font-mono text-lg">{value}</p>
        </div>
      )}
    </div>
  );
}

interface KeyButtonProps {
  char: string;
  glyph?: string;
  onClick: () => void;
}

function KeyButton({ char, glyph, onClick }: KeyButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className="w-8 h-10 p-0 flex flex-col items-center justify-center"
      onClick={onClick}
    >
      {glyph ? (
        <span
          className="w-5 h-5"
          dangerouslySetInnerHTML={{ __html: glyph }}
        />
      ) : (
        <span className="text-sm font-medium">{char}</span>
      )}
    </Button>
  );
}
