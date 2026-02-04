import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, Target, TrendingUp, AlertTriangle, CheckCircle, 
  ChevronRight, ChevronLeft, Crosshair
} from 'lucide-react';

interface TradingOnboardingProps {
  onComplete: () => void;
}

export function TradingOnboarding({ onComplete }: TradingOnboardingProps) {
  const [step, setStep] = useState(1);
  const [riskTolerance, setRiskTolerance] = useState('2');
  const [acceptedTerms, setAcceptedTerms] = useState({
    notFinancialAdvice: false,
    simulationFirst: false,
    capitalPreservation: false,
    personalResponsibility: false,
  });

  const allTermsAccepted = Object.values(acceptedTerms).every(Boolean);

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else if (allTermsAccepted) {
      onComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
          <Crosshair className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Trading Command Center</h1>
        <p className="text-muted-foreground mt-2">
          Capital operations for disciplined execution
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-2 w-12 rounded-full transition-colors ${
              s <= step ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Mission Briefing
            </CardTitle>
            <CardDescription>
              Understanding the capital command approach
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">This is NOT:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>❌ A get-rich-quick scheme</li>
                <li>❌ Financial advice or recommendations</li>
                <li>❌ A gambling platform</li>
                <li>❌ A place for emotional trading</li>
              </ul>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-medium mb-2">This IS:</h4>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  A disciplined approach to capital management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Rules-based execution with strict risk controls
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Education and skill development first
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  A bridge between income and long-term wealth
                </li>
              </ul>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>
                Trading Command is designed for service professionals who understand 
                discipline, structure, and following rules under pressure. We treat 
                capital operations like mission execution—with clear objectives, risk 
                parameters, and after-action reviews.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext}>
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Risk Profile Assessment
            </CardTitle>
            <CardDescription>
              Establishing your operational parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-base font-medium">
                Select your risk tolerance level
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                This determines your default position sizes and loss limits
              </p>

              <RadioGroup value={riskTolerance} onValueChange={setRiskTolerance} className="space-y-3">
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="1" id="risk-1" />
                  <Label htmlFor="risk-1" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Conservative</span>
                      <Badge variant="outline">Level 1</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Max 2% per position, 1% daily loss limit
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="2" id="risk-2" />
                  <Label htmlFor="risk-2" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Moderate</span>
                      <Badge variant="outline">Level 2</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Max 5% per position, 2% daily loss limit
                    </p>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem value="3" id="risk-3" />
                  <Label htmlFor="risk-3" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Aggressive</span>
                      <Badge variant="outline">Level 3</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Max 10% per position, 3% daily loss limit
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Risk Warning</p>
                  <p className="text-sm text-muted-foreground">
                    Higher risk levels can lead to larger losses. Start conservative 
                    and adjust as you gain experience and demonstrate consistent discipline.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button onClick={handleNext}>
              Continue
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Commitment to Discipline
            </CardTitle>
            <CardDescription>
              Acknowledge the rules of engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="not-financial-advice"
                  checked={acceptedTerms.notFinancialAdvice}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms({ ...acceptedTerms, notFinancialAdvice: !!checked })
                  }
                />
                <Label htmlFor="not-financial-advice" className="text-sm cursor-pointer">
                  I understand this is NOT financial advice. All trading decisions 
                  are my own, and I am solely responsible for my results.
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="simulation-first"
                  checked={acceptedTerms.simulationFirst}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms({ ...acceptedTerms, simulationFirst: !!checked })
                  }
                />
                <Label htmlFor="simulation-first" className="text-sm cursor-pointer">
                  I will complete the simulation phase and demonstrate consistent 
                  discipline before trading with real capital.
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="capital-preservation"
                  checked={acceptedTerms.capitalPreservation}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms({ ...acceptedTerms, capitalPreservation: !!checked })
                  }
                />
                <Label htmlFor="capital-preservation" className="text-sm cursor-pointer">
                  I commit to capital preservation as my primary objective. 
                  I will use stop losses and respect my risk limits.
                </Label>
              </div>

              <div className="flex items-start space-x-3 p-3 border rounded-lg">
                <Checkbox
                  id="personal-responsibility"
                  checked={acceptedTerms.personalResponsibility}
                  onCheckedChange={(checked) =>
                    setAcceptedTerms({ ...acceptedTerms, personalResponsibility: !!checked })
                  }
                />
                <Label htmlFor="personal-responsibility" className="text-sm cursor-pointer">
                  I accept full responsibility for my trading decisions and 
                  understand that losses are a normal part of the learning process.
                </Label>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Button onClick={handleNext} disabled={!allTermsAccepted}>
              Begin Training
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
