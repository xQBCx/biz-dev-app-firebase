import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import { useGlobalChat } from '@/contexts/GlobalChatContext';
import { useIsMobileChat, useIsTabletChat } from '@/hooks/useMediaQuery';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ChatMessage } from './ChatMessage';
import { 
  Sparkles, 
  X, 
  Minimize2, 
  Maximize2, 
  Send,
  Bot
} from 'lucide-react';

export function GlobalFloatingChat() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isOpen,
    setIsOpen,
    isExpanded,
    setIsExpanded,
    messages,
    addMessage,
    currentContext,
    conversationId,
    setConversationId,
    isLoading,
    setIsLoading,
  } = useGlobalChat();
  
  const isMobile = useIsMobileChat();
  const isTablet = useIsTabletChat();
  const [input, setInput] = useState('');
  const [streamingContent, setStreamingContent] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage, timestamp: new Date() });
    setIsLoading(true);
    setStreamingContent('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Please log in');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }].map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
          })),
          conversation_id: conversationId,
          context: { module: currentContext.module }
        })
      });

      if (!response.ok) throw new Error('Failed to get response');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, newlineIndex).trim();
          buffer = buffer.slice(newlineIndex + 1);
          
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            
            // Handle conversation ID
            if (parsed.type === 'conversation_id') {
              setConversationId(parsed.id);
              continue;
            }

            // Handle navigation
            if (parsed.type === 'navigation') {
              assistantMessage += `\n\n🚀 **Navigating to ${parsed.title}**`;
              setStreamingContent(assistantMessage);
              setTimeout(() => navigate(parsed.path), 800);
              continue;
            }

            // Handle initiative created
            if (parsed.type === 'initiative_created') {
              assistantMessage += `\n\n🎯 **Initiative Created: ${parsed.initiative?.name}**\n${parsed.message || ''}`;
              setStreamingContent(assistantMessage);
              toast.success('Initiative Created', { description: parsed.initiative?.name });
              if (parsed.navigate) {
                setTimeout(() => navigate(parsed.navigate), 1500);
              }
              continue;
            }

            // Handle initiative error
            if (parsed.type === 'initiative_creation_error') {
              assistantMessage += `\n\n⚠️ **Failed to create initiative:** ${parsed.error}`;
              setStreamingContent(assistantMessage);
              toast.error('Initiative Creation Failed', { description: parsed.error });
              continue;
            }

            // Handle proposal created
            if (parsed.type === 'proposal_created') {
              assistantMessage += `\n\n📄 **Proposal Created: ${parsed.proposal?.title}**`;
              setStreamingContent(assistantMessage);
              toast.success('Proposal Created');
              continue;
            }

            // Handle task created
            if (parsed.type === 'task_created') {
              assistantMessage += `\n\n✅ **Task Created:** ${parsed.task?.subject}`;
              setStreamingContent(assistantMessage);
              continue;
            }

            // Handle contact/company created
            if (parsed.type === 'contact_created') {
              assistantMessage += `\n\n✅ **Contact Added:** ${parsed.contact?.name}`;
              setStreamingContent(assistantMessage);
              continue;
            }
            if (parsed.type === 'company_created') {
              assistantMessage += `\n\n✅ **Company Added:** ${parsed.company?.name}`;
              setStreamingContent(assistantMessage);
              continue;
            }

            // Handle search results
            if (parsed.type === 'search_result') {
              assistantMessage += `\n\n🔍 **Search: "${parsed.query}"**\n`;
              if (parsed.found && parsed.results?.length > 0) {
                parsed.results.forEach((r: any) => {
                  if (r.type === 'company') assistantMessage += `\n• **Company:** ${r.name}`;
                  if (r.type === 'contact') assistantMessage += `\n• **Contact:** ${r.name}`;
                  if (r.type === 'deal') assistantMessage += `\n• **Deal:** ${r.title}`;
                });
              } else {
                assistantMessage += 'No results found.';
              }
              setStreamingContent(assistantMessage);
              continue;
            }

            // Handle tool errors
            if (parsed.type === 'tool_error') {
              assistantMessage += `\n\n⚠️ ${parsed.error}`;
              setStreamingContent(assistantMessage);
              continue;
            }

            // Handle streaming content
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantMessage += content;
              setStreamingContent(assistantMessage);
            }
          } catch {
            // Skip invalid JSON
          }
        }
      }

      // Add final message
      if (assistantMessage) {
        addMessage({ role: 'assistant', content: assistantMessage, timestamp: new Date() });
      }
      setStreamingContent('');
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Don't render on Dashboard (it has its own chat)
  if (typeof window !== 'undefined' && (window.location.pathname === '/' || window.location.pathname === '/dashboard')) {
    return null;
  }

  // Closed state - just the FAB
  if (!isOpen) {
    return (
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary shadow-lg flex items-center justify-center text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        <Sparkles className="h-6 w-6" />
      </motion.button>
    );
  }

  // Mobile: Bottom sheet
  if (isMobile) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: isExpanded ? '0%' : 'calc(100% - 60px)' }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border rounded-t-xl shadow-2xl"
          style={{ height: isExpanded ? '75vh' : '60px' }}
        >
          {/* Drag handle */}
          <div 
            className="flex items-center justify-center py-2 cursor-grab active:cursor-grabbing"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {isExpanded ? (
            <div className="flex flex-col h-[calc(75vh-32px)]">
              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-primary" />
                  <span className="font-semibold">AI Assistant</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                {messages.length === 0 && !streamingContent ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Bot className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p className="text-sm">Ask me anything about your {currentContext.module || 'business'}!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <ChatMessage
                        key={msg.id}
                        id={msg.id}
                        role={msg.role}
                        content={msg.content}
                      />
                    ))}
                    {streamingContent && (
                      <ChatMessage
                        id="streaming"
                        role="assistant"
                        content={streamingContent}
                        isStreaming
                      />
                    )}
                    {isLoading && !streamingContent && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    disabled={isLoading}
                  />
                  <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center gap-3 px-4 cursor-pointer"
              onClick={() => setIsExpanded(true)}
            >
              <Bot className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Tap to chat with AI...</span>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Desktop/Tablet: Floating card
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <Card className={`fixed bottom-6 right-6 z-50 shadow-2xl flex flex-col transition-all ${
          isExpanded ? 'w-[400px] h-[600px]' : 'w-[350px] h-[400px]'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">AI Assistant</span>
              {currentContext.module !== 'general' && (
                <span className="text-xs text-muted-foreground capitalize">({currentContext.module})</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsOpen(false)}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-3" ref={scrollRef}>
            {messages.length === 0 && !streamingContent ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="mx-auto h-10 w-10 mb-3 opacity-50" />
                <p className="text-sm">How can I help you?</p>
                <p className="text-xs mt-1 opacity-70">Context: {currentContext.module}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    id={msg.id}
                    role={msg.role}
                    content={msg.content}
                  />
                ))}
                {streamingContent && (
                  <ChatMessage
                    id="streaming"
                    role="assistant"
                    content={streamingContent}
                    isStreaming
                  />
                )}
                {isLoading && !streamingContent && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                disabled={isLoading}
                className="text-sm"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} size="icon" className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
