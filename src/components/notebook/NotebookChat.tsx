import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, FileText, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface NotebookChatProps {
  notebookId: string;
  sources: any[];
}

interface Message {
  id: string;
  role: string;
  content: string;
  citations?: any;
  created_at: string;
}

export function NotebookChat({ notebookId, sources }: NotebookChatProps) {
  const queryClient = useQueryClient();
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedContent, setStreamedContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ["notebook-conversations", notebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notebook_conversations")
        .select("*")
        .eq("notebook_id", notebookId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (question: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Save user message
      await supabase.from("notebook_conversations").insert({
        notebook_id: notebookId,
        user_id: user.id,
        role: "user",
        content: question,
      });

      setIsStreaming(true);
      setStreamedContent("");

      // Call the Q&A edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notebook-qa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            notebookId,
            question,
            sources: sources.filter(s => s.processing_status === "completed"),
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get answer");
      }

      // Stream the response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let citations: any[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                setStreamedContent(fullContent);
              }
              if (parsed.citations) {
                citations = parsed.citations;
              }
            } catch {
              // Skip incomplete JSON
            }
          }
        }
      }

      // Save assistant message
      await supabase.from("notebook_conversations").insert({
        notebook_id: notebookId,
        user_id: user.id,
        role: "assistant",
        content: fullContent,
        citations: citations,
      });

      return fullContent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-conversations", notebookId] });
      setInput("");
      setIsStreaming(false);
      setStreamedContent("");
    },
    onError: (error) => {
      toast.error(error.message);
      setIsStreaming(false);
      setStreamedContent("");
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamedContent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMutation.mutate(input);
  };

  const completedSources = sources.filter(s => s.processing_status === "completed");
  const hasReadySources = completedSources.length > 0;

  const suggestedQuestions = [
    "Summarize the key points from all sources",
    "What are the main themes across these documents?",
    "Create a bullet-point overview",
    "What questions should I be asking about this material?",
  ];

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.length === 0 && !isStreaming && (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Ask questions about your sources</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {hasReadySources
                  ? `${completedSources.length} source${completedSources.length > 1 ? "s" : ""} ready. Ask anything!`
                  : "Add and process some sources first to start asking questions."
                }
              </p>
              {hasReadySources && (
                <div className="space-y-2">
                  {suggestedQuestions.map((q, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      className="w-full justify-start text-left h-auto py-3"
                      onClick={() => {
                        setInput(q);
                        sendMutation.mutate(q);
                      }}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-lg px-4 py-3 ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
                    <p className="text-xs font-medium opacity-70">Sources:</p>
                    {msg.citations.map((c: any, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs opacity-70">
                        <FileText className="h-3 w-3 mt-0.5" />
                        <span className="line-clamp-2">{c.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isStreaming && streamedContent && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg px-4 py-3 bg-muted">
                <p className="text-sm whitespace-pre-wrap">{streamedContent}</p>
                <Loader2 className="h-4 w-4 animate-spin mt-2" />
              </div>
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto flex gap-2">
          <Input
            placeholder={hasReadySources ? "Ask a question about your sources..." : "Add sources first..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!hasReadySources || isStreaming}
          />
          <Button type="submit" disabled={!input.trim() || isStreaming || !hasReadySources}>
            {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
  );
}