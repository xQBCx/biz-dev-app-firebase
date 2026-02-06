import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Award, 
  ArrowLeft, 
  Users, 
  Target,
  PlayCircle,
  FileText,
  Video
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import ModulePlayer from './ModulePlayer';

interface Course {
  id: string;
  title: string;
  description: string;
  department: string;
  difficulty: string;
  duration_minutes: number;
  xp_reward: number;
  instructor_name: string;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  thumbnail_url?: string;
}

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

interface CourseViewerProps {
  courseId: string;
  onBack: () => void;
}

const CourseViewer = ({ courseId, onBack }: CourseViewerProps) => {
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user && !authLoading) {
      fetchCourseData();
    }
  }, [courseId, user, authLoading]);

  const fetchCourseData = async () => {
    if (!user) return;
    
    try {
      // Fetch course details
      const { data: courseData, error: courseError } = await supabase
        .from('academy_courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch modules
      const { data: moduleData, error: moduleError } = await supabase
        .from('academy_course_modules')
        .select('*')
        .eq('course_id', courseId)
        .eq('active', true)
        .order('order_index');

      if (moduleError) throw moduleError;
      setModules(moduleData || []);

      // Check enrollment status
      const { data: enrollmentData } = await supabase
        .from('academy_course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .eq('course_id', courseId)
        .single();

      setEnrollment(enrollmentData);

    } catch (error) {
      console.error('Error fetching course data:', error);
      toast({
        title: "Error",
        description: "Failed to load course details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in courses.",
        variant: "destructive",
      });
      return;
    }
    
    try {

      const { error } = await supabase
        .from('academy_course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
          status: 'enrolled',
          progress_percentage: 0,
        });

      if (error) throw error;

      toast({
        title: "Successfully Enrolled!",
        description: "You can now start this course.",
      });

      fetchCourseData(); // Refresh enrollment status
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Error",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const startCourse = async () => {
    if (!enrollment) return;

    try {
      const { error } = await supabase
        .from('academy_course_enrollments')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', enrollment.id);

      if (error) throw error;

      toast({
        title: "Course Started!",
        description: "Good luck with your learning journey!",
      });

      fetchCourseData(); // Refresh status
    } catch (error) {
      console.error('Error starting course:', error);
      toast({
        title: "Error",
        description: "Failed to start course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getModuleIcon = (contentType: string) => {
    switch (contentType) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'reading': return <FileText className="h-4 w-4" />;
      default: return <PlayCircle className="h-4 w-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Course not found.</p>
        <Button onClick={onBack} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>
      </div>
    );
  }

  const handleModuleComplete = async (moduleId: string) => {
    // Add module completion logic here
    console.log('Module completed:', moduleId);
    setActiveModule(null);
  };

  return (
    <div className="space-y-6">
      {/* Module Player */}
      <ModulePlayer
        module={activeModule}
        isOpen={!!activeModule}
        onClose={() => setActiveModule(null)}
        onComplete={handleModuleComplete}
      />

      {/* Header */}
      <div className="flex items-center gap-4">
        <Button onClick={onBack} variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Catalog
        </Button>
      </div>

      {/* Course Hero */}
      <Card className="card-elegant">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={getDifficultyColor(course.difficulty)}>
                  {course.difficulty}
                </Badge>
                <Badge variant="secondary">{course.department}</Badge>
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <CardDescription className="text-base max-w-3xl">
                {course.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{course.duration_minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{course.xp_reward} XP</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{course.instructor_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{modules.length} modules</span>
            </div>
          </div>

          {/* Enrollment Action */}
          <div className="flex items-center gap-4">
            {!enrollment ? (
              <Button onClick={enrollInCourse} size="lg">
                <BookOpen className="mr-2 h-4 w-4" />
                Enroll in Course
              </Button>
            ) : enrollment.status === 'enrolled' ? (
              <Button onClick={startCourse} size="lg">
                <Play className="mr-2 h-4 w-4" />
                Start Course
              </Button>
            ) : enrollment.status === 'in_progress' ? (
              <div className="flex items-center gap-4">
                <Button size="lg">
                  <Play className="mr-2 h-4 w-4" />
                  Continue Course
                </Button>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Progress: {enrollment.progress_percentage}%
                  </div>
                  <Progress value={enrollment.progress_percentage} className="w-32 h-2" />
                </div>
              </div>
            ) : (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Learning Objectives */}
          {course.learning_objectives && course.learning_objectives.length > 0 && (
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.learning_objectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Course Modules */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Course Content</CardTitle>
              <CardDescription>
                {modules.length} modules • {course.duration_minutes} minutes total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {modules.length > 0 ? (
                  modules.map((module, index) => (
                    <div 
                      key={module.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => setActiveModule(module)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium">{module.title}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {getModuleIcon(module.content_type)}
                              <span className="capitalize">{module.content_type}</span>
                            </div>
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
                      </div>
                      <Play className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Course modules will be available soon.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Prerequisites</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {course.prerequisites.map((prerequisite, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                      <span className="text-sm">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="text-lg">Topics Covered</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Instructor */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="text-lg">Instructor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="font-medium">{course.instructor_name}</h4>
                  <p className="text-sm text-muted-foreground">{course.department} Expert</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;