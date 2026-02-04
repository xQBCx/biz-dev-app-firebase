import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingBag, Plus } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartStore, Product } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Shop = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch products with their images
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (productsError) {
          console.error('Error fetching products:', productsError);
          toast.error('Failed to load products');
          return;
        }

        // Fetch images for all products
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .order('position', { ascending: true });

        // Fetch variants for all products
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*');

        // Combine products with their images and variants
        const productsWithMedia = (productsData || []).map(product => ({
          ...product,
          images: imagesData?.filter(img => img.product_id === product.id) || [],
          variants: variantsData?.filter(v => v.product_id === product.id) || [],
        }));

        setProducts(productsWithMedia);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (product: Product) => {
    const variant = product.variants?.[0];
    const price = variant?.price ?? product.price;
    
    addItem({
      product,
      variantId: variant?.id || null,
      variantTitle: variant?.title || 'Default',
      price,
      currencyCode: product.currency_code,
      quantity: 1,
    });

    toast.success('Added to cart', {
      description: product.title,
    });
  };

  const categories = [
    { id: 'equipment', label: 'Equipment', icon: '🏋️' },
    { id: 'apparel', label: 'Apparel', icon: '👕' },
    { id: 'supplements', label: 'Supplements', icon: '💊' },
    { id: 'footwear', label: 'Footwear', icon: '👟' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl">xCOACHx Shop</h1>
              <p className="text-xs text-primary-foreground/70">Gear up for your fitness journey</p>
            </div>
          </div>
          <CartDrawer />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 pb-24">
        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-xl p-8 mb-8">
          <h2 className="font-display text-3xl font-bold mb-2">Train Better. Gear Up.</h2>
          <p className="text-primary-foreground/80 max-w-xl">
            Premium workout equipment, apparel, supplements, and more to fuel your fitness goals.
          </p>
        </div>

        {/* Categories */}
        <div className="flex gap-3 overflow-x-auto pb-4 mb-8">
          {categories.map(cat => (
            <Button 
              key={cat.id}
              variant="outline" 
              className="flex-shrink-0 gap-2"
            >
              <span>{cat.icon}</span>
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-square" />
                <CardContent className="p-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Products Yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              We're stocking up! Products will be available soon. Check back later or tell us what you'd like to see.
            </p>
            <Button variant="outline" onClick={() => navigate('/coach-chat')}>
              Request Products
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => {
              const image = product.images?.[0];
              const variant = product.variants?.[0];
              const price = variant?.price ?? product.price;
              const isAvailable = variant ? variant.is_available : product.inventory_quantity > 0;

              return (
                <Card 
                  key={product.id} 
                  className="overflow-hidden group cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => navigate(`/shop/product/${product.handle}`)}
                >
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {image ? (
                      <img
                        src={image.url}
                        alt={image.alt_text || product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    {!isAvailable && (
                      <Badge variant="secondary" className="absolute top-2 left-2">
                        Sold Out
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-medium truncate mb-1">{product.title}</h3>
                    <p className="text-lg font-bold text-primary">
                      ${price.toFixed(2)}
                    </p>
                    <Button
                      className="w-full mt-3"
                      size="sm"
                      disabled={!isAvailable}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddToCart(product);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Shop;
