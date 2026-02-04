import { ClipboardList, Dumbbell, MessageCircle, TrendingUp } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Take the Quiz",
    description: "Tell us your goals, schedule, equipment, and experience level."
  },
  {
    number: "02",
    icon: Dumbbell,
    title: "Get Your Program",
    description: "Receive a personalized 4-week program built for your situation."
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Train with Support",
    description: "Log workouts, get form feedback, and chat with Bill Coach for guidance."
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "See Progress",
    description: "Track your streak, watch form scores improve, and level up your fitness."
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24 2xl:py-32 bg-muted/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl 2xl:text-6xl font-display font-bold mb-3 sm:mb-4">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="text-lg sm:text-xl 2xl:text-2xl text-muted-foreground max-w-2xl mx-auto px-4">
            From zero to consistent in 4 simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 2xl:gap-10">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 2xl:top-16 left-1/2 w-full h-0.5 bg-border" />
              )}
              
              <div className="relative z-10 text-center">
                {/* Step Number */}
                <div className="inline-flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 2xl:w-36 2xl:h-36 rounded-full bg-card border-4 border-accent/20 mb-4 sm:mb-6 mx-auto">
                  <div className="text-center">
                    <span className="block text-xs 2xl:text-sm text-muted-foreground font-medium tracking-wider">STEP</span>
                    <span className="block text-2xl sm:text-3xl 2xl:text-4xl font-display font-bold text-primary">{step.number}</span>
                  </div>
                </div>
                
                {/* Icon & Content */}
                <div className="flex justify-center mb-3 sm:mb-4">
                  <step.icon className="h-6 w-6 sm:h-8 sm:w-8 2xl:h-10 2xl:w-10 text-accent" />
                </div>
                <h3 className="text-lg sm:text-xl 2xl:text-2xl font-semibold mb-2">{step.title}</h3>
                <p className="text-sm sm:text-base 2xl:text-lg text-muted-foreground px-2">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};