import React from 'react';
import { useQBCScript } from '@/contexts/QBCScriptContext';
import DecryptedText from '@/components/DecryptedText';
import { cn } from '@/lib/utils';

interface QBCDecryptedTextProps {
  text: string;
  className?: string;
  /** Height of each word glyph when in QBC mode */
  glyphHeight?: string;
  /** DecryptedText animation trigger */
  animateOn?: 'view' | 'hover';
  /** DecryptedText animation speed */
  speed?: number;
  /** DecryptedText max iterations */
  maxIterations?: number;
  /** Force English mode regardless of toggle */
  forceEnglish?: boolean;
}

/**
 * Renders a single word as a glyph
 */
function WordGlyph({ 
  word, 
  glyphHeight,
  getGlyphSvg 
}: { 
  word: string; 
  glyphHeight: string;
  getGlyphSvg: (text: string) => string | null;
}) {
  const svgContent = getGlyphSvg(word);
  
  if (!svgContent) {
    return <span>{word}</span>;
  }
  
  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ height: glyphHeight }}
      title={word}
    >
      <span
        className="inline-block"
        style={{ 
          height: glyphHeight, 
          width: 'auto',
          aspectRatio: '1 / 1',
        }}
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </span>
  );
}

/**
 * QBCDecryptedText - Combines DecryptedText and QBC Glyph rendering
 * 
 * When QBC mode is OFF: Shows DecryptedText with scramble animation
 * When QBC mode is ON: Shows each word as a separate geometric glyph
 */
export function QBCDecryptedText({
  text,
  className,
  glyphHeight = '1em',
  animateOn = 'view',
  speed = 30,
  maxIterations = 20,
  forceEnglish = false,
}: QBCDecryptedTextProps) {
  const { isQBCMode, getGlyphSvg, isReady } = useQBCScript();
  
  // English mode or not ready - use DecryptedText
  if (!isQBCMode || forceEnglish || !isReady) {
    return (
      <DecryptedText
        text={text}
        className={className}
        animateOn={animateOn}
        speed={speed}
        maxIterations={maxIterations}
      />
    );
  }
  
  // QBC mode - render each word as a separate glyph
  const words = text.split(/\s+/).filter(Boolean);
  
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {words.map((word, index) => (
        <WordGlyph 
          key={`${word}-${index}`}
          word={word} 
          glyphHeight={glyphHeight}
          getGlyphSvg={getGlyphSvg}
        />
      ))}
    </span>
  );
}

/**
 * QBCStaticText - For static text that becomes glyphs in QBC mode
 * No animation in English mode. Each word becomes a separate glyph.
 */
export function QBCStaticText({
  children,
  className,
  glyphHeight = '1em',
  forceEnglish = false,
}: {
  children: string;
  className?: string;
  glyphHeight?: string;
  forceEnglish?: boolean;
}) {
  const { isQBCMode, getGlyphSvg, isReady } = useQBCScript();
  
  // English mode or not ready
  if (!isQBCMode || forceEnglish || !isReady) {
    return <span className={className}>{children}</span>;
  }
  
  // QBC mode - render each word as a separate glyph
  const words = children.split(/\s+/).filter(Boolean);
  
  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {words.map((word, index) => (
        <WordGlyph 
          key={`${word}-${index}`}
          word={word} 
          glyphHeight={glyphHeight}
          getGlyphSvg={getGlyphSvg}
        />
      ))}
    </span>
  );
}
