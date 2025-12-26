import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  Upload, Link, Mic, FileText, Youtube, Image, Video,
  Globe, Loader2, Send, Sparkles, Brain, Zap,
  ArrowRight, CheckCircle2, Music, X, MicOff,
  Building2, Users, Briefcase, Calendar, DollarSign,
  Code2, Lightbulb, MessageSquare, FileSearch, Layers
} from "lucide-react";
import { toast } from "sonner";

// Sound effects for emotional feedback
const SOUNDS = {
  dropIn: () => playSound(440, 0.1, 'sine'),
  processing: () => playSound(660, 0.15, 'triangle'),
  success: () => { playSound(523, 0.1, 'sine'); setTimeout(() => playSound(659, 0.1, 'sine'), 100); setTimeout(() => playSound(784, 0.15, 'sine'), 200); },
  thinking: () => playSound(330, 0.05, 'sine'),
  route: () => { playSound(392, 0.08, 'sine'); setTimeout(() => playSound(523, 0.12, 'sine'), 80); },
};

function playSound(frequency: number, duration: number, type: OscillatorType) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  } catch (e) {
    // Audio not supported
  }
}

type AgentMood = 'idle' | 'listening' | 'thinking' | 'excited' | 'processing' | 'routing';

interface RouteRecommendation {
  path: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  confidence: number;
  category: string;
}

