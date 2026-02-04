import { UserPlus, Users, Camera, CheckCircle } from "lucide-react";
const HowItWorksSection = () => {
  const steps = [{
    icon: UserPlus,
    title: "Create Your Profile",
    description: "Sign up and set up your secure profile with your verified identity"
  }, {
    icon: Users,
    title: "Connect with Partner",
    description: "Both parties open the app when considering romantic engagement"
  }, {
    icon: Camera,
    title: "Facial Verification",
    description: "Each person completes real-time facial verification to confirm identity"
  }, {
    icon: CheckCircle,
    title: "Mutual Consent Recorded",
    description: "Timestamped record created showing both parties gave informed consent"
  }];
  return <section id="how-it-works" className="py-20 px-4 bg-card/50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simple, secure verification in four easy steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => <div key={index} className="relative animate-fade-in" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <div className="bg-card p-6 rounded-2xl shadow-md hover:shadow-xl transition-all h-full border border-border hover:border-primary">
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 mx-auto">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-lg mb-3 text-center text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm text-center">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-primary/30" />}
            </div>)}
        </div>

        <div className="mt-16 p-8 bg-primary/5 rounded-2xl border border-primary/20">
          <h3 className="text-2xl font-bold text-center mb-4 text-foreground">
            Why Cumsent?
          </h3>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div>
              <h4 className="font-semibold text-primary mb-2">Protection for Everyone</h4>
              <p className="text-muted-foreground text-sm">
                Creates clear documentation that protects all parties from false accusations 
                and ensures everyone is on the same page.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">Legal Peace of Mind</h4>
              <p className="text-muted-foreground text-sm">
                Timestamped, verified records provide evidence of mutual consent that can 
                protect you in legal situations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">Prevents Misunderstandings</h4>
              <p className="text-muted-foreground text-sm">
                Clear, explicit verification removes ambiguity and ensures both parties 
                have given informed consent.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-primary mb-2">Complete Privacy</h4>
              <p className="text-muted-foreground text-sm">
                Your data is encrypted and private. Records are only accessible to 
                verified participants.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>;
};
export default HowItWorksSection;