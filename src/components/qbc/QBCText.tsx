/**
 * QBC Text Components
 * Renders text as geometric glyphs when QBC mode is enabled
 */

import React, { useMemo, useState, useEffect } from 'react';
import { useQBCScriptSafe } from '@/contexts/QBCScriptContext';
import { cn } from '@/lib/utils';

interface QBCTextProps {
  children: React.ReactNode;
  className?: string;
  forceEnglish?: boolean; // Always show as text, never glyph
  as?: keyof JSX.IntrinsicElements;
  title?: string; // Custom hover title
}

/**
 * QBCText - Renders text that transforms to glyphs in QBC mode
 */
export function QBCText({ 
  children, 
  className, 
  forceEnglish = false,
  as: Component = 'span',
  title,
}: QBCTextProps) {
  const { isQBCMode, getGlyphSvg, isReady } = useQBCScriptSafe();
  const [animating, setAnimating] = useState(false);
  
  const text = typeof children === 'string' ? children : String(children);
  
  const glyphSvg = useMemo(() => {
    if (forceEnglish || !isQBCMode || !isReady) return null;
    return getGlyphSvg(text);
  }, [forceEnglish, isQBCMode, isReady, text, getGlyphSvg]);
  
  // Trigger animation when switching to QBC mode
  useEffect(() => {
    if (isQBCMode && glyphSvg) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isQBCMode, glyphSvg]);
  
  // Normal text mode
  if (!isQBCMode || forceEnglish || !glyphSvg) {
    return <Component className={className}>{children}</Component>;
  }
  
  // QBC glyph mode
  return (
    <Component
      className={cn(
        'qbc-glyph-text inline-flex items-center',
        animating && 'qbc-glyph-animating',
        className
      )}
      title={title || text}
      aria-label={text}
    >
      <span
        className="qbc-glyph"
        dangerouslySetInnerHTML={{ __html: glyphSvg }}
      />
    </Component>
  );
}

interface QBCHeadingProps extends QBCTextProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * QBCHeading - Heading that transforms to glyphs
 * Automatically sizes glyph based on heading level
 */
export function QBCHeading({ 
  level, 
  children, 
  className,
  forceEnglish = false,
  title,
}: QBCHeadingProps) {
  const { isQBCMode, getGlyphSvg, isReady } = useQBCScriptSafe();
  const [animating, setAnimating] = useState(false);
  
  const text = typeof children === 'string' ? children : String(children);
  
  // Size mapping for heading levels
  const sizeMap: Record<number, number> = {
    1: 48,
    2: 40,
    3: 32,
    4: 28,
    5: 24,
    6: 20,
  };
  
  const size = sizeMap[level] || 24;
  
  const glyphSvg = useMemo(() => {
    if (forceEnglish || !isQBCMode || !isReady) return null;
    return getGlyphSvg(text, size);
  }, [forceEnglish, isQBCMode, isReady, text, size, getGlyphSvg]);
  
  // Trigger animation when switching to QBC mode
  useEffect(() => {
    if (isQBCMode && glyphSvg) {
      setAnimating(true);
      const timer = setTimeout(() => setAnimating(false), 800);
      return () => clearTimeout(timer);
    }
  }, [isQBCMode, glyphSvg]);
  
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  
  // Normal text mode
  if (!isQBCMode || forceEnglish || !glyphSvg) {
    return <Tag className={className}>{children}</Tag>;
  }
  
  // QBC glyph mode
  return (
    <Tag
      className={cn(
        'qbc-glyph-heading inline-flex items-center',
        animating && 'qbc-glyph-animating',
        className
      )}
      title={title || text}
      aria-label={text}
    >
      <span
        className="qbc-glyph"
        style={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: glyphSvg }}
      />
    </Tag>
  );
}

/**
 * QBCParagraph - Paragraph text that transforms to glyphs
 */
export function QBCParagraph({ 
  children, 
  className,
  forceEnglish = false,
}: QBCTextProps) {
  return (
    <QBCText 
      as="p" 
      className={className} 
      forceEnglish={forceEnglish}
    >
      {children}
    </QBCText>
  );
}

/**
 * QBCLabel - Label text that transforms to glyphs
 */
export function QBCLabel({ 
  children, 
  className,
  forceEnglish = false,
}: QBCTextProps) {
  return (
    <QBCText 
      as="label" 
      className={className} 
      forceEnglish={forceEnglish}
    >
      {children}
    </QBCText>
  );
}
