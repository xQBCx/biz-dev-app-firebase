import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Edit, Globe } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const TLDManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTLD, setEditingTLD] = useState<any>(null);

  const { data: tlds, isLoading } = useQuery({
    queryKey: ["tlds-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tlds")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

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
        <h2 className="text-2xl font-bold text-foreground">TLD Strategy Manager</h2>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <p className="text-center text-muted-foreground">Loading...</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tlds?.map((tld) => (
            <Card key={tld.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <Globe className="h-6 w-6 text-accent" />
                    <h3 className="text-2xl font-bold text-foreground">{tld.tld_name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      tld.status === "acquired" 
                        ? "bg-green-500/10 text-green-500"
                        : tld.status === "researching"
                        ? "bg-yellow-500/10 text-yellow-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}>
                      {tld.status}
                    </span>
                  </div>
                  
                  <p className="text-muted-foreground">{tld.strategic_value}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-muted-foreground">Estimated Cost: </span>
                      <span className="font-semibold text-foreground">
                        {formatCurrency(tld.estimated_cost_low)} - {formatCurrency(tld.estimated_cost_high)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Acquisition Target: </span>
                      <span className="font-semibold text-foreground">
                        {tld.acquisition_target ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setEditingTLD(tld);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit TLD Strategy</DialogTitle>
          </DialogHeader>
          <TLDForm
            tld={editingTLD}
            onSuccess={() => {
              setIsDialogOpen(false);
              setEditingTLD(null);
              queryClient.invalidateQueries({ queryKey: ["tlds-admin"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TLDForm = ({ tld, onSuccess }: { tld?: any; onSuccess: () => void }) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    tld_name: tld?.tld_name || "",
    acquisition_target: tld?.acquisition_target || false,
    estimated_cost_low: tld?.estimated_cost_low || "",
    estimated_cost_high: tld?.estimated_cost_high || "",
    strategic_value: tld?.strategic_value || "",
    status: tld?.status || "planned",
  });

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from("tlds")
        .update(data)
        .eq("id", tld.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "TLD updated successfully" });
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
        <Label htmlFor="tld_name">TLD Name</Label>
        <Input
          id="tld_name"
          value={formData.tld_name}
          onChange={(e) => setFormData({ ...formData, tld_name: e.target.value })}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="acquisition_target"
          checked={formData.acquisition_target}
          onCheckedChange={(checked) => 
            setFormData({ ...formData, acquisition_target: checked as boolean })
          }
        />
        <Label htmlFor="acquisition_target">Acquisition Target</Label>
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="researching">Researching</SelectItem>
            <SelectItem value="acquired">Acquired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="cost_low">Cost Low</Label>
          <Input
            id="cost_low"
            type="number"
            value={formData.estimated_cost_low}
            onChange={(e) => setFormData({ ...formData, estimated_cost_low: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="cost_high">Cost High</Label>
          <Input
            id="cost_high"
            type="number"
            value={formData.estimated_cost_high}
            onChange={(e) => setFormData({ ...formData, estimated_cost_high: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="strategic_value">Strategic Value</Label>
        <Textarea
          id="strategic_value"
          value={formData.strategic_value}
          onChange={(e) => setFormData({ ...formData, strategic_value: e.target.value })}
          rows={4}
        />
      </div>

      <Button type="submit" className="w-full">
        Update TLD
      </Button>
    </form>
  );
};

export default TLDManager;
