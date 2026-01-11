import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TalentProfiles } from "@/components/talent-network/TalentProfiles";
import { TalentInitiatives } from "@/components/talent-network/TalentInitiatives";
import { TalentMatching } from "@/components/talent-network/TalentMatching";
import { VisionGenerator } from "@/components/talent-network/VisionGenerator";
import { Users, Target, Sparkles, FileVideo } from "lucide-react";

export default function TalentNetwork() {
  const [activeTab, setActiveTab] = useState("profiles");

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Talent Network</h1>
        <p className="text-muted-foreground mt-1">
          Match influencers, professionals, and executives to your initiatives with AI-powered research and multi-modal vision delivery.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="profiles" className="gap-2">
            <Users className="h-4 w-4" />
            Talent Profiles
          </TabsTrigger>
          <TabsTrigger value="initiatives" className="gap-2">
            <Target className="h-4 w-4" />
            Initiatives
          </TabsTrigger>
          <TabsTrigger value="matching" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Matching
          </TabsTrigger>
          <TabsTrigger value="vision" className="gap-2">
            <FileVideo className="h-4 w-4" />
            Vision Studio
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profiles">
          <TalentProfiles />
        </TabsContent>

        <TabsContent value="initiatives">
          <TalentInitiatives />
        </TabsContent>

        <TabsContent value="matching">
          <TalentMatching />
        </TabsContent>

        <TabsContent value="vision">
          <VisionGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
