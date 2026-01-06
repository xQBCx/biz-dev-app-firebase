import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { 
  Upload, Mic, FileText, Youtube, Image, Video,
  Loader2, Send, Sparkles, Brain, Zap,
  ArrowRight, Music, X, MicOff,
  Building2, Users, Briefcase, Calendar, DollarSign,
  Code2, Lightbulb, MessageSquare, FileSearch, Layers,
  CheckCircle2
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

// Business import command patterns - explicit triggers for URL-based business spawning
const BUSINESS_IMPORT_PATTERNS = [
  /import\s+(?:this\s+)?(?:business|company)/i,
  /spawn\s+(?:from\s+)?(?:this\s+)?(?:url|link|site|website)/i,
  /add\s+(?:this\s+)?(?:company|business)\s+(?:to\s+)?(?:platform)?/i,
  /create\s+workspace\s+(?:for\s+)?(?:this)?/i,
  /onboard\s+(?:this\s+)?(?:business|company)/i,
];

// Detect if input contains a URL and an import command
export function detectBusinessImportIntent(text: string): { hasIntent: boolean; url: string | null } {
  const urlMatch = text.match(/https?:\/\/[^\s]+/i);
  const hasImportCommand = BUSINESS_IMPORT_PATTERNS.some(pattern => pattern.test(text));
  
  if (urlMatch && hasImportCommand) {
    return { hasIntent: true, url: urlMatch[0] };
  }
  
  return { hasIntent: false, url: null };
}

const ROUTE_KEYWORDS: Record<string, { path: string; title: string; icon: React.ReactNode; category: string }> = {
  'archive import': { path: '/archive-imports/new', title: 'Archive Import', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'archive imports': { path: '/archive-imports', title: 'Archive Imports', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'openai export': { path: '/archive-imports/new', title: 'Archive Import', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'chatgpt archive': { path: '/archive-imports/new', title: 'Archive Import', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'upload chatgpt': { path: '/archive-imports/new', title: 'Archive Import', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'import chatgpt': { path: '/archive-imports/new', title: 'Archive Import', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'user management': { path: '/user-management', title: 'User Management', icon: <Users className="h-4 w-4" />, category: 'admin' },
  'manage users': { path: '/user-management', title: 'User Management', icon: <Users className="h-4 w-4" />, category: 'admin' },
  'spawn': { path: '/business-spawn', title: 'Business Spawn', icon: <Sparkles className="h-4 w-4" />, category: 'business' },
  'start a business': { path: '/business-spawn', title: 'Business Spawn', icon: <Sparkles className="h-4 w-4" />, category: 'business' },
  'create a business': { path: '/business-spawn', title: 'Business Spawn', icon: <Sparkles className="h-4 w-4" />, category: 'business' },
  'new business': { path: '/business-spawn', title: 'Business Spawn', icon: <Sparkles className="h-4 w-4" />, category: 'business' },
  'launch': { path: '/business-spawn', title: 'Business Spawn', icon: <Sparkles className="h-4 w-4" />, category: 'business' },
  'import business': { path: '/business-spawn', title: 'Import Business', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'import company': { path: '/business-spawn', title: 'Import Business', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'business': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'company': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'llc': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'corporation': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'entity': { path: '/create-entity', title: 'Create Entity', icon: <Building2 className="h-4 w-4" />, category: 'business' },
  'contact': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  'lead': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  'deal room': { path: '/deal-rooms', title: 'Deal Rooms', icon: <Briefcase className="h-4 w-4" />, category: 'deals' },
  'deal rooms': { path: '/deal-rooms', title: 'Deal Rooms', icon: <Briefcase className="h-4 w-4" />, category: 'deals' },
  'dealroom': { path: '/deal-rooms', title: 'Deal Rooms', icon: <Briefcase className="h-4 w-4" />, category: 'deals' },
  'client': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  'customer': { path: '/crm', title: 'CRM', icon: <Users className="h-4 w-4" />, category: 'crm' },
  'meeting': { path: '/calendar', title: 'Calendar', icon: <Calendar className="h-4 w-4" />, category: 'productivity' },
  'schedule': { path: '/calendar', title: 'Calendar', icon: <Calendar className="h-4 w-4" />, category: 'productivity' },
  'task': { path: '/tasks', title: 'Tasks', icon: <CheckCircle2 className="h-4 w-4" />, category: 'productivity' },
  'reminder': { path: '/tasks', title: 'Tasks', icon: <CheckCircle2 className="h-4 w-4" />, category: 'productivity' },
  'funding': { path: '/funding', title: 'Funding', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  'investment': { path: '/funding', title: 'Funding', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  'investor': { path: '/funding', title: 'Funding', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  'earnings': { path: '/earnings', title: 'Earnings', icon: <DollarSign className="h-4 w-4" />, category: 'finance' },
  'research': { path: '/research-studio', title: 'Research Studio', icon: <FileSearch className="h-4 w-4" />, category: 'knowledge' },
  'knowledge': { path: '/research-studio', title: 'Knowledge Hub', icon: <Brain className="h-4 w-4" />, category: 'knowledge' },
  'notes': { path: '/research-studio', title: 'Research Studio', icon: <FileText className="h-4 w-4" />, category: 'knowledge' },
  'social': { path: '/social', title: 'Social Media', icon: <MessageSquare className="h-4 w-4" />, category: 'marketing' },
  'post': { path: '/social', title: 'Social Media', icon: <MessageSquare className="h-4 w-4" />, category: 'marketing' },
  'marketing': { path: '/brand-command-center', title: 'Brand Center', icon: <Sparkles className="h-4 w-4" />, category: 'marketing' },
  'brand': { path: '/brand-command-center', title: 'Brand Center', icon: <Sparkles className="h-4 w-4" />, category: 'marketing' },
  'workflow': { path: '/workflows', title: 'Workflows', icon: <Layers className="h-4 w-4" />, category: 'automation' },
  'automate': { path: '/workflows', title: 'Workflows', icon: <Zap className="h-4 w-4" />, category: 'automation' },
  'tool': { path: '/tools', title: 'Tools', icon: <Code2 className="h-4 w-4" />, category: 'tools' },
  'patent': { path: '/ip-launch', title: 'IP Launch', icon: <Lightbulb className="h-4 w-4" />, category: 'legal' },
  'trademark': { path: '/ip-launch', title: 'IP Launch', icon: <Lightbulb className="h-4 w-4" />, category: 'legal' },
  'intellectual': { path: '/ip-launch', title: 'IP Launch', icon: <Lightbulb className="h-4 w-4" />, category: 'legal' },
};

function analyzeInput(text: string, files?: File[]): RouteRecommendation[] {
  const recommendations: RouteRecommendation[] = [];
  const lowerText = text.toLowerCase();
  const matchedPaths = new Set<string>();
  
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
  
  if (files?.length) {
    files.forEach(file => {
      // Detect OpenAI export ZIP files
      if (file.name.endsWith('.zip') || file.type === 'application/zip') {
        if (!matchedPaths.has('/archive-imports/new')) {
          matchedPaths.add('/archive-imports/new');
          recommendations.push({
            path: '/archive-imports/new',
            title: 'Import OpenAI Archive',
            description: 'Process your ChatGPT/OpenAI export',
            icon: <FileSearch className="h-4 w-4" />,
            confidence: 0.98,
            category: 'knowledge',
          });
        }
      }
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
  
  return recommendations.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
}

interface UnifiedChatBarProps {
  onSendMessage: (message: string, images?: string[]) => void;
  inputValue: string;
  onInputChange: (value: string) => void;
  isStreaming: boolean;
  isRecording: boolean;
  onVoiceInput: () => void;
}

export function UnifiedChatBar({ 
  onSendMessage, 
  inputValue, 
  onInputChange, 
  isStreaming, 
  isRecording: externalIsRecording,
  onVoiceInput 
}: UnifiedChatBarProps) {
  const navigate = useNavigate();
  const [isDragging, setIsDragging] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mood, setMood] = useState<AgentMood>('idle');
  const [recommendations, setRecommendations] = useState<RouteRecommendation[]>([]);
  const [thinkingText, setThinkingText] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const thinkingRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const thinkingMessages = [
    "Analyzing your input...",
    "Understanding context...",
    "Finding the best route...",
    "Processing patterns...",
    "Connecting the dots...",
  ];

  // Analyze input as user types
  useEffect(() => {
    if (inputValue.length > 3 || droppedFiles.length > 0) {
      setMood('thinking');
      SOUNDS.thinking();
      
      const timeout = setTimeout(() => {
        const recs = analyzeInput(inputValue, droppedFiles);
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
  }, [inputValue, droppedFiles]);

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
    setMood(inputValue.length > 0 ? 'thinking' : 'idle');
  }, [inputValue]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Check for ZIP files (OpenAI exports)
      const zipFiles = files.filter(f => f.name.endsWith('.zip') || f.type === 'application/zip');
      if (zipFiles.length > 0) {
        // Show toast with option to navigate to archive importer
        toast.success("OpenAI Archive Detected", {
          description: "Click to import your ChatGPT/OpenAI export",
          action: {
            label: "Import Now",
            onClick: () => navigate('/archive-imports/new'),
          },
          duration: 10000,
        });
      }
      
      setDroppedFiles(prev => [...prev, ...files]);
      SOUNDS.success();
      setMood('processing');
    }

    const text = e.dataTransfer.getData("text");
    if (text) {
      onInputChange(inputValue + (inputValue ? "\n" : "") + text);
    }
  }, [inputValue, onInputChange, navigate]);

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
        
        // Transcribe the audio
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result?.toString().split(',')[1];
            if (base64Audio) {
              const { data: { session } } = await supabase.auth.getSession();
              if (session) {
                const { data, error } = await supabase.functions.invoke('transcribe-voice', {
                  body: { audio: base64Audio }
                });
                if (data?.text) {
                  onInputChange(inputValue + (inputValue ? " " : "") + data.text);
                }
              }
            }
          };
        } catch (error) {
          console.error('Error transcribing:', error);
          // Fallback: save as file
          const file = new File([audioBlob], `voice-memo-${Date.now()}.webm`, { type: "audio/webm" });
          setDroppedFiles(prev => [...prev, file]);
        }
        
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
    
    if (inputValue.trim() || droppedFiles.length > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
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
          
          if (inputValue.trim()) {
            await supabase.from("knowledge_items").insert({
              user_id: user.id,
              title: inputValue.substring(0, 50) + (inputValue.length > 50 ? "..." : ""),
              content: inputValue,
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
    
    setTimeout(() => {
      navigate(recommendation.path);
    }, 300);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() && droppedFiles.length === 0) return;
    if (isStreaming) return;
    
    setMood('processing');
    SOUNDS.processing();
    
    // Convert images to base64 for multimodal AI
    const imagePromises = droppedFiles
      .filter(file => file.type.startsWith('image/'))
      .map(file => new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      }));
    
    const images = await Promise.all(imagePromises);
    
    onSendMessage(inputValue, images.length > 0 ? images : undefined);
    setDroppedFiles([]);
    setMood('idle');
    setRecommendations([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getMoodGradient = () => {
    // Monochromatic mood indicators - no colored gradients
    switch (mood) {
      case 'excited': return 'from-foreground/10 via-foreground/5 to-transparent';
      case 'thinking': return 'from-muted-foreground/15 via-muted/10 to-transparent';
      case 'processing': return 'from-foreground/10 via-muted/10 to-transparent';
      case 'routing': return 'from-muted-foreground/10 via-muted/5 to-transparent';
      case 'listening': return 'from-foreground/15 via-foreground/5 to-transparent';
      default: return 'from-muted/30 via-muted/10 to-muted/30';
    }
  };

  const isExpanded = inputValue.length > 50 || droppedFiles.length > 0 || isRecording || recommendations.length > 0;

  return (
    <div 
      className={cn(
        "relative rounded-lg border bg-card overflow-hidden transition-all duration-300",
        isDragging && "ring-2 ring-primary ring-offset-2"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Animated gradient background */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-r transition-all duration-500 pointer-events-none",
          getMoodGradient(),
          mood !== 'idle' && "animate-pulse"
        )} 
      />
      
      <div className="relative z-10 p-3 sm:p-4">
        {/* Agent indicator with mood */}
        <div className="flex items-center gap-2 mb-3">
          <div className={cn("relative", mood !== 'idle' && "animate-bounce")}>
            <Avatar className={cn(
              "w-7 h-7 sm:w-8 sm:h-8 transition-all duration-300",
              mood === 'excited' && "ring-2 ring-foreground",
              mood === 'thinking' && "ring-2 ring-muted-foreground",
              mood === 'processing' && "ring-2 ring-foreground/80",
              mood === 'routing' && "ring-2 ring-muted-foreground/80",
              mood === 'listening' && "ring-2 ring-foreground/90"
            )}>
              <div className="flex items-center justify-center w-full h-full bg-primary text-primary-foreground">
                <Brain className={cn("h-4 w-4", mood !== 'idle' && "animate-spin")} />
              </div>
            </Avatar>
            {mood !== 'idle' && (
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-foreground/50 animate-ping" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {thinkingText || "Biz & Dev Agents ready — drop files, paste links, or ask anything"}
            </p>
          </div>
        </div>
        
        {/* Recording indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 mb-3 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-destructive">Recording {formatTime(recordingTime)}</span>
            <Button size="sm" variant="destructive" className="ml-auto h-7 text-xs" onClick={stopRecording}>
              Stop
            </Button>
          </div>
        )}
        
        {/* Dropped files */}
        {droppedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {droppedFiles.map((file, idx) => (
              <Badge 
                key={idx} 
                variant="secondary" 
                className="gap-1 pr-1 text-xs animate-in slide-in-from-bottom-2"
              >
                {file.type.startsWith('image/') && <Image className="h-3 w-3 shrink-0" />}
                {file.type.startsWith('audio/') && <Music className="h-3 w-3 shrink-0" />}
                {file.type.startsWith('video/') && <Video className="h-3 w-3 shrink-0" />}
                {file.type.includes('pdf') && <FileText className="h-3 w-3 shrink-0" />}
                <span className="max-w-[80px] sm:max-w-[120px] truncate">{file.name}</span>
                <button onClick={() => removeFile(idx)} className="ml-1 hover:text-destructive shrink-0">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        {/* Input area with actions */}
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Biz or Dev anything, drop files, paste links..."
              className={cn(
                "resize-none transition-all duration-200 text-sm",
                isExpanded ? "min-h-[80px]" : "min-h-[44px] max-h-[44px]"
              )}
              disabled={isStreaming}
              onFocus={() => !isStreaming && setMood('listening')}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-1.5 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              variant={isRecording ? "destructive" : "ghost"}
              size="icon"
              className={cn("h-9 w-9", isRecording && "animate-pulse")}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isStreaming}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button 
              size="icon"
              className="h-9 w-9"
              onClick={handleSubmit}
              disabled={(!inputValue.trim() && droppedFiles.length === 0) || isStreaming}
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        {/* AI Route Recommendations */}
        {recommendations.length > 0 && !isStreaming && (
          <div className="mt-3 space-y-2 animate-in slide-in-from-bottom-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="h-3 w-3 shrink-0" />
              <span className="truncate">Or go directly to...</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {recommendations.map((rec, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRoute(rec)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-all",
                    "hover:bg-primary/5 hover:border-primary/50",
                    "animate-in slide-in-from-bottom-2",
                    idx === 0 && "ring-1 ring-primary/50 bg-primary/5"
                  )}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <span className="p-1 rounded bg-muted text-muted-foreground">
                    {rec.icon}
                  </span>
                  <span className="font-medium">{rec.title}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Drop overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm border-2 border-dashed border-primary rounded-lg animate-in fade-in">
            <div className="text-center p-4">
              <Upload className="h-8 w-8 mx-auto mb-2 text-primary animate-bounce" />
              <p className="font-semibold text-sm">Drop it here!</p>
              <p className="text-xs text-muted-foreground">Files, screenshots, links</p>
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
    </div>
  );
}
