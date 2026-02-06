import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Play, CheckCircle, Clock, Award, Target, TrendingUp, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import CourseViewer from './CourseViewer';

interface Enrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  status: string;
  enrolled_at: string;
  started_at: string | null;
  completed_at: string | null;
  academy_courses: {
    title: string;
    description: string;
    department: string;
    difficulty: string;
    duration_minutes: number;
    xp_reward: number;
    instructor_name: string;
  };
}

interface LearningStats {
  totalEnrollments: number;
  completedCourses: number;
  inProgressCourses: number;
  totalXPEarned: number;
  hoursLearned: number;
}

const LearningDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [featuredCourses, setFeaturedCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [stats, setStats] = useState<LearningStats>({
    totalEnrollments: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalXPEarned: 0,
    hoursLearned: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchEnrollments();
        fetchFeaturedCourses();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First get enrollments
      const { data: enrollmentData, error: enrollmentError } = await supabase
        .from('academy_course_enrollments')
        .select('*')
        .eq('user_id', user.id)
        .order('enrolled_at', { ascending: false });

      if (enrollmentError) throw enrollmentError;

      if (!enrollmentData || enrollmentData.length === 0) {
        // Set demo data for demonstration
        const demoEnrollments = [
          {
            id: 'demo-1',
            course_id: 'demo-course-1',
            user_id: user.id,
            progress_percentage: 75,
            status: 'in_progress',
            enrolled_at: '2024-01-15T10:00:00Z',
            started_at: '2024-01-15T10:30:00Z',
            completed_at: null,
            academy_courses: {
              title: 'Customer Service Excellence',
              description: 'Master the art of exceptional guest service with proven techniques and real-world scenarios.',
              department: 'Front Desk',
              difficulty: 'beginner',
              duration_minutes: 45,
              xp_reward: 100,
              instructor_name: 'Sarah Johnson'
            }
          },
          {
            id: 'demo-2',
            course_id: 'demo-course-2',
            user_id: user.id,
            progress_percentage: 100,
            status: 'completed',
            enrolled_at: '2024-01-10T09:00:00Z',
            started_at: '2024-01-10T09:15:00Z',
            completed_at: '2024-01-12T14:30:00Z',
            academy_courses: {
              title: 'Safety Protocols & Emergency Procedures',
              description: 'Essential safety knowledge for hospitality professionals.',
              department: 'General',
              difficulty: 'beginner',
              duration_minutes: 30,
              xp_reward: 75,
              instructor_name: 'Mike Chen'
            }
          },
          {
            id: 'demo-3',
            course_id: 'demo-course-3',
            user_id: user.id,
            progress_percentage: 0,
            status: 'enrolled',
            enrolled_at: '2024-01-20T11:00:00Z',
            started_at: null,
            completed_at: null,
            academy_courses: {
              title: 'Advanced Housekeeping Techniques',
              description: 'Professional cleaning methods and efficiency optimization for housekeeping staff.',
              department: 'Housekeeping',
              difficulty: 'intermediate',
              duration_minutes: 60,
              xp_reward: 120,
              instructor_name: 'Maria Rodriguez'
            }
          }
        ];

        setEnrollments(demoEnrollments as Enrollment[]);
        setStats({
          totalEnrollments: 3,
          completedCourses: 1,
          inProgressCourses: 2,
          totalXPEarned: 75,
          hoursLearned: 0.5,
        });
        setLoading(false);
        return;
      }

      // Get course details for each enrollment
      const courseIds = enrollmentData.map(e => e.course_id);
      const { data: courseData, error: courseError } = await supabase
        .from('academy_courses')
        .select('*')
        .in('id', courseIds);

      if (courseError) throw courseError;

      // Combine enrollment and course data
      const enrichedEnrollments = enrollmentData.map(enrollment => {
        const course = courseData?.find(c => c.id === enrollment.course_id);
        return {
          ...enrollment,
          academy_courses: course ? {
            title: course.title,
            description: course.description,
            department: course.department,
            difficulty: course.difficulty,
            duration_minutes: course.duration_minutes,
            xp_reward: course.xp_reward,
            instructor_name: course.instructor_name,
          } : null
        };
      }).filter(e => e.academy_courses !== null);

      setEnrollments(enrichedEnrollments as Enrollment[]);
      
      // Calculate stats
      const completed = enrichedEnrollments.filter(e => e.status === 'completed').length;
      const inProgress = enrichedEnrollments.filter(e => e.status === 'in_progress' || e.status === 'enrolled').length;
      const totalXP = enrichedEnrollments
        .filter(e => e.status === 'completed')
        .reduce((sum, e) => sum + (e.academy_courses?.xp_reward || 0), 0);
      const totalHours = enrichedEnrollments
        .filter(e => e.status === 'completed')
        .reduce((sum, e) => sum + (e.academy_courses?.duration_minutes || 0), 0);

      setStats({
        totalEnrollments: enrichedEnrollments.length,
        completedCourses: completed,
        inProgressCourses: inProgress,
        totalXPEarned: totalXP,
        hoursLearned: Math.round(totalHours / 60 * 10) / 10, // Convert to hours with 1 decimal
      });

    } catch (error) {
      console.error('Error fetching enrollments:', error);
      toast({
        title: "Error",
        description: "Failed to load your learning progress.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('academy_courses')
        .select('*')
        .eq('active', true)
        .eq('featured', true)
        .order('created_at', { ascending: false })
        .limit(2);

      if (error) throw error;
      setFeaturedCourses(data || []);
    } catch (error) {
      console.error('Error fetching featured courses:', error);
    }
  };

  const startCourse = async (enrollmentId: string) => {
    try {
      const { error } = await supabase
        .from('academy_course_enrollments')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', enrollmentId);

      if (error) throw error;

      toast({
        title: "Course Started",
        description: "Good luck with your learning journey!",
      });

      fetchEnrollments(); // Refresh data
    } catch (error) {
      console.error('Error starting course:', error);
      toast({
        title: "Error",
        description: "Failed to start course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'enrolled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
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

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your learning progress...</p>
        </div>
      </div>
    );
  }

  if (selectedCourse) {
    return (
      <CourseViewer 
        courseId={selectedCourse} 
        onBack={() => setSelectedCourse(null)} 
      />
    );
  }

  const inProgressEnrollments = enrollments.filter(e => e.status === 'in_progress');
  const enrolledEnrollments = enrollments.filter(e => e.status === 'enrolled');
  const completedEnrollments = enrollments.filter(e => e.status === 'completed');


  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{stats.completedCourses}</div>
            <p className="text-sm text-muted-foreground">Completed Courses</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Award className="h-8 w-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{stats.totalXPEarned}</div>
            <p className="text-sm text-muted-foreground">XP Earned</p>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{stats.hoursLearned}</div>
            <p className="text-sm text-muted-foreground">Hours Learned</p>
          </CardContent>
        </Card>
      </div>

      {/* Featured Courses Section */}
      {featuredCourses.length > 0 && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Featured Courses
            </CardTitle>
            <CardDescription>
              Discover our most popular and highly-rated training programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {featuredCourses.map((course) => (
                <Card key={course.id} className="border-2 hover:border-primary/50 transition-all duration-200 hover:shadow-lg cursor-pointer">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(course.difficulty)}>
                              {course.difficulty}
                            </Badge>
                            <Badge variant="secondary">{course.department}</Badge>
                          </div>
                          <h3 className="font-semibold text-lg leading-tight">{course.title}</h3>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {course.description}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.duration_minutes}min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>{course.xp_reward} XP</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-muted-foreground">
                          by {course.instructor_name}
                        </span>
                        <Button 
                          size="sm"
                          onClick={() => setSelectedCourse(course.id)}
                        >
                          View Course
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Continue Learning Section */}
      {inProgressEnrollments.length > 0 && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-primary" />
              Continue Learning
            </CardTitle>
            <CardDescription>
              Pick up where you left off
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressEnrollments.slice(0, 4).map((enrollment) => (
                <Card key={enrollment.id} className="border-2 hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">{enrollment.academy_courses.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {enrollment.academy_courses.instructor_name} • {enrollment.academy_courses.department}
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Progress</span>
                          <span>{enrollment.progress_percentage}%</span>
                        </div>
                        <Progress value={enrollment.progress_percentage} className="h-2" />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge className={getDifficultyColor(enrollment.academy_courses.difficulty)}>
                          {enrollment.academy_courses.difficulty}
                        </Badge>
                        <Button size="sm">
                          <Play className="mr-2 h-3 w-3" />
                          Continue
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Start New Courses */}
      {enrolledEnrollments.length > 0 && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Ready to Start
            </CardTitle>
            <CardDescription>
              Courses you're enrolled in but haven't started yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledEnrollments.map((enrollment) => (
                <Card key={enrollment.id} className="border-2">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h4 className="font-semibold">{enrollment.academy_courses.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.academy_courses.instructor_name}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{enrollment.academy_courses.duration_minutes}min</span>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        {enrollment.academy_courses.xp_reward} XP
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={() => startCourse(enrollment.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Course
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Courses */}
      {completedEnrollments.length > 0 && (
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed Courses
            </CardTitle>
            <CardDescription>
              Your learning achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completedEnrollments.slice(0, 5).map((enrollment) => (
                <div 
                  key={enrollment.id} 
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">{enrollment.academy_courses.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {enrollment.academy_courses.department} • {enrollment.academy_courses.instructor_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      +{enrollment.academy_courses.xp_reward} XP
                    </Badge>
                    <Badge className={getDifficultyColor(enrollment.academy_courses.difficulty)}>
                      {enrollment.academy_courses.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
              {completedEnrollments.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  +{completedEnrollments.length - 5} more completed courses
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {enrollments.length === 0 && (
        <Card className="card-elegant">
          <CardContent className="text-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-4">Start Your Learning Journey</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              You haven't enrolled in any courses yet. Browse our catalog to find courses 
              that match your career goals and start earning XP today!
            </p>
            <Button>
              <BookOpen className="mr-2 h-4 w-4" />
              Browse Course Catalog
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LearningDashboard;