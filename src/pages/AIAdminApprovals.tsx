import { useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, XCircle, Clock, ExternalLink, Mail, Phone, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AIAdminApprovals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch pending providers
  const { data: pendingProviders } = useQuery({
    queryKey: ["ai-providers-pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_providers")
        .select(`
          *,
          ai_provider_applications (*)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  // Fetch pending products
  const { data: pendingProducts } = useQuery({
    queryKey: ["ai-products-pending"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_products")
        .select(`
          *,
          ai_providers (
            display_name,
            company_name
          )
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isAdmin,
  });

  const approveProviderMutation = useMutation({
    mutationFn: async (providerId: string) => {
      const { error } = await supabase
        .from("ai_providers")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          approved_by: user!.id,
        })
        .eq("id", providerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-providers-pending"] });
      toast({
        title: "Provider Approved",
        description: "The provider has been approved and can now add products.",
      });
      setSelectedProvider(null);
      setAdminNotes("");
    },
  });

  const rejectProviderMutation = useMutation({
    mutationFn: async ({ providerId, reason }: { providerId: string; reason: string }) => {
      const { error } = await supabase
        .from("ai_providers")
        .update({
          status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", providerId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-providers-pending"] });
      toast({
        title: "Provider Rejected",
        description: "The provider application has been rejected.",
        variant: "destructive",
      });
      setSelectedProvider(null);
      setAdminNotes("");
    },
  });

  const approveProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from("ai_products")
        .update({
          status: "active",
          approved_at: new Date().toISOString(),
          approved_by: user!.id,
        })
        .eq("id", productId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-products-pending"] });
      toast({
        title: "Product Approved",
        description: "The product is now live in the marketplace.",
      });
    },
  });

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-6 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-muted-foreground mb-6">
                You don't have permission to access this page.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[hsl(var(--neon-blue))] to-[hsl(var(--neon-purple))]">
            AI Gift Cards Admin
          </h1>
          <p className="text-lg text-muted-foreground">
            Review and approve provider applications and products
          </p>
        </div>

        <Tabs defaultValue="providers" className="space-y-6">
          <TabsList>
            <TabsTrigger value="providers">
              <Clock className="mr-2 h-4 w-4" />
              Pending Providers ({pendingProviders?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="products">
              <Clock className="mr-2 h-4 w-4" />
              Pending Products ({pendingProducts?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="providers" className="space-y-6">
            {pendingProviders && pendingProviders.length > 0 ? (
              pendingProviders.map((provider) => (
                <Card key={provider.id} className="border-[hsl(var(--neon-blue))]/20">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {provider.display_name}
                          <Badge variant="secondary">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending Review
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {provider.company_name}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        {provider.website && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => window.open(provider.website, "_blank")}
                          >
                            <Globe className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{provider.description}</p>
                    </div>

                    {provider.ai_provider_applications && provider.ai_provider_applications[0] && (
                      <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Contact Information
                          </h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Name:</strong> {provider.ai_provider_applications[0].contact_name}</p>
                            <p><strong>Email:</strong> {provider.ai_provider_applications[0].contact_email}</p>
                            {provider.ai_provider_applications[0].contact_phone && (
                              <p><strong>Phone:</strong> {provider.ai_provider_applications[0].contact_phone}</p>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Proposed Terms</h4>
                          <div className="space-y-1 text-sm">
                            <p><strong>Wholesale:</strong> {(provider.ai_provider_applications[0].application_data as any)?.wholesale_percent || 'N/A'}% of face value</p>
                            <p><strong>Affiliate:</strong> {(provider.ai_provider_applications[0].application_data as any)?.affiliate_percent || 'N/A'}% lifetime</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">API Endpoint</p>
                        <p className="text-sm truncate">{provider.api_endpoint || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Redemption URL</p>
                        <p className="text-sm truncate">{provider.redemption_url || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Webhook URL</p>
                        <p className="text-sm truncate">{provider.webhook_url || "Not provided"}</p>
                      </div>
                    </div>

                    {selectedProvider === provider.id ? (
                      <div className="space-y-4 pt-4 border-t">
                        <Textarea
                          placeholder="Add admin notes or rejection reason..."
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => approveProviderMutation.mutate(provider.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (!adminNotes.trim()) {
                                toast({
                                  title: "Rejection Reason Required",
                                  description: "Please provide a reason for rejection.",
                                  variant: "destructive",
                                });
                                return;
                              }
                              rejectProviderMutation.mutate({ 
                                providerId: provider.id, 
                                reason: adminNotes 
                              });
                            }}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedProvider(null);
                              setAdminNotes("");
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedProvider(provider.id)}
                      >
                        Review Application
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    No pending provider applications to review.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            {pendingProducts && pendingProducts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProducts.map((product) => (
                  <Card key={product.id} className="border-[hsl(var(--neon-purple))]/20">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        {product.name}
                        <Badge variant="secondary">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {product.ai_providers?.display_name}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      
                      <div className="space-y-2 p-3 bg-muted/50 rounded">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Face Value:</span>
                          <span className="font-semibold">${Number(product.face_value).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Wholesale:</span>
                          <span className="font-semibold">${Number(product.wholesale_price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Retail:</span>
                          <span className="font-semibold">${Number(product.retail_price).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Margin:</span>
                          <span className="font-semibold text-green-600">
                            {(((Number(product.retail_price) - Number(product.wholesale_price)) / Number(product.retail_price)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => approveProductMutation.mutate(product.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-600" />
                  <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
                  <p className="text-muted-foreground">
                    No pending products to review.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
