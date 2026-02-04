import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Droplet, Sparkles, Shield, Layers, Wind, Car } from "lucide-react";

const services = [
  {
    icon: Sparkles,
    title: "Premium Hand Wash",
    description: "Meticulous hand washing with premium products for a flawless finish"
  },
  {
    icon: Droplet,
    title: "(Spot-Free) Deionized Water",
    description: "Advanced deionized water system ensures zero water spots"
  },
  {
    icon: Car,
    title: "Interior Detail Cleaning",
    description: "Deep cleaning and conditioning of all interior surfaces"
  },
  {
    icon: Sparkles,
    title: "Paint Enhancement Polish",
    description: "Professional polishing to restore your paint's depth and shine"
  },
  {
    icon: Shield,
    title: "Ceramic Coating Protection",
    description: "Premium ceramic coating for long-lasting protection and gloss"
  },
  {
    icon: Layers,
    title: "Full Interior & Exterior Detail",
    description: "Comprehensive detailing service inside and out"
  },
  {
    icon: Wind,
    title: "Cabin Fogging & Disinfection",
    description: "Professional sanitization for a clean and healthy cabin environment"
  }
];

export const Services = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            OUR PREMIUM SERVICES
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional mobile detailing services delivered to your location
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <Card 
                key={index} 
                className="border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl flex-1">
                      {service.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
