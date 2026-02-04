import { useState, useEffect } from "react";
import { Link2, ExternalLink, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface CrossModuleLink {
  id: string;
  source_module: string;
  source_entity_id: string;
  target_module: string;
  target_entity_id: string;
  link_type: string;
  confidence_score: number;
  verified: boolean;
  metadata: Json;
  created_at: string;
}

export const CrossModuleLinks = () => {
  const [links, setLinks] = useState<CrossModuleLink[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from("ai_cross_module_links")
        .select("*")
        .order("confidence_score", { ascending: false })
        .limit(20);

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      console.error("Error fetching cross-module links:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyLink = async (linkId: string, verified: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("ai_cross_module_links")
        .update({ verified, verified_by: user.id })
        .eq("id", linkId);

      if (error) throw error;

      setLinks(links.map(link => 
        link.id === linkId ? { ...link, verified } : link
      ));

      toast.success(verified ? "Link verified" : "Link rejected");
    } catch (error) {
      console.error("Error verifying link:", error);
      toast.error("Failed to update link");
    }
  };

  const getModuleColor = (module: string) => {
    const colors: Record<string, string> = {
      crm: "bg-blue-500/20 text-blue-400",
      deals: "bg-green-500/20 text-green-400",
      construction: "bg-orange-500/20 text-orange-400",
      fleet: "bg-purple-500/20 text-purple-400",
      ip: "bg-pink-500/20 text-pink-400",
      tasks: "bg-yellow-500/20 text-yellow-400",
    };
    return colors[module] || "bg-muted text-muted-foreground";
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Cross-Module Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            No cross-module links discovered yet. The AI will automatically detect relationships between your CRM contacts, deals, projects, and other entities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Cross-Module Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {links.map((link) => (
          <div
            key={link.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
          >
            <div className="flex items-center gap-3">
              <Badge className={getModuleColor(link.source_module)}>
                {link.source_module}
              </Badge>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
              <Badge className={getModuleColor(link.target_module)}>
                {link.target_module}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {link.link_type}
              </span>
              <Badge variant="outline" className="text-xs">
                {Math.round(link.confidence_score * 100)}% confidence
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {link.verified !== null ? (
                <Badge variant={link.verified ? "default" : "destructive"}>
                  {link.verified ? "Verified" : "Rejected"}
                </Badge>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-green-500 hover:text-green-400 hover:bg-green-500/10"
                    onClick={() => verifyLink(link.id, true)}
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    onClick={() => verifyLink(link.id, false)}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
