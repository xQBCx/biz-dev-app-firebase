import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, TrendingUp, FileText } from "lucide-react";

interface Deal {
  id: string;
  name: string;
  amount?: number;
  stage: string;
  probability?: number;
  expected_close_date?: string;
  deal_type?: string;
  description?: string;
  created_at: string;
}

interface CRMDealDetailProps {
  dealId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

export const CRMDealDetail = ({ dealId, onEdit, onBack }: CRMDealDetailProps) => {
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDeal();
  }, [dealId]);

  const loadDeal = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_deals")
        .select("*")
        .eq("id", dealId)
        .single();

      if (error) throw error;
      setDeal(data);
    } catch (error) {
      console.error("Error loading deal:", error);
      toast.error("Failed to load deal");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const { error } = await supabase
        .from("crm_deals")
        .delete()
        .eq("id", dealId);

      if (error) throw error;

      toast.success("Deal deleted successfully");
      if (onBack) onBack();
      else navigate("/crm");
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error("Failed to delete deal");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!deal) {
    return <div className="text-center p-8">Deal not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack || (() => navigate("/crm"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="text-3xl font-bold mb-6">{deal.name}</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {deal.amount && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${deal.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Stage</p>
                <p className="font-medium capitalize">{deal.stage.replace('_', ' ')}</p>
              </div>
            </div>

            {deal.probability !== undefined && (
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Probability</p>
                  <p className="font-medium">{deal.probability}%</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {deal.expected_close_date && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Expected Close Date</p>
                  <p className="font-medium">
                    {new Date(deal.expected_close_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            {deal.deal_type && (
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Deal Type</p>
                  <p className="font-medium">{deal.deal_type}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {deal.description && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="whitespace-pre-wrap">{deal.description}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Created: {new Date(deal.created_at).toLocaleDateString()}
          </p>
        </div>
      </Card>
    </div>
  );
};
