import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface FranchiseApplicationModalProps {
  franchise: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function FranchiseApplicationModal({
  franchise,
  open,
  onOpenChange,
  onSuccess,
}: FranchiseApplicationModalProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    investment_amount: "",
    desired_location: "",
    experience_years: "",
    capital_available: "",
    message: "",
  });

  const createApplication = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("franchise_applications").insert({
        user_id: user.id,
        franchise_id: franchise.id,
        investment_amount: data.investment_amount ? parseFloat(data.investment_amount) : null,
        desired_location: data.desired_location,
        experience_years: data.experience_years ? parseInt(data.experience_years) : null,
        capital_available: data.capital_available ? parseFloat(data.capital_available) : null,
        message: data.message,
        status: "pending",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      setFormData({
        investment_amount: "",
        desired_location: "",
        experience_years: "",
        capital_available: "",
        message: "",
      });
      onSuccess();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit application");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createApplication.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply to {franchise?.brand_name}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="investment_amount">Desired Investment Amount</Label>
              <Input
                id="investment_amount"
                type="number"
                placeholder="100000"
                value={formData.investment_amount}
                onChange={(e) =>
                  setFormData({ ...formData, investment_amount: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capital_available">Capital Available</Label>
              <Input
                id="capital_available"
                type="number"
                placeholder="150000"
                value={formData.capital_available}
                onChange={(e) =>
                  setFormData({ ...formData, capital_available: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="desired_location">Desired Location</Label>
              <Input
                id="desired_location"
                placeholder="City, State"
                value={formData.desired_location}
                onChange={(e) =>
                  setFormData({ ...formData, desired_location: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience_years">Years of Business Experience</Label>
              <Input
                id="experience_years"
                type="number"
                placeholder="5"
                value={formData.experience_years}
                onChange={(e) =>
                  setFormData({ ...formData, experience_years: e.target.value })
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Tell us about yourself and why you're interested</Label>
            <Textarea
              id="message"
              placeholder="Share your background, experience, and goals..."
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createApplication.isPending}>
              {createApplication.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
