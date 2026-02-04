import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { 
  Headphones, 
  BookOpen, 
  FileText, 
  Presentation, 
  Network, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Video,
  Image,
  Table2,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { ExportToProspectDialog } from "./ExportToProspectDialog";
import { InteractiveMindMap } from "./InteractiveMindMap";
import { ProfessionalSlideViewer } from "./ProfessionalSlideViewer";
import { AudioOverviewPlayer } from "./AudioOverviewPlayer";

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
    estimatedSeconds: 45,
  },
  {
    id: "video_script",
    title: "Video Script",
    description: "Professional video script with scenes and narration",
    icon: Video,
    color: "bg-red-500/10 text-red-500",
    estimatedSeconds: 40,
  },
  {
    id: "study_guide",
    title: "Study Guide",
    description: "Structured guide with key concepts and definitions",
    icon: BookOpen,
    color: "bg-blue-500/10 text-blue-500",
    estimatedSeconds: 30,
  },
  {
    id: "flashcards",
    title: "Flashcards",
    description: "Q&A flashcards for studying and review",
    icon: FileText,
    color: "bg-green-500/10 text-green-500",
    estimatedSeconds: 25,
  },
  {
    id: "quiz",
    title: "Quiz",
    description: "Interactive quiz to test knowledge retention",
    icon: HelpCircle,
    color: "bg-amber-500/10 text-amber-500",
    estimatedSeconds: 30,
  },
  {
    id: "briefing",
    title: "Briefing Document",
    description: "Concise executive summary of your sources",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-500",
    estimatedSeconds: 20,
  },
  {
    id: "slides",
    title: "Slide Deck",
    description: "Presentation slides with key points",
    icon: Presentation,
    color: "bg-pink-500/10 text-pink-500",
    estimatedSeconds: 30,
  },
  {
    id: "infographic",
    title: "Infographic Data",
    description: "Structured data for visual infographic creation",
    icon: Image,
    color: "bg-indigo-500/10 text-indigo-500",
    estimatedSeconds: 35,
  },
  {
    id: "data_table",
    title: "Data Tables",
    description: "Tabular summaries and comparative analysis",
    icon: Table2,
    color: "bg-teal-500/10 text-teal-500",
    estimatedSeconds: 25,
  },
  {
    id: "mind_map",
    title: "Mind Map",
    description: "Visual concept map of ideas and connections",
    icon: Network,
    color: "bg-cyan-500/10 text-cyan-500",
    estimatedSeconds: 25,
  },
];

interface GeneratingState {
  isGenerating: boolean;
  outputType: string;
  startTime: number;
  estimatedSeconds: number;
}

