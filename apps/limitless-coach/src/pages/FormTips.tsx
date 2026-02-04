import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Video, CheckCircle, AlertTriangle, Dumbbell, Target, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formTips = [
  {
    exercise: "Squat",
    icon: Dumbbell,
    keyPoints: [
      "Keep feet shoulder-width apart, toes slightly out",
      "Drive knees out over toes",
      "Keep chest up and core braced",
      "Go to parallel or below if mobility allows",
      "Push through the whole foot, not just heels"
    ],
    commonMistakes: [
      "Knees caving inward",
      "Rounding lower back",
      "Rising onto toes",
      "Not hitting depth"
    ]
  },
  {
    exercise: "Deadlift",
    icon: Target,
    keyPoints: [
      "Bar over mid-foot, feet hip-width",
      "Hinge at hips, keep back flat",
      "Engage lats - 'protect your armpits'",
      "Drive through legs, then hips",
      "Lock out with glutes, not hyperextend back"
    ],
    commonMistakes: [
      "Rounding the back",
      "Bar drifting away from body",
      "Pulling with arms",
      "Starting with hips too low or too high"
    ]
  },
  {
    exercise: "Bench Press",
    icon: Shield,
    keyPoints: [
      "Retract shoulder blades - 'pack' them",
      "Slight arch in lower back",
      "Grip slightly wider than shoulders",
      "Touch chest at nipple line",
      "Drive feet into floor for stability"
    ],
    commonMistakes: [
      "Flaring elbows to 90 degrees",
      "Bouncing bar off chest",
      "Losing shoulder blade position",
      "Uneven bar path"
    ]
  },
  {
    exercise: "Overhead Press",
    icon: Dumbbell,
    keyPoints: [
      "Start with bar at collarbone",
      "Squeeze glutes and brace core",
      "Press in a straight line",
      "Move head back slightly, then through",
      "Lock out overhead, bar over mid-foot"
    ],
    commonMistakes: [
      "Excessive back lean",
      "Pressing in front of face",
      "Loose core and glutes",
      "Not finishing the lockout"
    ]
  },
  {
    exercise: "Barbell Row",
    icon: Target,
    keyPoints: [
      "Hinge to 45-degree torso angle",
      "Pull to lower chest/upper abs",
      "Lead with elbows, squeeze shoulder blades",
      "Control the descent",
      "Keep neck neutral"
    ],
    commonMistakes: [
      "Using momentum/body English",
      "Pulling too high (to upper chest)",
      "Standing too upright",
      "Shrugging shoulders"
    ]
  },
  {
    exercise: "Lunge",
    icon: Shield,
    keyPoints: [
      "Take a step that creates 90° at both knees",
      "Keep torso upright",
      "Front knee tracks over toes",
      "Lower straight down, not forward",
      "Push through front heel to stand"
    ],
    commonMistakes: [
      "Front knee drifting past toes",
      "Leaning torso forward",
      "Taking too short a step",
      "Back knee slamming the ground"
    ]
  }
];

const FormTips = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4 max-w-6xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl">Form Tips</h1>
            <p className="text-xs text-primary-foreground/70">Master the fundamentals</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 pb-24 space-y-6">
        {/* Intro Card */}
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0">
          <CardContent className="p-6">
            <h2 className="font-display text-2xl font-bold mb-2">
              Perfect Form = Better Results
            </h2>
            <p className="text-primary-foreground/80 mb-4">
              Good form isn't just about avoiding injury—it's about maximizing every rep. 
              These tips will help you train smarter and get stronger faster.
            </p>
            <Button 
              onClick={() => navigate('/form-check')}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Video className="h-4 w-4 mr-2" />
              Analyze Your Form with AI
            </Button>
          </CardContent>
        </Card>

        {/* Exercise Tips */}
        <div className="grid gap-4 md:grid-cols-2">
          {formTips.map((tip) => (
            <Card key={tip.exercise} className="overflow-hidden">
              <CardHeader className="bg-muted/50 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <tip.icon className="h-5 w-5 text-primary" />
                  {tip.exercise}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-primary flex items-center gap-1 mb-2">
                    <CheckCircle className="h-4 w-4" />
                    Key Points
                  </h4>
                  <ul className="space-y-1">
                    {tip.keyPoints.map((point, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-destructive flex items-center gap-1 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Common Mistakes
                  </h4>
                  <ul className="space-y-1">
                    {tip.commonMistakes.map((mistake, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-destructive mt-1">✗</span>
                        {mistake}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="bg-accent/10 border-accent/20">
          <CardContent className="p-6 text-center">
            <h3 className="font-display text-xl font-bold mb-2">
              Want Personalized Feedback?
            </h3>
            <p className="text-muted-foreground mb-4">
              Upload a video and get AI-powered form analysis with specific cues for improvement.
            </p>
            <Button 
              onClick={() => navigate('/form-check')}
              className="bg-primary hover:bg-primary/90"
            >
              <Video className="h-4 w-4 mr-2" />
              Try Form Check
            </Button>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          These tips are for educational purposes. Always consult a qualified trainer for personalized guidance.
        </p>
      </main>
    </div>
  );
};

export default FormTips;
