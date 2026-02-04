import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        q: "How do I get started with xCOACHx?",
        a: "Sign up for a free account, complete the onboarding questionnaire, and we'll generate a personalized program based on your goals, schedule, and equipment access. You can start training immediately!"
      },
      {
        q: "Do I need any equipment?",
        a: "Not necessarily! During onboarding, you'll tell us what equipment you have access to—whether it's a full gym, home equipment, resistance bands, or just your bodyweight. We'll create a program that works for you."
      },
      {
        q: "What fitness level do I need to be?",
        a: "xCOACHx is designed for all levels. Whether you're a complete beginner rebuilding momentum or an experienced lifter looking to optimize, our programs adapt to your experience level."
      }
    ]
  },
  {
    category: "Programs & Training",
    questions: [
      {
        q: "How are programs personalized?",
        a: "Your program is built based on your goals (fat loss, strength, confidence), available days, workout duration preferences, equipment access, experience level, and any injuries or limitations you share during onboarding."
      },
      {
        q: "Can I change my program?",
        a: "Yes! You can adjust your program at any time. Talk to Coach Bill in the AI chat to modify exercises, intensity, or focus areas based on how you're feeling."
      },
      {
        q: "How long are the workouts?",
        a: "Workout length is customized to your preferences—typically 30-60 minutes. You set your preferred duration during onboarding, and programs are designed to fit your schedule."
      }
    ]
  },
  {
    category: "AI Features",
    questions: [
      {
        q: "How does Form Check work?",
        a: "Upload a video of your exercise, and our AI analyzes your form in real-time. You'll get a score, specific feedback on what you're doing well, and actionable cues to improve."
      },
      {
        q: "Who is Coach Bill?",
        a: "Coach Bill is your AI-powered coaching assistant. He's direct, no-BS, and always available to answer questions, adjust your program, provide motivation, and help you stay on track."
      },
      {
        q: "Is the AI advice reliable?",
        a: "Our AI provides evidence-based fitness guidance and education. However, it's not a replacement for medical advice. Always consult a physician for health concerns or injuries."
      }
    ]
  },
  {
    category: "Coaching & Sessions",
    questions: [
      {
        q: "Can I work with a real coach?",
        a: "Yes! You can book 1-on-1 sessions with Coach Bill or other certified coaches on our platform. Sessions range from $75-150 depending on the coach and session type."
      },
      {
        q: "How do I become a coach on xCOACHx?",
        a: "If you're a certified trainer interested in joining our platform, visit the Coach Registration page to apply. We're always looking for quality coaches who share our values."
      }
    ]
  },
  {
    category: "Pricing & Plans",
    questions: [
      {
        q: "Is there a free option?",
        a: "Yes! The free tier includes access to 2 programs and basic workout tracking. It's a great way to get started and see if xCOACHx is right for you."
      },
      {
        q: "What's included in Pro?",
        a: "Pro ($19/month) unlocks the full program library, unlimited AI coach conversations, form analysis, nutrition tracking, and progress analytics."
      },
      {
        q: "Can I cancel anytime?",
        a: "Absolutely. There are no long-term contracts. You can cancel your subscription at any time from your account settings."
      }
    ]
  }
];

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center gap-4 max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="text-primary-foreground hover:bg-primary-foreground/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-xl">FAQ</h1>
            <p className="text-xs text-primary-foreground/70">Frequently Asked Questions</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 pb-24 space-y-8">
        {/* Intro */}
        <div className="text-center py-6">
          <h2 className="font-display text-2xl font-bold mb-2">How can we help?</h2>
          <p className="text-muted-foreground">
            Find answers to common questions about xCOACHx below.
          </p>
        </div>

        {/* FAQ Sections */}
        {faqs.map((section) => (
          <div key={section.category}>
            <h3 className="font-display font-bold text-lg mb-3 text-primary">
              {section.category}
            </h3>
            <Accordion type="single" collapsible className="space-y-2">
              {section.questions.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`${section.category}-${index}`}
                  className="border rounded-lg px-4"
                >
                  <AccordionTrigger className="text-left font-medium">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        {/* Contact CTA */}
        <div className="bg-muted/50 rounded-xl p-6 text-center">
          <h3 className="font-display font-bold text-lg mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            Chat with Coach Bill—he's always ready to help.
          </p>
          <Button onClick={() => navigate('/coach-chat')}>
            <MessageCircle className="h-4 w-4 mr-2" />
            Ask Coach Bill
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground text-center">
          xCOACHx provides fitness education and motivation. Not medical advice. 
          Consult a physician for health concerns.
        </p>
      </main>
    </div>
  );
};

export default FAQ;
