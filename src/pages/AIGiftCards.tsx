import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Gift, Sparkles, Store, Search, Shield, Zap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import aiLogo from "@/assets/ai-gift-cards-logo.png";

export default function AIGiftCards() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [purchasingProduct, setPurchasingProduct] = useState<string | null>(null);

  const handleBuyNow = async (productId: string) => {
    setPurchasingProduct(productId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product_id: productId, quantity: 1 },
      });

      if (error) throw error;

      // Open Stripe checkout in new tab
      if (data.url) {
        window.open(data.url, "_blank");
        toast.success("Opening checkout...");
      }
    } catch (error: any) {
      console.error("Checkout error:", error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setPurchasingProduct(null);
    }
  };

  const { data: providers } = useQuery({
    queryKey: ["ai-providers-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_providers")
        .select("*")
        .eq("status", "approved")
        .order("display_name");
      
      if (error) throw error;
      return data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["ai-products-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_products")
        .select(`
          *,
          ai_providers (
            id,
            display_name,
            logo_url,
            primary_color
          )
        `)
        .eq("status", "active")
        .order("retail_price");
      
      if (error) throw error;
      return data;
    },
  });

  const filteredProducts = products?.filter(product => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      product.name.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.ai_providers?.display_name.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Neon Theme */}
      <section className="relative overflow-hidden py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--neon-blue))]/10 via-[hsl(var(--neon-purple))]/10 to-[hsl(var(--neon-pink))]/10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--neon-blue))/0.1,transparent_50%)]" />
        
        <div className="container mx-auto relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto space-y-8">
            <img 
              src={aiLogo} 
              alt="AI Gift Cards" 
              className="w-48 h-48 object-contain drop-shadow-[0_0_40px_hsl(var(--neon-blue))]"
            />
            
            <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--neon-blue))] via-[hsl(var(--neon-purple))] to-[hsl(var(--neon-pink))]">
              AI Gift Cards
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl">
              Give the gift of AI. Digital and physical gift cards for ChatGPT, Gemini, Grok, and more. Perfect for events, rewards, and celebrations.
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-[hsl(var(--neon-blue))] hover:bg-[hsl(var(--neon-blue))]/80 text-white shadow-[var(--shadow-neon-blue)] transition-all"
              >
                <Gift className="mr-2 h-5 w-5" />
                Shop Digital Cards
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="border-[hsl(var(--neon-purple))] text-[hsl(var(--neon-purple))] hover:bg-[hsl(var(--neon-purple))]/10"
                onClick={() => navigate("/ai-gift-cards/provider-portal")}
              >
                <Store className="mr-2 h-5 w-5" />
                Become a Provider
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-card/50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-[hsl(var(--neon-blue))]/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Sparkles className="w-12 h-12 mb-4 text-[hsl(var(--neon-blue))]" />
                <CardTitle>Instant Delivery</CardTitle>
                <CardDescription>
                  Digital vouchers delivered instantly via email. No waiting, start using AI credits immediately.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[hsl(var(--neon-purple))]/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Shield className="w-12 h-12 mb-4 text-[hsl(var(--neon-purple))]" />
                <CardTitle>Secure & Simple</CardTitle>
                <CardDescription>
                  Each card has a unique QR code and redemption URL. Secure, trackable, and easy to use.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-[hsl(var(--neon-pink))]/20 bg-card/50 backdrop-blur">
              <CardHeader>
                <Zap className="w-12 h-12 mb-4 text-[hsl(var(--neon-pink))]" />
                <CardTitle>Perfect for Events</CardTitle>
                <CardDescription>
                  Bulk orders available for corporate events, trade shows, and customer appreciation.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Available AI Credits</h2>
                <p className="text-muted-foreground">
                  Choose from {providers?.length || 0} trusted AI providers
                </p>
              </div>
              
              <div className="w-full md:w-96">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search providers or products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {filteredProducts && filteredProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card 
                    key={product.id} 
                    className="overflow-hidden border-border/50 hover:border-[hsl(var(--neon-blue))]/50 transition-all hover:shadow-[var(--shadow-neon-blue)]"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3 mb-2">
                        {product.ai_providers?.logo_url && (
                          <img 
                            src={product.ai_providers.logo_url} 
                            alt={product.ai_providers.display_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {product.ai_providers?.display_name}
                          </p>
                        </div>
                      </div>
                      
                      {product.is_featured && (
                        <Badge variant="secondary" className="w-fit">
                          <Sparkles className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">
                        {product.description}
                      </p>
                      
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">
                          ${Number(product.retail_price).toFixed(2)}
                        </span>
                        <span className="text-lg text-muted-foreground">
                          / ${Number(product.face_value).toFixed(2)} credits
                        </span>
                      </div>
                    </CardContent>
                    
                    <CardFooter>
                      <Button 
                        className="w-full bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))] hover:opacity-90"
                        onClick={() => handleBuyNow(product.id)}
                        disabled={purchasingProduct === product.id}
                      >
                        <Gift className="mr-2 h-4 w-4" />
                        {purchasingProduct === product.id ? "Processing..." : "Buy Now"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <Gift className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No Products Available Yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for AI gift cards from top providers.
                </p>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-[hsl(var(--neon-blue))]/10 via-[hsl(var(--neon-purple))]/10 to-[hsl(var(--neon-pink))]/10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Become an AI Provider</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our marketplace and reach customers looking for AI credits. We handle the payments, you provide the value.
          </p>
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-[hsl(var(--neon-purple))] text-[hsl(var(--neon-purple))] hover:bg-[hsl(var(--neon-purple))]/10"
            onClick={() => navigate("/ai-gift-cards/provider-portal")}
          >
            <Store className="mr-2 h-5 w-5" />
            Apply as Provider
          </Button>
        </div>
      </section>
    </div>
  );
}
