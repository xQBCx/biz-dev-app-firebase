import React, { useMemo } from 'react';
import { useQBCScript } from '@/contexts/QBCScriptContext';
import { cn } from '@/lib/utils';

interface QBCTextProps {
  children: string;
  className?: string;
  /** Height of the glyph - matches font size by default */
  glyphHeight?: string;
  /** Fallback if glyph generation fails */
  fallback?: React.ReactNode;
  /** Force English mode regardless of toggle */
  forceEnglish?: boolean;
  /** HTML element to render as */
  as?: keyof JSX.IntrinsicElements;
}

/**
 * QBCText - Renders text as either English or QBC Glyph based on global toggle
 * 
 * When QBC mode is ON, the text is converted to its geometric glyph representation.
 * The glyph is sized to match the surrounding font size for seamless integration.
 */
export function QBCText({
  children,
  className,
  glyphHeight = '1em',
  fallback,
  forceEnglish = false,
  as: Component = 'span',
}: QBCTextProps) {
  const { isQBCMode, getGlyphSvg, isReady } = useQBCScript();
  
  const svgContent = useMemo(() => {
    if (forceEnglish || !isQBCMode || !isReady) return null;
    return getGlyphSvg(children);
  }, [children, isQBCMode, isReady, forceEnglish, getGlyphSvg]);
  
  // English mode or not ready
  if (!isQBCMode || forceEnglish || !isReady) {
    return <Component className={className}>{children}</Component>;
  }
  
  // QBC mode - render glyph
  if (!svgContent) {
    // Fallback if glyph generation failed
    return <Component className={className}>{fallback ?? children}</Component>;
  }
  
  return (
    <Component
      className={cn('inline-flex items-center justify-center', className)}
      style={{ height: glyphHeight }}
      title={children} // Show original text on hover
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
    </Component>
  );
}

/**
 * QBCHeading - Specialized for headings with larger glyph sizing
 */
export function QBCHeading({
  children,
  level = 1,
  className,
  glyphHeight,
}: {
  children: string;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  glyphHeight?: string;
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Default heights based on heading level
  const defaultHeights: Record<number, string> = {
    1: '2.5rem',
    2: '2rem',
    3: '1.5rem',
    4: '1.25rem',
    5: '1rem',
    6: '0.875rem',
  };
  
  return (
    <QBCText
      as={Tag}
      className={className}
      glyphHeight={glyphHeight ?? defaultHeights[level]}
    >
      {children}
    </QBCText>
  );
}
