import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, ExternalLink, Settings, Trash2 } from "lucide-react";
import { MintDomainDialog } from "./MintDomainDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TLDDomainListProps {
  tldId: string;
  searchQuery: string;
}

const statusColors: Record<string, string> = {
  available: "bg-green-100 text-green-800",
  reserved: "bg-amber-100 text-amber-800",
  allocated: "bg-blue-100 text-blue-800",
  sold: "bg-purple-100 text-purple-800",
  parked: "bg-gray-100 text-gray-800",
};

export function TLDDomainList({ tldId, searchQuery }: TLDDomainListProps) {
  const queryClient = useQueryClient();
  const [mintOpen, setMintOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: domains, isLoading } = useQuery({
    queryKey: ["tld-domains", tldId, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from("tld_registered_domains")
        .select("*")
        .eq("tld_id", tldId)
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query = query.ilike("domain_name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteDomain = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tld_registered_domains")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tld-domains"] });
      queryClient.invalidateQueries({ queryKey: ["tld-domain-stats"] });
      toast.success("Domain removed");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error("Failed to delete domain", { description: error.message });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 border-b">
            <p className="text-sm text-muted-foreground">
              {domains?.length || 0} domains registered
            </p>
            <Button size="sm" onClick={() => setMintOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Register Domain
            </Button>
          </div>

          {domains && domains.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price (USD)</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="font-medium">
                      {domain.full_domain}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={statusColors[domain.status] || ""}
                      >
                        {domain.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {domain.category || "—"}
                    </TableCell>
                    <TableCell>
                      {domain.price_usd
                        ? `$${Number(domain.price_usd).toLocaleString()}`
                        : "—"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {domain.owner_type === "internal" ? "Internal" : domain.owner_type}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteId(domain.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              No domains registered yet. Click "Register Domain" to add one.
            </div>
          )}
        </CardContent>
      </Card>

      <MintDomainDialog
        open={mintOpen}
        onOpenChange={setMintOpen}
        tldId={tldId}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the domain from your registry. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground"
              onClick={() => deleteId && deleteDomain.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
