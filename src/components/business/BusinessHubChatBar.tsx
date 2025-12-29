import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Loader2, 
  Sparkles, 
  Building2,
  Globe,
  FolderTree,
  FileSearch,
  Settings,
  Minimize2,
  Maximize2,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface BusinessHubChatBarProps {
  businessId: string;
  businessName: string;
  className?: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { label: "Update website", icon: Globe, action: "update_website" },
  { label: "Refine ERP", icon: FolderTree, action: "refine_erp" },
  { label: "New research", icon: FileSearch, action: "new_research" },
  { label: "Configure modules", icon: Settings, action: "configure_modules" },
];

export function BusinessHubChatBar({ businessId, businessName, className }: BusinessHubChatBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          messages: [...messages, userMessage].map(m => ({
            role: m.role,
            content: m.content,
          })),
          context: {
            type: "business_hub",
            businessId,
            businessName,
          },
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data?.response || "I can help you manage and build your business. What would you like to do?",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response");
      
      // Add a fallback message
      const fallbackMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "I'm here to help you build and manage your business. You can ask me to update your website, refine your ERP structure, conduct market research, or configure platform modules. What would you like to do?",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const prompts: Record<string, string> = {
      update_website: `I'd like to update the website for ${businessName}. Can you help me improve the content and design?`,
      refine_erp: `Can you help me refine the ERP structure for ${businessName}? I want to optimize the organizational setup.`,
      new_research: `I need updated market research for ${businessName}. What are the latest trends and opportunities?`,
      configure_modules: `Help me configure the platform modules for ${businessName}. Which ones should I enable?`,
    };
    
    setInput(prompts[action] || "");
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isExpanded) {
    return (
      <Card 
        className={cn(
          "fixed bottom-4 right-4 p-4 cursor-pointer hover:shadow-lg transition-shadow z-50",
          "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20",
          className
        )}
        onClick={() => setIsExpanded(true)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">Continue Building</p>
            <p className="text-xs text-muted-foreground">Chat with AI to develop {businessName}</p>
          </div>
          <Maximize2 className="w-4 h-4 text-muted-foreground ml-2" />
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-4 right-4 w-96 shadow-xl z-50 flex flex-col",
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-medium text-sm">{businessName}</p>
            <p className="text-xs text-muted-foreground">Business Builder</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsExpanded(false)}
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => {
              setIsExpanded(false);
              setMessages([]);
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-1.5 p-2 border-b overflow-x-auto">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.action}
              variant="outline"
              size="sm"
              className="text-xs shrink-0 h-7 px-2"
              onClick={() => handleQuickAction(action.action)}
            >
              <Icon className="w-3 h-3 mr-1" />
              {action.label}
            </Button>
          );
        })}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 h-64 p-3" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Ask me anything about {businessName}</p>
            <p className="text-xs mt-1">I can help update your website, ERP, and more</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="p-2 border-t">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your business..."
            className="min-h-[40px] max-h-24 resize-none text-sm"
            rows={1}
          />
          <Button 
            size="icon" 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
