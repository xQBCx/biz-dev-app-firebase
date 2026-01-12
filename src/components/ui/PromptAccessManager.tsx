import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  User, Building2, Briefcase, Factory, Pin, PinOff, 
  Trash2, Users, ArrowUpDown, Settings 
} from "lucide-react";
import { toast } from "sonner";

interface PromptAccessEntity {
  id: string;
  entity_type: string;
  entity_id: string;
  display_name: string;
  email: string | null;
  avatar_url: string | null;
  pinned: boolean;
  usage_count: number;
  last_used_at: string | null;
}

const entityTypeIcons: Record<string, React.ReactNode> = {
  contact: <User className="h-4 w-4" />,
  company: <Building2 className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  deal_room: <Briefcase className="h-4 w-4" />,
  business: <Factory className="h-4 w-4" />
};

export function PromptAccessManager() {
  const { user } = useAuth();
  const [entities, setEntities] = useState<PromptAccessEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const fetchEntities = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("prompt_access_entities")
        .select("*")
        .eq("user_id", user.id)
        .order("pinned", { ascending: false })
        .order("usage_count", { ascending: false });

      if (error) throw error;
      setEntities(data || []);
    } catch (error) {
      console.error("Error fetching prompt access entities:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchEntities();
    }
  }, [open, user]);

  const togglePin = async (entity: PromptAccessEntity) => {
    try {
      const { error } = await supabase
        .from("prompt_access_entities")
        .update({ pinned: !entity.pinned })
        .eq("id", entity.id);

      if (error) throw error;
      
      setEntities(prev => 
        prev.map(e => e.id === entity.id ? { ...e, pinned: !e.pinned } : e)
      );
      
      toast.success(entity.pinned ? "Unpinned from quick access" : "Pinned to quick access");
    } catch (error) {
      console.error("Error toggling pin:", error);
      toast.error("Failed to update");
    }
  };

  const removeEntity = async (entity: PromptAccessEntity) => {
    try {
      const { error } = await supabase
        .from("prompt_access_entities")
        .delete()
        .eq("id", entity.id);

      if (error) throw error;
      
      setEntities(prev => prev.filter(e => e.id !== entity.id));
      toast.success("Removed from quick access");
    } catch (error) {
      console.error("Error removing entity:", error);
      toast.error("Failed to remove");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          <span className="hidden sm:inline">Prompt Access</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Prompt Access List
          </DialogTitle>
          <DialogDescription>
            Manage entities that appear first when you type @ in any input. 
            Pin your most important contacts and companies for quick access.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : entities.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p className="text-muted-foreground">
                  Your quick access list is empty.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Entities you @mention will appear here automatically.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {/* Pinned Section */}
              {entities.filter(e => e.pinned).length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <Pin className="h-3 w-3" /> Pinned
                  </h4>
                  <div className="space-y-1">
                    {entities.filter(e => e.pinned).map(renderEntity)}
                  </div>
                </div>
              )}

              {/* Recent Section */}
              {entities.filter(e => !e.pinned).length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                    <ArrowUpDown className="h-3 w-3" /> Frequently Used
                  </h4>
                  <div className="space-y-1">
                    {entities.filter(e => !e.pinned).map(renderEntity)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );

  function renderEntity(entity: PromptAccessEntity) {
    return (
      <div
        key={entity.id}
        className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
      >
        <Avatar className="h-10 w-10 shrink-0">
          {entity.avatar_url ? (
            <AvatarImage src={entity.avatar_url} alt={entity.display_name} />
          ) : null}
          <AvatarFallback className="text-sm">
            {entity.display_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{entity.display_name}</span>
            <Badge variant="outline" className="shrink-0 text-xs gap-1">
              {entityTypeIcons[entity.entity_type]}
            </Badge>
          </div>
          {entity.email && (
            <p className="text-sm text-muted-foreground truncate">{entity.email}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Used {entity.usage_count} time{entity.usage_count !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => togglePin(entity)}
            title={entity.pinned ? "Unpin" : "Pin to top"}
          >
            {entity.pinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => removeEntity(entity)}
            title="Remove from quick access"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }
}
