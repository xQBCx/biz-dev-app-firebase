import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Headphones, 
  Video, 
  Presentation, 
  FileText, 
  PieChart, 
  HelpCircle,
  Loader2,
  Sparkles,
  Clock,
  CheckCircle,
  Play
} from "lucide-react";

const OUTPUT_FORMATS = [
  {
    id: "audio_overview",
    title: "Audio Overview",
    description: "Podcast-style explanation of the opportunity",
    icon: Headphones,
    color: "bg-purple-500/10 text-purple-500",
    estimatedSeconds: 45,
  },
  {
    id: "video_script",
    title: "Video Script",
    description: "Script for a video presentation",
    icon: Video,
    color: "bg-red-500/10 text-red-500",
    estimatedSeconds: 35,
  },
  {
    id: "slide_deck",
    title: "Slide Deck",
    description: "Key points in presentation format",
    icon: Presentation,
    color: "bg-blue-500/10 text-blue-500",
    estimatedSeconds: 30,
  },
  {
    id: "infographic",
    title: "Infographic Data",
    description: "Visual summary with key metrics",
    icon: PieChart,
    color: "bg-green-500/10 text-green-500",
    estimatedSeconds: 25,
  },
  {
    id: "executive_brief",
    title: "Executive Brief",
    description: "Concise written summary for professionals",
    icon: FileText,
    color: "bg-orange-500/10 text-orange-500",
    estimatedSeconds: 20,
  },
  {
    id: "flashcards",
    title: "Flashcards/Quiz",
    description: "Interactive Q&A to help understand the opportunity",
    icon: HelpCircle,
    color: "bg-cyan-500/10 text-cyan-500",
    estimatedSeconds: 25,
  },
];

const LEARNING_STYLE_QUESTIONS = [
  {
    question: "When learning something new, do you prefer to:",
    options: [
      { value: "audio", label: "Listen to someone explain it" },
      { value: "video", label: "Watch a demonstration" },
      { value: "text", label: "Read about it" },
      { value: "interactive", label: "Try it hands-on" },
    ],
  },
  {
    question: "In a meeting, you're most engaged when:",
    options: [
      { value: "audio", label: "There's a good discussion" },
      { value: "slides", label: "There are visual slides" },
      { value: "text", label: "There's a detailed document" },
      { value: "infographic", label: "There are charts and data" },
    ],
  },
];

