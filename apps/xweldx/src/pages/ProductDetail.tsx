import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ChevronLeft, 
  ShoppingCart, 
  Star, 
  Package,
  Check,
  Minus,
  Plus
} from "lucide-react";
import { fetchProductByHandle, ShopifyProduct, CartItem } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export default function ProductDetail() {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct] = useState<ShopifyProduct['node'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    if (handle) {
      loadProduct();
    }
  }, [handle]);

  const loadProduct = async () => {
    if (!handle) return;
    setIsLoading(true);
    try {
      const data = await fetchProductByHandle(handle);
      setProduct(data);
      if (data?.variants.edges[0]) {
        setSelectedVariant(data.variants.edges[0].node.id);
      }
    } catch (err) {
      console.error('Failed to load product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || !selectedVariant) return;

    const variant = product.variants.edges.find(v => v.node.id === selectedVariant)?.node;
    if (!variant) return;

    const cartItem: CartItem = {
      product: { node: product } as ShopifyProduct,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success(`Added ${product.title} to cart`, {
      position: "top-center"
    });
  };

  const currentVariant = product?.variants.edges.find(v => v.node.id === selectedVariant)?.node;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="grid lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!product) {
    return (
      <AppLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="text-xl font-bold mb-2">Product Not Found</h2>
            <p className="text-muted-foreground mb-4">The product you're looking for doesn't exist.</p>
            <Link to="/shop">
              <Button variant="industrial">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Shop
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ChevronLeft className="h-4 w-4" />
          Back to Shop
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="aspect-square rounded-xl overflow-hidden bg-secondary/20 border border-border">
              {product.images.edges[selectedImage]?.node ? (
                <img
                  src={product.images.edges[selectedImage].node.url}
                  alt={product.images.edges[selectedImage].node.altText || product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="h-24 w-24 text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {product.images.edges.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {product.images.edges.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-accent' : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <img
                      src={image.node.url}
                      alt={image.node.altText || `${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {product.productType && (
                <Badge variant="outline">{product.productType}</Badge>
              )}
              {product.tags?.includes('recommended') && (
                <Badge variant="success" className="gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Recommended
                </Badge>
              )}
            </div>

            {/* Title & Price */}
            <div>
              <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight">
                {product.title}
              </h1>
              <p className="text-3xl font-bold text-accent mt-2">
                ${parseFloat(currentVariant?.price.amount || product.priceRange.minVariantPrice.amount).toFixed(2)}
              </p>
            </div>

            {/* Description */}
            <p className="text-muted-foreground leading-relaxed">
              {product.description || "Premium industrial equipment for professional inspection workflows."}
            </p>

            {/* Variants */}
            {product.options.length > 0 && product.options[0].values.length > 1 && (
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.name}>
                    <label className="text-sm font-medium uppercase tracking-wider mb-2 block">
                      {option.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.variants.edges.map((variant) => {
                        const optionValue = variant.node.selectedOptions.find(o => o.name === option.name)?.value;
                        return (
                          <Button
                            key={variant.node.id}
                            variant={selectedVariant === variant.node.id ? "industrial" : "outline"}
                            size="sm"
                            onClick={() => setSelectedVariant(variant.node.id)}
                            disabled={!variant.node.availableForSale}
                          >
                            {optionValue}
                            {selectedVariant === variant.node.id && (
                              <Check className="h-4 w-4 ml-2" />
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="text-sm font-medium uppercase tracking-wider mb-2 block">
                Quantity
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-mono text-xl">{quantity}</span>
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
              variant="industrial"
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={!currentVariant?.availableForSale}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {currentVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
            </Button>

            {/* Features */}
            <div className="steel-panel rounded-lg p-4 space-y-2">
              <h3 className="font-bold uppercase tracking-wider text-sm">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  Industrial-grade quality
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  Compatible with xWeldx platform
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-success" />
                  Professional support included
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
