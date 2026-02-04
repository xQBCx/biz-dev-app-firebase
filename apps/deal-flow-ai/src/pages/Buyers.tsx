import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, Plus, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CSVImportDialog } from "@/components/properties/CSVImportDialog";
import { AddBuyerDialog } from "@/components/buyers/AddBuyerDialog";
import { BuyersTable } from "@/components/buyers/BuyersTable";
import type { Tables } from "@/integrations/supabase/types";

type Buyer = Tables<"buyers">;

const REQUIRED_FIELDS = [{ key: "name", label: "Name" }];

const OPTIONAL_FIELDS = [
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "target_counties", label: "Target Counties" },
  { key: "min_price", label: "Min Price" },
  { key: "max_price", label: "Max Price" },
  { key: "property_types", label: "Property Types" },
  { key: "notes", label: "Notes" },
];

export default function Buyers() {
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");

  const fetchBuyers = async () => {
    try {
      const { data, error } = await supabase
        .from("buyers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBuyers(data || []);
    } catch (error) {
      toast.error("Failed to load buyers");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const filteredBuyers = useMemo(() => {
    if (!search) return buyers;
    const searchLower = search.toLowerCase();
    return buyers.filter(
      (b) =>
        b.name.toLowerCase().includes(searchLower) ||
        b.email?.toLowerCase().includes(searchLower) ||
        b.target_counties?.toLowerCase().includes(searchLower)
    );
  }, [buyers, search]);

  const handleImport = async (data: Record<string, string>[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const records = data.map((row) => ({
      user_id: user.id,
      name: row.name,
      phone: row.phone || null,
      email: row.email || null,
      target_counties: row.target_counties || null,
      min_price: row.min_price ? parseFloat(row.min_price.replace(/[^0-9.]/g, "")) : null,
      max_price: row.max_price ? parseFloat(row.max_price.replace(/[^0-9.]/g, "")) : null,
      property_types: row.property_types || null,
      notes: row.notes || null,
      status: "ACTIVE" as const,
    }));

    const { error } = await supabase.from("buyers").insert(records);
    if (error) throw error;

    await fetchBuyers();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Buyers</h1>
            <p className="text-muted-foreground">
              {filteredBuyers.length} buyers{search ? " (filtered)" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowImport(true)}>
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button className="gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              Add Buyer
            </Button>
          </div>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or county..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {filteredBuyers.length > 0 ? (
          <BuyersTable buyers={filteredBuyers} isLoading={isLoading} />
        ) : !isLoading ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {buyers.length > 0 ? "No buyers match your search" : "No buyers yet"}
            </p>
            {buyers.length === 0 && (
              <>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Build your buyer database by importing from CSV or adding buyers manually. The
                  AI will match properties to the right buyers based on their preferences.
                </p>
                <Button className="gap-2" onClick={() => setShowImport(true)}>
                  <Upload className="h-4 w-4" />
                  Import Buyers
                </Button>
              </>
            )}
          </div>
        ) : null}
      </div>

      <CSVImportDialog
        open={showImport}
        onOpenChange={setShowImport}
        onImport={handleImport}
        requiredFields={REQUIRED_FIELDS}
        optionalFields={OPTIONAL_FIELDS}
        title="Import Buyers"
        description="Upload a CSV file with your cash buyer contacts. Map the columns to the appropriate fields."
      />

      <AddBuyerDialog open={showAdd} onOpenChange={setShowAdd} onSuccess={fetchBuyers} />
    </DashboardLayout>
  );
}
