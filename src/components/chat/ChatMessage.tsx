import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatMessage({ id, role, content, isStreaming = false }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const isUser = role === 'user';

  return (
    <div className={cn('group relative flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'relative max-w-[85%] rounded-lg px-3 py-2',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        <p className="text-sm whitespace-pre-wrap pr-6">{content}</p>
        
        {/* Copy button - always visible on mobile, hover on desktop */}
        {!isStreaming && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity',
              'md:opacity-0 md:group-hover:opacity-100',
              'touch-device:opacity-70',
              isUser 
                ? 'text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10' 
                : 'text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10'
            )}
            onClick={handleCopy}
            aria-label="Copy message"
          >
            {copied ? (
              <Check className="h-3 w-3" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
