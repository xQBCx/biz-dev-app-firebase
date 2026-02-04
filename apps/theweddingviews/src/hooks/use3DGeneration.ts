import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Generate3DFromImageOptions {
  imageUrl: string;
}

interface Generate3DFromPromptOptions {
  prompt: string;
}

interface GenerationResult {
  id: string;
  state: "pending" | "processing" | "completed" | "failed";
  model?: { url: string };
  failure_reason?: string;
}

export function use3DGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [status, setStatus] = useState<GenerationResult | null>(null);

  const generateFromImage = async ({ imageUrl }: Generate3DFromImageOptions) => {
    setIsGenerating(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-3d", {
        body: { imageUrl, mode: "image-to-3d" },
      });

      if (error) throw error;

      if (data.error) {
        if (data.code === "NO_API_KEY") {
          toast({
            title: "API Key Required",
            description: "Please add your Luma AI API key in settings to use 3D generation.",
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
        title: "3D Generation Started",
        description: "Your 3D model is being generated. This may take a few minutes.",
      });

      return data;
    } catch (error: any) {
      console.error("3D generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start 3D generation.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateFromPrompt = async ({ prompt }: Generate3DFromPromptOptions) => {
    setIsGenerating(true);
    setStatus(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-3d", {
        body: { prompt, mode: "prompt-to-3d" },
      });

      if (error) throw error;

      if (data.error) {
        if (data.code === "NO_API_KEY") {
          toast({
            title: "API Key Required",
            description: "Please add your Luma AI API key in settings to use 3D generation.",
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
        title: "3D Generation Started",
        description: "Your 3D model is being generated. This may take a few minutes.",
      });

      return data;
    } catch (error: any) {
      console.error("3D generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to start 3D generation.",
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

  const pollStatus = async (id?: string, interval = 5000, maxAttempts = 120) => {
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
              title: "3D Model Ready",
              description: "Your 3D model has been generated successfully!",
            });
          } else {
            toast({
              title: "Generation Failed",
              description: result.failure_reason || "3D generation failed.",
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
    generateFromImage,
    generateFromPrompt,
    checkStatus,
    pollStatus,
    isGenerating,
    generationId,
    status,
  };
}
