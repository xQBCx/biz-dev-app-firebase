import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export interface PromptItem {
  id: string;
  user_id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  priority: "low" | "medium" | "high";
  status: "draft" | "ready" | "used" | "archived";
  images: string[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface PromptFilters {
  search: string;
  category: string;
  status: string;
  priority: string;
}

export const usePromptLibrary = () => {
  const [prompts, setPrompts] = useState<PromptItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<PromptFilters>({
    search: "",
    category: "",
    status: "",
    priority: "",
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPrompts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from("prompt_library")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.priority) {
        query = query.eq("priority", filters.priority);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPrompts((data || []) as PromptItem[]);
    } catch (error) {
      console.error("Error fetching prompts:", error);
      toast({
        title: "Error",
        description: "Failed to load prompts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createPrompt = async (prompt: Partial<PromptItem>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("prompt_library")
        .insert([{
          user_id: user.id,
          title: prompt.title || "Untitled Prompt",
          content: prompt.content || "",
          category: prompt.category || "general",
          tags: prompt.tags || [],
          priority: prompt.priority || "medium",
          status: prompt.status || "draft",
          images: (prompt.images || []) as unknown as string,
          metadata: JSON.parse(JSON.stringify(prompt.metadata || {})),
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Prompt saved",
        description: "Your prompt has been saved to the library",
      });

      await fetchPrompts();
      return data as PromptItem;
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive",
      });
      return null;
    }
  };

  const updatePrompt = async (id: string, updates: Partial<PromptItem>) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id: _id, user_id, created_at, updated_at, ...safeUpdates } = updates as PromptItem;
      const { error } = await supabase
        .from("prompt_library")
        .update({
          ...safeUpdates,
          metadata: safeUpdates.metadata ? JSON.parse(JSON.stringify(safeUpdates.metadata)) : undefined,
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Prompt updated",
        description: "Your changes have been saved",
      });

      await fetchPrompts();
      return true;
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast({
        title: "Error",
        description: "Failed to update prompt",
        variant: "destructive",
      });
      return false;
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const { error } = await supabase
        .from("prompt_library")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Prompt deleted",
        description: "The prompt has been removed",
      });

      await fetchPrompts();
      return true;
    } catch (error) {
      console.error("Error deleting prompt:", error);
      toast({
        title: "Error",
        description: "Failed to delete prompt",
        variant: "destructive",
      });
      return false;
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
      return true;
    } catch (error) {
      console.error("Error copying:", error);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
      return false;
    }
  };

  const exportAsMarkdown = (prompt: PromptItem) => {
    const markdown = `# ${prompt.title}

**Category:** ${prompt.category}
**Priority:** ${prompt.priority}
**Status:** ${prompt.status}
**Tags:** ${prompt.tags.join(", ") || "None"}
**Created:** ${new Date(prompt.created_at).toLocaleDateString()}

---

${prompt.content}

${prompt.images.length > 0 ? `\n## Images\n${prompt.images.map((url, i) => `![Image ${i + 1}](${url})`).join("\n")}` : ""}
`;
    
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Prompt exported as Markdown",
    });
  };

  const exportAsJSON = (prompt: PromptItem) => {
    const json = JSON.stringify(prompt, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prompt.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Exported",
      description: "Prompt exported as JSON",
    });
  };

  useEffect(() => {
    fetchPrompts();
  }, [user, filters]);

  // Set up realtime subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("prompt_library_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "prompt_library",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchPrompts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    prompts,
    loading,
    filters,
    setFilters,
    createPrompt,
    updatePrompt,
    deletePrompt,
    copyToClipboard,
    exportAsMarkdown,
    exportAsJSON,
    refetch: fetchPrompts,
  };
};

export const PROMPT_CATEGORIES = [
  "general",
  "feature-idea",
  "ai-prompt",
  "system-design",
  "bug-fix",
  "ui-ux",
  "integration",
  "workflow",
  "research",
  "other",
];
