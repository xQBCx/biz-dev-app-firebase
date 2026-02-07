import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Pencil, Trash2, Package } from "lucide-react";
import { supabase } from "packages/supabase-client/src/client";
import { toast } from "sonner";
import { Product } from "@/stores/cartStore";

interface ProductFormData {
  title: string;
  description: string;
  handle: string;
  price: string;
  compare_at_price: string;
  inventory_quantity: string;
  product_type: string;
  is_active: boolean;
}

const defaultFormData: ProductFormData = {
  title: '',
  description: '',
  handle: '',
  price: '',
  compare_at_price: '',
  inventory_quantity: '0',
  product_type: '',
  is_active: true,
};

const AdminProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const generateHandle = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'title' && !editingProduct) {
        updated.handle = generateHandle(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const productData = {
        title: formData.title,
        description: formData.description || null,
        handle: formData.handle || generateHandle(formData.title),
        price: parseFloat(formData.price) || 0,
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        inventory_quantity: parseInt(formData.inventory_quantity) || 0,
        product_type: formData.product_type || null,
        is_active: formData.is_active,
      };

      if (editingProduct) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;
        toast.success('Product updated');
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;
        toast.success('Product created');
      }

      setIsDialogOpen(false);
      setEditingProduct(null);
      setFormData(defaultFormData);
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error(error.message || 'Failed to save product');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      description: product.description || '',
      handle: product.handle,
      price: product.price.toString(),
      compare_at_price: product.compare_at_price?.toString() || '',
      inventory_quantity: product.inventory_quantity.toString(),
      product_type: product.product_type || '',
      is_active: product.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.title}"? This cannot be undone.`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      toast.success('Product deleted');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/admin')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="font-display font-bold text-xl">Product Management</h1>
              <p className="text-xs text-primary-foreground/70">Add and manage shop products</p>
            </div>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary" onClick={handleNewProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Product title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="handle">URL Handle</Label>
                  <Input
                    id="handle"
                    name="handle"
                    value={formData.handle}
                    onChange={handleInputChange}
                    placeholder="product-url-handle"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price *</Label>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compare_at_price">Compare at Price</Label>
                    <Input
                      id="compare_at_price"
                      name="compare_at_price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.compare_at_price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="inventory_quantity">Inventory</Label>
                    <Input
                      id="inventory_quantity"
                      name="inventory_quantity"
                      type="number"
                      min="0"
                      value={formData.inventory_quantity}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="product_type">Type</Label>
                    <Input
                      id="product_type"
                      name="product_type"
                      value={formData.product_type}
                      onChange={handleInputChange}
                      placeholder="e.g. Apparel"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="is_active">Active</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving} className="flex-1">
                    {isSaving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products ({products.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center py-8 text-muted-foreground">Loading products...</p>
            ) : products.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No products yet</p>
                <Button onClick={handleNewProduct}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Inventory</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{product.title}</p>
                          <p className="text-sm text-muted-foreground">{product.product_type || 'No type'}</p>
                        </div>
                      </TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.inventory_quantity}</TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminProducts;
