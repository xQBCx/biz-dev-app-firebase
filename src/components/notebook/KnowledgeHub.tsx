import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, Brain, Inbox, Library, GraduationCap, Network, 
  FileText, Image, Youtube, Globe, Mic, Clock, Sparkles,
  MessageSquare, Trash2, MoreVertical, Filter, SortAsc,
  CheckCircle, XCircle, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { QuickCapture } from "./QuickCapture";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string | null;
  summary: string | null;
  source_url: string | null;
  source_type: string;
  source_platform: string | null;
  processing_status: string;
  ai_tags: string[];
  ai_categories: string[];
  key_points: any[];
  mastery_level: number;
  next_review_at: string | null;
  created_at: string;
}

const sourceTypeIcons: Record<string, any> = {
  text: FileText,
  url: Globe,
  youtube: Youtube,
  pdf: FileText,
  image: Image,
  audio: Mic,
  voice_memo: Mic,
  screenshot: Image,
  document: FileText,
};

const statusConfig: Record<string, { icon: any; color: string }> = {
  pending: { icon: Clock, color: "text-muted-foreground" },
  processing: { icon: Loader2, color: "text-primary animate-spin" },
  completed: { icon: CheckCircle, color: "text-green-500" },
  failed: { icon: XCircle, color: "text-destructive" },
};

export function KnowledgeHub() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["knowledge-items"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("knowledge_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as KnowledgeItem[];
    },
  });

  const { data: inboxCount = 0 } = useQuery({
    queryKey: ["knowledge-inbox-count"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from("knowledge_inbox")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "inbox");

      if (error) throw error;
      return count || 0;
    },
  });

  const { data: reviewDueCount = 0 } = useQuery({
    queryKey: ["knowledge-review-due"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from("knowledge_items")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .lte("next_review_at", new Date().toISOString());

      if (error) throw error;
      return count || 0;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("knowledge_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-items"] });
      toast.success("Item deleted");
      if (selectedItem) setSelectedItem(null);
    },
  });

  const askMutation = useMutation({
    mutationFn: async (question: string) => {
      const response = await supabase.functions.invoke("knowledge-chat", {
        body: { question, itemIds: items.map(i => i.id) },
      });
      if (response.error) throw response.error;
      return response.data;
    },
  });

  const filteredItems = items.filter(item => {
    const matchesSearch = !searchQuery || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.ai_tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTab = activeTab === "all" ||
      (activeTab === "articles" && ["url", "pdf"].includes(item.source_type)) ||
      (activeTab === "media" && ["youtube", "audio", "video", "image"].includes(item.source_type)) ||
      (activeTab === "notes" && ["text", "voice_memo"].includes(item.source_type));

    return matchesSearch && matchesTab;
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">Knowledge Hub</h1>
          </div>
          <QuickCapture compact />
        </div>

        {/* Stats */}
        <div className="flex gap-4 mb-4">
          <Card className="flex-1 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Library className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{items.length}</p>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </div>
          </Card>
          <Card className="flex-1 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{inboxCount}</p>
              <p className="text-xs text-muted-foreground">Processing</p>
            </div>
          </Card>
          <Card className="flex-1 p-3 flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{reviewDueCount}</p>
              <p className="text-xs text-muted-foreground">Due for Review</p>
            </div>
          </Card>
        </div>

        {/* Search & Filter */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your knowledge base..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <SortAsc className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* List */}
        <div className="w-96 border-r flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <div className="px-4 pt-4">
              <TabsList className="w-full">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="articles" className="flex-1">Articles</TabsTrigger>
                <TabsTrigger value="media" className="flex-1">Media</TabsTrigger>
                <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No items yet</p>
                    <p className="text-sm">Start capturing knowledge!</p>
                  </div>
                ) : (
                  filteredItems.map((item) => {
                    const Icon = sourceTypeIcons[item.source_type] || FileText;
                    const status = statusConfig[item.processing_status] || statusConfig.pending;
                    const StatusIcon = status.icon;

                    return (
                      <Card
                        key={item.id}
                        className={`p-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                          selectedItem?.id === item.id ? "ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedItem(item)}
                      >
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm truncate">{item.title}</p>
                              <StatusIcon className={`h-3 w-3 flex-shrink-0 ${status.color}`} />
                            </div>
                            {item.summary && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                {item.summary}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                              </span>
                              {item.ai_tags.slice(0, 2).map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs py-0">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </Tabs>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 flex flex-col">
          {selectedItem ? (
            <ItemDetail 
              item={selectedItem} 
              onDelete={() => deleteMutation.mutate(selectedItem.id)}
              isDeleting={deleteMutation.isPending}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select an item to view details</p>
                <p className="text-sm">or drop something new to capture</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface ItemDetailProps {
  item: KnowledgeItem;
  onDelete: () => void;
  isDeleting: boolean;
}

function ItemDetail({ item, onDelete, isDeleting }: ItemDetailProps) {
  const Icon = sourceTypeIcons[item.source_type] || FileText;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b p-4 flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold">{item.title}</h2>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {item.source_type}
              </Badge>
              {item.source_platform && (
                <Badge variant="secondary" className="text-xs">
                  {item.source_platform}
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} disabled={isDeleting} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4">
        <div className="max-w-2xl space-y-6">
          {/* Summary */}
          {item.summary && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Summary
              </h3>
              <Card className="p-4 bg-primary/5 border-primary/20">
                <p className="text-sm">{item.summary}</p>
              </Card>
            </div>
          )}

          {/* Key Points */}
          {item.key_points && item.key_points.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Key Points</h3>
              <ul className="space-y-2">
                {item.key_points.map((point: any, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{typeof point === 'string' ? point : point.text || JSON.stringify(point)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {item.ai_tags.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {item.ai_tags.map(tag => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Categories */}
          {item.ai_categories.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {item.ai_categories.map(cat => (
                  <Badge key={cat} variant="outline">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Source URL */}
          {item.source_url && (
            <div>
              <h3 className="text-sm font-medium mb-2">Source</h3>
              <a 
                href={item.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline break-all"
              >
                {item.source_url}
              </a>
            </div>
          )}

          {/* Full Content */}
          {item.content && (
            <div>
              <h3 className="text-sm font-medium mb-2">Content</h3>
              <Card className="p-4">
                <p className="text-sm whitespace-pre-wrap">{item.content}</p>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}