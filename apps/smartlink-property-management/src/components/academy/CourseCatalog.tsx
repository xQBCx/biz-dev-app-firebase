import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Clock, Star, Users, Play, Search, Filter, TrendingUp, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import VideoUploadButton from './VideoUploadButton';

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
  featured: boolean;
}

const CourseCatalog = () => {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const departments = ['Front Desk', 'Housekeeping', 'Maintenance', 'Operations', 'General'];
  const difficulties = ['beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [courses, selectedDepartment, selectedDifficulty, searchTerm]);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('academy_courses')
        .select('*')
        .eq('active', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(course => course.department === selectedDepartment);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(course => course.difficulty === selectedDifficulty);
    }

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCourses(filtered);
  };

  const enrollInCourse = async (courseId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to enroll in courses.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('academy_course_enrollments')
        .insert({
          user_id: user.id,
          course_id: courseId,
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Already Enrolled",
            description: "You're already enrolled in this course!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "Enrollment Successful",
          description: "You've been enrolled in the course. Start learning!",
        });
      }
    } catch (error) {
      console.error('Error enrolling in course:', error);
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const featuredCourses = filteredCourses.filter(course => course.featured);
  const departmentCourses = departments.reduce((acc, dept) => {
    acc[dept] = filteredCourses.filter(course => course.department === dept);
    return acc;
  }, {} as Record<string, Course[]>);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Learn + Earn Academy</h1>
        <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
          Advance your career while earning XP and rewards. Choose from our comprehensive course catalog 
          designed specifically for property management professionals.
        </p>
        <div className="flex gap-4 justify-center">
          <div className="flex items-center gap-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500" />
            <span>Career Growth</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Award className="h-4 w-4 text-yellow-500" />
            <span>Earn XP & Rewards</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-blue-500" />
            <span>Expert Instructors</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {difficulties.map(diff => (
                  <SelectItem key={diff} value={diff}>
                    {diff.charAt(0).toUpperCase() + diff.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Course Content */}
      <Tabs defaultValue="featured" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="front-desk">Front Desk</TabsTrigger>
          <TabsTrigger value="housekeeping">Housekeeping</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="general">General</TabsTrigger>
        </TabsList>

        <TabsContent value="featured">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Featured Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map(course => (
                <CourseCard key={course.id} course={course} onEnroll={enrollInCourse} />
              ))}
            </div>
          </div>
        </TabsContent>

        {departments.map(dept => (
          <TabsContent key={dept.toLowerCase().replace(' ', '-')} value={dept.toLowerCase().replace(' ', '-')}>
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{dept} Training</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {departmentCourses[dept]?.map(course => (
                  <CourseCard key={course.id} course={course} onEnroll={enrollInCourse} />
                ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
}

const CourseCard = ({ course, onEnroll }: CourseCardProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="card-elegant hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg leading-tight">{course.title}</CardTitle>
            {course.instructor_name === 'Coach Lopez' && (
              <CoachVideoMessage />
            )}
            <CardDescription className="mt-2">{course.description}</CardDescription>
          </div>
          {course.featured && (
            <Badge className="bg-yellow-100 text-yellow-800 ml-2">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>{course.instructor_name}</span>
        </div>

        {/* Learning Objectives */}
        {course.learning_objectives && course.learning_objectives.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">You'll Learn:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              {course.learning_objectives.slice(0, 3).map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
              {course.learning_objectives.length > 3 && (
                <li className="text-xs text-muted-foreground italic">
                  +{course.learning_objectives.length - 3} more objectives
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Prerequisites:</h4>
            <div className="flex flex-wrap gap-1">
              {course.prerequisites.map((prereq, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.duration_minutes}min</span>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {course.xp_reward} XP
            </Badge>
          </div>
          <Badge className={getDifficultyColor(course.difficulty)}>
            {course.difficulty}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {course.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {course.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{course.tags.length - 3}
            </Badge>
          )}
        </div>

        <Button 
          className="w-full" 
          onClick={() => onEnroll(course.id)}
        >
          <Play className="mr-2 h-4 w-4" />
          Start Learning
        </Button>
      </CardContent>
    </Card>
  );
};

interface CoachVideoMessageProps {}

const CoachVideoMessage = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a video file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (50MB limit)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Video file must be less than 50MB.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const fileName = `coach-message-${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('academy-videos')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('academy-videos')
        .getPublicUrl(data.path);

      setVideoUrl(urlData.publicUrl);
      
      toast({
        title: "Video uploaded successfully",
        description: "Coach's message has been updated.",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-2 p-3 bg-gradient-to-r from-primary/10 to-accent/10 border-l-4 border-primary rounded-r-lg">
      {videoUrl ? (
        <div className="space-y-2">
          <video 
            className="w-full rounded-md"
            controls
            preload="metadata"
            style={{ maxHeight: '200px' }}
          >
            <source src={videoUrl} />
            Your browser does not support the video tag.
          </video>
          <p className="text-xs text-muted-foreground">A word from Coach Lopez</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm italic text-primary font-medium">
            "Leadership isn't about being in charge. It's about taking care of those in your charge."
          </p>
          <p className="text-xs text-muted-foreground">- A word from coach</p>
        </div>
      )}
      
      <div className="mt-2">
        <label 
          htmlFor="coach-video-upload"
          className={`inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 cursor-pointer ${
            isUploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <input
            id="coach-video-upload"
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={isUploading}
            className="hidden"
          />
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
              Uploading...
            </>
          ) : (
            <>
              📹 {videoUrl ? 'Update' : 'Add'} Coach Video
            </>
          )}
        </label>
      </div>
    </div>
  );
};

export default CourseCatalog;