const ROUTE_KEYWORDS: Record<string, { path: string; title: string; icon: React.ReactNode; category: string }> = {
  // Business & Entities
  'business': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'company': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'llc': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'corporation': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'entity': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  
  // CRM
  'contact': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  'lead': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  'deal': { path: '/crm', title: 'Deal Rooms', icon: <Briefcase className="h-4 w-4" />, category: 'deals' },
  'client': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  'customer': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  
  // Calendar & Tasks
  'meeting': { path: '/calendar', title: 'Calendar', icon: <Calendar className="h-4 w-4" />, category: 'productivity' },
  'schedule': { path: '/calendar', title: 'Calendar', icon: <Calendar className="h-4 w-4" />, category: 'productivity' },
  'task': { path: '/tasks', title: 'Tasks', icon: <CheckCircle2 className="h-4 w-4" />, category: 'productivity' },
  'reminder': { path: '/tasks', title: 'Tasks', icon: <CheckCircle2 className="h-4 w-4" />, category: 'productivity' },
  
  // Funding & Finance
  'funding': { path: '/funding', title: 'Funding', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  'investment': { path: '/funding', title: 'Funding', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  'investor': { path: '/funding', title: 'Funding', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  'earnings': { path: '/earnings', title: 'Earnings', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  
  // Research & Knowledge
  'research': { path: '/research-studio', title: 'Research Studio', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'knowledge': { path: '/research-studio', title: 'Knowledge Hub', icon: <Brain className="h-4 w-4" />, category: 'knowledge' },
  'notes': { path: '/research-studio', title: 'Research Studio', icon: <FileText className="h-4 w-4" />, category: 'knowledge' },
  
  // Social & Marketing
  'social': { path: '/social', title: 'Social Media', icon: <MessageSquare className="h-4 w-4" />, category: 'marketing' },
  'post': { path: '/social', title: 'Social Media', icon: <MessageSquare className="h-4 w-4" />, category: 'marketing' },
  'marketing': { path: '/brand-command-center', title: 'Brand Center', icon: <Sparkles className="h-4 w-4" />, category: 'marketing' },
  'brand': { path: '/brand-command-center', title: 'Brand Center', icon: <Sparkles className="h-4 w-4" />, category: 'marketing' },
  
  // Tools & Workflows
  'workflow': { path: '/workflows', title: 'Workflows', icon: <Layers className="h-4 w-4" />, category: 'automation' },
  'automate': { path: '/workflows', title: 'Workflows', icon: <Zap className="h-4 w-4" />, category: 'automation' },
  'tool': { path: '/tools', title: 'Tools', icon: <Code2 className="h-4 w-4" />, category: 'tools' },
  
  // IP & Legal
  'patent': { path: '/ip-launch', title: 'IP Launch', icon: <Lightbulb className="h-4 w-4" />, category: 'legal' },
  'trademark': { path: '/ip-launch', title: 'IP Launch', icon: <Lightbulb className="h-4 w-4" />, category: 'legal' },
  'intellectual': { path: '/ip-launch', title: 'IP Launch', icon: <Lightbulb className="h-4 w-4" />, category: 'legal' },
};

function analyzeInput(text: string, files?: File[]): RouteRecommendation[] {
  const recommendations: RouteRecommendation[] = [];
  const lowerText = text.toLowerCase();
  const matchedPaths = new Set<string>();
  
  // Check for keyword matches
  Object.entries(ROUTE_KEYWORDS).forEach(([keyword, route]) => {
    if (lowerText.includes(keyword) && !matchedPaths.has(route.path)) {
      matchedPaths.add(route.path);
      recommendations.push({
        ...route,
        description: `Detected "${keyword}" in your input`,
        confidence: 0.8 + Math.random() * 0.2,
      });
    }
  });
  
  // File type analysis
  if (files?.length) {
    files.forEach(file => {
      if (file.type.startsWith('image/') || file.type.includes('pdf')) {
        if (!matchedPaths.has('/research-studio')) {
          matchedPaths.add('/research-studio');
          recommendations.push({
            path: '/research-studio',
            title: 'Knowledge Hub',
            description: 'Store and analyze this document',
            icon: <Brain className="h-4 w-4" />,
            confidence: 0.9,
            category: 'knowledge',
          });
        }
      }
      if (file.type.startsWith('audio/')) {
        if (!matchedPaths.has('/research-studio')) {
          matchedPaths.add('/research-studio');
          recommendations.push({
            path: '/research-studio',
            title: 'Voice Memos',
            description: 'Transcribe and save this recording',
            icon: <Mic className="h-4 w-4" />,
            confidence: 0.95,
            category: 'knowledge',
          });
        }
      }
    });
  }
  
  // URL detection
  const urlPatterns = [
    { pattern: /youtube\.com|youtu\.be/i, route: { path: '/research-studio', title: 'Knowledge Hub', icon: <Youtube className="h-4 w-4" />, category: 'knowledge' } },
    { pattern: /linkedin\.com\/in\//i, route: { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' } },
    { pattern: /twitter\.com|x\.com/i, route: { path: '/social', title: 'Social Media', icon: <MessageSquare className="h-4 w-4" />, category: 'marketing' } },
  ];
  
  urlPatterns.forEach(({ pattern, route }) => {
    if (pattern.test(text) && !matchedPaths.has(route.path)) {
      matchedPaths.add(route.path);
      recommendations.push({
        ...route,
        description: 'Detected link in your input',
        confidence: 0.85,
      });
    }
  });
  
  // Default to knowledge hub if nothing else matches
  if (recommendations.length === 0 && text.length > 20) {
    recommendations.push({
      path: '/research-studio',
      title: 'Knowledge Hub',
      description: 'Save to your knowledge base',
      icon: <Brain className="h-4 w-4" />,
      confidence: 0.6,
      category: 'knowledge',
    });
  }
  
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

export function IntelligentCapture() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mood, setMood] = useState<AgentMood>('idle');
  const [recommendations, setRecommendations] = useState<RouteRecommendation[]>([]);
  const [thinkingText, setThinkingText] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Dynamic thinking messages
  const thinkingMessages = [
    "Analyzing your input...",
    "Understanding context...",
    "Finding the best route...",
    "Processing patterns...",
    "Connecting the dots...",
    "Learning from your intent...",
  ];

  // Analyze input as user types
  useEffect(() => {
    if (input.length > 3 || droppedFiles.length > 0) {
      setMood('thinking');
      SOUNDS.thinking();
      
      const timeout = setTimeout(() => {
        const recs = analyzeInput(input, droppedFiles);
        setRecommendations(recs);
        if (recs.length > 0) {
          setMood('routing');
          SOUNDS.route();
        } else {
          setMood('listening');
        }
      }, 500);
      
      return () => clearTimeout(timeout);
    } else {
      setRecommendations([]);
      setMood('idle');
    }
  }, [input, droppedFiles]);

  // Thinking animation
  useEffect(() => {
    if (mood === 'thinking' || mood === 'processing') {
      let i = 0;
      thinkingRef.current = setInterval(() => {
        setThinkingText(thinkingMessages[i % thinkingMessages.length]);
        i++;
      }, 800);
    } else {
      setThinkingText("");
      if (thinkingRef.current) clearInterval(thinkingRef.current);
    }
    return () => {
      if (thinkingRef.current) clearInterval(thinkingRef.current);
    };
  }, [mood]);

  // Expand based on input length
  useEffect(() => {
    setIsExpanded(input.length > 50 || droppedFiles.length > 0 || isRecording);
  }, [input, droppedFiles, isRecording]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!isDragging) {
      setIsDragging(true);
      SOUNDS.dropIn();
      setMood('excited');
    }
  }, [isDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setMood(input.length > 0 ? 'thinking' : 'idle');
  }, [input]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setDroppedFiles(prev => [...prev, ...files]);
      SOUNDS.success();
      setMood('processing');
    }

    const text = e.dataTransfer.getData("text");
    if (text) {
      setInput(prev => prev + (prev ? "\n" : "") + text);
    }
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([audioBlob], `voice-memo-${Date.now()}.webm`, { type: "audio/webm" });
        setDroppedFiles(prev => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
        SOUNDS.success();
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setMood('listening');
      SOUNDS.processing();

      timerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);

    } catch (error) {
      toast.error("Failed to access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const removeFile = (index: number) => {
    setDroppedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleRoute = async (recommendation: RouteRecommendation) => {
    setMood('excited');
    SOUNDS.success();
    
    // If there's content, save it first
    if (input.trim() || droppedFiles.length > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Save to knowledge inbox for processing
          for (const file of droppedFiles) {
            const ext = file.name.split('.').pop();
            const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            
            await supabase.storage.from("knowledge-hub").upload(filePath, file);
            
            await supabase.from("knowledge_items").insert({
              user_id: user.id,
              title: file.name,
              source_type: file.type.split('/')[0] || 'document',
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
              processing_status: "pending",
            });
          }
          
          if (input.trim()) {
            await supabase.from("knowledge_items").insert({
              user_id: user.id,
              title: input.substring(0, 50) + (input.length > 50 ? "..." : ""),
              content: input,
              source_type: "text",
              processing_status: "pending",
            });
          }
          
          toast.success("Content saved to Knowledge Hub");
        }
      } catch (error) {
        console.error("Error saving content:", error);
      }
    }
    
    // Navigate to the recommended route
    setTimeout(() => {
      navigate(recommendation.path);
    }, 300);
  };

  const handleSendToAgent = async () => {
    if (!input.trim() && droppedFiles.length === 0) return;
    
    setMood('processing');
    SOUNDS.processing();
    
    // This will be handled by the parent component's chat
    // For now, we'll emit a custom event
    const event = new CustomEvent('intelligent-capture-submit', {
      detail: { text: input, files: droppedFiles }
    });
    window.dispatchEvent(event);
    
    setInput("");
    setDroppedFiles([]);
    setMood('idle');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getMoodGradient = () => {
    switch (mood) {
      case 'excited': return 'from-yellow-500/20 via-orange-500/20 to-red-500/20';
      case 'thinking': return 'from-blue-500/20 via-purple-500/20 to-pink-500/20';
      case 'processing': return 'from-cyan-500/20 via-blue-500/20 to-indigo-500/20';
      case 'routing': return 'from-green-500/20 via-emerald-500/20 to-teal-500/20';
      case 'listening': return 'from-pink-500/20 via-rose-500/20 to-red-500/20';
      default: return 'from-muted/50 via-muted/30 to-muted/50';
    }
  };

  const getMoodPulse = () => {
    return mood !== 'idle' ? 'animate-pulse' : '';
  };

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-500",
        isExpanded ? "p-6" : "p-4",
        isDragging && "ring-2 ring-primary ring-offset-2"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Animated gradient background */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r transition-all duration-700",
          getMoodGradient(),
          getMoodPulse()
        )} 
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Header with Agent Avatar */}
        <div className="flex items-center gap-3 mb-4">
          <div className={cn(
            "relative",
            mood !== 'idle' && "animate-bounce"
          )}>
            <Avatar className={cn(
              "w-10 h-10 transition-all duration-300",
              mood === 'excited' && "ring-2 ring-yellow-500 ring-offset-2",
              mood === 'thinking' && "ring-2 ring-blue-500 ring-offset-2",
              mood === 'processing' && "ring-2 ring-cyan-500 ring-offset-2",
              mood === 'routing' && "ring-2 ring-green-500 ring-offset-2",
              mood === 'listening' && "ring-2 ring-pink-500 ring-offset-2"
            )}>
              <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground font-bold">
                <Brain className={cn("h-5 w-5", mood !== 'idle' && "animate-spin")} />
              </div>
            </Avatar>
            {mood !== 'idle' && (
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border-2 border-background animate-ping" />
            )}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">Intelligent Capture</p>
            <p className="text-xs text-muted-foreground">
              {thinkingText || "Drop anything here — I'll help you route it"}
            </p>
          </div>
          
          {/* Quick Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant={isRecording ? "destructive" : "ghost"}
              size="icon"
              className={cn("h-8 w-8", isRecording && "animate-pulse")}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            <span className="text-sm font-medium text-destructive">Recording {formatTime(recordingTime)}</span>
            <Button size="sm" variant="destructive" className="ml-auto h-7" onClick={stopRecording}>
              Stop
            </Button>
          </div>
        )}
        
        {/* Dropped files */}
        {droppedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {droppedFiles.map((file, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="gap-1.5 pr-1 animate-in slide-in-from-bottom-2"
              >
                {file.type.startsWith('image/') && <Image className="h-3 w-3" />}
                {file.type.startsWith('audio/') && <Music className="h-3 w-3" />}
                {file.type.startsWith('video/') && <Video className="h-3 w-3" />}
                {file.type.includes('pdf') && <FileText className="h-3 w-3" />}
                <span className="max-w-[100px] truncate">{file.name}</span>
                <button onClick={() => removeFile(idx)} className="ml-1 hover:text-destructive">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {/* Dynamic input area */}
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What do you want to accomplish? Drop files, paste links, or describe your goal..."
            className={cn(
              "resize-none transition-all duration-300 pr-24",
              isExpanded ? "min-h-[100px]" : "min-h-[44px]"
            )}
            onFocus={() => setMood('listening')}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-1">
            <Button 
              size="sm" 
              className="h-8 gap-1.5"
              onClick={handleSendToAgent}
              disabled={!input.trim() && droppedFiles.length === 0}
            >
              <Send className="h-3.5 w-3.5" />
              Ask Agent
            </Button>
          </div>
        </div>
        
        {/* AI Route Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-4 space-y-2 animate-in slide-in-from-bottom-4">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" />
              Recommended destinations
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {recommendations.map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRoute(rec)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border text-left transition-all",
                    "hover:bg-primary/5 hover:border-primary/50 hover:scale-[1.02]",
                    "animate-in slide-in-from-bottom-2",
                    idx === 0 && "ring-1 ring-primary/50 bg-primary/5"
                  )}
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={cn(
                    "p-2 rounded-md",
                    rec.category === 'knowledge' && "bg-purple-500/10 text-purple-500",
                    rec.category === 'crm' && "bg-blue-500/10 text-blue-500",
                    rec.category === 'business' && "bg-green-500/10 text-green-500",
                    rec.category === 'finance' && "bg-yellow-500/10 text-yellow-500",
                    rec.category === 'productivity' && "bg-orange-500/10 text-orange-500",
                    rec.category === 'marketing' && "bg-pink-500/10 text-pink-500",
                    rec.category === 'automation' && "bg-cyan-500/10 text-cyan-500"
                  )}>
                    {rec.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{rec.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{rec.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg animate-in fade-in">
            <div className="text-center">
              <Upload className="h-10 w-10 mx-auto mb-2 text-primary animate-bounce" />
              <p className="font-semibold">Drop it here!</p>
              <p className="text-sm text-muted-foreground">Files, screenshots, links — anything</p>
            </div>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            setDroppedFiles(prev => [...prev, ...files]);
            SOUNDS.success();
          }
        }}
      />
    </Card>
  );
}
