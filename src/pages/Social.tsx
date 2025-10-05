import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNavigate } from "react-router-dom";
import { 
  Building2,
  Shield,
  ArrowLeft,
  Search,
  Users,
  MessageSquare,
  Heart,
  Share2,
  TrendingUp,
  Briefcase,
  Globe,
  MapPin,
  Send,
  Vote,
  Filter
} from "lucide-react";

type Post = {
  id: string;
  author: {
    name: string;
    company: string;
    verified: boolean;
    industry: string;
    location: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
};

const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Sarah Chen",
      company: "TechFlow Solutions LLC",
      verified: true,
      industry: "Technology",
      location: "San Francisco, CA"
    },
    content: "Just closed our Series A! Looking for recommendations for fractional CFOs who specialize in SaaS. Any verified business owners have experience with this?",
    timestamp: "2h ago",
    likes: 47,
    comments: 23,
    shares: 8
  },
  {
    id: "2",
    author: {
      name: "Michael Rodriguez",
      company: "GreenBuild Construction Inc",
      verified: true,
      industry: "Construction",
      location: "Austin, TX"
    },
    content: "Implemented the AI workflow automation from Biz Dev App - saved 15 hours/week on admin tasks. Game changer for construction management. Happy to share my setup!",
    timestamp: "5h ago",
    likes: 89,
    comments: 34,
    shares: 15
  },
  {
    id: "3",
    author: {
      name: "Jessica Thompson",
      company: "Wellness Partners LLC",
      verified: true,
      industry: "Healthcare",
      location: "Denver, CO"
    },
    content: "Seeking verified business owners in the healthcare space for a potential partnership on a new telehealth platform. Must have active EIN and be willing to share equity.",
    timestamp: "1d ago",
    likes: 56,
    comments: 41,
    shares: 12
  }
];

const Social = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("feed");
  const [newPost, setNewPost] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handlePost = () => {
    if (!newPost.trim()) return;
    // In real app, this would create a new post
    setNewPost("");
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-elevated">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <div className="h-8 w-px bg-border"></div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                <div>
                  <h1 className="text-lg font-bold">Business Network</h1>
                  <p className="text-xs text-muted-foreground">Verified owners only</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses, people..."
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Badge variant="outline" className="border-primary text-primary">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left Sidebar - User Profile */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="text-center mb-4">
                <Avatar className="w-20 h-20 mx-auto mb-3 bg-gradient-primary">
                  <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-primary-foreground">
                    JD
                  </div>
                </Avatar>
                <h3 className="font-semibold text-lg">John Doe</h3>
                <p className="text-sm text-muted-foreground mb-2">Your Business LLC</p>
                <Badge className="bg-primary/10 text-primary border-primary/30">
                  <Shield className="w-3 h-3 mr-1" />
                  BD-ID Verified
                </Badge>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Technology</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">San Francisco, CA</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">yourbusiness.com</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border mt-4">
                <div className="text-center">
                  <div className="font-bold text-lg">247</div>
                  <div className="text-xs text-muted-foreground">Connections</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">89</div>
                  <div className="text-xs text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-lg">1.2k</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
              </div>
            </Card>

            {/* Quick Links */}
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-3 text-sm">Quick Links</h3>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Users className="w-4 h-4 mr-2" />
                  My Network
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Vote className="w-4 h-4 mr-2" />
                  CivicPulse™ Votes
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Opportunities
                </Button>
              </div>
            </Card>
          </div>

          {/* Main Content - Feed */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post */}
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex gap-3">
                <Avatar className="w-10 h-10 bg-gradient-primary shrink-0">
                  <div className="flex items-center justify-center w-full h-full font-bold text-primary-foreground">
                    JD
                  </div>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share insights, ask questions, or post opportunities..."
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    className="min-h-[100px] resize-none"
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Poll
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Users className="w-4 h-4 mr-2" />
                        Collab
                      </Button>
                    </div>
                    <Button onClick={handlePost} disabled={!newPost.trim()}>
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Filter */}
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="feed">Latest</TabsTrigger>
                  <TabsTrigger value="trending">Trending</TabsTrigger>
                  <TabsTrigger value="following">Following</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Posts */}
            <ScrollArea className="h-[calc(100vh-24rem)]">
              <div className="space-y-4">
                {mockPosts.map((post) => (
                  <Card key={post.id} className="p-6 shadow-elevated border border-border hover:shadow-glow transition-all">
                    <div className="flex gap-3">
                      <Avatar className="w-12 h-12 bg-gradient-chrome shrink-0">
                        <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep">
                          {post.author.name.split(' ').map(n => n[0]).join('')}
                        </div>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold">{post.author.name}</h4>
                              {post.author.verified && (
                                <Shield className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{post.author.company}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {post.author.industry}
                              </Badge>
                              <span>•</span>
                              <span>{post.author.location}</span>
                              <span>•</span>
                              <span>{post.timestamp}</span>
                            </div>
                          </div>
                        </div>

                        <p className="text-sm mb-4 leading-relaxed">{post.content}</p>

                        <div className="flex items-center gap-6 pt-3 border-t border-border">
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <Heart className="w-4 h-4 mr-2" />
                            {post.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            {post.comments}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                            <Share2 className="w-4 h-4 mr-2" />
                            {post.shares}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <div className="lg:col-span-3 space-y-4">
            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                Trending Topics
              </h3>
              <div className="space-y-3">
                {[
                  { topic: "AI Automation", posts: 342 },
                  { topic: "Series A Funding", posts: 187 },
                  { topic: "B-Corp Certification", posts: 156 },
                  { topic: "Remote Teams", posts: 289 }
                ].map((item, idx) => (
                  <div key={idx} className="cursor-pointer hover:bg-muted/50 rounded p-2 transition-colors">
                    <div className="font-semibold text-sm">#{item.topic}</div>
                    <div className="text-xs text-muted-foreground">{item.posts} posts</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 shadow-elevated border border-border">
              <h3 className="font-semibold mb-4">Suggested Connections</h3>
              <div className="space-y-3">
                {[
                  { name: "Alex Kumar", company: "DataViz Pro", industry: "Analytics" },
                  { name: "Emma Wilson", company: "GreenTech Inc", industry: "Sustainability" }
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 bg-gradient-chrome">
                      <div className="flex items-center justify-center w-full h-full font-bold text-navy-deep text-sm">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </div>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate">{person.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{person.company}</div>
                    </div>
                    <Button size="sm" variant="outline">Connect</Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-4 bg-gradient-primary border-0 shadow-glow">
              <h3 className="font-semibold mb-2 text-primary-foreground">CivicPulse™</h3>
              <p className="text-sm text-primary-foreground/80 mb-3">
                Vote on platform features and community guidelines
              </p>
              <Button variant="secondary" size="sm" className="w-full">
                <Vote className="w-4 h-4 mr-2" />
                View Active Votes
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Social;