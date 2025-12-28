import { useState } from 'react';
import { Radio, Trophy, TrendingUp, Plus, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BroadcastFeed } from '@/components/broadcast/BroadcastFeed';
import { AchievementSubmitForm } from '@/components/broadcast/AchievementSubmitForm';
import { BroadcastAnalytics } from '@/components/broadcast/BroadcastAnalytics';

export default function Broadcast() {
  const [showAchievementForm, setShowAchievementForm] = useState(false);
  const [activeTab, setActiveTab] = useState("feed");

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto py-6 px-4 space-y-6">
        {/* Hero */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Radio className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Universal Professional Network</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
            UPN Broadcast — The ESPN of Business. Stay informed with AI-curated industry news, 
            verified achievements, and interactive Q&A powered by your professional network.
          </p>
          
          {/* Submit Achievement Button */}
          <div className="mt-6">
            <Dialog open={showAchievementForm} onOpenChange={setShowAchievementForm}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Achievement
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <AchievementSubmitForm
                  onSuccess={() => setShowAchievementForm(false)}
                  onCancel={() => setShowAchievementForm(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Live Segments
              </CardTitle>
              <Radio className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">AI-Powered</div>
              <p className="text-xs text-muted-foreground">Real-time news curation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Achievements
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">BD-ID Verified</div>
              <p className="text-xs text-muted-foreground">Authenticated business wins</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sectors
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5 Industries</div>
              <p className="text-xs text-muted-foreground">Housing, Transport, Energy, Utilities, General</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content with Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
            <TabsTrigger value="feed" className="gap-2">
              <Radio className="h-4 w-4" />
              Live Feed
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="feed">
            <BroadcastFeed />
          </TabsContent>

          <TabsContent value="analytics">
            <BroadcastAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}