import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const LeadMagnetCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary via-primary to-primary/90 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(255,255,255,0.1) 50px,
            rgba(255,255,255,0.1) 51px
          )`
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-primary-foreground">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Zap className="h-4 w-4" />
            Free 2-Minute Assessment
          </div>
          
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Find Your Perfect Program
          </h2>
          <p className="text-lg sm:text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Take our quick fitness quiz to get your personalized readiness score 
            and unlock a free 7-day starter program tailored to your goals.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button 
              size="lg"
              onClick={() => navigate('/quiz')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold text-lg px-8"
            >
              Take the Quiz
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/programs')}
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
            >
              Browse Programs
            </Button>
          </div>

          {/* What you'll get */}
          <div className="grid sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Readiness Score</p>
                <p className="text-sm text-primary-foreground/70">Know exactly where you stand</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Target className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Personalized Plan</p>
                <p className="text-sm text-primary-foreground/70">Matched to your goals & schedule</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Free 7-Day Program</p>
                <p className="text-sm text-primary-foreground/70">Start training immediately</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
