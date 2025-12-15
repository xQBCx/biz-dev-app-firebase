import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  Briefcase, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Zap,
  Target,
  FileText,
  Calendar,
  MessageSquare
} from "lucide-react";

interface OnboardingTourProps {
  open: boolean;
  onComplete: () => void;
}

const tourSteps = [
  {
    id: "welcome",
    title: "Welcome to Biz Dev App! 🎉",
    description: "Your all-in-one platform for business development, AI-powered workflows, and smart automation.",
    icon: Sparkles,
    content: (
      <div className="space-y-4">
        <p className="text-muted-foreground">
          We're excited to have you on board! This quick tour will help you get started with the key features.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Building2 className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">Manage Entities</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Zap className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">AI Workflows</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">CRM & Contacts</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <Target className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-xs font-medium">Task Management</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: "ai-assistant",
    title: "Meet Biz & Dev",
    description: "Your AI assistants are ready to help you strategize and execute.",
    icon: MessageSquare,
    content: (
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 p-3 rounded-lg border">
            <Badge className="mb-2">Biz</Badge>
            <p className="text-xs text-muted-foreground">Strategic AI agent for business planning, funding, and scaling strategies.</p>
          </div>
          <div className="flex-1 p-3 rounded-lg border">
            <Badge variant="secondary" className="mb-2">Dev</Badge>
            <p className="text-xs text-muted-foreground">Execution AI agent for tools, workflows, automation, and technical setup.</p>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Use the chat on your dashboard to ask questions, create tasks, schedule meetings, and more!
        </p>
      </div>
    )
  },
  {
    id: "quick-actions",
    title: "Quick Actions",
    description: "Here are some things you can do right away:",
    icon: Zap,
    content: null // Will be rendered dynamically with navigation
  },
  {
    id: "complete",
    title: "You're All Set!",
    description: "Start exploring and building your business empire.",
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
          <h4 className="font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Pro Tip
          </h4>
          <p className="text-sm text-muted-foreground">
            Check the sidebar for AI-powered recommendations tailored to your activity. The more you use the platform, the smarter it gets!
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Need help? Just ask Biz or Dev in the chat, or explore the Tools section for all available features.
        </p>
      </div>
    )
  }
];

export const OnboardingTour = ({ open, onComplete }: OnboardingTourProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleQuickAction = (path: string) => {
    onComplete();
    navigate(path);
  };

  const currentTourStep = tourSteps[currentStep];
  const Icon = currentTourStep.icon;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-full bg-primary/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle>{currentTourStep.title}</DialogTitle>
              <DialogDescription>{currentTourStep.description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <div className="py-4">
          {currentTourStep.id === "quick-actions" ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Choose an action to get started, or continue the tour:
              </p>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3"
                onClick={() => handleQuickAction('/create-entity')}
              >
                <Building2 className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Create Your First Entity</p>
                  <p className="text-xs text-muted-foreground">Register a business, LLC, or corporation</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3"
                onClick={() => handleQuickAction('/crm')}
              >
                <Users className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Set Up Your CRM</p>
                  <p className="text-xs text-muted-foreground">Add contacts, companies, and deals</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3"
                onClick={() => handleQuickAction('/tasks')}
              >
                <Target className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Create Your First Task</p>
                  <p className="text-xs text-muted-foreground">Start organizing your work</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start h-auto py-3"
                onClick={() => handleQuickAction('/workflows')}
              >
                <Zap className="w-5 h-5 mr-3 text-primary" />
                <div className="text-left">
                  <p className="font-medium">Explore AI Workflows</p>
                  <p className="text-xs text-muted-foreground">Automate your business processes</p>
                </div>
                <ArrowRight className="w-4 h-4 ml-auto" />
              </Button>
            </div>
          ) : (
            currentTourStep.content
          )}
        </div>

        {/* Progress indicator */}
        <div className="flex items-center gap-1.5 mb-4 justify-center">
          {tourSteps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all ${
                idx === currentStep 
                  ? 'w-6 bg-primary' 
                  : idx < currentStep 
                    ? 'w-1.5 bg-primary/50' 
                    : 'w-1.5 bg-muted'
              }`} 
            />
          ))}
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext}>
            {currentStep === tourSteps.length - 1 ? "Get Started" : "Next"}
            {currentStep < tourSteps.length - 1 && <ArrowRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
