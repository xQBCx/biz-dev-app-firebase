import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Plus, Upload, Edit, Trash2, Download } from "lucide-react";
import { downloadDomainCSVTemplate } from "@/utils/csvTemplates";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DomainManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<any>(null);

  const { data: domains, isLoading } = useQuery({
    queryKey: ["domains-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("domains")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("domains")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains-admin"] });
      toast({ title: "Domain deleted successfully" });
    },
  });

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split("\n").slice(1); // Skip header
    
    const domains = lines
      .filter(line => line.trim())
      .map(line => {
        const [domain_name, category, value_low, value_high, strategic_role, description] = 
          line.split(",").map(s => s.trim());
        
        return {
          domain_name,
          category,
          estimated_value_low: parseFloat(value_low) || 0,
          estimated_value_high: parseFloat(value_high) || 0,
          strategic_role,
          description,
        };
      });

    const { error } = await supabase.from("domains").insert(domains);
    
    if (error) {
      toast({ title: "Error uploading domains", variant: "destructive" });
    } else {
      toast({ title: `${domains.length} domains imported successfully` });
      queryClient.invalidateQueries({ queryKey: ["domains-admin"] });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Domain Portfolio Manager</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={downloadDomainCSVTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Template
          </Button>
          
          <Label htmlFor="csv-upload" className="cursor-pointer">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import CSV
              </span>
            </Button>
          </Label>
          <Input
            id="csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditingDomain(null)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Domain
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingDomain ? "Edit Domain" : "Add New Domain"}
                </DialogTitle>
              </DialogHeader>
              <DomainForm
                domain={editingDomain}
                onSuccess={() => {
                  setIsDialogOpen(false);
                  setEditingDomain(null);
                  queryClient.invalidateQueries({ queryKey: ["domains-admin"] });
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Value Range</TableHead>
              <TableHead>Strategic Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">Loading...</TableCell>
              </TableRow>
            ) : domains?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No domains yet. Add domains or import a CSV.
                </TableCell>
              </TableRow>
            ) : (
              domains?.map((domain) => (
                <TableRow key={domain.id}>
                  <TableCell className="font-medium">{domain.domain_name}</TableCell>
                  <TableCell>{domain.category || "—"}</TableCell>
                  <TableCell>
                    {formatCurrency(domain.estimated_value_low)} - {formatCurrency(domain.estimated_value_high)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {domain.strategic_role || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingDomain(domain);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(domain.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

const DomainForm = ({ domain, onSuccess }: { domain?: any; onSuccess: () => void }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    domain_name: domain?.domain_name || "",
    category: domain?.category || "",
    estimated_value_low: domain?.estimated_value_low || "",
    estimated_value_high: domain?.estimated_value_high || "",
    strategic_role: domain?.strategic_role || "",
    description: domain?.description || "",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (domain) {
        const { error } = await supabase
          .from("domains")
          .update(data)
          .eq("id", domain.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("domains").insert([data]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: `Domain ${domain ? "updated" : "created"} successfully` });
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="domain_name">Domain Name</Label>
        <Input
          id="domain_name"
          value={formData.domain_name}
          onChange={(e) => setFormData({ ...formData, domain_name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="value_low">Value Low</Label>
          <Input
            id="value_low"
            type="number"
            value={formData.estimated_value_low}
            onChange={(e) => setFormData({ ...formData, estimated_value_low: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="value_high">Value High</Label>
          <Input
            id="value_high"
            type="number"
            value={formData.estimated_value_high}
            onChange={(e) => setFormData({ ...formData, estimated_value_high: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="strategic_role">Strategic Role</Label>
        <Input
          id="strategic_role"
          value={formData.strategic_role}
          onChange={(e) => setFormData({ ...formData, strategic_role: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <Button type="submit" className="w-full">
        {domain ? "Update Domain" : "Add Domain"}
      </Button>
    </form>
  );
};

export default DomainManager;
