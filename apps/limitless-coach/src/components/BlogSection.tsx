import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Image, Video, Link as LinkIcon, ArrowRight, Calendar } from "lucide-react";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  title: string;
  content: string | null;
  excerpt: string | null;
  content_type: string;
  media_url: string | null;
  external_link: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
}

const contentTypeIcons = {
  article: FileText,
  image: Image,
  video: Video,
  link: LinkIcon,
};

const contentTypeColors = {
  article: "bg-blue-500/20 text-blue-400",
  image: "bg-green-500/20 text-green-400",
  video: "bg-purple-500/20 text-purple-400",
  link: "bg-orange-500/20 text-orange-400",
};

export const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("is_published", true)
        .order("published_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderMediaPreview = (post: BlogPost) => {
    if (post.content_type === "image" && post.media_url) {
      return (
        <img
          src={post.media_url}
          alt={post.title}
          className="w-full h-48 object-cover rounded-t-lg"
        />
      );
    }
    if (post.content_type === "video" && post.media_url) {
      return (
        <video
          src={post.media_url}
          className="w-full h-48 object-cover rounded-t-lg"
          muted
          playsInline
        />
      );
    }
    return (
      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent/20 rounded-t-lg flex items-center justify-center">
        {(() => {
          const Icon = contentTypeIcons[post.content_type as keyof typeof contentTypeIcons] || FileText;
          return <Icon className="h-12 w-12 text-primary/50" />;
        })()}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-80 rounded-lg" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Latest Updates
          </h2>
          <p className="text-muted-foreground text-lg">
            Stay tuned for the latest fitness tips, workouts, and inspiration.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Latest Updates
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Daily fitness tips, workout demos, nutrition guides, and motivation to keep you moving forward.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => {
            const Icon = contentTypeIcons[post.content_type as keyof typeof contentTypeIcons] || FileText;
            const colorClass = contentTypeColors[post.content_type as keyof typeof contentTypeColors] || contentTypeColors.article;

            return (
              <Card
                key={post.id}
                className="overflow-hidden hover:shadow-lg transition-all duration-300 bg-card border-border group"
              >
                {renderMediaPreview(post)}
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary" className={colorClass}>
                      <Icon className="h-3 w-3 mr-1" />
                      {post.content_type}
                    </Badge>
                    {post.published_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(post.published_at), "MMM d, yyyy")}
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {post.external_link ? (
                    <a
                      href={post.external_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read More <ArrowRight className="h-4 w-4" />
                    </a>
                  ) : (
                    <Link
                      to={`/blog/${post.id}`}
                      className="text-primary text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read More <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" asChild>
            <Link to="/blog">
              View All Posts <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
