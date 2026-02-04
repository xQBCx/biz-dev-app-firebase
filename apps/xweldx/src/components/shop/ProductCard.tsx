import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, Star } from "lucide-react";
import { ShopifyProduct, CartItem } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface ProductCardProps {
  product: ShopifyProduct;
  index?: number;
}

export const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore(state => state.addItem);
  const { node } = product;
  
  const firstVariant = node.variants.edges[0]?.node;
  const price = parseFloat(node.priceRange.minVariantPrice.amount);
  const imageUrl = node.images.edges[0]?.node?.url;
  const isRecommended = node.tags?.includes('recommended');

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!firstVariant) return;

    const cartItem: CartItem = {
      product,
      variantId: firstVariant.id,
      variantTitle: firstVariant.title,
      price: firstVariant.price,
      quantity: 1,
      selectedOptions: firstVariant.selectedOptions || []
    };
    
    addItem(cartItem);
    toast.success(`Added ${node.title} to cart`, {
      position: "top-center"
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <Link to={`/shop/product/${node.handle}`} className="block group">
        <div className="steel-panel rounded-lg overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-[0_0_30px_hsla(24,96%,53%,0.2)]">
          {/* Image */}
          <div className="relative aspect-square bg-secondary/20 overflow-hidden">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={node.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Eye className="h-12 w-12 text-muted-foreground/30" />
              </div>
            )}
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {isRecommended && (
                <Badge variant="success" className="gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Recommended
                </Badge>
              )}
              {node.productType && (
                <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">
                  {node.productType}
                </Badge>
              )}
            </div>
            
            {/* Quick Add Button */}
            <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
              <Button 
                variant="industrial" 
                className="w-full"
                onClick={handleAddToCart}
                disabled={!firstVariant?.availableForSale}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg truncate group-hover:text-accent transition-colors">
              {node.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {node.description || "Premium industrial equipment"}
            </p>
            <div className="flex items-center justify-between mt-4">
              <span className="text-2xl font-bold text-accent">
                ${price.toFixed(2)}
              </span>
              {!firstVariant?.availableForSale && (
                <Badge variant="outline" className="text-destructive border-destructive">
                  Out of Stock
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
