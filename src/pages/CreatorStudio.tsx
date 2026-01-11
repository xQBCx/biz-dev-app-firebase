import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrandLicensingEngine } from "@/components/creator-studio/BrandLicensingEngine";
import { PassiveIncomeSpawner } from "@/components/creator-studio/PassiveIncomeSpawner";
import { ContentWhiteLabelSystem } from "@/components/creator-studio/ContentWhiteLabelSystem";
import { CreatorAnalytics } from "@/components/creator-studio/CreatorAnalytics";
import { Palette, Award, Zap, FileText, BarChart3 } from "lucide-react";

const CreatorStudio = () => {
  const [activeTab, setActiveTab] = useState("licensing");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Palette className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-fluid-lg font-bold text-foreground">Creator Studio</h1>
                <p className="text-fluid-sm text-muted-foreground">
                  Transform influence into sustainable operator infrastructure
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="licensing" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span className="hidden sm:inline">Licensing</span>
                </TabsTrigger>
                <TabsTrigger value="passive" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  <span className="hidden sm:inline">Passive Income</span>
                </TabsTrigger>
                <TabsTrigger value="content" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Content</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="licensing" className="space-y-4">
                <BrandLicensingEngine />
              </TabsContent>

              <TabsContent value="passive" className="space-y-4">
                <PassiveIncomeSpawner />
              </TabsContent>

              <TabsContent value="content" className="space-y-4">
                <ContentWhiteLabelSystem />
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <CreatorAnalytics />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CreatorStudio;
