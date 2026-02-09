import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "packages/supabase-client/src";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Crown, Lock, Unlock, Search, Loader2 } from "lucide-react";
import { format } from "date-fns";

type GlyphClaim = {
  id: string;
  canonical_text: string;
  display_text: string;
  content_hash: string;
  status: string;
  is_canonical: boolean | null;
  canonical_at: string | null;
  canonical_notes: string | null;
  owner_user_id: string | null;
  created_at: string;
};

export default function CanonicalGlyphRegistry() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCanonical, setFilterCanonical] = useState<boolean | null>(null);
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphClaim | null>(null);
  const [canonicalNotes, setCanonicalNotes] = useState("");

  const { data: glyphs, isLoading } = useQuery({
    queryKey: ["glyph-claims-canonical"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("glyph_claims")
        .select("*")
        .order("is_canonical", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as GlyphClaim[];
    },
  });

  const toggleCanonicalMutation = useMutation({
    mutationFn: async ({ id, is_canonical, notes }: { id: string; is_canonical: boolean; notes?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const updates: Record<string, unknown> = {
        is_canonical,
        canonical_at: is_canonical ? new Date().toISOString() : null,
        canonical_by: is_canonical ? user?.id : null,
        canonical_notes: notes || null,
      };
      
      const { error } = await supabase.from("glyph_claims").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["glyph-claims-canonical"] });
      toast.success("Glyph canonical status updated");
      setSelectedGlyph(null);
    },
    onError: (error) => toast.error(error.message),
  });

  const filteredGlyphs = glyphs?.filter((g) => {
    const matchesSearch = 
      g.canonical_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.display_text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = 
      filterCanonical === null || g.is_canonical === filterCanonical;
    return matchesSearch && matchesFilter;
  });

  const getStats = () => {
    if (!glyphs) return { canonical: 0, pending: 0, total: 0 };
    return {
      canonical: glyphs.filter((g) => g.is_canonical).length,
      pending: glyphs.filter((g) => !g.is_canonical).length,
      total: glyphs.length,
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-amber-400">{stats.canonical}</div>
            <p className="text-sm text-muted-foreground">Canonical Glyphs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-sm text-muted-foreground">Non-Canonical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-sm text-muted-foreground">Total Claims</p>
          </CardContent>
        </Card>
      </div>

      {/* Info */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Crown className="h-5 w-5 text-amber-500 mt-0.5" />
            <div>
              <h4 className="font-medium">Canonical Glyph Registry</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Canonical glyphs are official, immutable representations in the Rosetta Library.
                Once marked canonical, glyphs become reference implementations that cannot be modified.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search glyphs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterCanonical === null ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCanonical(null)}
          >
            All
          </Button>
          <Button
            variant={filterCanonical === true ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCanonical(true)}
          >
            <Crown className="h-4 w-4 mr-1" />
            Canonical
          </Button>
          <Button
            variant={filterCanonical === false ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterCanonical(false)}
          >
            Non-Canonical
          </Button>
        </div>
      </div>

      {/* Glyphs List */}
      <Card>
        <CardHeader>
          <CardTitle>Glyph Claims</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredGlyphs?.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No glyphs found</p>
          ) : (
            <div className="space-y-3">
              {filteredGlyphs?.map((glyph) => (
                <div
                  key={glyph.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-colors ${
                    glyph.is_canonical
                      ? "bg-amber-500/10 border border-amber-500/30"
                      : "bg-muted/30 hover:bg-muted/50"
                  }`}
                >
                  {glyph.is_canonical ? (
                    <Crown className="h-5 w-5 text-amber-500" />
                  ) : (
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{glyph.canonical_text}</span>
                      {glyph.is_canonical && (
                        <Badge className="bg-amber-500/20 text-amber-400">Canonical</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                      <span>Hash: {glyph.content_hash.slice(0, 12)}...</span>
                      <span>•</span>
                      <span>{format(new Date(glyph.created_at), "MMM d, yyyy")}</span>
                    </div>
                    {glyph.canonical_notes && (
                      <p className="text-sm mt-1">{glyph.canonical_notes}</p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedGlyph(glyph);
                          setCanonicalNotes(glyph.canonical_notes || "");
                        }}
                      >
                        {glyph.is_canonical ? (
                          <>
                            <Unlock className="h-4 w-4 mr-1" />
                            Manage
                          </>
                        ) : (
                          <>
                            <Crown className="h-4 w-4 mr-1" />
                            Make Canonical
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {glyph.is_canonical ? "Manage Canonical Glyph" : "Make Glyph Canonical"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Text</label>
                          <p className="font-mono mt-1">{glyph.canonical_text}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Content Hash</label>
                          <p className="font-mono text-sm text-muted-foreground mt-1 break-all">
                            {glyph.content_hash}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Canonical Notes</label>
                          <Textarea
                            value={canonicalNotes}
                            onChange={(e) => setCanonicalNotes(e.target.value)}
                            placeholder="Notes about this canonical glyph..."
                            className="mt-2"
                          />
                        </div>
                        <div className="flex gap-2">
                          {glyph.is_canonical ? (
                            <Button
                              variant="destructive"
                              onClick={() =>
                                toggleCanonicalMutation.mutate({
                                  id: glyph.id,
                                  is_canonical: false,
                                })
                              }
                              disabled={toggleCanonicalMutation.isPending}
                            >
                              <Unlock className="h-4 w-4 mr-1" />
                              Remove Canonical Status
                            </Button>
                          ) : (
                            <Button
                              onClick={() =>
                                toggleCanonicalMutation.mutate({
                                  id: glyph.id,
                                  is_canonical: true,
                                  notes: canonicalNotes,
                                })
                              }
                              disabled={toggleCanonicalMutation.isPending}
                            >
                              <Crown className="h-4 w-4 mr-1" />
                              Mark as Canonical
                            </Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
