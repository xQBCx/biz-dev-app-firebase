import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Copy, 
  Share2, 
  Download,
  Loader2,
  ChevronRight,
  Building2,
  Users,
  FolderTree,
  Lightbulb,
  Shield,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface MasterWhitePaperButtonProps {
  className?: string;
}

export function MasterWhitePaperButton({ className }: MasterWhitePaperButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");

  const sections = [
    { id: "overview", name: "Platform Overview", icon: Building2 },
    { id: "architecture", name: "Architecture", icon: FolderTree },
    { id: "modules", name: "Core Modules", icon: Zap },
    { id: "ai", name: "AI Capabilities", icon: Lightbulb },
    { id: "security", name: "Security & Governance", icon: Shield },
    { id: "users", name: "User Management", icon: Users },
  ];

  const handleCopy = () => {
    const content = getMasterContent();
    navigator.clipboard.writeText(content);
    toast.success("Master white paper copied to clipboard");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/whitepaper/master`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard");
  };

  const handleDownload = () => {
    const content = getMasterContent();
    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "biz-dev-platform-whitepaper.md";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("White paper downloaded");
  };

  const handleTextToSpeech = () => {
    const content = getSectionContent(activeSection);
    
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(content);
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className={cn("gap-2 border-primary/20 hover:border-primary/50", className)}
        >
          <BookOpen className="w-4 h-4 text-primary" />
          Platform Documentation
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">Biz Dev Platform</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">Master White Paper</Badge>
                  <Badge variant="outline" className="text-xs">v1.0</Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleTextToSpeech}>
                {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-4 mt-4">
          {/* Navigation Sidebar */}
          <div className="col-span-1 space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition-colors",
                    activeSection === section.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {section.name}
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <ScrollArea className="col-span-3 h-[60vh] pr-4">
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap leading-relaxed">
                {getSectionContent(activeSection)}
              </div>
            </div>
          </ScrollArea>
        </div>

        <div className="flex items-center justify-between pt-4 border-t mt-4">
          <p className="text-xs text-muted-foreground">
            This documentation is automatically generated and maintained by the platform AI.
          </p>
          <Badge variant="outline" className="text-xs">
            Last synced: {new Date().toLocaleDateString()}
          </Badge>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getMasterContent(): string {
  return Object.keys(sectionContent).map(key => sectionContent[key as keyof typeof sectionContent]).join("\n\n---\n\n");
}

function getSectionContent(sectionId: string): string {
  return sectionContent[sectionId as keyof typeof sectionContent] || sectionContent.overview;
}

const sectionContent = {
  overview: `# Biz Dev Platform Overview

The Biz Dev Platform is a comprehensive business development and management ecosystem designed to transform how organizations operate, grow, and succeed.

## Vision
To create the most intelligent, integrated business development platform that treats every user as a "personal corporation" with measurable assets, optimized workflows, and AI-powered decision making.

## Core Philosophy
- **Unity Meridian Architecture**: A strategic framework treating users as economic entities with assets, liabilities, and workflows
- **Two Rails System**: Combining first-principles physics-based modeling with machine learning for optimal decisions
- **Embedding-Driven Intelligence**: Every action feeds user behavioral profiles for hyper-personalization

## Key Differentiators
1. **AI-First Design**: Every module leverages AI for automation, insights, and recommendations
2. **Ecosystem Integration**: Seamless connection between CRM, ERP, communication, and productivity tools
3. **Business Spawning**: Revolutionary capability to launch and manage businesses from within the platform
4. **Real-Time Adaptation**: The platform evolves with your business through continuous learning`,

  architecture: `# Platform Architecture

## System Design Principles

### Unity Meridian Framework
The platform follows the Unity Meridian vision where:
- Every user is modeled as a personal corporation
- Assets include time, skills, relationships, IP, money, health, and attention
- The system optimizes across all asset classes simultaneously

### Two Rails Decision Framework
1. **Physics Rail**: First-principles, explicit models for understanding and reasoning
   - Business logic and financial models
   - Contract enforcement and compliance
   - Infrastructure and governance

2. **ML Rail**: Big data and embeddings for prediction and personalization
   - Agent and tool recommendations
   - Deal and lead ranking
   - Pattern detection and anomaly flagging

### Data Architecture
- **Graph-Based Modeling**: Everything modeled as nodes and edges
- **Real-Time Event Processing**: Actions immediately update embeddings
- **Multi-Tenant Isolation**: Secure separation of business data`,

  modules: `# Core Modules

## Business Development
- **CRM**: Customer relationship management with AI-powered insights
- **Deal Room**: Structured deal negotiation with knowledge base integration
- **Service Offerings**: Manage and present your service catalog

## Operations
- **ERP Generator**: AI-generated organizational structures that auto-evolve
- **Workflows**: Custom automation with visual builders
- **Fleet Management**: Vehicle and asset tracking

## Intelligence
- **Research Studio**: NotebookLM-style document analysis and Q&A
- **AI Assistant**: Unified conversational interface for all platform actions
- **Analytics Dashboard**: Real-time business intelligence

## Productivity (The Grid)
- **Documents & Notes**: Collaborative content creation
- **Communication Hub**: Unified inbox and outreach tools
- **Calendar & Tasks**: Time management and scheduling

## Finance
- **Invoicing**: AI-powered billing and payment tracking
- **Expense Management**: Automated categorization and reporting
- **AI Gift Cards**: Unique monetary value exchange system`,

  ai: `# AI Capabilities

## Lovable AI Integration
The platform leverages Lovable AI for seamless model access without API key management.

### Available Models
- **Google Gemini 2.5 Pro**: Complex reasoning and multimodal analysis
- **Google Gemini 2.5 Flash**: Balanced speed and capability
- **OpenAI GPT-5**: Powerful reasoning for critical operations

### AI Features
1. **Intelligent Capture**: Multimodal input processing (files, voice, URLs)
2. **Tool Calling**: Structured actions from natural language
3. **Context-Aware Recommendations**: Personalized suggestions based on user behavior
4. **Proactive Notifications**: AI-initiated helpful alerts

### Learning Systems
- **Pattern Recognition**: Identifies successful workflows
- **Preference Learning**: Adapts to user communication style
- **Outcome Tracking**: Measures and optimizes AI suggestions`,

  security: `# Security & Governance

## Security Architecture
- **Row-Level Security (RLS)**: Fine-grained data access control
- **Role-Based Access Control (RBAC)**: Admin, user, and custom roles
- **Audit Logging**: Complete trail of all system actions

## Governance Framework
- **AI Guardrails**: Configurable limits on AI actions
- **Human Oversight**: Required approvals for high-impact decisions
- **Compliance Controls**: Built-in regulatory frameworks

## Data Protection
- **Encryption**: At-rest and in-transit protection
- **Data Lineage**: Track data origin and transformations
- **PII Detection**: Automatic identification of sensitive data

## Incident Management
- **Threat Intelligence**: Proactive threat monitoring
- **Incident Response**: Structured workflows for security events
- **Risk Register**: Ongoing risk assessment and mitigation`,

  users: `# User Management

## Role Hierarchy
- **Master Admin**: Full platform control and configuration
- **Admin**: Organizational management capabilities
- **Manager**: Team and project oversight
- **User**: Standard platform access
- **Client User**: Limited external access

## Permission System
- **Module-Level Control**: Enable/disable entire modules per user
- **Action-Level Permissions**: View, create, edit, delete granularity
- **Custom Roles**: Define specialized permission sets

## User Experience
- **Personalization Engine**: AI-powered recommendations
- **Adaptive Interface**: UI that learns user preferences
- **Multi-Workspace**: Manage multiple organizations

## Onboarding
- **Guided Setup**: Step-by-step configuration
- **Access Requests**: Controlled invitation system
- **Training Materials**: In-app documentation and guides`
};
