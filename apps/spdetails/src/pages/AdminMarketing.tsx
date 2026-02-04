import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  Megaphone, 
  FileText, 
  Search, 
  TrendingUp,
  Building2,
  Car,
  Home,
  Briefcase,
  Trophy
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function AdminMarketing() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeCampaigns: 0,
    contentPieces: 0,
    trackedKeywords: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [leadsRes, campaignsRes, contentRes, keywordsRes] = await Promise.all([
      supabase.from('marketing_leads').select('id', { count: 'exact', head: true }),
      supabase.from('marketing_campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('marketing_content').select('id', { count: 'exact', head: true }),
      supabase.from('seo_keywords').select('id', { count: 'exact', head: true })
    ]);

    setStats({
      totalLeads: leadsRes.count || 0,
      activeCampaigns: campaignsRes.count || 0,
      contentPieces: contentRes.count || 0,
      trackedKeywords: keywordsRes.count || 0
    });
  };

  const quickActions = [
    { title: "Lead Generation", description: "Build prospect lists for Houston businesses", icon: Users, href: "/admin/marketing/leads", color: "bg-blue-500" },
    { title: "Campaigns", description: "Create and manage outreach campaigns", icon: Megaphone, href: "/admin/marketing/campaigns", color: "bg-green-500" },
    { title: "Content Creator", description: "Generate social posts, emails, and ads", icon: FileText, href: "/admin/marketing/content", color: "bg-purple-500" },
    { title: "SEO & Analytics", description: "Track keywords and website performance", icon: Search, href: "/admin/marketing/seo", color: "bg-orange-500" },
  ];

  const leadCategories = [
    { title: "Office Buildings", count: 0, icon: Building2, type: "office_building" },
    { title: "Golf Courses", count: 0, icon: Trophy, type: "golf_course" },
    { title: "High-Income Neighborhoods", count: 0, icon: Home, type: "high_income_neighborhood" },
    { title: "Dealerships", count: 0, icon: Car, type: "dealership_small" },
    { title: "Fleet Companies", count: 0, icon: Briefcase, type: "fleet_company" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Hub</h1>
        <p className="text-muted-foreground">Manage leads, campaigns, content, and SEO from one place</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLeads}</div>
            <p className="text-xs text-muted-foreground">Prospects in database</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Megaphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">Running campaigns</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Content Pieces</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.contentPieces}</div>
            <p className="text-xs text-muted-foreground">Posts, emails, ads</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tracked Keywords</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.trackedKeywords}</div>
            <p className="text-xs text-muted-foreground">SEO keywords</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card 
            key={action.title} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(action.href)}
          >
            <CardHeader>
              <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-2`}>
                <action.icon className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg">{action.title}</CardTitle>
              <CardDescription>{action.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Target Markets */}
      <Card>
        <CardHeader>
          <CardTitle>Target Markets - Harris County & Houston</CardTitle>
          <CardDescription>Build prospect lists for each category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {leadCategories.map((category) => (
              <Button
                key={category.type}
                variant="outline"
                className="h-auto py-4 flex flex-col items-center gap-2"
                onClick={() => navigate(`/admin/marketing/leads?type=${category.type}`)}
              >
                <category.icon className="h-8 w-8" />
                <span className="text-sm font-medium">{category.title}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>Follow these steps to launch your marketing</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Build Lead Lists:</strong> Go to Lead Generation to add prospects for office buildings, dealerships, golf courses, etc.</li>
            <li><strong>Create Content:</strong> Use AI Content Creator to generate social posts, emails, and ad copy tailored to each audience.</li>
            <li><strong>Launch Campaigns:</strong> Set up email, SMS, or social campaigns targeting your lead lists.</li>
            <li><strong>Track Performance:</strong> Monitor SEO keywords and campaign analytics to optimize your reach.</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
