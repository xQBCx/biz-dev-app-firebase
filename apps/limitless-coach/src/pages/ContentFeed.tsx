import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Video, 
  Image as ImageIcon, 
  Dumbbell, 
  Target, 
  Utensils, 
  Sparkles,
  Play,
  Heart,
  MessageCircle,
  Share2,
  ArrowLeft,
  Grid,
  List,
  Book
} from "lucide-react";

interface CoachContent {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  media_url: string;
  thumbnail_url: string | null;
  view_count: number;
  like_count: number;
  created_at: string;
}

interface DigitalBook {
  id: string;
  title: string;
  description: string | null;
  author: string;
  cover_image_url: string | null;
  price: number;
  compare_at_price: number | null;
  category: string | null;
  pages: number | null;
}

const contentTypeConfig = {
  video: { label: "Video", icon: Video, color: "bg-red-500" },
  image: { label: "Image", icon: ImageIcon, color: "bg-blue-500" },
  workout_demo: { label: "Workout Demo", icon: Dumbbell, color: "bg-orange-500" },
  form_tip: { label: "Form Tip", icon: Target, color: "bg-green-500" },
  meal_prep: { label: "Meal Prep", icon: Utensils, color: "bg-purple-500" },
  motivation: { label: "Motivation", icon: Sparkles, color: "bg-pink-500" },
};

const categoryLabels: Record<string, string> = {
  fitness: "Fitness & Training",
  nutrition: "Nutrition",
  mindset: "Mindset",
  lifestyle: "Lifestyle",
  training_program: "Training Program",
};

export default function ContentFeed() {
  const [content, setContent] = useState<CoachContent[]>([]);
  const [books, setBooks] = useState<DigitalBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("feed");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchContent();
    fetchBooks();
  }, []);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from("coach_content")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("digital_books")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const filteredContent = selectedCategory === "all" 
    ? content 
    : content.filter(c => c.content_type === selectedCategory);

  const handleLike = async (id: string) => {
    // Increment like count
    try {
      const item = content.find(c => c.id === id);
      if (!item) return;

      await supabase
        .from("coach_content")
        .update({ like_count: (item.like_count || 0) + 1 })
        .eq("id", id);

      setContent(prev => prev.map(c => 
        c.id === id ? { ...c, like_count: (c.like_count || 0) + 1 } : c
      ));
    } catch (error) {
      console.error("Error liking content:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/today">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Coach Content</h1>
                <p className="text-sm text-muted-foreground">Workouts, tips, and motivation from Coach Bill</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="feed">Feed</TabsTrigger>
            <TabsTrigger value="workouts">
              <Dumbbell className="h-4 w-4 mr-1" />
              Workouts
            </TabsTrigger>
            <TabsTrigger value="form_tip">
              <Target className="h-4 w-4 mr-1" />
              Form Tips
            </TabsTrigger>
            <TabsTrigger value="meal_prep">
              <Utensils className="h-4 w-4 mr-1" />
              Meal Prep
            </TabsTrigger>
            <TabsTrigger value="books">
              <Book className="h-4 w-4 mr-1" />
              Books
            </TabsTrigger>
          </TabsList>

          {/* Feed Tab */}
          <TabsContent value="feed">
            {isLoading ? (
              <div className="text-center py-12">Loading...</div>
            ) : content.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No content yet</h3>
                  <p className="text-muted-foreground">
                    Check back soon for new workout videos and tips
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-4"
              }>
                {content.map((item) => {
                  const config = contentTypeConfig[item.content_type as keyof typeof contentTypeConfig];
                  const IconComponent = config?.icon || Video;

                  return (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative aspect-video bg-muted">
                        {item.content_type === "video" ? (
                          <>
                            <video
                              src={item.media_url}
                              className="w-full h-full object-cover"
                              poster={item.thumbnail_url || undefined}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
                                <Play className="h-8 w-8 text-white" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <img
                            src={item.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 left-2">
                          <Badge className={config?.color || "bg-primary"}>
                            <IconComponent className="h-3 w-3 mr-1" />
                            {config?.label || item.content_type}
                          </Badge>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold line-clamp-1 mb-1">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <button 
                              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                              onClick={() => handleLike(item.id)}
                            >
                              <Heart className="h-4 w-4" />
                              {item.like_count}
                            </button>
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <MessageCircle className="h-4 w-4" />
                              0
                            </button>
                            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
                              <Share2 className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Category Tabs */}
          {["workouts", "form_tip", "meal_prep"].map((category) => (
            <TabsContent key={category} value={category}>
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
                : "space-y-4"
              }>
                {content
                  .filter(c => category === "workouts" 
                    ? c.content_type === "workout_demo" || c.content_type === "video"
                    : c.content_type === category
                  )
                  .map((item) => {
                    const config = contentTypeConfig[item.content_type as keyof typeof contentTypeConfig];
                    const IconComponent = config?.icon || Video;

                    return (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          {item.content_type === "video" || item.content_type === "workout_demo" ? (
                            <>
                              <video
                                src={item.media_url}
                                className="w-full h-full object-cover"
                                poster={item.thumbnail_url || undefined}
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <button className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
                                  <Play className="h-8 w-8 text-white" />
                                </button>
                              </div>
                            </>
                          ) : (
                            <img
                              src={item.media_url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold line-clamp-1 mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                {content.filter(c => category === "workouts" 
                  ? c.content_type === "workout_demo" || c.content_type === "video"
                  : c.content_type === category
                ).length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground">
                    No content in this category yet
                  </div>
                )}
              </div>
            </TabsContent>
          ))}

          {/* Books Tab */}
          <TabsContent value="books">
            {books.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No books available yet</h3>
                  <p className="text-muted-foreground">
                    Check back soon for training guides and ebooks
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {books.map((book) => (
                  <Card key={book.id} className="overflow-hidden">
                    <div className="relative aspect-[3/4] bg-muted">
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Book className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{book.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{book.author}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">${book.price}</span>
                        {book.compare_at_price && (
                          <span className="text-xs text-muted-foreground line-through">
                            ${book.compare_at_price}
                          </span>
                        )}
                      </div>
                      <Link to={`/shop/book/${book.id}`}>
                        <Button size="sm" className="w-full mt-2">
                          View Details
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}