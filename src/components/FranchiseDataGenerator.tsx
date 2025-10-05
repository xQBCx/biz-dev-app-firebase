import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sparkles, TrendingUp, Loader2 } from "lucide-react";

export function FranchiseDataGenerator({ onComplete }: { onComplete: () => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState("");

  // Major NAICS industry codes
  const naicsCodes = [
    { code: "72", name: "Food & Beverage Services" },
    { code: "44-45", name: "Retail Trade" },
    { code: "62", name: "Health & Fitness" },
    { code: "61", name: "Education & Training" },
    { code: "81", name: "Home & Personal Services" },
    { code: "441", name: "Automotive" },
    { code: "531", name: "Real Estate" },
    { code: "54", name: "Professional Services" },
    { code: "721", name: "Hospitality & Lodging" },
    { code: "56", name: "Business Support Services" },
  ];

  const generateFranchiseData = async () => {
    setIsGenerating(true);
    setProgress(0);
    
    try {
      const totalSteps = naicsCodes.length + 1; // +1 for future predictions
      let completed = 0;

      // Generate franchises for each NAICS code
      for (const { code, name } of naicsCodes) {
        setCurrentStep(`Generating ${name} franchises...`);
        
        const { error } = await supabase.functions.invoke("generate-franchise-data", {
          body: { naicsCode: code, count: 3 }
        });

        if (error) {
          console.error(`Error generating ${name}:`, error);
          toast.error(`Failed to generate ${name} franchises`);
        } else {
          toast.success(`Generated ${name} franchises`);
        }

        completed++;
        setProgress((completed / totalSteps) * 100);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Generate future predictions
      setCurrentStep("Generating future franchise predictions...");
      
      const { error: futureError } = await supabase.functions.invoke("generate-franchise-data", {
        body: { count: 5 }
      });

      if (futureError) {
        console.error("Error generating predictions:", futureError);
        toast.error("Failed to generate future predictions");
      } else {
        toast.success("Generated future franchise predictions");
      }

      completed++;
      setProgress(100);
      setCurrentStep("Complete!");

      toast.success("All franchise data generated successfully!");
      setTimeout(() => {
        onComplete();
      }, 1500);

    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate franchise data");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Card className="p-8 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div>
          <Sparkles className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h2 className="text-2xl font-bold mb-2">Generate Franchise Database</h2>
          <p className="text-muted-foreground">
            Populate the marketplace with diverse franchises across all industries, complete with SOPs and future predictions
          </p>
        </div>

        {isGenerating && (
          <div className="space-y-4">
            <Progress value={progress} className="w-full" />
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{currentStep}</span>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={generateFranchiseData}
            disabled={isGenerating}
            size="lg"
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate All Franchises
              </>
            )}
          </Button>

          <div className="text-xs text-muted-foreground">
            This will generate 30+ franchises across 10 industries plus 5 future predictions
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Powered by AI predictions & market analysis</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
