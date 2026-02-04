import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Brain, DollarSign, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { useTradingSession } from '@/hooks/useTradingSession';

interface PreFlightChecklistProps {
  onComplete: () => void;
}

export function PreFlightChecklist({ onComplete }: PreFlightChecklistProps) {
  const { completePreflight } = useTradingSession();
  const [calmFocused, setCalmFocused] = useState(false);
  const [lossLimitDefined, setLossLimitDefined] = useState(false);
  const [riskAccepted, setRiskAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allChecked = calmFocused && lossLimitDefined && riskAccepted;

  const handleConfirm = async () => {
    if (!allChecked) return;
    
    setIsSubmitting(true);
    const success = await completePreflight(calmFocused, lossLimitDefined, riskAccepted);
    setIsSubmitting(false);
    
    if (success) {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-2 border-primary/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Pre-Flight Checklist</CardTitle>
            <CardDescription className="text-base mt-2">
              Discipline Over Dopamine — Complete this before trading
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-muted/50 rounded-lg p-4 space-y-4">
            {/* Checklist Item 1 */}
            <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/80 transition-colors">
              <Checkbox 
                id="calm" 
                checked={calmFocused}
                onCheckedChange={(checked) => setCalmFocused(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label 
                  htmlFor="calm" 
                  className="flex items-center gap-2 text-base font-medium cursor-pointer"
                >
                  <Brain className="h-5 w-5 text-blue-500" />
                  Am I calm and focused?
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  No anxiety, tilt, or emotional pressure. Clear mind only.
                </p>
              </div>
              {calmFocused && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>

            {/* Checklist Item 2 */}
            <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/80 transition-colors">
              <Checkbox 
                id="lossLimit" 
                checked={lossLimitDefined}
                onCheckedChange={(checked) => setLossLimitDefined(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label 
                  htmlFor="lossLimit" 
                  className="flex items-center gap-2 text-base font-medium cursor-pointer"
                >
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Is my daily loss limit defined?
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  2% max risk per trade. 2 losses = done for the day.
                </p>
              </div>
              {lossLimitDefined && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>

            {/* Checklist Item 3 */}
            <div className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/80 transition-colors">
              <Checkbox 
                id="riskAccepted" 
                checked={riskAccepted}
                onCheckedChange={(checked) => setRiskAccepted(checked === true)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label 
                  htmlFor="riskAccepted" 
                  className="flex items-center gap-2 text-base font-medium cursor-pointer"
                >
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Do I accept the risk of losing money today?
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Trading involves risk. Only trade what you can afford to lose.
                </p>
              </div>
              {riskAccepted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2">
            <div className={`h-2 w-12 rounded-full ${calmFocused ? 'bg-green-500' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full ${lossLimitDefined ? 'bg-green-500' : 'bg-muted'}`} />
            <div className={`h-2 w-12 rounded-full ${riskAccepted ? 'bg-green-500' : 'bg-muted'}`} />
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button 
            className="w-full h-12 text-lg font-semibold"
            disabled={!allChecked || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-5 w-5" />
                Confirm & Enter Trading
              </>
            )}
          </Button>
          
          <p className="text-xs text-center text-muted-foreground">
            By clicking confirm, you acknowledge understanding the risks involved in trading.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
