import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { toast } from 'sonner';

// Product types matching our Supabase schema
export interface Product {
  id: string;
  title: string;
  description: string | null;
  handle: string;
  price: number;
  compare_at_price: number | null;
  currency_code: string;
  is_active: boolean;
  inventory_quantity: number;
  product_type: string | null;
  vendor: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  url: string;
  alt_text: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  title: string;
  price: number;
  compare_at_price: number | null;
  sku: string | null;
  inventory_quantity: number;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  is_available: boolean;
}

export interface CartItem {
  product: Product;
  variantId: string | null;
  variantTitle: string;
  price: number;
  currencyCode: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isLoading: boolean;
  
  // Actions
  addItem: (item: CartItem) => void;
  updateQuantity: (itemKey: string, quantity: number) => void;
  removeItem: (itemKey: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  getItemKey: (item: CartItem) => string;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,

      getItemKey: (item: CartItem) => {
        return item.variantId || item.product.id;
      },

      addItem: (item) => {
        const { items, getItemKey } = get();
        const itemKey = getItemKey(item);
        const existingItem = items.find(i => getItemKey(i) === itemKey);
        
        if (existingItem) {
          set({
            items: items.map(i =>
              getItemKey(i) === itemKey
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            )
          });
        } else {
          set({ items: [...items, item] });
        }
        toast.success('Added to cart', { position: 'top-center' });
      },

      updateQuantity: (itemKey, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemKey);
          return;
        }
        
        const { getItemKey } = get();
        set({
          items: get().items.map(item =>
            getItemKey(item) === itemKey ? { ...item, quantity } : item
          )
        });
      },

      removeItem: (itemKey) => {
        const { getItemKey } = get();
        set({
          items: get().items.filter(item => getItemKey(item) !== itemKey)
        });
      },

      clearCart: () => {
        set({ items: [] });
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'xcoachx-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
