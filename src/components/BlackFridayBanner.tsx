import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function BlackFridayBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: isBlackFriday } = useQuery({
    queryKey: ["black-friday-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_pricing_config")
        .select("black_friday_start, black_friday_end, black_friday_discount_percent")
        .eq("is_active", true)
        .single();
      
      if (error || !data) return null;

      const now = new Date();
      const start = data.black_friday_start ? new Date(data.black_friday_start) : null;
      const end = data.black_friday_end ? new Date(data.black_friday_end) : null;

      const isActive = start && end && now >= start && now <= end && data.black_friday_discount_percent > 0;
      
      return isActive 
        ? { active: true, discount: data.black_friday_discount_percent }
        : null;
    },
  });

  if (!isBlackFriday?.active || dismissed) return null;

  return (
    <div className="relative bg-gradient-to-r from-[hsl(var(--neon-pink))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-blue))] text-white py-3 px-6">
      <div className="container mx-auto flex items-center justify-center gap-3">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <p className="text-sm md:text-base font-semibold">
          🎉 Black Friday Special: {isBlackFriday.discount}% OFF Gift Cards – Limited Time Only!
        </p>
        <Sparkles className="w-5 h-5 animate-pulse" />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
        onClick={() => setDismissed(true)}
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
