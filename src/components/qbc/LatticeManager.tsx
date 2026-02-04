import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Cpu, Lock, Globe, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const LatticeManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [newLatticeName, setNewLatticeName] = useState("");

  const { data: lattices, isLoading, refetch } = useQuery({
    queryKey: ["qbc-lattices", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("qbc_lattices")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleCreateLattice = async () => {
    if (!newLatticeName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a name for your lattice",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      // Create a basic custom lattice based on Metatron's Cube
      const { error } = await supabase.from("qbc_lattices").insert({
        owner_user_id: user?.id,
        lattice_name: newLatticeName,
        lattice_type: "custom",
        is_private: true,
        vertex_config: {
          vertices: [
            { id: 0, x: 0, y: -100, label: "Node0" },
            { id: 1, x: 86.6, y: -50, label: "Node1" },
            { id: 2, x: 86.6, y: 50, label: "Node2" },
            { id: 3, x: 0, y: 100, label: "Node3" },
            { id: 4, x: -86.6, y: 50, label: "Node4" },
            { id: 5, x: -86.6, y: -50, label: "Node5" },
            { id: 6, x: 0, y: 0, label: "Center" },
          ],
          edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,6],[1,6],[2,6],[3,6],[4,6],[5,6]],
        },
        character_map: {
          "A": [0, 1], "B": [1, 2], "C": [2, 3], "D": [3, 4], "E": [4, 5],
          "F": [5, 0], "G": [0, 6], "H": [1, 6], "I": [2, 6], "J": [3, 6],
          "K": [4, 6], "L": [5, 6], "M": [0, 2], "N": [1, 3], "O": [2, 4],
          "P": [3, 5], "Q": [4, 0], "R": [5, 1], "S": [0, 3], "T": [1, 4],
          "U": [2, 5], "V": [3, 0], "W": [4, 1], "X": [5, 2], "Y": [0, 4],
          "Z": [1, 5], " ": [6, 6],
          "0": [6, 0], "1": [6, 1], "2": [6, 2], "3": [6, 3], "4": [6, 4],
          "5": [6, 5], "6": [0, 0], "7": [1, 1], "8": [2, 2], "9": [3, 3],
        },
      });

      if (error) throw error;

      toast({
        title: "Lattice Created",
        description: `"${newLatticeName}" is now available for encoding`,
      });
      setNewLatticeName("");
      refetch();
    } catch (error) {
      console.error("Create lattice error:", error);
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create New Lattice */}
      <div className="flex gap-3">
        <Input
          placeholder="New lattice name..."
          value={newLatticeName}
          onChange={(e) => setNewLatticeName(e.target.value)}
          className="flex-1"
        />
        <Button onClick={handleCreateLattice} disabled={isCreating}>
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Create
            </>
          )}
        </Button>
      </div>

      {/* Lattice List */}
      <div className="grid gap-4">
        {lattices?.map((lattice) => (
          <Card key={lattice.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Cpu className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{lattice.lattice_name}</CardTitle>
                    <CardDescription className="text-xs">
                      {lattice.lattice_type} • Created {new Date(lattice.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {lattice.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  {lattice.is_private ? (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Private
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Vertices:</span>
                  <p className="font-semibold">
                    {(lattice.vertex_config as any)?.vertices?.length || 0}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Edges:</span>
                  <p className="font-semibold">
                    {(lattice.vertex_config as any)?.edges?.length || 0}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Characters:</span>
                  <p className="font-semibold">
                    {Object.keys(lattice.character_map || {}).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {(!lattices || lattices.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <Cpu className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No custom lattices yet</p>
            <p className="text-sm">Create one to start using custom encoding patterns</p>
          </div>
        )}
      </div>
    </div>
  );
};
