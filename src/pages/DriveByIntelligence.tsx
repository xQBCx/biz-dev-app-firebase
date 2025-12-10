import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Drive-By Intelligence</h1>
        <p className="text-muted-foreground mt-1">
          Capture and convert real-world business opportunities on the go
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-full overflow-x-auto justify-start">
          <TabsTrigger value="capture" className="flex items-center gap-2 flex-shrink-0">
            <Camera className="h-4 w-4" />
            <span className="hidden sm:inline">Capture</span>
          </TabsTrigger>
          <TabsTrigger value="queue" className="flex items-center gap-2 flex-shrink-0">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Queue</span>
          </TabsTrigger>
          <TabsTrigger value="leads" className="flex items-center gap-2 flex-shrink-0">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Leads</span>
          </TabsTrigger>
          <TabsTrigger value="companies" className="flex items-center gap-2 flex-shrink-0">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Companies</span>
          </TabsTrigger>
          <TabsTrigger value="work" className="flex items-center gap-2 flex-shrink-0">
            <Briefcase className="h-4 w-4" />
            <span className="hidden sm:inline">Work</span>
          </TabsTrigger>
          <TabsTrigger value="playbooks" className="flex items-center gap-2 flex-shrink-0">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">Playbooks</span>
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
  );
};

export default DriveByIntelligence;