export function NotebookStudio({ notebookId, sources }: NotebookStudioProps) {
  const queryClient = useQueryClient();
  const [selectedOutput, setSelectedOutput] = useState<any>(null);
  const [generating, setGenerating] = useState<GeneratingState | null>(null);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [outputToExport, setOutputToExport] = useState<any>(null);

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

  // Progress timer effect
  useEffect(() => {
    if (!generating) {
      setProgress(0);
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const elapsed = (Date.now() - generating.startTime) / 1000;
      setElapsedTime(Math.floor(elapsed));
      
      // Smooth progress that slows down as it approaches 95%
      const estimatedProgress = Math.min(95, (elapsed / generating.estimatedSeconds) * 100);
      // Use easing function to slow down near the end
      const easedProgress = estimatedProgress < 80 
        ? estimatedProgress 
        : 80 + (estimatedProgress - 80) * 0.3;
      setProgress(easedProgress);
    }, 100);

    return () => clearInterval(interval);
  }, [generating]);

  const generateMutation = useMutation({
    mutationFn: async (outputType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const typeConfig = outputTypes.find(t => t.id === outputType);
      setGenerating({
        isGenerating: true,
        outputType,
        startTime: Date.now(),
        estimatedSeconds: typeConfig?.estimatedSeconds || 30,
      });

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
      setProgress(100);
      setTimeout(() => {
        setGenerating(null);
        queryClient.invalidateQueries({ queryKey: ["notebook-outputs", notebookId] });
        toast.success("Content generated successfully!");
      }, 500);
    },
    onError: (error) => {
      setGenerating(null);
      toast.error("Failed to generate: " + error.message);
    },
  });

  const completedSources = sources.filter(s => s.processing_status === "completed");
  const hasReadySources = completedSources.length > 0;

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEstimatedRemaining = () => {
    if (!generating) return "";
    const remaining = Math.max(0, generating.estimatedSeconds - elapsedTime);
    if (remaining === 0 && progress < 100) return "Almost done...";
    return `~${formatTime(remaining)} remaining`;
  };

  const getCurrentTypeConfig = () => {
    if (!generating) return null;
    return outputTypes.find(t => t.id === generating.outputType);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Generation Progress Dialog */}
      <Dialog open={generating?.isGenerating || false} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Generating {getCurrentTypeConfig()?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              {getCurrentTypeConfig() && (() => {
                const config = getCurrentTypeConfig();
                const IconComponent = config?.icon;
                return (
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config?.color}`}>
                    {IconComponent && <IconComponent className="h-6 w-6" />}
                  </div>
                );
              })()}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Analyzing your sources and creating content...
                </p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Elapsed: {formatTime(elapsedTime)}
                </span>
                <span className="text-muted-foreground">
                  {getEstimatedRemaining()}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                {progress < 30 && "Analyzing source content..."}
                {progress >= 30 && progress < 60 && "Generating content structure..."}
                {progress >= 60 && progress < 90 && "Finalizing output..."}
                {progress >= 90 && "Almost complete..."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Generate New */}
      <div>
        <h2 className="text-lg font-medium mb-4 text-foreground">Generate Content</h2>
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
                !hasReadySources || generating?.isGenerating ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={() => hasReadySources && !generating?.isGenerating && generateMutation.mutate(type.id)}
            >
              <CardHeader className="pb-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${type.color}`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base mt-3 text-foreground">{type.title}</CardTitle>
                <CardDescription className="text-sm">{type.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>

      {/* Generated Outputs */}
      {outputs.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4 text-foreground">Generated Content</h2>
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
                      <p className="font-medium text-foreground">{output.title}</p>
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-foreground">{selectedOutput?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto pr-2">
            {/* Audio Overview - Now with real audio player */}
            {selectedOutput?.output_type === "audio_overview" && (
              <AudioOverviewPlayer
                transcript={selectedOutput.content?.text || selectedOutput.content?.transcript || ""}
                audioUrl={selectedOutput.audio_url}
                outputId={selectedOutput.id}
              />
            )}

            {selectedOutput?.output_type === "flashcards" && (
              <div className="space-y-4">
                {(selectedOutput.content?.cards || []).map((card: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <p className="font-medium text-foreground">Q: {card.question}</p>
                      <p className="text-muted-foreground">A: {card.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedOutput?.output_type === "study_guide" && (
              <div className="prose prose-sm max-w-none text-foreground">
                <div dangerouslySetInnerHTML={{ __html: selectedOutput.content?.html || selectedOutput.content?.text || "" }} />
              </div>
            )}

            {selectedOutput?.output_type === "briefing" && (
              <div className="prose prose-sm max-w-none text-foreground">
                <div dangerouslySetInnerHTML={{ __html: selectedOutput.content?.html || selectedOutput.content?.text || "" }} />
              </div>
            )}

            {/* Slides - Now with professional viewer */}
            {selectedOutput?.output_type === "slides" && selectedOutput.content?.slides && (
              <ProfessionalSlideViewer
                slides={selectedOutput.content.slides}
                title={selectedOutput.title}
              />
            )}

            {/* Mind Map - Now interactive and expandable */}
            {selectedOutput?.output_type === "mind_map" && selectedOutput.content?.central && (
              <InteractiveMindMap data={selectedOutput.content} />
            )}
            
            {selectedOutput?.output_type === "mind_map" && !selectedOutput.content?.central && (
              <div className="p-4">
                <pre className="text-sm whitespace-pre-wrap text-foreground">
                  {JSON.stringify(selectedOutput.content, null, 2)}
                </pre>
              </div>
            )}

            {/* Video Script viewer */}
            {selectedOutput?.output_type === "video_script" && (
              <div className="space-y-4">
                {(selectedOutput.content?.scenes || []).map((scene: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4">
                      <p className="text-xs text-muted-foreground mb-1">Scene {i + 1}</p>
                      <h4 className="font-medium text-foreground mb-2">{scene.title}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{scene.visual}</p>
                      <p className="text-sm text-foreground italic">"{scene.narration}"</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Quiz viewer */}
            {selectedOutput?.output_type === "quiz" && (
              <div className="space-y-4">
                {(selectedOutput.content?.questions || []).map((q: any, i: number) => (
                  <Card key={i}>
                    <CardContent className="p-4 space-y-2">
                      <p className="font-medium text-foreground">{i + 1}. {q.question}</p>
                      <div className="space-y-1 pl-4">
                        {(q.options || []).map((opt: string, j: number) => (
                          <p key={j} className={`text-sm ${q.correct_index === j ? "text-green-600 font-medium" : "text-muted-foreground"}`}>
                            {String.fromCharCode(65 + j)}. {opt}
                          </p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Infographic Data viewer */}
            {selectedOutput?.output_type === "infographic" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {(selectedOutput.content?.metrics || []).map((m: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-primary">{m.value}</p>
                        <p className="text-sm text-muted-foreground">{m.label}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {selectedOutput.content?.sections && (
                  <div className="space-y-2">
                    {selectedOutput.content.sections.map((s: any, i: number) => (
                      <div key={i} className="border-l-2 border-primary pl-4">
                        <h4 className="font-medium text-foreground">{s.title}</h4>
                        <p className="text-sm text-muted-foreground">{s.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Data Table viewer */}
            {selectedOutput?.output_type === "data_table" && (
              <div className="space-y-4">
                {(selectedOutput.content?.tables || []).map((table: any, i: number) => (
                  <div key={i}>
                    <h4 className="font-medium text-foreground mb-2">{table.title}</h4>
                    <div className="border rounded-lg overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            {(table.headers || []).map((h: string, j: number) => (
                              <th key={j} className="px-3 py-2 text-left font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(table.rows || []).map((row: string[], ri: number) => (
                            <tr key={ri} className="border-t">
                              {row.map((cell: string, ci: number) => (
                                <td key={ci} className="px-3 py-2">{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOutputToExport(selectedOutput);
                setExportDialogOpen(true);
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Export to Prospect Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Export to Prospect Dialog */}
      {outputToExport && (
        <ExportToProspectDialog
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          output={outputToExport}
          notebookId={notebookId}
        />
      )}
    </div>
  );
}