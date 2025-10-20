import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Building2,
  Package,
  Users,
  Plus,
  Edit,
  ExternalLink,
  Mail,
  DollarSign,
  Trash2,
  Link as LinkIcon,
  Network
} from "lucide-react";
import { toast } from "sonner";
import { CompanyRelationshipManager } from "@/components/CompanyRelationshipManager";
import { CorporateStructureEducation } from "@/components/CorporateStructureEducation";

const PortfolioCompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [linkedContacts, setLinkedContacts] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showLinkContactDialog, setShowLinkContactDialog] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    category: "",
    pricing_model: "",
    base_price: "",
    target_audience: "",
    features: ""
  });
  const [selectedContactId, setSelectedContactId] = useState("");

  useEffect(() => {
    if (user && id) {
      loadData();
    }
  }, [user, id]);

  const loadData = async () => {
    if (!user || !id) return;
    setIsLoading(true);

    try {
      const [companyRes, productsRes, linkedRes, contactsRes] = await Promise.all([
        supabase
          .from("portfolio_companies")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("company_products")
          .select("*")
          .eq("company_id", id)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("company_contacts")
          .select(`
            *,
            crm_contacts(id, first_name, last_name, email, title, company_id)
          `)
          .eq("company_id", id)
          .eq("user_id", user.id),
        supabase
          .from("crm_contacts")
          .select("id, first_name, last_name, email, title")
          .eq("user_id", user.id)
          .order("first_name")
      ]);

      if (companyRes.error) throw companyRes.error;
      if (productsRes.error) throw productsRes.error;
      if (linkedRes.error) throw linkedRes.error;
      if (contactsRes.error) throw contactsRes.error;

      setCompany(companyRes.data);
      setProducts(productsRes.data || []);
      setLinkedContacts(linkedRes.data || []);
      setAllContacts(contactsRes.data || []);

    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load company data");
      navigate("/portfolio");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !id) return;

    try {
      const { error } = await supabase
        .from("company_products")
        .insert({
          company_id: id,
          user_id: user.id,
          name: productForm.name,
          description: productForm.description || null,
          category: productForm.category || null,
          pricing_model: productForm.pricing_model || null,
          base_price: productForm.base_price ? parseFloat(productForm.base_price) : null,
          target_audience: productForm.target_audience || null,
          features: productForm.features ? productForm.features.split(",").map(f => f.trim()) : []
        } as any);

      if (error) throw error;

      toast.success("Product added successfully");
      setShowProductDialog(false);
      setProductForm({
        name: "",
        description: "",
        category: "",
        pricing_model: "",
        base_price: "",
        target_audience: "",
        features: ""
      });
      loadData();
    } catch (error: any) {
      console.error("Error creating product:", error);
      toast.error(error.message || "Failed to create product");
    }
  };

  const handleLinkContact = async () => {
    if (!user || !id || !selectedContactId) return;

    try {
      const { error } = await supabase
        .from("company_contacts")
        .insert({
          company_id: id,
          contact_id: selectedContactId,
          user_id: user.id,
          relationship_type: "prospect"
        } as any);

      if (error) throw error;

      toast.success("Contact linked successfully");
      setShowLinkContactDialog(false);
      setSelectedContactId("");
      loadData();
    } catch (error: any) {
      console.error("Error linking contact:", error);
      toast.error(error.message || "Failed to link contact");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const { error } = await supabase
        .from("company_products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast.success("Product deleted");
      loadData();
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.message || "Failed to delete product");
    }
  };

  const handleUnlinkContact = async (linkId: string) => {
    if (!confirm("Are you sure you want to unlink this contact?")) return;

    try {
      const { error } = await supabase
        .from("company_contacts")
        .delete()
        .eq("id", linkId);

      if (error) throw error;

      toast.success("Contact unlinked");
      loadData();
    } catch (error: any) {
      console.error("Error unlinking contact:", error);
      toast.error(error.message || "Failed to unlink contact");
    }
  };

  const getCompanyTypeColor = (type: string) => {
    const colors = {
      owned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      affiliate: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      strategic_advisor: "bg-green-500/10 text-green-500 border-green-500/20",
      partner: "bg-orange-500/10 text-orange-500 border-orange-500/20"
    };
    return colors[type as keyof typeof colors] || colors.owned;
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gradient-depth flex items-center justify-center">Loading...</div>;
  }

  if (!company) {
    return <div className="min-h-screen bg-gradient-depth flex items-center justify-center">Company not found</div>;
  }

  const availableContacts = allContacts.filter(
    c => !linkedContacts.some(lc => lc.contact_id === c.id)
  );

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={company.name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div
                className="w-20 h-20 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                style={{ backgroundColor: company.primary_color }}
              >
                {company.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-4xl font-bold mb-2">{company.name}</h1>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={getCompanyTypeColor(company.company_type)}
                >
                  {company.company_type.replace("_", " ").toUpperCase()}
                </Badge>
                {!company.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => navigate("/portfolio")}>
            Back to Portfolio
          </Button>
        </div>

        {/* Company Info Card */}
        <Card className="p-6 mb-6 shadow-elevated border border-border">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Company Information</h3>
              {company.description && (
                <p className="text-sm text-muted-foreground mb-4">
                  {company.description}
                </p>
              )}
              <div className="space-y-2 text-sm">
                {company.website && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.commission_rate && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>{company.commission_rate}% commission rate</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Email Domains</h3>
              {company.email_domains && company.email_domains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {company.email_domains.map((domain: string, idx: number) => (
                    <Badge key={idx} variant="secondary">
                      <Mail className="w-3 h-3 mr-1" />
                      {domain}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No email domains configured</p>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="products">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products ({products.length})
            </TabsTrigger>
            <TabsTrigger value="contacts">
              <Users className="w-4 h-4 mr-2" />
              Contacts ({linkedContacts.length})
            </TabsTrigger>
            <TabsTrigger value="structure">
              <Network className="w-4 h-4 mr-2" />
              Structure
            </TabsTrigger>
            <TabsTrigger value="education">
              <Building2 className="w-4 h-4 mr-2" />
              Education
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Products & Services</h2>
              <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Product/Service</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          placeholder="e.g., Software, Hardware"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pricing_model">Pricing Model</Label>
                        <Input
                          id="pricing_model"
                          value={productForm.pricing_model}
                          onChange={(e) => setProductForm({ ...productForm, pricing_model: e.target.value })}
                          placeholder="e.g., Subscription, One-time"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="base_price">Base Price ($)</Label>
                        <Input
                          id="base_price"
                          type="number"
                          step="0.01"
                          value={productForm.base_price}
                          onChange={(e) => setProductForm({ ...productForm, base_price: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="target_audience">Target Audience</Label>
                        <Input
                          id="target_audience"
                          value={productForm.target_audience}
                          onChange={(e) => setProductForm({ ...productForm, target_audience: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="features">Features (comma-separated)</Label>
                      <Input
                        id="features"
                        value={productForm.features}
                        onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                        placeholder="Feature 1, Feature 2, Feature 3"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setShowProductDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Create Product</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {products.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add products or services that you offer through {company.name}
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <Card key={product.id} className="p-6 shadow-elevated border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{product.name}</h3>
                        {product.category && (
                          <Badge variant="outline">{product.category}</Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {product.description}
                      </p>
                    )}
                    <div className="space-y-2 text-sm">
                      {product.base_price && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>${product.base_price}</span>
                        </div>
                      )}
                      {product.features && product.features.length > 0 && (
                        <div className="pt-2 border-t border-border">
                          <p className="text-xs text-muted-foreground mb-1">Features:</p>
                          <div className="flex flex-wrap gap-1">
                            {product.features.slice(0, 3).map((feature: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {product.features.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{product.features.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Linked Contacts</h2>
              <Dialog open={showLinkContactDialog} onOpenChange={setShowLinkContactDialog}>
                <DialogTrigger asChild>
                  <Button disabled={availableContacts.length === 0}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Link Contact
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Link Contact to {company.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Select Contact</Label>
                      <Select value={selectedContactId} onValueChange={setSelectedContactId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a contact" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              {contact.first_name} {contact.last_name} - {contact.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setShowLinkContactDialog(false);
                          setSelectedContactId("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button onClick={handleLinkContact} disabled={!selectedContactId}>
                        Link Contact
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {linkedContacts.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Linked Contacts</h3>
                <p className="text-muted-foreground mb-6">
                  Link contacts from your CRM to track which prospects should hear about {company.name}
                </p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {linkedContacts.map((link: any) => (
                  <Card key={link.id} className="p-6 shadow-elevated border border-border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">
                          {link.crm_contacts.first_name} {link.crm_contacts.last_name}
                        </h3>
                        {link.crm_contacts.title && (
                          <p className="text-sm text-muted-foreground">{link.crm_contacts.title}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnlinkContact(link.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{link.crm_contacts.email}</span>
                      </div>
                      <Badge variant="outline">
                        {link.relationship_type}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Corporate Structure Tab */}
          <TabsContent value="structure" className="mt-6">
            <CompanyRelationshipManager 
              companyId={id!} 
              companyName={company.name}
            />
          </TabsContent>

          {/* Education Tab */}
          <TabsContent value="education" className="mt-6">
            <CorporateStructureEducation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PortfolioCompanyDetail;