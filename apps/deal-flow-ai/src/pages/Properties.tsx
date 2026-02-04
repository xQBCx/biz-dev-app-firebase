import { useState, useEffect, useMemo } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Upload, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CSVImportDialog } from "@/components/properties/CSVImportDialog";
import { AddPropertyDialog } from "@/components/properties/AddPropertyDialog";
import { PropertiesTable } from "@/components/properties/PropertiesTable";
import { PropertyFilters } from "@/components/properties/PropertyFilters";
import type { Tables } from "@/integrations/supabase/types";

type Property = Tables<"properties">;

const REQUIRED_FIELDS = [{ key: "address", label: "Address" }];

const OPTIONAL_FIELDS = [
  { key: "city", label: "City" },
  { key: "state", label: "State" },
  { key: "zip", label: "ZIP Code" },
  { key: "county", label: "County" },
  { key: "list_price", label: "List Price" },
  { key: "seller_name", label: "Seller Name" },
  { key: "seller_phone", label: "Seller Phone" },
  { key: "seller_email", label: "Seller Email" },
  { key: "notes", label: "Notes" },
];

export default function Properties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [county, setCounty] = useState("all");

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      toast.error("Failed to load properties");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const counties = useMemo(() => {
    const uniqueCounties = new Set(
      properties.map((p) => p.county).filter(Boolean) as string[]
    );
    return Array.from(uniqueCounties).sort();
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        !search ||
        p.address.toLowerCase().includes(searchLower) ||
        p.city?.toLowerCase().includes(searchLower) ||
        p.seller_name?.toLowerCase().includes(searchLower);

      const matchesStatus = status === "all" || p.status === status;
      const matchesCounty = county === "all" || p.county === county;

      return matchesSearch && matchesStatus && matchesCounty;
    });
  }, [properties, search, status, county]);

  const handleImport = async (data: Record<string, string>[]) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    const records = data.map((row) => ({
      user_id: user.id,
      address: row.address,
      city: row.city || null,
      state: row.state || null,
      zip: row.zip || null,
      county: row.county || null,
      list_price: row.list_price ? parseFloat(row.list_price.replace(/[^0-9.]/g, "")) : null,
      seller_name: row.seller_name || null,
      seller_phone: row.seller_phone || null,
      seller_email: row.seller_email || null,
      notes: row.notes || null,
      status: "NEW_LEAD" as const,
    }));

    const { error } = await supabase.from("properties").insert(records);
    if (error) throw error;

    await fetchProperties();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Properties</h1>
            <p className="text-muted-foreground">
              {filteredProperties.length} properties
              {search || status !== "all" || county !== "all" ? " (filtered)" : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2" onClick={() => setShowImport(true)}>
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
            <Button className="gap-2" onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4" />
              Add Property
            </Button>
          </div>
        </div>

        <PropertyFilters
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          county={county}
          onCountyChange={setCounty}
          counties={counties}
        />

        {filteredProperties.length > 0 ? (
          <PropertiesTable properties={filteredProperties} isLoading={isLoading} />
        ) : !isLoading ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {properties.length > 0 ? "No properties match your filters" : "No properties yet"}
            </p>
            {properties.length === 0 && (
              <>
                <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                  Import your first batch of properties from a CSV file or add them manually to
                  get started with AI-powered deal analysis.
                </p>
                <Button className="gap-2" onClick={() => setShowImport(true)}>
                  <Upload className="h-4 w-4" />
                  Import Properties
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
        title="Import Properties"
        description="Upload a CSV file with your property leads. Map the columns to the appropriate fields."
      />

      <AddPropertyDialog
        open={showAdd}
        onOpenChange={setShowAdd}
        onSuccess={fetchProperties}
      />
    </DashboardLayout>
  );
}
