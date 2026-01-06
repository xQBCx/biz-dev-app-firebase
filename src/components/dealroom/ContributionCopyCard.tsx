import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Copy, Check, User, Package, DollarSign } from "lucide-react";

interface Contribution {
  id: string;
  participant_id: string;
  classification: string;
  credits_amount: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
  participant?: {
    name: string;
    email: string;
  };
  ingredient?: {
    name: string;
    ingredient_type: string;
  };
}

interface ContributionCopyCardProps {
  contribution: Contribution;
  dealRoomName: string;
}

const classificationLabels: Record<string, string> = {
  ingredient_one_time: "One-Time Ingredient",
  ingredient_embedded: "Embedded Ingredient",
  formulation_effort: "Formulation Effort",
  process_governance: "Process Governance",
  distribution_origination: "Distribution/Origination",
  execution_deployment: "Execution/Deployment",
  risk_assumption: "Risk Assumption",
};

export const ContributionCopyCard = ({ 
  contribution,
  dealRoomName 
}: ContributionCopyCardProps) => {
  const [copied, setCopied] = useState(false);

  const generateCopyText = () => {
    const lines = [
      `=== Contribution Summary ===`,
      `Deal Room: ${dealRoomName}`,
      ``,
      `Participant: ${contribution.participant?.name || "Unknown"}`,
      `Email: ${contribution.participant?.email || "N/A"}`,
      ``,
      `Classification: ${classificationLabels[contribution.classification] || contribution.classification}`,
      `Credits: ${contribution.credits_amount.toLocaleString()}`,
      ``,
    ];

    if (contribution.description) {
      lines.push(`Description: ${contribution.description}`);
      lines.push(``);
    }

    if (contribution.ingredient) {
      lines.push(`Related Ingredient: ${contribution.ingredient.name} (${contribution.ingredient.ingredient_type})`);
      lines.push(``);
    }

    lines.push(`Status: ${contribution.is_active ? "Active" : "Inactive"}`);
    lines.push(`Added: ${new Date(contribution.created_at).toLocaleDateString()}`);

    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generateCopyText());
      setCopied(true);
      toast.success("Contribution details copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card className="p-4 relative group">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </Button>

      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium">
              {contribution.participant?.name || "Unknown Participant"}
            </span>
            <Badge variant="outline" className="text-xs">
              {classificationLabels[contribution.classification] || contribution.classification}
            </Badge>
          </div>
          {contribution.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {contribution.description}
            </p>
          )}
          {contribution.ingredient && (
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Package className="w-3 h-3" />
              <span>{contribution.ingredient.name}</span>
            </div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="flex items-center gap-1 text-primary font-bold">
            <DollarSign className="w-4 h-4" />
            {contribution.credits_amount.toLocaleString()}
          </div>
          <span className="text-xs text-muted-foreground">credits</span>
        </div>
      </div>
    </Card>
  );
};
