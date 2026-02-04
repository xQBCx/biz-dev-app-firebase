import { Video, Brain, Zap, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

const Features = () => {
  const features = [
    {
      icon: Video,
      title: "Live Feeds",
      description: "Real-time video streams from venues with privacy-protected face blurring. See the actual vibe before you go.",
    },
    {
      icon: Brain,
      title: "AI Crowd Analysis",
      description: "Smart crowd density detection and energy level monitoring across restaurants, clubs, parks, events, and more.",
    },
    {
      icon: Zap,
      title: "Instant Reservations",
      description: "Book tables, bottle service, and VIP experiences in seconds. Get confirmed while you're still deciding what to wear.",
    },
    {
      icon: Bell,
      title: "Exclusive Flash Deals",
      description: "Receive real-time alerts for special promotions, guest appearances, and limited-time offers from your favorite venues.",
    },
  ];

  return (
    <section className="py-20 bg-gradient-dark relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How LIIVE Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real-time visibility for any venue where people gather
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
            >
              <div className="mb-4 inline-block p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
