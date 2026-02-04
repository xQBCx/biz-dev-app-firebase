import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GenerateVideoOptions {
  prompt: string;
  aspectRatio?: "16:9" | "9:16" | "1:1";
  loop?: boolean;
}

interface GenerationResult {
  id: string;
  state: "pending" | "processing" | "completed" | "failed";
  video?: { url: string };
  failure_reason?: string;
}

export function useVideoGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationResult | null>(null);

  const generateVideo = async ({ prompt, aspectRatio = "16:9", loop = false }: GenerateVideoOptions) => {
    setIsGenerating(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { prompt, aspectRatio, loop },
      });

      if (error) throw error;

      if (data.error) {
        if (data.code === "NO_API_KEY") {
          toast({
            title: "API Key Required",
            description: "Please add your Luma AI API key in settings to use video generation.",
            variant: "destructive",
          });
        } else {
          throw new Error(data.error);
        }
        return null;
      }

      setGenerationId(data.id);
      setStatus(data);

      toast({
        title: "Video Generation Started",
        description: "Your video is being generated. This may take a few minutes.",
      });

      return data;
    } catch (error: any) {
      console.error("Video generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start video generation.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const checkStatus = async (id?: string) => {
    const checkId = id || generationId;
    if (!checkId) return null;

    try {
      const { data, error } = await supabase.functions.invoke("check-generation-status", {
        body: { generationId: checkId },
      });

      if (error) throw error;

      setStatus(data);
      return data;
    } catch (error: any) {
      console.error("Status check error:", error);
      return null;
    }
  };

  const pollStatus = async (id?: string, interval = 5000, maxAttempts = 60) => {
    const checkId = id || generationId;
    if (!checkId) return null;

    let attempts = 0;

    return new Promise<GenerationResult | null>((resolve) => {
      const poll = async () => {
        attempts++;
        const result = await checkStatus(checkId);

        if (!result || attempts >= maxAttempts) {
          resolve(result);
          return;
        }

        if (result.state === "completed" || result.state === "failed") {
          if (result.state === "completed") {
            toast({
              title: "Video Ready",
              description: "Your video has been generated successfully!",
            });
          } else {
            toast({
              title: "Generation Failed",
              description: result.failure_reason || "Video generation failed.",
              variant: "destructive",
            });
          }
          resolve(result);
          return;
        }

        setTimeout(poll, interval);
      };

      poll();
    });
  };

  return {
    generateVideo,
    checkStatus,
    pollStatus,
    isGenerating,
    generationId,
    status,
  };
}
