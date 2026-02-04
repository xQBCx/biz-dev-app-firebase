import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";
import { toast } from "sonner";

type CardMaterial = "paper" | "plastic" | "aluminum" | "silver" | "gold";

interface BusinessCardCreatorProps {
  onClose: () => void;
}

export function BusinessCardCreator({ onClose }: BusinessCardCreatorProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    card_name: "",
    title: "",
    company_name: "",
    email: user?.email || "",
    phone: "",
    website: "",
    material: "paper" as CardMaterial,
    background_color: "#1a1a1a",
    text_color: "#ffffff",
    total_editions: 100,
  });

  const createCard = useMutation({
    mutationFn: async () => {
      // Generate serial number and verification code
      const { data: serialData } = await supabase.rpc("generate_card_serial");
      const { data: verificationData } = await supabase.rpc("generate_verification_code");

      const { data, error } = await supabase
        .from("business_cards")
        .insert({
          user_id: user?.id,
          ...formData,
          serial_number: serialData,
          verification_code: verificationData,
          status: "draft",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Business card created successfully!");
      onClose();
    },
    onError: (error) => {
      toast.error("Failed to create business card");
      console.error(error);
    },
  });

  const materialInfo = {
    paper: { price: 0, badge: "Free", rarity: "Common" },
    plastic: { price: 5, badge: "$5", rarity: "Uncommon" },
    aluminum: { price: 25, badge: "$25", rarity: "Rare" },
    silver: { price: 100, badge: "$100", rarity: "Epic" },
    gold: { price: 500, badge: "$500", rarity: "Legendary" },
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCard.mutate();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create Business Card</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="card_name">Card Name *</Label>
                <Input
                  id="card_name"
                  value={formData.card_name}
                  onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
                  placeholder="e.g., Founder Edition"
                  required
                />
              </div>

              <div>
                <Label htmlFor="title">Your Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., CEO & Founder"
                />
              </div>

              <div>
                <Label htmlFor="company_name">Company Name</Label>
                <Input
                  id="company_name"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Your Company"
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <Label htmlFor="material">Card Material *</Label>
                <Select
                  value={formData.material}
                  onValueChange={(value: CardMaterial) => setFormData({ ...formData, material: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(materialInfo).map(([material, info]) => (
                      <SelectItem key={material} value={material}>
                        <div className="flex items-center justify-between w-full">
                          <span className="capitalize">{material}</span>
                          <span className="text-xs text-muted-foreground ml-4">
                            {info.badge} • {info.rarity}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {materialInfo[formData.material].rarity} rarity
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="background_color">Background</Label>
                  <Input
                    id="background_color"
                    type="color"
                    value={formData.background_color}
                    onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="text_color">Text Color</Label>
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.text_color}
                    onChange={(e) => setFormData({ ...formData, text_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="total_editions">Total Editions</Label>
                <Input
                  id="total_editions"
                  type="number"
                  min="1"
                  max="10000"
                  value={formData.total_editions}
                  onChange={(e) => setFormData({ ...formData, total_editions: parseInt(e.target.value) })}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Lower edition counts increase collectibility
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={createCard.isPending}>
                {createCard.isPending ? "Creating..." : `Create Card (${materialInfo[formData.material].badge})`}
              </Button>
            </form>

            <div className="flex items-center justify-center">
              <div
                className="w-full max-w-sm aspect-[1.75/1] rounded-xl shadow-2xl p-6 flex flex-col justify-between"
                style={{
                  backgroundColor: formData.background_color,
                  color: formData.text_color,
                }}
              >
                <div>
                  <h3 className="text-2xl font-bold mb-1">{formData.card_name || "Card Preview"}</h3>
                  <p className="text-sm opacity-80">{formData.title || "Your Title"}</p>
                </div>
                <div>
                  <p className="font-semibold text-lg mb-2">{formData.company_name || "Company Name"}</p>
                  <div className="space-y-1 text-sm opacity-80">
                    <p>{formData.email || "email@example.com"}</p>
                    <p>{formData.phone || "+1 (555) 123-4567"}</p>
                    <p>{formData.website || "www.example.com"}</p>
                  </div>
                </div>
                <div className="flex justify-between items-end text-xs opacity-60">
                  <span className="capitalize">{formData.material}</span>
                  <span>Edition #1/{formData.total_editions}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}