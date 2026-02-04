import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentLinksListProps {
  merchantId: string;
  onUpdate: () => void;
}

const PaymentLinksList = ({ merchantId, onUpdate }: PaymentLinksListProps) => {
  const [links, setLinks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
  }, [merchantId]);

  const fetchLinks = async () => {
    const { data, error } = await supabase
      .from("payment_links")
      .select("*")
      .eq("merchant_id", merchantId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching links:", error);
    } else {
      setLinks(data || []);
    }
    setLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard!" });
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading payment links...</div>;
  }

  if (links.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No payment links yet. Create your first one!</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <TableRow key={link.id}>
            <TableCell className="font-medium">{link.title}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {link.link_type.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              {link.amount ? `$${Number(link.amount).toFixed(2)}` : "Variable"}
            </TableCell>
            <TableCell>
              <Badge variant={link.is_active ? "default" : "secondary"}>
                {link.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                {link.checkout_url && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(link.checkout_url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(link.checkout_url, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PaymentLinksList;