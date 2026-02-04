import { Button } from "@/components/ui/button";
import { Shield, Camera, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen flex items-center justify-center px-4 pt-20">
      <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
        <Logo size="lg" className="justify-center" />
        
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
          Verified Consent,
          <br />
          <span className="text-primary">Clear Communication</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
          A secure platform for verifying mutual consent before romantic engagement. 
          Protect yourself and your partner with facial verification and timestamped records.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button 
            size="lg"
            onClick={() => navigate("/auth")}
            className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-all"
          >
            Start Verification
          </Button>
          <Button 
            size="lg"
            variant="outline"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary/10"
          >
            Learn More
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          {[
            {
              icon: Shield,
              title: "Secure & Private",
              description: "End-to-end encrypted verification with complete privacy protection"
            },
            {
              icon: Camera,
              title: "Facial Verification",
              description: "Biometric confirmation ensures authentic consent from real people"
            },
            {
              icon: Check,
              title: "Timestamped Records",
              description: "Permanent, verifiable records of mutual consent for peace of mind"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-shadow"
            >
              <feature.icon className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
