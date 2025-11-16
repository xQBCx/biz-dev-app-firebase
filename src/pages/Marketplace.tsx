import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag, Users, TrendingUp, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Marketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Performance-Based Marketplace
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Connect products with proven marketers. Results-driven partnerships where everyone wins.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <ShoppingBag className="h-5 w-5" />
                Active Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">127</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <Users className="h-5 w-5" />
                Verified Marketers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">89</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <TrendingUp className="h-5 w-5" />
                Active Partnerships
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">342</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <MessageSquare className="h-5 w-5" />
                Total Deals Closed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">1,247</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="products">Browse Products</TabsTrigger>
            <TabsTrigger value="marketers">Browse Marketers</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Product & Service Listings</CardTitle>
                    <CardDescription>
                      Find products that need your marketing expertise
                    </CardDescription>
                  </div>
                  {user && (
                    <Button onClick={() => navigate("/marketplace/listings/create")}>
                      Create Listing
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/marketplace/listings")}
                >
                  View All Product Listings
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="marketers">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Marketer Profiles</CardTitle>
                    <CardDescription>
                      Find proven marketers to promote your products
                    </CardDescription>
                  </div>
                  {user && (
                    <Button onClick={() => navigate("/marketplace/marketer/create")}>
                      Create Marketer Profile
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/marketplace/marketers")}
                >
                  View All Marketers
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* How It Works */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">1. Connect</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Product owners list their offerings. Marketers browse and request partnerships.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">2. Perform</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Marketers promote products using their proven strategies. Track performance in real-time.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-primary">3. Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Everyone wins with performance-based commissions. Results speak louder than promises.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