export function VisionGenerator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const { data: matches = [] } = useQuery({
    queryKey: ["talent-matches-for-vision", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("talent_initiative_matches")
        .select("*, crm_contacts(*), talent_initiatives(*)")
        .eq("user_id", user?.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const generateMutation = useMutation({
    mutationFn: async ({ matchId, format }: { matchId: string; format: string }) => {
      setIsGenerating(true);
      setProgress(0);
      
      const interval = setInterval(() => {
        setProgress((p) => Math.min(95, p + 5));
      }, 500);

      try {
        const response = await supabase.functions.invoke("talent-generate-vision", {
          body: { matchId, format },
        });
        
        clearInterval(interval);
        setProgress(100);
        
        if (response.error) throw new Error(response.error.message);
        return response.data;
      } catch (e) {
        clearInterval(interval);
        throw e;
      }
    },
    onSuccess: (data) => {
      setGeneratedContent(data);
      setIsGenerating(false);
      toast.success("Vision content generated!");
    },
    onError: (error) => {
      setIsGenerating(false);
      toast.error("Generation failed: " + error.message);
    },
  });

  const selectedMatchData = matches.find((m: any) => m.id === selectedMatch);
  const selectedFormatData = OUTPUT_FORMATS.find((f) => f.id === selectedFormat);

  const determinePreferredFormat = () => {
    // Simple algorithm based on quiz answers
    const counts: Record<string, number> = {};
    Object.values(quizAnswers).forEach((answer) => {
      counts[answer] = (counts[answer] || 0) + 1;
    });
    
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const topStyle = sorted[0][0];
      const formatMap: Record<string, string> = {
        audio: "audio_overview",
        video: "video_script",
        slides: "slide_deck",
        text: "executive_brief",
        infographic: "infographic",
        interactive: "flashcards",
      };
      return formatMap[topStyle] || "executive_brief";
    }
    return "executive_brief";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Vision Studio</h2>
        <p className="text-sm text-muted-foreground">
          Generate personalized vision materials to present opportunities in the format that works best for each talent
        </p>
      </div>

      {/* Match Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Select Match</CardTitle>
          <CardDescription>Choose which talent-initiative match to create vision materials for</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedMatch} onValueChange={setSelectedMatch}>
            <SelectTrigger>
              <SelectValue placeholder="Select a match" />
            </SelectTrigger>
            <SelectContent>
              {matches.map((match: any) => (
                <SelectItem key={match.id} value={match.id}>
                  {match.crm_contacts?.first_name} {match.crm_contacts?.last_name} → {match.talent_initiatives?.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedMatch && (
        <>
          {/* Learning Style Quiz */}
          {!selectedMatchData?.crm_contacts?.preferred_learning_style && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Determine Learning Style
                </CardTitle>
                <CardDescription>
                  Help us understand how {selectedMatchData?.crm_contacts?.first_name} prefers to receive information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => setShowQuiz(true)}>
                  Take Learning Style Quiz
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Format Selection */}
          <div>
            <h3 className="text-base font-medium mb-4">Select Output Format</h3>
            {selectedMatchData?.crm_contacts?.preferred_learning_style && (
              <p className="text-sm text-muted-foreground mb-4">
                💡 {selectedMatchData?.crm_contacts?.first_name} prefers: <Badge variant="outline">{selectedMatchData?.crm_contacts?.preferred_learning_style}</Badge>
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {OUTPUT_FORMATS.map((format) => (
                <Card
                  key={format.id}
                  className={`cursor-pointer transition-all ${
                    selectedFormat === format.id 
                      ? "border-primary ring-2 ring-primary/20" 
                      : "hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedFormat(format.id)}
                >
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${format.color}`}>
                      <format.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base mt-3">{format.title}</CardTitle>
                    <CardDescription className="text-sm">{format.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          {selectedFormat && (
            <Button 
              size="lg" 
              className="w-full gap-2"
              onClick={() => generateMutation.mutate({ matchId: selectedMatch, format: selectedFormat })}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Sparkles className="h-5 w-5" />
              )}
              Generate {selectedFormatData?.title} for {selectedMatchData?.crm_contacts?.first_name}
            </Button>
          )}
        </>
      )}

      {/* Generation Progress Dialog */}
      <Dialog open={isGenerating}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Generating {selectedFormatData?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              {selectedFormatData && (
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${selectedFormatData.color}`}>
                  <selectedFormatData.icon className="h-6 w-6" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Creating personalized vision for {selectedMatchData?.crm_contacts?.first_name}...
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              {progress < 30 && "Analyzing initiative details..."}
              {progress >= 30 && progress < 60 && "Researching talent background..."}
              {progress >= 60 && progress < 90 && "Generating content..."}
              {progress >= 90 && "Finalizing..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Learning Style Quiz Dialog */}
      <Dialog open={showQuiz} onOpenChange={setShowQuiz}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Learning Style Assessment</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-6 py-4">
              {LEARNING_STYLE_QUESTIONS.map((q, idx) => (
                <div key={idx} className="space-y-3">
                  <Label className="text-sm font-medium">{q.question}</Label>
                  <RadioGroup
                    value={quizAnswers[idx] || ""}
                    onValueChange={(v) => setQuizAnswers({ ...quizAnswers, [idx]: v })}
                  >
                    {q.options.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value} id={`${idx}-${opt.value}`} />
                        <Label htmlFor={`${idx}-${opt.value}`} className="font-normal">
                          {opt.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
              <Button 
                className="w-full"
                onClick={() => {
                  const recommended = determinePreferredFormat();
                  setSelectedFormat(recommended);
                  setShowQuiz(false);
                  toast.success(`Recommended format: ${OUTPUT_FORMATS.find(f => f.id === recommended)?.title}`);
                }}
                disabled={Object.keys(quizAnswers).length < LEARNING_STYLE_QUESTIONS.length}
              >
                Get Recommendation
              </Button>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Generated Content Display */}
      {generatedContent && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Generated Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[400px]">
              {generatedContent.format === "flashcards" ? (
                <div className="space-y-3">
                  {generatedContent.content?.cards?.map((card: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <p className="font-medium">Q: {card.question}</p>
                        <p className="text-muted-foreground mt-2">A: {card.answer}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : generatedContent.format === "slide_deck" ? (
                <div className="space-y-4">
                  {generatedContent.content?.slides?.map((slide: any, i: number) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <h4 className="font-bold mb-2">Slide {i + 1}: {slide.title}</h4>
                        <ul className="list-disc pl-4 space-y-1">
                          {slide.bullets?.map((b: string, j: number) => (
                            <li key={j} className="text-sm">{b}</li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{generatedContent.content?.text || JSON.stringify(generatedContent.content, null, 2)}</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
