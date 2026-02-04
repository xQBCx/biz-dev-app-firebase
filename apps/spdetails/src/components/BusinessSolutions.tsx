import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Gift, Car, TrendingUp, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const businessTypes = [
  {
    icon: Building2,
    title: "Fleet Maintenance",
    description: "Keep your company vehicles pristine and professional with scheduled detailing services"
  },
  {
    icon: Users,
    title: "Employee Benefits",
    description: "Offer mobile detailing as a perk or incentive for your team members"
  },
  {
    icon: Gift,
    title: "Corporate Gifting",
    description: "Give the gift of a spotless vehicle to clients, partners, or employees"
  },
  {
    icon: Car,
    title: "Dealership Services",
    description: "Get your lot inventory show-ready with professional detailing services"
  },
  {
    icon: MapPin,
    title: "Golf Course Partnerships",
    description: "Premium detailing services for members while they enjoy their round"
  },
  {
    icon: TrendingUp,
    title: "Property Management",
    description: "Enhance your property amenities with on-site detailing services"
  }
];

export const BusinessSolutions = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            How Businesses Leverage SP Details
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-8">
            Professional mobile auto detailing solutions designed for businesses. 
            From fleet management to employee perks, we bring premium detailing to your location.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" onClick={() => navigate("/partner-register")}>
              Get Started for Business
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/booking")}>
              Request a Quote
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {businessTypes.map((type, index) => {
            const Icon = type.icon;
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
                      {type.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-16 bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-4">
                Get Started with No Upfront Costs
              </h3>
              <p className="text-muted-foreground mb-6">
                Customize your detailing program for your business needs. Set your own scheduling, 
                manage multiple vehicles, and get full visibility into every service. We integrate 
                seamlessly with your operations without any service fees.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">Flexible scheduling - book in advance or same-day service</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">Transparent pricing with detailed service reports</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                  <p className="text-sm">Professional detailers with vetted experience</p>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Card className="w-full max-w-md border-2">
                <CardHeader>
                  <CardTitle className="text-center">Business Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Building2 className="h-5 w-5 text-primary" />
                    <span className="text-sm">Volume discounts available</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    <span className="text-sm">Priority scheduling</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm">Dedicated account manager</span>
                  </div>
                  <Button className="w-full mt-4" onClick={() => navigate("/partner-register")}>
                    Start Your Business Account
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
