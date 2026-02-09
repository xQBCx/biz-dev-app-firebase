import { useState } from "react";
import { supabase } from "packages/supabase-client/src";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

const merchantSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(200),
  businessAddress: z.string().max(500).optional(),
  contactEmail: z.string().email("Invalid email address"),
  contactPhone: z.string().max(20).optional(),
  processor: z.enum(["coinbase_commerce", "bitpay", "strike"]),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required").max(100),
});

interface CreateMerchantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CreateMerchantDialog = ({ open, onOpenChange, onSuccess }: CreateMerchantDialogProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    businessName: "",
    businessAddress: "",
    contactEmail: "",
    contactPhone: "",
    processor: "coinbase_commerce",
    email: "",
    password: "",
    fullName: "",
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = merchantSchema.parse(formData);
      setIsLoading(true);

      // Get current session token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Call edge function to create merchant using admin privileges
      const { data, error } = await supabase.functions.invoke('create-merchant', {
        body: {
          email: validatedData.email,
          password: validatedData.password,
          fullName: validatedData.fullName,
          businessName: validatedData.businessName,
          businessAddress: validatedData.businessAddress || null,
          contactEmail: validatedData.contactEmail,
          contactPhone: validatedData.contactPhone || null,
          processor: validatedData.processor,
        },
      });

      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || "Failed to create merchant");

      toast({
        title: "Success!",
        description: `Merchant ${validatedData.businessName} created successfully.`,
      });

      onOpenChange(false);
      onSuccess();
      
      // Reset form
      setFormData({
        businessName: "",
        businessAddress: "",
        contactEmail: "",
        contactPhone: "",
        processor: "coinbase_commerce",
        email: "",
        password: "",
        fullName: "",
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to create merchant",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create New Merchant</DialogTitle>
          <DialogDescription>
            Add a new merchant to the platform
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="processor">Payment Processor *</Label>
              <Select
                value={formData.processor}
                onValueChange={(value) => setFormData({ ...formData, processor: value })}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="coinbase_commerce">Coinbase Commerce</SelectItem>
                  <SelectItem value="bitpay">BitPay</SelectItem>
                  <SelectItem value="strike">Strike</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="businessAddress">Business Address</Label>
            <Input
              id="businessAddress"
              value={formData.businessAddress}
              onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="text-sm font-medium mb-4">Merchant Login Credentials</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Login Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-primary hover:bg-primary/90">
              {isLoading ? "Creating..." : "Create Merchant"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMerchantDialog;