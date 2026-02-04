import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ChevronRight, Car, Sparkles } from "lucide-react";

export interface QuestionnaireData {
  // Exterior
  exteriorCondition: string;
  exteriorNeeds: string[];
  hasWaterSpots: boolean;
  hasScratches: boolean;
  lastWaxed: string;
  // Interior
  interiorCondition: string;
  interiorNeeds: string[];
  hasPetHair: boolean;
  hasStains: boolean;
  hasOdors: boolean;
  seatMaterial: string;
  // Additional
  additionalNotes: string;
}

interface ServiceQuestionnaireProps {
  onComplete: (data: QuestionnaireData) => void;
  onSkip: () => void;
}

const EXTERIOR_NEEDS = [
  { id: "wash", label: "Basic Wash" },
  { id: "wax", label: "Wax/Sealant Application" },
  { id: "clay-bar", label: "Clay Bar Treatment" },
  { id: "polish", label: "Polish/Paint Correction" },
  { id: "ceramic", label: "Ceramic Coating" },
  { id: "headlights", label: "Headlight Restoration" },
  { id: "wheels", label: "Wheel Deep Clean" },
  { id: "trim", label: "Trim Restoration" },
];

const INTERIOR_NEEDS = [
  { id: "vacuum", label: "Vacuum & Dust" },
  { id: "wipe-down", label: "Surface Wipe Down" },
  { id: "leather-care", label: "Leather Conditioning" },
  { id: "carpet-shampoo", label: "Carpet Shampoo" },
  { id: "extraction", label: "Deep Extraction" },
  { id: "odor", label: "Odor Removal" },
  { id: "sanitize", label: "Sanitization" },
  { id: "uv-protect", label: "UV Protection" },
];

export const ServiceQuestionnaire = ({ onComplete, onSkip }: ServiceQuestionnaireProps) => {
  const [step, setStep] = useState<"exterior" | "interior" | "additional">("exterior");
  const [data, setData] = useState<QuestionnaireData>({
    exteriorCondition: "",
    exteriorNeeds: [],
    hasWaterSpots: false,
    hasScratches: false,
    lastWaxed: "",
    interiorCondition: "",
    interiorNeeds: [],
    hasPetHair: false,
    hasStains: false,
    hasOdors: false,
    seatMaterial: "",
    additionalNotes: "",
  });

  const toggleExteriorNeed = (id: string) => {
    setData(prev => ({
      ...prev,
      exteriorNeeds: prev.exteriorNeeds.includes(id)
        ? prev.exteriorNeeds.filter(n => n !== id)
        : [...prev.exteriorNeeds, id],
    }));
  };

  const toggleInteriorNeed = (id: string) => {
    setData(prev => ({
      ...prev,
      interiorNeeds: prev.interiorNeeds.includes(id)
        ? prev.interiorNeeds.filter(n => n !== id)
        : [...prev.interiorNeeds, id],
    }));
  };

  const handleNext = () => {
    if (step === "exterior") setStep("interior");
    else if (step === "interior") setStep("additional");
    else onComplete(data);
  };

  const handleBack = () => {
    if (step === "interior") setStep("exterior");
    else if (step === "additional") setStep("interior");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          {step === "exterior" && <><Car className="h-6 w-6" /> Exterior Assessment</>}
          {step === "interior" && <><Sparkles className="h-6 w-6" /> Interior Assessment</>}
          {step === "additional" && <>Additional Details</>}
        </CardTitle>
        <CardDescription>
          Help us understand your vehicle's needs for accurate service recommendations
        </CardDescription>
        <div className="flex gap-2 mt-4">
          {["exterior", "interior", "additional"].map((s, i) => (
            <div
              key={s}
              className={`h-2 flex-1 rounded-full transition-colors ${
                (step === "exterior" && i === 0) ||
                (step === "interior" && i <= 1) ||
                (step === "additional" && i <= 2)
                  ? "bg-primary"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "exterior" && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-medium">Overall Exterior Condition</Label>
              <RadioGroup
                value={data.exteriorCondition}
                onValueChange={(v) => setData(prev => ({ ...prev, exteriorCondition: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "excellent", label: "Excellent", desc: "Like new, minimal dust" },
                  { value: "good", label: "Good", desc: "Light dirt, no major issues" },
                  { value: "fair", label: "Fair", desc: "Noticeable dirt/grime" },
                  { value: "poor", label: "Needs Work", desc: "Heavy contamination" },
                ].map((opt) => (
                  <Label
                    key={opt.value}
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                      data.exteriorCondition === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={opt.value} />
                      <span className="font-medium">{opt.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{opt.desc}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">What exterior services do you need?</Label>
              <div className="grid grid-cols-2 gap-2">
                {EXTERIOR_NEEDS.map((need) => (
                  <Label
                    key={need.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      data.exteriorNeeds.includes(need.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={data.exteriorNeeds.includes(need.id)}
                      onCheckedChange={() => toggleExteriorNeed(need.id)}
                    />
                    <span className="text-sm">{need.label}</span>
                  </Label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <Checkbox
                  checked={data.hasWaterSpots}
                  onCheckedChange={(c) => setData(prev => ({ ...prev, hasWaterSpots: !!c }))}
                />
                <span className="text-sm">Has water spots?</span>
              </Label>
              <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <Checkbox
                  checked={data.hasScratches}
                  onCheckedChange={(c) => setData(prev => ({ ...prev, hasScratches: !!c }))}
                />
                <span className="text-sm">Has scratches?</span>
              </Label>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">When was it last waxed/sealed?</Label>
              <RadioGroup
                value={data.lastWaxed}
                onValueChange={(v) => setData(prev => ({ ...prev, lastWaxed: v }))}
                className="flex flex-wrap gap-2"
              >
                {["Never", "6+ months", "3-6 months", "Recently"].map((opt) => (
                  <Label
                    key={opt}
                    className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${
                      data.lastWaxed === opt
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={opt} className="sr-only" />
                    {opt}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </>
        )}

        {step === "interior" && (
          <>
            <div className="space-y-3">
              <Label className="text-base font-medium">Overall Interior Condition</Label>
              <RadioGroup
                value={data.interiorCondition}
                onValueChange={(v) => setData(prev => ({ ...prev, interiorCondition: v }))}
                className="grid grid-cols-2 gap-3"
              >
                {[
                  { value: "excellent", label: "Excellent", desc: "Clean, well-maintained" },
                  { value: "good", label: "Good", desc: "Light dust, no stains" },
                  { value: "fair", label: "Fair", desc: "Visible dirt/stains" },
                  { value: "poor", label: "Needs Work", desc: "Heavy soiling" },
                ].map((opt) => (
                  <Label
                    key={opt.value}
                    className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-all ${
                      data.interiorCondition === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <RadioGroupItem value={opt.value} />
                      <span className="font-medium">{opt.label}</span>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">{opt.desc}</span>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">What interior services do you need?</Label>
              <div className="grid grid-cols-2 gap-2">
                {INTERIOR_NEEDS.map((need) => (
                  <Label
                    key={need.id}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                      data.interiorNeeds.includes(need.id)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Checkbox
                      checked={data.interiorNeeds.includes(need.id)}
                      onCheckedChange={() => toggleInteriorNeed(need.id)}
                    />
                    <span className="text-sm">{need.label}</span>
                  </Label>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <Checkbox
                  checked={data.hasPetHair}
                  onCheckedChange={(c) => setData(prev => ({ ...prev, hasPetHair: !!c }))}
                />
                <span className="text-sm">Pet hair?</span>
              </Label>
              <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <Checkbox
                  checked={data.hasStains}
                  onCheckedChange={(c) => setData(prev => ({ ...prev, hasStains: !!c }))}
                />
                <span className="text-sm">Stains?</span>
              </Label>
              <Label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                <Checkbox
                  checked={data.hasOdors}
                  onCheckedChange={(c) => setData(prev => ({ ...prev, hasOdors: !!c }))}
                />
                <span className="text-sm">Odors?</span>
              </Label>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Seat Material</Label>
              <RadioGroup
                value={data.seatMaterial}
                onValueChange={(v) => setData(prev => ({ ...prev, seatMaterial: v }))}
                className="flex flex-wrap gap-2"
              >
                {["Leather", "Cloth/Fabric", "Vinyl", "Mixed"].map((opt) => (
                  <Label
                    key={opt}
                    className={`px-4 py-2 border rounded-full cursor-pointer transition-all ${
                      data.seatMaterial === opt
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value={opt} className="sr-only" />
                    {opt}
                  </Label>
                ))}
              </RadioGroup>
            </div>
          </>
        )}

        {step === "additional" && (
          <div className="space-y-4">
            <div className="space-y-3">
              <Label className="text-base font-medium">Any additional notes or concerns?</Label>
              <Textarea
                placeholder="Tell us about any specific areas of concern, special requests, or additional details..."
                value={data.additionalNotes}
                onChange={(e) => setData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                rows={5}
              />
            </div>

            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>Exterior: {data.exteriorCondition || "Not specified"} condition</p>
                <p>Interior: {data.interiorCondition || "Not specified"} condition</p>
                <p>Seat Material: {data.seatMaterial || "Not specified"}</p>
                {data.exteriorNeeds.length > 0 && (
                  <p>Exterior Services: {data.exteriorNeeds.length} selected</p>
                )}
                {data.interiorNeeds.length > 0 && (
                  <p>Interior Services: {data.interiorNeeds.length} selected</p>
                )}
                {(data.hasPetHair || data.hasStains || data.hasOdors) && (
                  <p>
                    Special Concerns: {[
                      data.hasPetHair && "Pet hair",
                      data.hasStains && "Stains",
                      data.hasOdors && "Odors"
                    ].filter(Boolean).join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <div>
            {step !== "exterior" ? (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={onSkip}>
                Skip Questionnaire
              </Button>
            )}
          </div>
          <Button onClick={handleNext} className="gap-2">
            {step === "additional" ? "Continue to Booking" : "Next"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
