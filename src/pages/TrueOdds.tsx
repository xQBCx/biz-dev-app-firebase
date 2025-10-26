import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { TrendingUp, BarChart3, Globe, Trophy, Zap, Shield } from "lucide-react";

export default function TrueOdds() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            TrueOdds
          </h1>
          <p className="text-2xl md:text-3xl text-muted-foreground font-medium">
            Odds you can trust. Signals you can see.
          </p>
        </div>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Data-driven prediction markets powered by real-time signals from news, weather, injuries, earnings, and sentiment analysis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button size="lg" onClick={() => navigate("/trueodds/explore")} className="min-w-[200px]">
            <Trophy className="mr-2 h-5 w-5" />
            Explore Markets
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/trueodds/signals")} className="min-w-[200px]">
            <Zap className="mr-2 h-5 w-5" />
            Signal Feed
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Live Signal Aggregation</h3>
            <p className="text-muted-foreground">
              We ingest real-time data from news, weather, injuries, earnings reports, and social sentiment to calculate transparent odds.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Dynamic Odds Engine</h3>
            <p className="text-muted-foreground">
              Our algorithm weighs each signal by impact and credibility, adjusting odds in real-time so you always see why the line moved.
            </p>
          </Card>

          <Card className="p-6 text-center hover:shadow-lg transition-shadow">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Skill-Based Prediction</h3>
            <p className="text-muted-foreground">
              Launch in simulation mode (Texas-compliant). Build parlays, track ROI, compete on leaderboards with no cash settlement required.
            </p>
          </Card>
        </div>
      </section>

      {/* Market Categories */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Prediction Markets</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => navigate("/trueodds/explore?category=SPORTS")}
          >
            <Trophy className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Sports</h3>
            <p className="text-sm text-muted-foreground">NFL, NBA, MLB odds with injury & weather signals</p>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => navigate("/trueodds/explore?category=STOCKS")}
          >
            <TrendingUp className="h-10 w-10 text-secondary mb-3" />
            <h3 className="text-xl font-semibold mb-2">Stocks</h3>
            <p className="text-sm text-muted-foreground">Earnings beats, price movements, merger rumors</p>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => navigate("/trueodds/explore?category=CRYPTO")}
          >
            <BarChart3 className="h-10 w-10 text-accent mb-3" />
            <h3 className="text-xl font-semibold mb-2">Crypto</h3>
            <p className="text-sm text-muted-foreground">BTC, ETH price predictions, protocol events</p>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-xl transition-all hover:scale-105"
            onClick={() => navigate("/trueodds/explore?category=WORLD")}
          >
            <Globe className="h-10 w-10 text-primary mb-3" />
            <h3 className="text-xl font-semibold mb-2">World Events</h3>
            <p className="text-sm text-muted-foreground">Fed decisions, elections, policy changes</p>
          </Card>
        </div>
      </section>

      {/* Trust Signals */}
      <section className="container mx-auto px-4 py-16 mb-12">
        <div className="bg-muted/30 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Built for Transparency</h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Every odds shift is explained. See exactly which signals moved the line, their credibility scores, and source links. No black boxes.
          </p>
          <Button onClick={() => navigate("/trueodds/signals")} variant="outline" size="lg">
            View Live Signal Feed
          </Button>
        </div>
      </section>
    </div>
  );
}