import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Link2, Clock, User, FileText, Briefcase, Shield, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface RelationshipAnchor {
  id: string;
  anchor_type: string;
  source_contact_id: string | null;
  target_contact_id: string | null;
  facilitator_contact_id: string | null;
  linked_proposal_id: string | null;
  linked_deal_room_id: string | null;
  description: string | null;
  transaction_hash: string | null;
  block_number: number | null;
  anchored_at: string | null;
  created_at: string;
  metadata: any;
}

interface XODIAKRelationshipViewProps {
  contactId?: string;
  dealRoomId?: string;
  limit?: number;
}

export const XODIAKRelationshipView = ({ contactId, dealRoomId, limit = 20 }: XODIAKRelationshipViewProps) => {
  const { user } = useAuth();
  const [anchors, setAnchors] = useState<RelationshipAnchor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAnchors();
    }
  }, [user, contactId, dealRoomId]);

  const loadAnchors = async () => {
    try {
      let query = supabase
        .from("xodiak_relationship_anchors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (contactId) {
        query = query.or(`source_contact_id.eq.${contactId},target_contact_id.eq.${contactId},facilitator_contact_id.eq.${contactId}`);
      }

      if (dealRoomId) {
        query = query.eq("linked_deal_room_id", dealRoomId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnchors(data || []);
    } catch (error) {
      console.error("Error loading relationship anchors:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAnchorTypeIcon = (type: string) => {
    switch (type) {
      case "introduction":
        return <User className="w-4 h-4" />;
      case "asset_share":
        return <FileText className="w-4 h-4" />;
      case "meeting":
        return <Clock className="w-4 h-4" />;
      case "idea_disclosure":
        return <Shield className="w-4 h-4" />;
      case "connection":
        return <Link2 className="w-4 h-4" />;
      default:
        return <Link2 className="w-4 h-4" />;
    }
  };

  const getAnchorTypeBadgeColor = (type: string) => {
    switch (type) {
      case "introduction":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "asset_share":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "meeting":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "idea_disclosure":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "connection":
        return "bg-cyan-500/10 text-cyan-500 border-cyan-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (anchors.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2">No Relationship Anchors</h3>
          <p className="text-muted-foreground text-sm">
            XODIAK relationship anchors will appear here when connections, introductions, 
            or asset shares are cryptographically recorded.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          XODIAK Relationship Ledger
        </CardTitle>
        <CardDescription>
          Cryptographically anchored relationship events and asset disclosures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {anchors.map((anchor) => (
              <div
                key={anchor.id}
                className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getAnchorTypeBadgeColor(anchor.anchor_type)}`}>
                      {getAnchorTypeIcon(anchor.anchor_type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={getAnchorTypeBadgeColor(anchor.anchor_type)}>
                          {anchor.anchor_type.replace("_", " ")}
                        </Badge>
                        {anchor.transaction_hash && (
                          <Badge variant="outline" className="text-xs font-mono">
                            Anchored
                          </Badge>
                        )}
                      </div>
                      
                      {anchor.description && (
                        <p className="text-sm text-foreground">{anchor.description}</p>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(anchor.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                      
                      {anchor.transaction_hash && (
                        <div className="flex items-center gap-2 mt-2">
                          <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                            {anchor.transaction_hash.slice(0, 16)}...
                          </code>
                          {anchor.block_number && (
                            <span className="text-xs text-muted-foreground">
                              Block #{anchor.block_number}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {(anchor.linked_deal_room_id || anchor.linked_proposal_id) && (
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
