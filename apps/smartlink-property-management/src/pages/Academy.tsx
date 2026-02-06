import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/layout/PublicLayout";
import { 
  ArrowRight, 
  BookOpen, 
  Video, 
  FileText, 
  TrendingUp, 
  Users, 
  Clock, 
  Star,
  Sparkles,
  Play,
  Download,
  ChevronRight,
  Newspaper,
  GraduationCap,
  Lightbulb,
  BarChart3
} from "lucide-react";

const Academy = () => {
  const featuredContent = [
    {
      category: "Operations",
      title: "Building Systems That Scale: Operational Excellence in Hospitality",
      description: "How we built operational frameworks that maintain consistency across properties while empowering on-site teams to make real-time decisions.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&auto=format&fit=crop&q=60",
      readTime: "10 min read",
      type: "Article",
      featured: true,
      slug: "/academy/operational-excellence",
      author: {
        name: "Jason Lopez",
        role: "Operations Director",
        avatar: "JL",
      },
    },
    {
      category: "Market Expansion",
      title: "Emerging Markets in Hospitality: Where the Opportunity Lies",
      description: "An inside look at the untapped markets we're seeing across the industry and what operators need to know before expanding their portfolios.",
      image: "https://images.unsplash.com/photo-1551632436-cbf8dd35adfa?w=800&auto=format&fit=crop&q=60",
      readTime: "12 min read",
      type: "Article",
      featured: true,
      slug: "/academy/emerging-markets",
      author: {
        name: "Bill Mercer",
        role: "Director of New Markets",
        avatar: "BM",
      },
    },
    {
      category: "Owner Perspective",
      title: "Leading from Within: Building Teams That Thrive",
      description: "What it means to be a team, leading from an owner's perspective by working alongside your people to build a culture that creates a beautiful work environment.",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&auto=format&fit=crop&q=60",
      readTime: "10 min read",
      type: "Article",
      featured: true,
      slug: "/academy/owner-lessons",
      author: {
        name: "Brittany Patel",
        role: "Owner & Operator",
        avatar: "BP",
      },
    },
    {
      category: "Leadership",
      title: "What It Means to Be a Leader: Why Leadership Matters",
      description: "A deep exploration of what true leadership means in hospitality—the qualities that define great leaders and the impact they create.",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60",
      readTime: "12 min read",
      type: "Article",
      featured: true,
      slug: "/academy/leadership-matters",
      author: {
        name: "Jason Lopez",
        role: "Operations Director",
        avatar: "JL",
      },
    },
  ];

  const categories = [
    {
      icon: Newspaper,
      title: "Industry News",
      description: "Stay updated with the latest hospitality trends and market insights",
      count: 24,
      color: "from-blue-500 to-blue-700",
    },
    {
      icon: GraduationCap,
      title: "Training Courses",
      description: "Professional development for hospitality teams at all levels",
      count: 18,
      color: "from-purple-500 to-purple-700",
    },
    {
      icon: Lightbulb,
      title: "Best Practices",
      description: "Proven strategies from top-performing properties",
      count: 32,
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: BarChart3,
      title: "Case Studies",
      description: "Real results from SmartLink partner properties",
      count: 12,
      color: "from-emerald-500 to-teal-600",
    },
  ];

  const latestArticles = [
    {
      title: "5 Ways to Improve Your Property's Online Reviews",
      category: "Guest Experience",
      date: "Dec 5, 2025",
      readTime: "6 min",
    },
    {
      title: "Seasonal Staffing Strategies That Actually Work",
      category: "Operations",
      date: "Dec 3, 2025",
      readTime: "8 min",
    },
    {
      title: "Technology Integration: What's Worth the Investment",
      category: "Tech & Innovation",
      date: "Dec 1, 2025",
      readTime: "10 min",
    },
    {
      title: "Building a Culture of Continuous Improvement",
      category: "Leadership",
      date: "Nov 28, 2025",
      readTime: "7 min",
    },
    {
      title: "Revenue Management Best Practices for Boutique Hotels",
      category: "Revenue",
      date: "Nov 25, 2025",
      readTime: "9 min",
    },
  ];

  const popularCourses = [
    {
      title: "Front Desk Excellence",
      level: "Beginner",
      duration: "2 hours",
      rating: 4.9,
      students: 1240,
    },
    {
      title: "Housekeeping Standards & Efficiency",
      level: "Intermediate",
      duration: "3 hours",
      rating: 4.8,
      students: 890,
    },
    {
      title: "Leadership for Property Managers",
      level: "Advanced",
      duration: "5 hours",
      rating: 4.9,
      students: 560,
    },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-slate-50 via-white to-gray-50 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]"></div>
        <div className="absolute top-0 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-br from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -translate-y-32 sm:-translate-y-40 lg:-translate-y-48 translate-x-32 sm:translate-x-40 lg:translate-x-48"></div>
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 lg:w-80 h-48 sm:h-64 lg:h-80 bg-gradient-to-tr from-purple-100/20 to-blue-100/20 rounded-full blur-3xl translate-y-24 sm:translate-y-32 -translate-x-24 sm:-translate-x-32"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-slate-100 rounded-full px-4 sm:px-6 py-2 mb-6 sm:mb-8">
              <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 text-slate-600" />
              <span className="text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider">SmartLink Academy</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-6 sm:mb-8 text-slate-900 leading-tight">
              Learn. Grow.{" "}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">Lead.</span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4">
              Your destination for hospitality insights, professional training, and industry best practices. 
              Stay ahead with expert content designed for operators.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto min-h-[48px]">
                Explore Content
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <Button variant="outline" size="lg" className="bg-white border-2 border-slate-300 text-slate-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-purple-600 hover:text-white hover:border-transparent transition-all duration-300 font-bold text-sm sm:text-base px-6 sm:px-8 py-3 rounded-xl w-full sm:w-auto min-h-[48px]">
                Browse Courses
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold text-slate-700">Featured</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Trending This Week
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              The most popular content from our library, handpicked for hospitality professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {featuredContent.map((item, index) => (
              <Link key={index} to={item.slug} className="block">
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white h-full">
                  <div className="relative h-48 sm:h-56 overflow-hidden">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    <Badge className="absolute top-4 left-4 bg-white/90 text-slate-700 hover:bg-white">
                      {item.category}
                    </Badge>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <span className="text-white/90 text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.readTime}
                      </span>
                      <Badge variant="secondary" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                        {item.type}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4">
                      {item.description}
                    </p>
                    
                    {/* Author Section */}
                    <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {item.author.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{item.author.name}</p>
                        <p className="text-xs text-slate-500">{item.author.role}</p>
                      </div>
                      <span className="text-blue-600 font-semibold text-sm flex items-center">
                        Read
                        <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Find exactly what you need to elevate your property operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <Card key={index} className="group cursor-pointer border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white overflow-hidden">
                <CardContent className="p-6 sm:p-8">
                  <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <category.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                    {category.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-sm font-medium">{category.count} resources</span>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Articles & Popular Courses */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Latest Articles */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Latest Articles</h2>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-semibold">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {latestArticles.map((article, index) => (
                  <Card key={index} className="group cursor-pointer border border-slate-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white">
                    <CardContent className="p-4 sm:p-5 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 text-sm sm:text-base">
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 mt-1 text-xs sm:text-sm text-slate-500">
                          <span>{article.category}</span>
                          <span>•</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 transition-colors flex-shrink-0" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Popular Courses */}
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Popular Courses</h2>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 font-semibold">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-4">
                {popularCourses.map((course, index) => (
                  <Card key={index} className="group cursor-pointer border border-slate-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300 bg-white">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                          <Play className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 group-hover:text-purple-600 transition-colors text-sm sm:text-base">
                            {course.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2">
                            <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                              {course.level}
                            </Badge>
                            <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {course.duration}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                              {course.rating}
                            </span>
                            <span className="text-xs sm:text-sm text-slate-500 flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {course.students.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(59,130,246,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(147,51,234,0.1),transparent_50%)]"></div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-2 mb-6 backdrop-blur-sm">
              <TrendingUp className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-semibold text-white/80">Stay Informed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
              Get Weekly Industry Insights
            </h2>
            <p className="text-slate-300 mb-8 max-w-xl mx-auto">
              Join hospitality professionals receiving our curated newsletter with the latest trends, tips, and best practices.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm"
              />
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 min-h-[48px]">
                Subscribe
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <p className="text-slate-500 text-xs mt-4">No spam, unsubscribe anytime.</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Academy;
