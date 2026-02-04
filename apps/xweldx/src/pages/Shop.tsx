import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProductCard } from "@/components/shop/ProductCard";
import { DeviceSelector } from "@/components/shop/DeviceSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Glasses, 
  HardHat, 
  Wrench, 
  Flame,
  ShoppingBag,
  Package
} from "lucide-react";
import { fetchProducts, ShopifyProduct } from "@/lib/shopify";

const CATEGORIES = [
  { id: 'all', label: 'All Products', icon: ShoppingBag },
  { id: 'ar-glasses', label: 'AR Glasses', icon: Glasses, query: 'product_type:AR Glasses OR tag:ar-glasses' },
  { id: 'inspection', label: 'Inspection Equipment', icon: HardHat, query: 'product_type:Inspection OR tag:inspection' },
  { id: 'safety', label: 'Safety Gear', icon: HardHat, query: 'product_type:Safety OR tag:safety' },
  { id: 'welding', label: 'Welding Supplies', icon: Flame, query: 'product_type:Welding OR tag:welding' },
];

export default function Shop() {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, [activeCategory]);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const category = CATEGORIES.find(c => c.id === activeCategory);
      const data = await fetchProducts(50, category?.query);
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-accent/30 p-8 sm:p-12"
        >
          <div className="industrial-grid absolute inset-0 opacity-20" />
          <div className="relative z-10 max-w-2xl">
            <Badge variant="outline" className="mb-4 border-accent/50 text-accent">
              Industrial Equipment Store
            </Badge>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight">
              xWeldx Equipment
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-xl">
              Professional AR glasses, inspection tools, safety gear, and welding supplies for industrial pipe support inspection.
            </p>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-10 top-10 w-32 h-32 rounded-full bg-success/10 blur-2xl" />
        </motion.div>

        {/* AR Device Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <DeviceSelector />
        </motion.div>

        {/* Product Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent p-0">
              {CATEGORIES.map((category) => {
                const Icon = category.icon;
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground px-4 py-2 gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="steel-panel rounded-lg overflow-hidden">
                      <Skeleton className="aspect-square" />
                      <div className="p-4 space-y-3">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-8 w-1/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Error Loading Products</h3>
                  <p className="text-muted-foreground mb-4">{error}</p>
                  <Button variant="industrial" onClick={loadProducts}>
                    Try Again
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-xl font-bold mb-2">No Products Found</h3>
                  <p className="text-muted-foreground mb-4">
                    We're setting up our store. Tell us what equipment you need!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Try asking: "Add AR glasses product for $299" or "Create safety helmet product"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product, index) => (
                    <ProductCard key={product.node.id} product={product} index={index} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </AppLayout>
  );
}
