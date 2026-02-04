import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Camera, Upload, Video, CheckCircle2,
  AlertTriangle, Dumbbell, Play, X
} from "lucide-react";

type AnalysisResult = {
  score: number;
  feedback: string[];
  improvements: string[];
  exerciseDetected: string;
};

const exerciseOptions = [
  "Squat",
  "Deadlift",
  "Bench Press",
  "Push-up",
  "Lunge",
  "Row",
  "Overhead Press",
  "Other"
];

const FormCheck = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast({
          title: "Invalid file",
          description: "Please select a video file",
          variant: "destructive"
        });
        return;
      }
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!videoFile || !selectedExercise) return;

    setIsAnalyzing(true);

    // Simulate AI analysis (in production, this would call an edge function)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock analysis result
    const mockResults: AnalysisResult = {
      score: Math.floor(Math.random() * 20) + 75, // 75-95
      exerciseDetected: selectedExercise,
      feedback: [
        "Good depth on the movement",
        "Core engagement looks solid",
        "Tempo is consistent throughout"
      ],
      improvements: [
        "Keep your chest up slightly more at the bottom",
        "Try to maintain a more neutral spine",
        "Consider slowing down the eccentric phase"
      ]
    };

    setAnalysisResult(mockResults);
    setIsAnalyzing(false);

    toast({
      title: "Analysis Complete",
      description: `Form score: ${mockResults.score}/100`
    });
  };

  const resetAnalysis = () => {
    setVideoFile(null);
    setVideoPreview(null);
    setAnalysisResult(null);
    setSelectedExercise(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground py-4 px-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/today')}
            className="text-primary-foreground hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-display font-bold">Form Check</h1>
            <p className="text-xs text-primary-foreground/70">
              AI-powered form analysis
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {!analysisResult ? (
          <>
            {/* Upload Section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5 text-accent" />
                  Upload Your Video
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!videoPreview ? (
                  <div
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-accent/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-medium mb-2">
                      Tap to upload a video
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Record yourself performing the exercise
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <video
                      src={videoPreview}
                      className="w-full rounded-lg"
                      controls
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setVideoFile(null);
                        setVideoPreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Exercise Selection */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Dumbbell className="h-5 w-5 text-accent" />
                  Select Exercise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {exerciseOptions.map(exercise => (
                    <Button
                      key={exercise}
                      variant={selectedExercise === exercise ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      {selectedExercise === exercise && (
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                      )}
                      {exercise}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Analyze Button */}
            <Button
              className="w-full bg-accent hover:bg-accent/90 text-accent-foreground py-6 text-lg"
              disabled={!videoFile || !selectedExercise || isAnalyzing}
              onClick={handleAnalyze}
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2" />
                  Analyzing Form...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Analyze My Form
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="mt-4">
                <Progress value={66} className="h-2" />
                <p className="text-sm text-center text-muted-foreground mt-2">
                  Our AI is reviewing your movement...
                </p>
              </div>
            )}
          </>
        ) : (
          /* Results Section */
          <>
            <Card className="mb-6 border-2 border-accent/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Form Analysis Results</CardTitle>
                  <div className={`text-3xl font-display font-bold ${
                    analysisResult.score >= 85 ? 'text-success' :
                    analysisResult.score >= 70 ? 'text-warning' : 'text-destructive'
                  }`}>
                    {analysisResult.score}/100
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Exercise detected: <span className="font-medium text-foreground">{analysisResult.exerciseDetected}</span>
                </p>

                <div className="mb-6">
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    What You're Doing Well
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.feedback.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-success">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold flex items-center gap-2 mb-3">
                    <AlertTriangle className="h-5 w-5 text-warning" />
                    Areas to Improve
                  </h4>
                  <ul className="space-y-2">
                    {analysisResult.improvements.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-warning">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={resetAnalysis}
              >
                Analyze Another
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate('/coach-chat')}
              >
                Ask Bill About This
              </Button>
            </div>
          </>
        )}

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground mt-6 px-4">
          Form analysis is for educational purposes only. Not a substitute for professional coaching.
          Consult a trainer for personalized guidance.
        </p>
      </main>
    </div>
  );
};

export default FormCheck;