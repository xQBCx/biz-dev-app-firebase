import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Sparkles, Video } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Hero Section */}
          <section className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              About LIIVE
            </h1>
            <p className="text-xl text-muted-foreground">
              Live Intelligent Interactive Venue Explorer
            </p>
          </section>

          {/* Mission Section */}
          <section className="mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Mission</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  LIIVE revolutionizes how people discover and experience venues by combining 
                  live video streaming with artificial intelligence. We believe that choosing 
                  where to spend your time should be easy, informed, and exciting.
                </p>
                <p>
                  By providing real-time views into venues and AI-powered crowd analysis, 
                  we help you make better decisions about where to go, whether you're looking 
                  for a quiet coffee shop, a buzzing nightclub, or anything in between.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Features Section */}
          <section className="grid md:grid-cols-3 gap-6 mb-12">
            <Card>
              <CardHeader>
                <Video className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Live Streaming</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  See venues in real-time before you go. No surprises, just authentic views.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Sparkles className="h-10 w-10 text-primary mb-2" />
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Smart crowd detection and atmosphere analysis powered by advanced AI.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Eye className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Transparency</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Make informed decisions with real-time data and honest venue information.
                </CardDescription>
              </CardContent>
            </Card>
          </section>

          {/* Story Section */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Our Story</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground space-y-4">
                <p>
                  LIIVE was born from a simple frustration: arriving at a venue only to find 
                  it was completely different from what you expected. Too crowded, too quiet, 
                  or just not the right vibe.
                </p>
                <p>
                  We combined cutting-edge technology with user-friendly design to create a 
                  platform that gives you the power to see before you go. Our AI analyzes 
                  crowd levels, energy, and atmosphere in real-time, so you always know what 
                  to expect.
                </p>
                <p>
                  Today, LIIVE helps thousands of people discover the perfect venues for 
                  their needs, while helping venues attract the right customers at the right time.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
