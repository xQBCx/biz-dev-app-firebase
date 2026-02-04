import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Minus, Plus, ShoppingBag } from "lucide-react";
import { CartDrawer } from "@/components/CartDrawer";
import { useCartStore, Product, ProductVariant } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProductDetail = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Fetch product by handle
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('handle', handle)
          .eq('is_active', true)
          .single();

        if (productError || !productData) {
          console.error('Error fetching product:', productError);
          setIsLoading(false);
          return;
        }

        // Fetch images
        const { data: imagesData } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', productData.id)
          .order('position', { ascending: true });

        // Fetch variants
        const { data: variantsData } = await supabase
          .from('product_variants')
          .select('*')
          .eq('product_id', productData.id);

        const fullProduct: Product = {
          ...productData,
          images: imagesData || [],
          variants: variantsData || [],
        };

        setProduct(fullProduct);
        if (variantsData && variantsData.length > 0) {
          setSelectedVariant(variantsData[0]);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (handle) {
      fetchProduct();
    }
  }, [handle]);

  const handleAddToCart = () => {
    if (!product) return;

    const price = selectedVariant?.price ?? product.price;

    addItem({
      product,
      variantId: selectedVariant?.id || null,
      variantTitle: selectedVariant?.title || 'Default',
      price,
      currencyCode: product.currency_code,
      quantity,
    });

    toast.success('Added to cart', {
      description: `${quantity}x ${product.title}`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => navigate('/shop')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <CartDrawer />
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product Not Found</h2>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const variants = product.variants || [];
  const currentPrice = selectedVariant?.price ?? product.price;
  const isAvailable = selectedVariant 
    ? selectedVariant.is_available 
    : product.inventory_quantity > 0;

  // Get unique options from variants
  const getUniqueOptions = () => {
    const options: { name: string; values: string[] }[] = [];
    
    if (variants.some(v => v.option1)) {
      const values = [...new Set(variants.map(v => v.option1).filter(Boolean))] as string[];
      if (values.length > 0) options.push({ name: 'Option 1', values });
    }
    if (variants.some(v => v.option2)) {
      const values = [...new Set(variants.map(v => v.option2).filter(Boolean))] as string[];
      if (values.length > 0) options.push({ name: 'Option 2', values });
    }
    if (variants.some(v => v.option3)) {
      const values = [...new Set(variants.map(v => v.option3).filter(Boolean))] as string[];
      if (values.length > 0) options.push({ name: 'Option 3', values });
    }
    
    return options;
  };

  const options = getUniqueOptions();

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/shop')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <span className="font-display font-bold">xCOACHx Shop</span>
          </div>
          <CartDrawer />
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 pb-24">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-muted rounded-xl overflow-hidden">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage].url}
                  alt={images[selectedImage].alt_text || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      selectedImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt={img.alt_text || ''}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">{product.title}</h1>
              <p className="text-2xl font-bold text-primary">
                ${currentPrice.toFixed(2)}
              </p>
              {product.compare_at_price && product.compare_at_price > currentPrice && (
                <p className="text-muted-foreground line-through">
                  ${product.compare_at_price.toFixed(2)}
                </p>
              )}
              {!isAvailable && (
                <Badge variant="secondary" className="mt-2">Sold Out</Badge>
              )}
            </div>

            {product.description && (
              <p className="text-muted-foreground">{product.description}</p>
            )}

            {/* Variants */}
            {variants.length > 1 && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Option</label>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((variant) => (
                      <Button
                        key={variant.id}
                        variant={selectedVariant?.id === variant.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.is_available}
                      >
                        {variant.title}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantity</label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              className="w-full"
              size="lg"
              disabled={!isAvailable}
              onClick={handleAddToCart}
            >
              {isAvailable ? 'Add to Cart' : 'Sold Out'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductDetail;
