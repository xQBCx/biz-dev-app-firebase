import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GenerateImageOptions {
  prompt: string;
  editImage?: string; // Base64 or URL of image to edit
}

interface GenerationResult {
  image: string;
  message?: string;
}

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async ({ prompt, editImage }: GenerateImageOptions): Promise<GenerationResult | null> => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt, editImage },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setGeneratedImage(data.image);
      return data;
    } catch (error: any) {
      console.error("Image generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearImage = () => setGeneratedImage(null);

  return {
    generateImage,
    isGenerating,
    generatedImage,
    clearImage,
  };
}
