import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, BookOpen, Award, Play, Settings, Users, Calendar, Gift, Star, Trophy, Zap, Crown, Heart, TrendingUp, Target, ShoppingCart, FileText, Download, ExternalLink } from 'lucide-react';
import CourseCatalog from '@/components/academy/CourseCatalog';
import LearningDashboard from '@/components/academy/LearningDashboard';

const Academy = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>OS</span>
        <span>/</span>
        <span className="text-foreground">Academy</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Learn + Earn Academy</h1>
          <p className="text-muted-foreground">
            Advance your career while earning XP and rewards through comprehensive training
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="learning" className="space-y-6">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="learning">My Learning</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="recognition">Recognition</TabsTrigger>
          <TabsTrigger value="admin">Admin</TabsTrigger>
        </TabsList>

        <TabsContent value="learning" className="space-y-6">
          <LearningDashboard />
        </TabsContent>

        <TabsContent value="catalog" className="space-y-6">
          <CourseCatalog />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          {/* Training Resources Header */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Training Resources Library
              </CardTitle>
              <CardDescription>
                Access PDFs, handbooks, and other training materials anytime
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Resource Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Reference Guides */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-green-500" />
                  Quick Reference
                </CardTitle>
                <CardDescription>Essential guides and checklists</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Housekeeping Checklist", type: "PDF", size: "2.1 MB" },
                  { title: "Emergency Procedures", type: "PDF", size: "1.8 MB" },
                  { title: "Guest Service Scripts", type: "PDF", size: "950 KB" },
                  { title: "Safety Protocols", type: "PDF", size: "3.2 MB" }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Policy Handbooks */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                  Policy Handbooks
                </CardTitle>
                <CardDescription>Complete policy documentation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Employee Handbook 2024", type: "PDF", size: "12.5 MB" },
                  { title: "HR Policies", type: "PDF", size: "8.7 MB" },
                  { title: "Operations Manual", type: "PDF", size: "15.2 MB" },
                  { title: "Brand Standards Guide", type: "PDF", size: "6.3 MB" }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Training Manuals */}
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-500" />
                  Training Manuals
                </CardTitle>
                <CardDescription>Comprehensive training materials</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Leadership Development", type: "PDF", size: "18.9 MB" },
                  { title: "Customer Excellence", type: "PDF", size: "11.4 MB" },
                  { title: "Technical Procedures", type: "PDF", size: "9.8 MB" },
                  { title: "New Hire Orientation", type: "PDF", size: "7.6 MB" }
                ].map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">{resource.title}</p>
                        <p className="text-xs text-muted-foreground">{resource.type} • {resource.size}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost">
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Interactive Training Modules */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5 text-blue-500" />
                Interactive Training Modules
              </CardTitle>
              <CardDescription>
                Alternative training formats beyond traditional video courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: "Virtual Property Tour",
                    description: "360° interactive walkthrough of hotel operations",
                    format: "Interactive 3D",
                    duration: "15 min",
                    icon: "🏨"
                  },
                  {
                    title: "Guest Scenario Simulator",
                    description: "Practice handling difficult guest situations",
                    format: "Simulation",
                    duration: "20 min",
                    icon: "👥"
                  },
                  {
                    title: "Equipment Training Lab",
                    description: "Virtual hands-on equipment operation training",
                    format: "Interactive",
                    duration: "12 min",
                    icon: "🔧"
                  },
                  {
                    title: "Safety Protocol Quiz",
                    description: "Interactive assessment of safety procedures",
                    format: "Quiz",
                    duration: "8 min",
                    icon: "🛡️"
                  },
                  {
                    title: "Brand Standards Game",
                    description: "Gamified brand compliance training",
                    format: "Game",
                    duration: "18 min",
                    icon: "🎯"
                  },
                  {
                    title: "Communication Workshop",
                    description: "Interactive team communication exercises",
                    format: "Workshop",
                    duration: "25 min",
                    icon: "💬"
                  }
                ].map((module, index) => (
                  <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="text-center mb-4">
                        <div className="text-3xl mb-2">{module.icon}</div>
                        <h4 className="font-semibold">{module.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{module.description}</p>
                      </div>
                      <div className="flex justify-between items-center mb-4">
                        <Badge variant="outline">{module.format}</Badge>
                        <span className="text-sm text-muted-foreground">{module.duration}</span>
                      </div>
                      <Button className="w-full">
                        <Play className="mr-2 h-4 w-4" />
                        Start Module
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mobile Learning Options */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-green-500" />
                Mobile Learning
              </CardTitle>
              <CardDescription>
                Access training materials on your mobile device for on-the-go learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Quick Learning Formats</h4>
                  <div className="space-y-3">
                    {[
                      { title: "Micro-Learning Bites", description: "5-minute focused training sessions", icon: "⚡" },
                      { title: "Audio Training Podcasts", description: "Listen while you work", icon: "🎧" },
                      { title: "Flashcard Reviews", description: "Quick knowledge checks", icon: "📚" },
                      { title: "Video Summaries", description: "Key points in 60 seconds", icon: "🎬" }
                    ].map((format, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                        <span className="text-2xl">{format.icon}</span>
                        <div>
                          <p className="font-medium">{format.title}</p>
                          <p className="text-sm text-muted-foreground">{format.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">Offline Access</h4>
                  <div className="p-4 border rounded-lg bg-muted/20">
                    <div className="text-center">
                      <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
                      <p className="font-medium mb-2">Download for Offline</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download training materials to access without internet connection
                      </p>
                      <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Setup Offline Access
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* XP and Level Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="card-elegant lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Experience Progress
                </CardTitle>
                <CardDescription>
                  Your journey to mastery and career advancement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold">Level 1</div>
                    <p className="text-sm text-muted-foreground">New Team Member</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-yellow-500">0 XP</div>
                    <p className="text-sm text-muted-foreground">0 / 100 to next level</p>
                  </div>
                </div>
                <Progress value={0} className="h-3" />
                
                {/* XP Breakdown */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold">0</div>
                    <p className="text-xs text-muted-foreground">Modules</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">0</div>
                    <p className="text-xs text-muted-foreground">Hours</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">0</div>
                    <p className="text-xs text-muted-foreground">Certifications</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold">0</div>
                    <p className="text-xs text-muted-foreground">Culture Points</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-500" />
                  Earned Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">No badges earned yet</p>
                  <Button variant="outline" size="sm">
                    <Target className="mr-2 h-4 w-4" />
                    View Available
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Promotion Pathway */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Career Pathway
              </CardTitle>
              <CardDescription>
                Your path to advancement and leadership roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between py-8">
                <div className="flex items-center space-x-8">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                      1
                    </div>
                    <p className="text-sm font-medium mt-2">New Hire</p>
                    <p className="text-xs text-green-500">Current</p>
                  </div>
                  <div className="h-px bg-muted flex-1"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      2
                    </div>
                    <p className="text-sm font-medium mt-2">Supervisor</p>
                    <p className="text-xs text-muted-foreground">1000 XP</p>
                  </div>
                  <div className="h-px bg-muted flex-1"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      3
                    </div>
                    <p className="text-sm font-medium mt-2">Manager</p>
                    <p className="text-xs text-muted-foreground">3000 XP</p>
                  </div>
                  <div className="h-px bg-muted flex-1"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                      <Crown className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-medium mt-2">GM</p>
                    <p className="text-xs text-muted-foreground">5000 XP</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          {/* Rewards Overview */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-500" />
                Reward Store
              </CardTitle>
              <CardDescription>
                Redeem your XP for amazing rewards and experiences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold">0 XP Available</span>
                  </div>
                </div>
                <Button variant="outline">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  My Redemptions
                </Button>
              </div>

              {/* Reward Categories */}
              <Tabs defaultValue="experience" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="perk">Perks</TabsTrigger>
                  <TabsTrigger value="growth">Growth</TabsTrigger>
                  <TabsTrigger value="career">Career</TabsTrigger>
                </TabsList>

                <TabsContent value="experience" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Extra PTO Day", cost: 1000, description: "Additional paid time off day" },
                      { title: "Weekend Getaway", cost: 2000, description: "Two-night stay at partner hotel" },
                      { title: "Wellness Retreat", cost: 1500, description: "Full-day spa and wellness experience" }
                    ].map((reward, index) => (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{reward.title}</h4>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {reward.cost} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                          <Button className="w-full" disabled>
                            Redeem Reward
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="perk" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Premium Parking", cost: 300, description: "Reserved parking spot for one month" },
                      { title: "Branded Backpack", cost: 250, description: "High-quality company branded gear" },
                      { title: "Free Lunch Week", cost: 400, description: "Five free lunches at property restaurant" }
                    ].map((reward, index) => (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{reward.title}</h4>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {reward.cost} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                          <Button className="w-full" disabled>
                            Redeem Reward
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="growth" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "GM Mentorship", cost: 800, description: "One-on-one session with General Manager" },
                      { title: "Conference Ticket", cost: 3000, description: "Paid attendance to industry conference" },
                      { title: "Leadership Workshop", cost: 1200, description: "Advanced leadership training program" }
                    ].map((reward, index) => (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{reward.title}</h4>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {reward.cost} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                          <Button className="w-full" disabled>
                            Redeem Reward
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="career" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { title: "Promotion Fast Track", cost: 2500, description: "Priority consideration for next promotion cycle" }
                    ].map((reward, index) => (
                      <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold">{reward.title}</h4>
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                              {reward.cost} XP
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">{reward.description}</p>
                          <Button className="w-full" disabled>
                            Redeem Reward
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-6">
          {/* Recognition Wall */}
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-gold" />
                Recognition Wall
              </CardTitle>
              <CardDescription>
                Celebrating our top performers and culture champions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                <Card className="border-gold bg-gradient-to-br from-yellow-50 to-orange-50">
                  <CardContent className="p-6 text-center">
                    <Trophy className="h-8 w-8 text-gold mx-auto mb-2" />
                    <h4 className="font-semibold text-gold">Employee of the Month</h4>
                    <p className="text-sm text-muted-foreground mt-2">No winner yet</p>
                  </CardContent>
                </Card>
                
                <Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <h4 className="font-semibold text-primary">Culture Champion</h4>
                    <p className="text-sm text-muted-foreground mt-2">No winner yet</p>
                  </CardContent>
                </Card>
                
                <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6 text-center">
                    <Star className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <h4 className="font-semibold text-green-700">Learning Leader</h4>
                    <p className="text-sm text-muted-foreground mt-2">No winner yet</p>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Leaderboard */}
              <div className="space-y-4">
                <h4 className="font-semibold">Monthly XP Leaderboard</h4>
                <div className="text-center py-8 border rounded-lg bg-muted/10">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No rankings yet</p>
                  <p className="text-sm text-muted-foreground mt-2">Start earning XP to see your position!</p>
                </div>
              </div>

              {/* Team Challenges */}
              <div className="space-y-4 mt-8">
                <h4 className="font-semibold">Active Team Challenges</h4>
                <Card className="border-dashed border-2">
                  <CardContent className="p-6 text-center">
                    <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h4 className="font-semibold mb-2">No Active Challenges</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Team challenges will appear here when they're created by your manager
                    </p>
                    <Button variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Suggest Challenge
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admin">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                Manage training content and track team progress
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-16">
                <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
                <h3 className="text-xl font-semibold mb-4">Admin Features</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Manage training programs, create custom content, and track team learning progress. 
                  Admin features are currently in development.
                </p>
                <div className="flex gap-3 justify-center">
                  <Button disabled>
                    <Users className="mr-2 h-4 w-4" />
                    Create Module
                  </Button>
                  <Button variant="outline" disabled>
                    <Award className="mr-2 h-4 w-4" />
                    Manage Certifications
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Contact your system administrator for access to admin features.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Academy;