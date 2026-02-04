import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Store, Search, Star, TrendingUp, ShoppingCart, Tag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface App {
  id: string;
  app_name: string;
  app_slug: string;
  description: string;
  category: string;
  base_price: number;
  white_label_price: number;
  is_featured: boolean;
  is_white_label_ready: boolean;
  icon_url: string | null;
}

const SEED_APPS = [
  { name: "Habit Tracker", slug: "habit-tracker", category: "Productivity", price: 9.99, featured: true },
  { name: "Subscription Tracker", slug: "subscription-tracker", category: "Finance", price: 4.99, featured: true },
  { name: "AI Task Planner", slug: "ai-task-planner", category: "Productivity", price: 14.99, featured: true },
  { name: "Micro-Learning Hub", slug: "micro-learning", category: "Education", price: 19.99 },
  { name: "Wellness Companion", slug: "wellness-companion", category: "Wellness", price: 12.99 },
];

export default function AppStore() {
  const { session } = useAuth();
  const [apps, setApps] = useState<App[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
      const { data, error } = await supabase
        .from("app_registry")
        .select("*")
        .eq("is_published", true)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (error: any) {
      toast.error("Failed to load apps");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (app: App, isWhiteLabel: boolean = false) => {
    if (!session?.user?.id) {
      toast.error("Please log in to purchase apps");
      return;
    }

    try {
      // Create license
      const { error } = await supabase.from("app_licenses").insert({
        app_id: app.id,
        user_id: session.user.id,
        license_type: isWhiteLabel ? "white_label" : "direct",
        status: "active",
      });

      if (error) throw error;
      toast.success(`${app.app_name} purchased successfully!`);
    } catch (error: any) {
      toast.error(error.message || "Purchase failed");
    }
  };

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.app_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || app.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(apps.map(app => app.category)));

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Store className="h-8 w-8 text-primary" />
          App Store
        </h1>
        <p className="text-muted-foreground">
          Browse and purchase apps from the Biz Dev Ecosystem
        </p>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search apps..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Featured Apps Section */}
      {filteredApps.some(app => app.is_featured) && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Featured Apps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredApps.filter(app => app.is_featured).map(app => (
              <AppCard key={app.id} app={app} onPurchase={handlePurchase} />
            ))}
          </div>
        </div>
      )}

      {/* All Apps Grid */}
      <div className="mb-4">
        <h2 className="text-2xl font-semibold mb-4">All Apps</h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading apps...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No apps found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map(app => (
            <AppCard key={app.id} app={app} onPurchase={handlePurchase} />
          ))}
        </div>
      )}

      {/* Coming Soon Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SEED_APPS.slice(3).map(app => (
            <Card key={app.slug} className="opacity-60">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {app.name}
                  <Badge variant="secondary">Coming Soon</Badge>
                </CardTitle>
                <CardDescription>{app.category}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  This app is currently in development.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">${app.price}</span>
                  <span className="text-sm text-muted-foreground">/month</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button disabled className="w-full">Coming Soon</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function AppCard({ app, onPurchase }: { app: App; onPurchase: (app: App, isWhiteLabel: boolean) => void }) {
  return (
    <Card className="flex flex-col hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {app.app_name}
          {app.is_featured && <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />}
        </CardTitle>
        <CardDescription>
          <Badge variant="outline">{app.category}</Badge>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4">
          {app.description || "Transform your workflow with this powerful app."}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">${app.base_price}</span>
          <span className="text-sm text-muted-foreground">/month</span>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button className="w-full" onClick={() => onPurchase(app, false)}>
          <ShoppingCart className="h-4 w-4 mr-2" />
          Purchase
        </Button>
        {app.is_white_label_ready && (
          <Button variant="outline" className="w-full" onClick={() => onPurchase(app, true)}>
            <Tag className="h-4 w-4 mr-2" />
            White-Label ${app.white_label_price}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
