import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Award, 
  X,
  FileText,
  Video,
  PlayCircle
} from 'lucide-react';

interface Module {
  id: string;
  title: string;
  description: string;
  content_type: string;
  content_url?: string;
  duration_minutes: number;
  xp_reward: number;
  order_index: number;
}

interface ModulePlayerProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (moduleId: string) => void;
}

const ModulePlayer = ({ module, isOpen, onClose, onComplete }: ModulePlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);

  const handleComplete = () => {
    if (module) {
      setCompleted(true);
      setProgress(100);
      onComplete(module.id);
    }
  };

  const getModuleIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      default: return <PlayCircle className="h-4 w-4" />;
    }
  };

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'video': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'reading': return 'bg-green-100 text-green-800 border-green-200';
      case 'interactive': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReadingContent = (module: Module) => {
    const contentMap: Record<string, JSX.Element> = {
      'Room Cleaning Fundamentals': (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Room Cleaning Fundamentals</h2>
          
          <section>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Learning Objectives</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Master the 7-step room cleaning process</li>
              <li>Understand proper sanitization techniques</li>
              <li>Learn time management for efficient cleaning</li>
              <li>Recognize quality standards and inspection criteria</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-foreground">The 7-Step Process</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary">Step 1: Pre-Inspection</h4>
                <p>Check room condition, note maintenance issues, and plan cleaning approach.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary">Step 2: Declutter & Strip</h4>
                <p>Remove all linens, towels, and guest items. Clear all surfaces.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary">Step 3: Dust & Wipe</h4>
                <p>Dust from top to bottom, clean all surfaces with appropriate products.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary">Step 4: Bathroom Deep Clean</h4>
                <p>Sanitize all bathroom surfaces, replace amenities, ensure everything sparkles.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary">Step 5: Vacuum & Floor Care</h4>
                <p>Vacuum carpets thoroughly, mop hard floors, pay attention to corners.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary">Step 6: Make Beds & Restock</h4>
                <p>Fresh linens with hospital corners, restock amenities and supplies.</p>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                <h4 className="font-semibold text-primary">Step 7: Final Inspection</h4>
                <p>Quality check, touch-ups, and room readiness verification.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Time Standards</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/20 rounded-lg">
                <h4 className="font-semibold">Standard Room</h4>
                <p className="text-2xl font-bold text-primary">22 minutes</p>
              </div>
              <div className="p-3 bg-secondary/20 rounded-lg">
                <h4 className="font-semibold">Suite</h4>
                <p className="text-2xl font-bold text-primary">35 minutes</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Quality Checklist</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Bedroom</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Bed made with crisp corners</li>
                  <li>✓ All surfaces dust-free</li>
                  <li>✓ Carpet vacuumed</li>
                  <li>✓ Windows spotless</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Bathroom</h4>
                <ul className="text-sm space-y-1">
                  <li>✓ Sink and faucet shining</li>
                  <li>✓ Toilet sanitized inside/out</li>
                  <li>✓ Shower/tub spotless</li>
                  <li>✓ Mirror streak-free</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      ),
      'Leadership Fundamentals': (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-foreground">Leadership Fundamentals for Hospitality</h2>
          
          <section>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Core Leadership Principles</h3>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                <h4 className="font-semibold text-blue-700">Lead by Example</h4>
                <p>Demonstrate the standards and behaviors you expect from your team.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                <h4 className="font-semibold text-green-700">Communicate Clearly</h4>
                <p>Ensure all team members understand expectations, goals, and procedures.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                <h4 className="font-semibold text-purple-700">Empower Others</h4>
                <p>Give team members authority to make decisions and solve problems.</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                <h4 className="font-semibold text-orange-700">Continuous Development</h4>
                <p>Invest in your team's growth and your own professional development.</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Effective Team Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Daily Leadership Tasks</h4>
                <ul className="space-y-2">
                  <li>• Morning team briefings</li>
                  <li>• Regular check-ins with staff</li>
                  <li>• Performance feedback</li>
                  <li>• Problem-solving support</li>
                  <li>• Recognition and motivation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Conflict Resolution</h4>
                <ul className="space-y-2">
                  <li>• Listen to all parties</li>
                  <li>• Identify root causes</li>
                  <li>• Mediate fair solutions</li>
                  <li>• Follow up on outcomes</li>
                  <li>• Document important issues</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-3 text-foreground">Guest Service Leadership</h3>
            <p className="mb-4">As a leader, you set the tone for exceptional guest service:</p>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg">
              <blockquote className="text-lg italic text-center">
                "Great leaders create more leaders, not followers. Empower your team to exceed guest expectations."
              </blockquote>
            </div>
          </section>
        </div>
      )
    };

    return contentMap[module.title] || (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">{module.title}</h2>
        <p className="text-muted-foreground">{module.description}</p>
        <div className="p-4 bg-muted/50 rounded-lg">
          <p>Comprehensive training content for this module is being developed. Check back soon for detailed materials.</p>
        </div>
      </div>
    );
  };

  if (!module) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getContentTypeColor(module.content_type)}>
                {getModuleIcon(module.content_type)}
                <span className="ml-1 capitalize">{module.content_type}</span>
              </Badge>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{module.duration_minutes}min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Award className="h-3 w-3" />
                  <span>{module.xp_reward} XP</span>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogTitle className="text-xl">{module.title}</DialogTitle>
          <p className="text-muted-foreground">{module.description}</p>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="flex-shrink-0 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Module Progress</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {module.content_type === 'video' && module.content_url ? (
            <div className="flex-1 bg-black rounded-lg overflow-hidden">
              <iframe
                src={module.content_url}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                onLoad={() => {
                  // Simulate watching progress
                  const interval = setInterval(() => {
                    setProgress(prev => {
                      const newProgress = prev + 2;
                      if (newProgress >= 100) {
                        clearInterval(interval);
                        setTimeout(handleComplete, 1000);
                        return 100;
                      }
                      return newProgress;
                    });
                  }, 100);
                }}
              />
            </div>
          ) : module.content_type === 'interactive' ? (
            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                  <PlayCircle className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Interactive Training Module</h3>
                <p className="text-muted-foreground max-w-md">
                  This interactive session includes hands-on exercises, quizzes, and real-world scenarios.
                </p>
                <Button onClick={() => setProgress(100)}>
                  <Play className="mr-2 h-4 w-4" />
                  Start Interactive Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col bg-background rounded-lg border">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="prose prose-sm max-w-none">
                  {getReadingContent(module)}
                </div>
              </div>
              <div className="border-t p-4 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Reading Progress: {Math.round(progress)}%
                  </div>
                  <Button 
                    onClick={() => {
                      setProgress(100);
                      setTimeout(handleComplete, 500);
                    }}
                    disabled={progress >= 100}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Mark as Read
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex-shrink-0 flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            {completed && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            {progress >= 100 && !completed && (
              <Button onClick={handleComplete}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark Complete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ModulePlayer;