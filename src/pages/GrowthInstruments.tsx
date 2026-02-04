import { useState } from "react";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GrowthFundCreator } from "@/components/growth-instruments/GrowthFundCreator";
import { InvestmentAllocationPanel } from "@/components/growth-instruments/InvestmentAllocationPanel";
import { MilestoneTrackingSystem } from "@/components/growth-instruments/MilestoneTrackingSystem";
import { ROIDistributionEngine } from "@/components/growth-instruments/ROIDistributionEngine";
import { Sprout, TrendingUp, Target, DollarSign } from "lucide-react";

const GrowthInstruments = () => {
  const [activeTab, setActiveTab] = useState("create");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-fluid-lg font-bold text-foreground">Human Growth Instruments</h1>
                <p className="text-fluid-sm text-muted-foreground">
                  Performance-backed investments in human development
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="create" className="flex items-center gap-2">
                  <Sprout className="h-4 w-4" />
                  <span className="hidden sm:inline">Create Fund</span>
                </TabsTrigger>
                <TabsTrigger value="investments" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  <span className="hidden sm:inline">Investments</span>
                </TabsTrigger>
                <TabsTrigger value="milestones" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Milestones</span>
                </TabsTrigger>
                <TabsTrigger value="distributions" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span className="hidden sm:inline">ROI</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="create" className="space-y-4">
                <GrowthFundCreator />
              </TabsContent>

              <TabsContent value="investments" className="space-y-4">
                <InvestmentAllocationPanel />
              </TabsContent>

              <TabsContent value="milestones" className="space-y-4">
                <MilestoneTrackingSystem />
              </TabsContent>

              <TabsContent value="distributions" className="space-y-4">
                <ROIDistributionEngine />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default GrowthInstruments;
