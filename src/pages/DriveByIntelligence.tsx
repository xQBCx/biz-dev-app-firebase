import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DriveByCapture } from "@/components/driveby/DriveByCapture";
import { DriveByQueue } from "@/components/driveby/DriveByQueue";
import { DriveByLeads } from "@/components/driveby/DriveByLeads";
import { DriveByCompanies } from "@/components/driveby/DriveByCompanies";
import { DriveByWorkItems } from "@/components/driveby/DriveByWorkItems";
import { DriveByPlaybooks } from "@/components/driveby/DriveByPlaybooks";
import { Camera, ListTodo, Building2, Users, Briefcase, BookOpen } from "lucide-react";

const DriveByIntelligence = () => {
  const [activeTab, setActiveTab] = useState("capture");

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Drive-By Intelligence</h1>
                <p className="text-muted-foreground mt-1">
                  Capture and convert real-world business opportunities on the go
                </p>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-6">
                <TabsTrigger value="capture" className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Capture
                </TabsTrigger>
                <TabsTrigger value="queue" className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  Queue
                </TabsTrigger>
                <TabsTrigger value="leads" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Leads
                </TabsTrigger>
                <TabsTrigger value="companies" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Companies
                </TabsTrigger>
                <TabsTrigger value="work" className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Work
                </TabsTrigger>
                <TabsTrigger value="playbooks" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Playbooks
                </TabsTrigger>
              </TabsList>

              <TabsContent value="capture" className="mt-6">
                <DriveByCapture />
              </TabsContent>
              <TabsContent value="queue" className="mt-6">
                <DriveByQueue />
              </TabsContent>
              <TabsContent value="leads" className="mt-6">
                <DriveByLeads />
              </TabsContent>
              <TabsContent value="companies" className="mt-6">
                <DriveByCompanies />
              </TabsContent>
              <TabsContent value="work" className="mt-6">
                <DriveByWorkItems />
              </TabsContent>
              <TabsContent value="playbooks" className="mt-6">
                <DriveByPlaybooks />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DriveByIntelligence;
