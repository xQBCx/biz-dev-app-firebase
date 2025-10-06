import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Package, DollarSign } from "lucide-react";

export default function ProviderDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewProduct, setShowNewProduct] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    sku: "",
    face_value: "",
    wholesale_price: "",
    retail_price: "",
    stock_quantity: "",
    valid_days: "365",
    card_type: "digital" as const,
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadProviderData();
  }, [user, navigate]);

  const loadProviderData = async () => {
    try {
      const { data: providerData, error: providerError } = await supabase
        .from("ai_providers")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (providerError) throw providerError;
      setProvider(providerData);

      const { data: productsData, error: productsError } = await supabase
        .from("ai_products")
        .select("*")
        .eq("provider_id", providerData.id)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);
    } catch (error: any) {
      console.error("Error loading provider data:", error);
      toast.error("Failed to load provider data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!provider) return;

    try {
      const { error } = await supabase.from("ai_products").insert({
        provider_id: provider.id,
        name: newProduct.name,
        description: newProduct.description,
        sku: newProduct.sku,
        face_value: parseFloat(newProduct.face_value),
        wholesale_price: parseFloat(newProduct.wholesale_price),
        retail_price: parseFloat(newProduct.retail_price),
        stock_quantity: parseInt(newProduct.stock_quantity),
        valid_days: parseInt(newProduct.valid_days),
        card_type: newProduct.card_type,
        status: "pending",
      });

      if (error) throw error;

      toast.success("Product created! Awaiting admin approval.");
      setShowNewProduct(false);
      setNewProduct({
        name: "",
        description: "",
        sku: "",
        face_value: "",
        wholesale_price: "",
        retail_price: "",
        stock_quantity: "",
        valid_days: "365",
        card_type: "digital",
      });
      loadProviderData();
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>No Provider Account</CardTitle>
              <CardDescription>
                You need to apply as a provider first.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/ai-provider-portal")}>
                Apply as Provider
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Provider Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your AI gift card products
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.filter((p) => p.status === "active").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {products.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Your Products</CardTitle>
                <CardDescription>
                  Manage your AI gift card offerings
                </CardDescription>
              </div>
              <Button onClick={() => setShowNewProduct(!showNewProduct)}>
                <Plus className="mr-2 h-4 w-4" />
                New Product
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showNewProduct && (
              <div className="mb-6 p-4 border rounded-lg space-y-4">
                <h3 className="font-semibold">Create New Product</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Product Name</Label>
                    <Input
                      value={newProduct.name}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, name: e.target.value })
                      }
                      placeholder="e.g., $50 ChatGPT Credits"
                    />
                  </div>
                  <div>
                    <Label>SKU</Label>
                    <Input
                      value={newProduct.sku}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, sku: e.target.value })
                      }
                      placeholder="e.g., GPT-50"
                    />
                  </div>
                  <div>
                    <Label>Face Value ($)</Label>
                    <Input
                      type="number"
                      value={newProduct.face_value}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, face_value: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Wholesale Price ($)</Label>
                    <Input
                      type="number"
                      value={newProduct.wholesale_price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, wholesale_price: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Retail Price ($)</Label>
                    <Input
                      type="number"
                      value={newProduct.retail_price}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, retail_price: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Stock Quantity</Label>
                    <Input
                      type="number"
                      value={newProduct.stock_quantity}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stock_quantity: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Valid Days</Label>
                    <Input
                      type="number"
                      value={newProduct.valid_days}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, valid_days: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>Card Type</Label>
                    <Select
                      value={newProduct.card_type}
                      onValueChange={(value: any) =>
                        setNewProduct({ ...newProduct, card_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="physical">Physical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label>Description</Label>
                    <Textarea
                      value={newProduct.description}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateProduct}>Create Product</Button>
                  <Button variant="outline" onClick={() => setShowNewProduct(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku} | Stock: {product.stock_quantity}
                    </p>
                    <p className="text-sm">
                      Face Value: ${product.face_value} | Retail: ${product.retail_price}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm ${
                        product.status === "active"
                          ? "bg-green-100 text-green-800"
                          : product.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {product.status}
                    </span>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No products yet. Create your first product!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
