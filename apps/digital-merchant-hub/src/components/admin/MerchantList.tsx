import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface MerchantListProps {
  status?: string;
  onUpdate: () => void;
}

const MerchantList = ({ status, onUpdate }: MerchantListProps) => {
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchants();
  }, [status]);

  const fetchMerchants = async () => {
    let query = supabase.from("merchants").select("*").order("created_at", { ascending: false });
    
    if (status) {
      query = query.eq("status", status);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching merchants:", error);
    } else {
      setMerchants(data || []);
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading merchants...</div>;
  }

  if (merchants.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No merchants found</div>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Business Name</TableHead>
          <TableHead>Contact Email</TableHead>
          <TableHead>Processor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>API Key</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {merchants.map((merchant) => (
          <TableRow key={merchant.id}>
            <TableCell className="font-medium">{merchant.business_name}</TableCell>
            <TableCell>{merchant.contact_email}</TableCell>
            <TableCell>
              <Badge variant="outline" className="capitalize">
                {merchant.processor.replace("_", " ")}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={merchant.status === "active" ? "default" : "secondary"}>
                {merchant.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={merchant.api_key_configured ? "default" : "destructive"}>
                {merchant.api_key_configured ? "Configured" : "Not Set"}
              </Badge>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default MerchantList;