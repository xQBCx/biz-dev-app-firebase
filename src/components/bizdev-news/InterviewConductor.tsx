import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Mic, ArrowRight, ArrowLeft, Sparkles, Image, Volume2, FileText, Check } from "lucide-react";

interface InterviewConductorProps {
  onComplete: (articleId: string) => void;
}

interface Question {
  id: string;
  question: string;
  category: string;
}

type InterviewStep = 'setup' | 'generating' | 'questions' | 'answering' | 'generating-content' | 'complete';

export function InterviewConductor({ onComplete }: InterviewConductorProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState<InterviewStep>('setup');
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  
  // Setup form
  const [subjectName, setSubjectName] = useState('');
  const [subjectTitle, setSubjectTitle] = useState('');
  const [subjectCompany, setSubjectCompany] = useState('');
  
  // Questions and answers
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ questionId: string; answer: string }[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState('');
  
  // Generation status
  const [generatingArticle, setGeneratingArticle] = useState(false);
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [generatingCover, setGeneratingCover] = useState(false);
  const [articleGenerated, setArticleGenerated] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [coverGenerated, setCoverGenerated] = useState(false);

  // Create interview and generate questions
  const startInterviewMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Create interview record
      const { data: interview, error: createError } = await supabase
        .from('news_interviews')
        .insert({
          user_id: user.id,
          subject_name: subjectName,
          subject_title: subjectTitle,
          subject_company: subjectCompany,
          interview_status: 'pending'
        })
        .select()
        .single();

      if (createError) throw createError;

      // Generate questions
      const { data, error } = await supabase.functions.invoke('news-generate-questions', {
        body: {
          interviewId: interview.id,
          subjectName,
          subjectTitle,
          subjectCompany
        }
      });

      if (error) throw error;
      return { interview, questions: data.questions };
    },
    onSuccess: ({ interview, questions }) => {
      setInterviewId(interview.id);
      setQuestions(questions);
      setStep('questions');
      toast.success('Interview questions generated!');
    },
    onError: (error) => {
      console.error('Error starting interview:', error);
      toast.error('Failed to generate questions');
    }
  });

  const handleStartInterview = () => {
    if (!subjectName.trim()) {
      toast.error('Please enter the subject\'s name');
      return;
    }
    setStep('generating');
    startInterviewMutation.mutate();
  };

  const handleSaveAnswer = () => {
    if (!currentAnswer.trim()) return;
    
    const newAnswers = [...answers, { 
      questionId: questions[currentQuestionIndex].id, 
      answer: currentAnswer 
    }];
    setAnswers(newAnswers);
    setCurrentAnswer('');

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, save to database
      saveAnswersAndGenerateContent(newAnswers);
    }
  };

  const saveAnswersAndGenerateContent = async (finalAnswers: { questionId: string; answer: string }[]) => {
    setStep('generating-content');
    
    try {
      // Save answers to interview
      await supabase
        .from('news_interviews')
        .update({ 
          answers: finalAnswers,
          interview_status: 'in_progress'
        })
        .eq('id', interviewId);

      // Generate article
      setGeneratingArticle(true);
      const { data: articleData, error: articleError } = await supabase.functions.invoke('news-generate-article', {
        body: { interviewId }
      });
      
      if (articleError) throw articleError;
      setArticleId(articleData.articleId);
      setArticleGenerated(true);
      setGeneratingArticle(false);
      toast.success('Article generated!');

      // Generate audio (in parallel with cover)
      setGeneratingAudio(true);
      supabase.functions.invoke('news-generate-audio', {
        body: { interviewId }
      }).then(() => {
        setAudioGenerated(true);
        setGeneratingAudio(false);
        toast.success('Audio interview generated!');
      }).catch((err) => {
        console.error('Audio generation error:', err);
        setGeneratingAudio(false);
        toast.error('Audio generation failed');
      });

      // Generate magazine cover
      setGeneratingCover(true);
      supabase.functions.invoke('news-generate-cover', {
        body: { 
          interviewId, 
          articleId: articleData.articleId,
          subjectName, 
          subjectTitle, 
          subjectCompany,
          coverType: 'magazine'
        }
      }).then(() => {
        setCoverGenerated(true);
        setGeneratingCover(false);
        toast.success('Magazine cover generated!');
      }).catch((err) => {
        console.error('Cover generation error:', err);
        setGeneratingCover(false);
        toast.error('Cover generation failed');
      });

      setStep('complete');
      queryClient.invalidateQueries({ queryKey: ['news-articles'] });
      queryClient.invalidateQueries({ queryKey: ['news-interviews'] });

    } catch (error) {
      console.error('Content generation error:', error);
      toast.error('Failed to generate content');
      setStep('questions');
    }
  };

  const progress = step === 'answering' 
    ? ((currentQuestionIndex + 1) / questions.length) * 100 
    : step === 'complete' ? 100 : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Progress indicator */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <Badge variant={step === 'setup' ? 'default' : 'secondary'}>1. Setup</Badge>
        <ArrowRight className="h-4 w-4" />
        <Badge variant={['questions', 'answering'].includes(step) ? 'default' : 'secondary'}>2. Interview</Badge>
        <ArrowRight className="h-4 w-4" />
        <Badge variant={['generating-content', 'complete'].includes(step) ? 'default' : 'secondary'}>3. Generate</Badge>
      </div>

      {/* Step 1: Setup */}
      {step === 'setup' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Start New Interview
            </CardTitle>
            <CardDescription>
              Enter the subject's details. Our AI will generate intelligent questions based on your platform activity and their background.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                placeholder="e.g., John Smith"
                value={subjectName}
                onChange={(e) => setSubjectName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title / Role</Label>
              <Input
                id="title"
                placeholder="e.g., CEO, Founder, Director"
                value={subjectTitle}
                onChange={(e) => setSubjectTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company / Organization</Label>
              <Input
                id="company"
                placeholder="e.g., Tech Innovations Inc."
                value={subjectCompany}
                onChange={(e) => setSubjectCompany(e.target.value)}
              />
            </div>
            <Button 
              onClick={handleStartInterview} 
              className="w-full gap-2"
              disabled={!subjectName.trim()}
            >
              <Sparkles className="h-4 w-4" />
              Generate Interview Questions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Generating Questions */}
      {step === 'generating' && (
        <Card>
          <CardContent className="py-12 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <h3 className="text-lg font-semibold mb-2">Generating Interview Questions</h3>
            <p className="text-muted-foreground">
              Analyzing your platform activity to create intelligent, personalized questions...
            </p>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Questions */}
      {step === 'questions' && (
        <Card>
          <CardHeader>
            <CardTitle>Interview Questions</CardTitle>
            <CardDescription>
              Review the generated questions. Click "Begin Interview" when ready.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="flex gap-3 p-3 rounded-lg border">
                  <span className="font-mono text-sm text-muted-foreground w-6">{idx + 1}.</span>
                  <div className="flex-1">
                    <p className="text-sm">{q.question}</p>
                    <Badge variant="outline" className="mt-2 text-xs">{q.category}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setStep('answering')} className="w-full gap-2">
              Begin Interview
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Answer Questions */}
      {step === 'answering' && questions[currentQuestionIndex] && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <Badge variant="outline">
                Question {currentQuestionIndex + 1} of {questions.length}
              </Badge>
              <Badge>{questions[currentQuestionIndex].category}</Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <p className="text-lg font-medium">{questions[currentQuestionIndex].question}</p>
            </div>
            <Textarea
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <div className="flex gap-3">
              {currentQuestionIndex > 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
              )}
              <Button 
                onClick={handleSaveAnswer} 
                className="flex-1 gap-2"
                disabled={!currentAnswer.trim()}
              >
                {currentQuestionIndex < questions.length - 1 ? (
                  <>
                    Next Question
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Complete & Generate Content
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Generating Content */}
      {(step === 'generating-content' || step === 'complete') && (
        <Card>
          <CardHeader>
            <CardTitle>Generating Your Content</CardTitle>
            <CardDescription>
              Creating a complete multi-modal interview package
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {generatingArticle ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : articleGenerated ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Magazine Article</p>
                  <p className="text-sm text-muted-foreground">Written interview content</p>
                </div>
                {articleGenerated && <Badge variant="default">Complete</Badge>}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {generatingAudio ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : audioGenerated ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Volume2 className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Audio Interview</p>
                  <p className="text-sm text-muted-foreground">Dual-voice audio version</p>
                </div>
                {audioGenerated && <Badge variant="default">Complete</Badge>}
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border">
                {generatingCover ? (
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                ) : coverGenerated ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Image className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex-1">
                  <p className="font-medium">Magazine Cover</p>
                  <p className="text-sm text-muted-foreground">AI-generated cover art</p>
                </div>
                {coverGenerated && <Badge variant="default">Complete</Badge>}
              </div>
            </div>

            {step === 'complete' && articleId && (
              <Button 
                onClick={() => onComplete(articleId)} 
                className="w-full gap-2"
              >
                View Your Article
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
