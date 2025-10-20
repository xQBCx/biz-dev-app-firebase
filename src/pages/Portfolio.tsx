import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Plus,
  Search,
  Package,
  Users,
  TrendingUp,
  Mail,
  ExternalLink,
  Edit,
  DollarSign
} from "lucide-react";
import { toast } from "sonner";

const Portfolio = () => {
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [companies, setCompanies] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("companies");
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    totalProducts: 0,
    linkedContacts: 0
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      loadPortfolioData();
    }
  }, [user]);

  const loadPortfolioData = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const [companiesRes, productsRes, contactsRes] = await Promise.all([
        supabase
          .from("portfolio_companies")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("company_products")
          .select("*, portfolio_companies(name)")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("company_contacts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
      ]);

      if (companiesRes.error) throw companiesRes.error;
      if (productsRes.error) throw productsRes.error;
      if (contactsRes.error) throw contactsRes.error;

      setCompanies(companiesRes.data || []);
      setProducts(productsRes.data || []);

      setStats({
        totalCompanies: companiesRes.data?.length || 0,
        activeCompanies: companiesRes.data?.filter(c => c.is_active).length || 0,
        totalProducts: productsRes.data?.length || 0,
        linkedContacts: contactsRes.count || 0
      });

    } catch (error) {
      console.error("Error loading portfolio data:", error);
      toast.error("Failed to load portfolio data");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCompanies = companies.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getCompanyTypeColor = (type: string) => {
    const colors = {
      owned: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      affiliate: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      strategic_advisor: "bg-green-500/10 text-green-500 border-green-500/20",
      partner: "bg-orange-500/10 text-orange-500 border-orange-500/20"
    };
    return colors[type as keyof typeof colors] || colors.owned;
  };

  const getCompanyTypeLabel = (type: string) => {
    const labels = {
      owned: "Owned",
      affiliate: "Affiliate",
      strategic_advisor: "Strategic Advisor",
      partner: "Partner"
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">My Portfolio</h1>
            <p className="text-muted-foreground">
              Manage your companies, products, and strategic relationships
            </p>
          </div>
          <Button onClick={() => navigate("/portfolio/companies/new")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Company
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 shadow-elevated border border-border">
            <Building2 className="w-6 h-6 mb-2 text-blue-500" />
            <div className="text-2xl font-bold mb-1">{stats.totalCompanies}</div>
            <div className="text-xs text-muted-foreground">Total Companies</div>
          </Card>
          <Card className="p-6 shadow-elevated border border-border">
            <TrendingUp className="w-6 h-6 mb-2 text-green-500" />
            <div className="text-2xl font-bold mb-1">{stats.activeCompanies}</div>
            <div className="text-xs text-muted-foreground">Active</div>
          </Card>
          <Card className="p-6 shadow-elevated border border-border">
            <Package className="w-6 h-6 mb-2 text-purple-500" />
            <div className="text-2xl font-bold mb-1">{stats.totalProducts}</div>
            <div className="text-xs text-muted-foreground">Products/Services</div>
          </Card>
          <Card className="p-6 shadow-elevated border border-border">
            <Users className="w-6 h-6 mb-2 text-orange-500" />
            <div className="text-2xl font-bold mb-1">{stats.linkedContacts}</div>
            <div className="text-xs text-muted-foreground">Linked Contacts</div>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search companies or products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="companies">
              <Building2 className="w-4 h-4 mr-2" />
              Companies
            </TabsTrigger>
            <TabsTrigger value="products">
              <Package className="w-4 h-4 mr-2" />
              Products
            </TabsTrigger>
          </TabsList>

          {/* Companies Tab */}
          <TabsContent value="companies" className="mt-6">
            {filteredCompanies.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Building2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Companies Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add your first company to start managing your portfolio
                </p>
                <Button onClick={() => navigate("/portfolio/companies/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Company
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <Card
                    key={company.id}
                    className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all cursor-pointer"
                    onClick={() => navigate(`/portfolio/companies/${company.id}`)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {company.logo_url ? (
                          <img
                            src={company.logo_url}
                            alt={company.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: company.primary_color }}
                          >
                            {company.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{company.name}</h3>
                          <Badge
                            variant="outline"
                            className={getCompanyTypeColor(company.company_type)}
                          >
                            {getCompanyTypeLabel(company.company_type)}
                          </Badge>
                        </div>
                      </div>
                      {!company.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    {company.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {company.website && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <ExternalLink className="w-4 h-4" />
                          <span className="truncate">{company.website}</span>
                        </div>
                      )}
                      {company.commission_rate && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span>{company.commission_rate}% commission</span>
                        </div>
                      )}
                      {company.email_domains?.length > 0 && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{company.email_domains[0]}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {products.filter(p => p.company_id === company.id).length} products
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/portfolio/companies/${company.id}/edit`);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-6">
            {filteredProducts.length === 0 ? (
              <Card className="p-12 text-center shadow-elevated border border-border">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Products Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Add products or services to your companies
                </p>
                {companies.length > 0 ? (
                  <Button onClick={() => navigate(`/portfolio/companies/${companies[0].id}`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Products
                  </Button>
                ) : (
                  <Button onClick={() => navigate("/portfolio/companies/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Company First
                  </Button>
                )}
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product: any) => (
                  <Card
                    key={product.id}
                    className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {product.portfolio_companies?.name}
                        </p>
                      </div>
                      {!product.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>

                    {product.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                        {product.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm">
                      {product.category && (
                        <Badge variant="outline">{product.category}</Badge>
                      )}
                      {product.base_price && (
                        <div className="flex items-center gap-2 text-muted-foreground mt-2">
                          <DollarSign className="w-4 h-4" />
                          <span>${product.base_price}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Portfolio;