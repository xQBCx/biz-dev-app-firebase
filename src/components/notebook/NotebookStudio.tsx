import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Headphones, 
  BookOpen, 
  FileText, 
  Presentation, 
  Network, 
  Loader2,
  Play,
  Download,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "sonner";

interface NotebookStudioProps {
  notebookId: string;
  sources: any[];
}

const outputTypes = [
  {
    id: "audio_overview",
    title: "Audio Overview",
    description: "Podcast-style audio summary of your sources",
    icon: Headphones,
    color: "bg-purple-500/10 text-purple-500",
  },
  {
    id: "study_guide",
    title: "Study Guide",
    description: "Structured guide with key concepts and definitions",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-500",
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Q&A flashcards for studying and review",
    icon: FileText,
    color: "bg-green-500/10 text-green-500",
  },
  {
    id: "briefing",
    title: "Briefing Document",
    description: "Concise executive summary of your sources",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    id: "slides",
    title: "Slide Deck",
    description: "Presentation slides with key points",
    icon: Presentation,
    color: "bg-pink-500/10 text-pink-500",
  },
  {
    id: "mind_map",
    title: "Mind Map",
    description: "Visual concept map of ideas and connections",
    icon: Network,
    color: "bg-cyan-500/10 text-cyan-500",
  },
];

export function NotebookStudio({ notebookId, sources }: NotebookStudioProps) {
  const queryClient = useQueryClient();
  const [selectedOutput, setSelectedOutput] = useState<any>(null);

  const { data: outputs = [] } = useQuery({
    queryKey: ["notebook-outputs", notebookId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notebook_outputs")
        .select("*")
        .eq("notebook_id", notebookId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (outputType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const response = await supabase.functions.invoke("notebook-generate-output", {
        body: {
          notebookId,
          outputType,
          sources: sources.filter(s => s.processing_status === "completed"),
        },
      });

      if (response.error) throw new Error(response.error.message);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notebook-outputs", notebookId] });
      toast.success("Generation started! This may take a minute.");
    },
    onError: (error) => {
      toast.error("Failed to generate: " + error.message);
    },
  });

  const completedSources = sources.filter(s => s.processing_status === "completed");
  const hasReadySources = completedSources.length > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Generate New */}
      <div>
        <h2 className="text-lg font-medium mb-4">Generate Content</h2>
        {!hasReadySources && (
          <p className="text-sm text-muted-foreground mb-4">
            Add and process some sources first to generate content.
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outputTypes.map((type) => (
            <Card
              key={type.id}
              className={`cursor-pointer hover:border-primary/50 transition-colors ${
                !hasReadySources ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => hasReadySources && generateMutation.mutate(type.id)}
            >
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base mt-3">{type.title}</CardTitle>
                <CardDescription className="text-sm">{type.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Generated Outputs */}
      {outputs.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4">Generated Content</h2>
          <div className="space-y-3">
            {outputs.map((output: any) => {
              const typeConfig = outputTypes.find(t => t.id === output.output_type);
              const Icon = typeConfig?.icon || FileText;

              return (
                <Card
                  key={output.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => setSelectedOutput(output)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig?.color || "bg-muted"}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{output.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(output.created_at).toLocaleDateString()} • {output.status}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {output.status === "completed" && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {output.status === "generating" && (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      )}
                      {output.status === "failed" && (
                        <XCircle className="h-5 w-5 text-destructive" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Output Viewer Dialog */}
      <Dialog open={!!selectedOutput} onOpenChange={() => setSelectedOutput(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{selectedOutput?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedOutput?.output_type === "audio_overview" && selectedOutput?.audio_url && (
              <div className="space-y-4">
                <audio controls className="w-full">
                  <source src={selectedOutput.audio_url} type="audio/mpeg" />
                </audio>
                <p className="text-sm">{selectedOutput.content?.transcript}</p>
              </div>
            )}

            {selectedOutput?.output_type === "flashcards" && (
              <div className="space-y-4">
                {(selectedOutput.content?.cards || []).map((card: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <p className="font-medium">Q: {card.question}</p>
                      <p className="text-muted-foreground">A: {card.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedOutput?.output_type === "study_guide" && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedOutput.content?.html || selectedOutput.content?.text || "" }} />
              </div>
            )}

            {selectedOutput?.output_type === "briefing" && (
              <div className="prose prose-sm max-w-none">
                <div dangerouslySetInnerHTML={{ __html: selectedOutput.content?.html || selectedOutput.content?.text || "" }} />
              </div>
            )}

            {selectedOutput?.output_type === "slides" && (
              <div className="space-y-4">
                {(selectedOutput.content?.slides || []).map((slide: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <h3 className="font-bold mb-2">{slide.title}</h3>
                      <ul className="list-disc pl-4 space-y-1">
                        {(slide.bullets || []).map((b: string, j: number) => (
                          <li key={j} className="text-sm">{b}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedOutput?.output_type === "mind_map" && (
              <div className="p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(selectedOutput.content, null, 2)}
                </pre>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}