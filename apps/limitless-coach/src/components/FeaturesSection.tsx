import { Target, Brain, Utensils, Users, Camera, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Target,
    title: "Personalized Programs",
    description: "4-12 week programs tailored to your goals, schedule, and equipment access."
  },
  {
    icon: Brain,
    title: "AI Coach Chat",
    description: "Get instant guidance, motivation, and answers from Bill Coach AI—direct and no-BS."
  },
  {
    icon: Camera,
    title: "Form Analysis",
    description: "Upload workout videos for AI-powered form feedback and injury prevention."
  },
  {
    icon: Utensils,
    title: "Nutrition Targets",
    description: "Simple calorie and macro tracking with plate templates that actually work."
  },
  {
    icon: Users,
    title: "Coach Marketplace",
    description: "Find local trainers or work with Limitless Coach for in-person or virtual sessions."
  },
  {
    icon: Trophy,
    title: "Progress Tracking",
    description: "Log workouts, track streaks, and watch your form scores improve over time."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 2xl:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-display font-bold mb-3 sm:mb-4">
            Everything You Need to <span className="text-gradient">Get Stronger</span>
          </h2>
          <p className="text-lg sm:text-xl 2xl:text-2xl text-muted-foreground max-w-2xl 2xl:max-w-3xl mx-auto px-4">
            Whether you're rebuilding momentum or pushing past plateaus, 
            we've got the tools and coaching to help you succeed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 2xl:gap-8">
          {features.map((feature) => (
            <Card 
              key={feature.title} 
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-accent/50"
            >
              <CardContent className="p-5 sm:p-6 2xl:p-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 2xl:w-14 2xl:h-14 rounded-lg bg-accent/10 flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-accent/20 transition-colors">
                  <feature.icon className="h-5 w-5 sm:h-6 sm:w-6 2xl:h-7 2xl:w-7 text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl 2xl:text-2xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base 2xl:text-lg text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};