import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Plus, 
  Send, 
  Image as ImageIcon, 
  Target, 
  MessageCircle,
  Loader2,
  AlertTriangle,
  CheckCircle,
  X,
  Sparkles
} from "lucide-react";

interface HealthGoal {
  id: string;
  title: string;
  description: string | null;
  goal_type: string;
  status: string;
  body_area: string | null;
  created_at: string;
}

interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  image_url: string | null;
  generated_images: any;
  created_at: string;
}

export default function HealthGoals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<HealthGoal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<HealthGoal | null>(null);
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [message, setMessage] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false);
  const [showWaiverDialog, setShowWaiverDialog] = useState(false);
  const [waiverAccepted, setWaiverAccepted] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [newGoalBodyArea, setNewGoalBodyArea] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      checkWaiver();
      fetchGoals();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedGoal) {
      fetchConversations(selectedGoal.id);
    }
  }, [selectedGoal]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    setUserId(session.user.id);
  };

  const checkWaiver = async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('health_waivers')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (!data) {
      setShowWaiverDialog(true);
    } else {
      setWaiverAccepted(true);
    }
  };

  const acceptWaiver = async () => {
    if (!userId) return;
    
    const { error } = await supabase.from('health_waivers').insert({
      user_id: userId,
      waiver_version: '1.0',
      user_agent: navigator.userAgent
    });

    if (error) {
      toast.error("Failed to save waiver acceptance");
      return;
    }

    setWaiverAccepted(true);
    setShowWaiverDialog(false);
    toast.success("Waiver accepted. Let's work on your health goals!");
  };

  const fetchGoals = async () => {
    if (!userId) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from('health_goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to load health goals");
    } else {
      setGoals(data || []);
    }
    setIsLoading(false);
  };

  const fetchConversations = async (goalId: string) => {
    const { data, error } = await supabase
      .from('goal_conversations')
      .select('*')
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true });

    if (error) {
      toast.error("Failed to load conversation");
    } else {
      setConversations(data || []);
    }
  };

  const createGoal = async () => {
    if (!userId || !newGoalTitle.trim()) return;

    const { data, error } = await supabase.from('health_goals').insert({
      user_id: userId,
      title: newGoalTitle,
      description: newGoalDescription || null,
      body_area: newGoalBodyArea || null,
      goal_type: 'pain_management'
    }).select().single();

    if (error) {
      toast.error("Failed to create goal");
      return;
    }

    setGoals([data, ...goals]);
    setSelectedGoal(data);
    setShowNewGoalDialog(false);
    setNewGoalTitle("");
    setNewGoalDescription("");
    setNewGoalBodyArea("");
    toast.success("Goal created! Tell me more about what you're experiencing.");
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile || !userId) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('health-images')
      .upload(fileName, imageFile);

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    const { data } = supabase.storage
      .from('health-images')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const sendMessage = async () => {
    if (!selectedGoal || !userId || (!message.trim() && !imagePreview)) return;

    setIsSending(true);
    let imageUrl: string | null = null;

    // Upload image if present
    if (imageFile) {
      imageUrl = await uploadImage();
    }

    // Save user message
    const { data: userMsg, error: userMsgError } = await supabase
      .from('goal_conversations')
      .insert({
        goal_id: selectedGoal.id,
        user_id: userId,
        role: 'user',
        content: message,
        image_url: imageUrl
      })
      .select()
      .single();

    if (userMsgError) {
      toast.error("Failed to send message");
      setIsSending(false);
      return;
    }

    setConversations([...conversations, userMsg]);
    const currentMessage = message;
    setMessage("");
    setImagePreview(null);
    setImageFile(null);

    // Get AI response
    try {
      const messagesForAI = [...conversations, userMsg].map(msg => ({
        role: msg.role,
        content: msg.content,
        imageUrl: msg.image_url
      }));

      const response = await supabase.functions.invoke('analyze-health-goal', {
        body: { messages: messagesForAI, goalId: selectedGoal.id }
      });

      if (response.error) throw response.error;

      const { response: aiResponse, suggestedExercises } = response.data;

      // Save assistant message
      const { data: assistantMsg, error: assistantMsgError } = await supabase
        .from('goal_conversations')
        .insert({
          goal_id: selectedGoal.id,
          user_id: userId,
          role: 'assistant',
          content: aiResponse,
          generated_images: suggestedExercises ? { exercises: suggestedExercises } : null
        })
        .select()
        .single();

      if (!assistantMsgError && assistantMsg) {
        setConversations(prev => [...prev, assistantMsg]);
      }
    } catch (error) {
      console.error('AI error:', error);
      toast.error("Failed to get AI response");
    }

    setIsSending(false);
  };

  const generateExerciseImage = async (exerciseName: string) => {
    toast.info(`Generating diagram for: ${exerciseName}`);
    
    try {
      const response = await supabase.functions.invoke('analyze-health-goal', {
        body: { generateExerciseImage: true, exerciseName }
      });

      if (response.error) throw response.error;

      const { imageUrl } = response.data;
      if (imageUrl) {
        // Open image in new dialog or display inline
        window.open(imageUrl, '_blank');
        toast.success("Exercise diagram generated!");
      }
    } catch (error) {
      console.error('Image generation error:', error);
      toast.error("Failed to generate exercise diagram");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-primary/20 text-primary';
      case 'achieved': return 'bg-green-500/20 text-green-600';
      case 'paused': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted';
    }
  };

  if (!waiverAccepted && !showWaiverDialog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Waiver Dialog */}
      <Dialog open={showWaiverDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Health & Fitness Disclaimer
            </DialogTitle>
            <DialogDescription className="text-left space-y-4 pt-4">
              <p>
                <strong>Important:</strong> The Limitless Coach platform provides fitness education, 
                general wellness information, and AI-assisted suggestions. This is NOT medical advice.
              </p>
              <p>
                By using this feature, you acknowledge that:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-sm">
                <li>All suggestions are for educational purposes only</li>
                <li>You should consult a physician, physical therapist, or qualified healthcare 
                    professional before starting any exercise program or addressing pain/injury</li>
                <li>AI analysis is not a substitute for professional medical diagnosis</li>
                <li>You assume responsibility for your own health decisions</li>
                <li>Viome, Fountain Life, and other partner services are independent providers</li>
              </ul>
              <p className="font-medium">
                If you experience severe pain, numbness, or concerning symptoms, seek immediate 
                medical attention.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Go Back
            </Button>
            <Button onClick={acceptWaiver}>
              I Understand & Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Goal Dialog */}
      <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Health Goal</DialogTitle>
            <DialogDescription>
              Describe what you want to work on. Be specific about the area and symptoms.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                placeholder="e.g., Fix my knee pain during basketball"
                value={newGoalTitle}
                onChange={(e) => setNewGoalTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Body Area (optional)</label>
              <Input
                placeholder="e.g., Left knee, patella"
                value={newGoalBodyArea}
                onChange={(e) => setNewGoalBodyArea(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Textarea
                placeholder="Describe when the pain happens, how it feels, and any other details..."
                value={newGoalDescription}
                onChange={(e) => setNewGoalDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={createGoal} disabled={!newGoalTitle.trim()}>
              Create Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Health Goals</h1>
              <p className="text-xs text-muted-foreground">AI-Powered Wellness Support</p>
            </div>
          </div>
          <Button onClick={() => setShowNewGoalDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>
      </header>

      <div className="container px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {/* Goals List */}
          <div className="md:col-span-1">
            <Card className="h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Your Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[calc(100vh-240px)]">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : goals.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <Target className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                      <p className="text-sm text-muted-foreground">
                        No health goals yet. Create one to get started!
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {goals.map((goal) => (
                        <button
                          key={goal.id}
                          onClick={() => setSelectedGoal(goal)}
                          className={`w-full p-4 text-left transition-colors hover:bg-muted/50 ${
                            selectedGoal?.id === goal.id ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{goal.title}</p>
                              {goal.body_area && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {goal.body_area}
                                </p>
                              )}
                            </div>
                            <Badge className={getStatusColor(goal.status)}>
                              {goal.status}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Conversation */}
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              {selectedGoal ? (
                <>
                  <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-base">{selectedGoal.title}</CardTitle>
                        {selectedGoal.body_area && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Body area: {selectedGoal.body_area}
                          </p>
                        )}
                      </div>
                      <Badge className={getStatusColor(selectedGoal.status)}>
                        {selectedGoal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {conversations.length === 0 ? (
                        <div className="text-center py-8">
                          <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                          <p className="text-muted-foreground">
                            Start by describing your issue or upload a photo showing where it hurts.
                          </p>
                        </div>
                      ) : (
                        conversations.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-lg p-3 ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}
                            >
                              {msg.image_url && (
                                <img
                                  src={msg.image_url}
                                  alt="Uploaded"
                                  className="max-w-full h-auto rounded mb-2"
                                />
                              )}
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              
                              {/* Show exercise generation buttons for assistant messages */}
                              {msg.role === 'assistant' && msg.generated_images?.exercises && (
                                <div className="mt-3 pt-3 border-t border-border/50">
                                  <p className="text-xs text-muted-foreground mb-2">
                                    Generate exercise diagrams:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {msg.generated_images.exercises.map((exercise: string, i: number) => (
                                      <Button
                                        key={i}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs h-7"
                                        onClick={() => generateExerciseImage(exercise)}
                                      >
                                        <Sparkles className="h-3 w-3 mr-1" />
                                        {exercise}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                      {isSending && (
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-lg p-3">
                            <Loader2 className="h-4 w-4 animate-spin" />
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t">
                    {imagePreview && (
                      <div className="relative inline-block mb-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-20 w-auto rounded"
                        />
                        <button
                          onClick={() => {
                            setImagePreview(null);
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Input
                        placeholder="Describe your symptoms, when pain occurs..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                        disabled={isSending}
                      />
                      <Button onClick={sendMessage} disabled={isSending || (!message.trim() && !imagePreview)}>
                        {isSending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      ⚠️ This is not medical advice. Consult a healthcare professional for diagnosis.
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <Target className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Goal</h3>
                    <p className="text-muted-foreground text-sm max-w-md">
                      Choose an existing health goal or create a new one to start getting 
                      AI-powered insights and exercise recommendations.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
