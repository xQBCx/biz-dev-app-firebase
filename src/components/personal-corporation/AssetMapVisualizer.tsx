import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, Brain, Users, Lightbulb, DollarSign, Heart, Eye, Loader2 } from "lucide-react";

interface AssetMapVisualizerProps {
  snapshot: any;
  isLoading: boolean;
}

export const AssetMapVisualizer = ({ snapshot, isLoading }: AssetMapVisualizerProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const assetCategories = [
    {
      title: "Time Assets",
      icon: Clock,
      color: "text-blue-500",
      items: [
        { label: "Available Hours/Week", value: snapshot?.available_hours_weekly || 0, max: 168, unit: "hrs" },
        { label: "Peak Productivity Hours", value: (snapshot?.peak_productivity_hours as any[])?.length || 0, max: 24, unit: "hrs" },
      ]
    },
    {
      title: "Skills Assets",
      icon: Brain,
      color: "text-purple-500",
      items: [
        { label: "Skills Inventory", value: Array.isArray(snapshot?.skills_inventory) ? snapshot.skills_inventory.length : 0, max: 50, unit: "skills" },
        { label: "Avg Skill Score", value: Object.values(snapshot?.skill_scores || {}).reduce((a: number, b: any) => a + (Number(b) || 0), 0) / Math.max(Object.keys(snapshot?.skill_scores || {}).length, 1), max: 10, unit: "/10" },
      ]
    },
    {
      title: "Relationship Assets",
      icon: Users,
      color: "text-green-500",
      items: [
        { label: "Network Size", value: snapshot?.network_size || 0, max: 1000, unit: "contacts" },
        { label: "Relationship Strength", value: snapshot?.relationship_strength_avg || 0, max: 10, unit: "/10" },
        { label: "Key Relationships", value: (snapshot?.key_relationships as any[])?.length || 0, max: 50, unit: "VIPs" },
      ]
    },
    {
      title: "IP Assets",
      icon: Lightbulb,
      color: "text-yellow-500",
      items: [
        { label: "Spawned Businesses", value: snapshot?.spawned_businesses_count || 0, max: 20, unit: "businesses" },
        { label: "Content Pieces", value: snapshot?.content_pieces_count || 0, max: 500, unit: "pieces" },
        { label: "Documented Knowledge", value: snapshot?.documented_knowledge_count || 0, max: 100, unit: "docs" },
      ]
    },
    {
      title: "Capital Assets",
      icon: DollarSign,
      color: "text-emerald-500",
      items: [
        { label: "Total Earnings", value: snapshot?.total_earnings || 0, max: 100000, unit: "$", isCurrency: true },
        { label: "Pending Payouts", value: snapshot?.pending_payouts || 0, max: 10000, unit: "$", isCurrency: true },
        { label: "Credit Balance", value: snapshot?.credit_balance || 0, max: 10000, unit: "credits" },
      ]
    },
    {
      title: "Health/Energy Assets",
      icon: Heart,
      color: "text-red-500",
      items: [
        { label: "Energy Score", value: (snapshot?.energy_score || 0) * 10, max: 10, unit: "/10" },
        { label: "Sustainability Index", value: (snapshot?.sustainability_index || 0) * 10, max: 10, unit: "/10" },
      ]
    },
    {
      title: "Attention Assets",
      icon: Eye,
      color: "text-indigo-500",
      items: [
        { label: "Focus Capacity", value: (snapshot?.focus_capacity_score || 0) * 10, max: 10, unit: "/10" },
      ]
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Asset Map</CardTitle>
          <CardDescription>
            A comprehensive view of your personal assets across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assetCategories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="border-l-4" style={{ borderLeftColor: `var(--${category.color.replace('text-', '')})` }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className={`h-5 w-5 ${category.color}`} />
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {category.items.map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-medium">
                            {item.isCurrency ? `$${item.value.toLocaleString()}` : `${typeof item.value === 'number' ? item.value.toFixed(1) : item.value} ${item.unit}`}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((Number(item.value) / item.max) * 100, 100)} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Total Asset Value Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Estimated Asset Value</p>
              <p className="text-3xl font-bold text-primary">
                ${(snapshot?.total_asset_value || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Time: {snapshot?.available_hours_weekly || 0} hrs/wk</Badge>
              <Badge variant="outline">Network: {snapshot?.network_size || 0}</Badge>
              <Badge variant="outline">Businesses: {snapshot?.spawned_businesses_count || 0}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
