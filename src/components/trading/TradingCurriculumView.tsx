import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BookOpen, CheckCircle, Clock, Lock, Play, Star
} from 'lucide-react';
import { 
  TradingCurriculum, 
  CurriculumProgress, 
  TradingSkillLevel,
  skillLevelConfig,
  useUpdateCurriculumProgress
} from '@/hooks/useTradingCommand';

interface TradingCurriculumViewProps {
  curriculum: TradingCurriculum[];
  progress: CurriculumProgress[];
  userSkillLevel: TradingSkillLevel;
  isLoading: boolean;
}

const skillLevelOrder: TradingSkillLevel[] = ['recruit', 'trainee', 'operator', 'specialist', 'commander', 'strategist'];

export function TradingCurriculumView({ curriculum, progress, userSkillLevel, isLoading }: TradingCurriculumViewProps) {
  const updateProgress = useUpdateCurriculumProgress();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  const getProgressStatus = (curriculumId: string) => {
    const p = progress.find(pr => pr.curriculum_id === curriculumId);
    return p?.status || 'not_started';
  };

  const canAccessModule = (requiredLevel: TradingSkillLevel) => {
    const userIndex = skillLevelOrder.indexOf(userSkillLevel);
    const requiredIndex = skillLevelOrder.indexOf(requiredLevel);
    return userIndex >= requiredIndex;
  };

  const handleStartModule = (curriculumId: string) => {
    updateProgress.mutate({ curriculumId, status: 'in_progress' });
  };

  const handleCompleteModule = (curriculumId: string) => {
    updateProgress.mutate({ curriculumId, status: 'completed' });
  };

  const completedCount = curriculum.filter(c => {
    const status = getProgressStatus(c.id);
    return status === 'completed' || status === 'mastered';
  }).length;

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Training Curriculum
          </CardTitle>
          <CardDescription>
            Complete modules to advance your skill level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Progress value={(completedCount / curriculum.length) * 100} className="h-3" />
            </div>
            <div className="text-sm font-medium">
              {completedCount}/{curriculum.length} Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Module List */}
      <div className="space-y-4">
        {curriculum.map((module) => {
          const status = getProgressStatus(module.id);
          const isAccessible = canAccessModule(module.skill_level_required);
          const config = skillLevelConfig[module.skill_level_required];

          return (
            <Card key={module.id} className={!isAccessible ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`p-3 rounded-full ${
                    status === 'completed' || status === 'mastered' 
                      ? 'bg-green-100 text-green-600' 
                      : status === 'in_progress'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {status === 'completed' || status === 'mastered' ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : status === 'in_progress' ? (
                      <Play className="h-5 w-5" />
                    ) : !isAccessible ? (
                      <Lock className="h-5 w-5" />
                    ) : (
                      <BookOpen className="h-5 w-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">
                        Module {module.module_order}: {module.title}
                      </h3>
                      {status === 'mastered' && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {module.description}
                    </p>

                    {/* Learning Objectives */}
                    {module.learning_objectives && module.learning_objectives.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Learning Objectives:</p>
                        <ul className="text-sm space-y-1">
                          {module.learning_objectives.slice(0, 3).map((objective, i) => (
                            <li key={i} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              {objective}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant="outline" className={config.color.replace('bg-', 'border-') + ' bg-opacity-10'}>
                        {config.label} Level
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {module.estimated_hours} hours
                      </div>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex-shrink-0">
                    {!isAccessible ? (
                      <Button variant="outline" disabled>
                        <Lock className="h-4 w-4 mr-1" />
                        Locked
                      </Button>
                    ) : status === 'not_started' ? (
                      <Button onClick={() => handleStartModule(module.id)}>
                        Start Module
                      </Button>
                    ) : status === 'in_progress' ? (
                      <Button onClick={() => handleCompleteModule(module.id)}>
                        Mark Complete
                      </Button>
                    ) : (
                      <Button variant="outline">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
