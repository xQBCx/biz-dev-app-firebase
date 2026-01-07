import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Loader2 } from "lucide-react";
import { useVoiceNarration } from "@/hooks/useVoiceNarration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DealRoomVoiceOverviewProps {
  variant: "general" | "specific";
  dealRoom?: {
    name: string;
    description: string | null;
    category: string;
    expected_deal_size_min: number | null;
    expected_deal_size_max: number | null;
    time_horizon: string;
    status: string;
    voting_enabled?: boolean;
    contract_locked?: boolean;
  };
  participants?: Array<{ name: string; email: string }>;
}

const GENERAL_OVERVIEW_SCRIPT = `Welcome to Deal Rooms. 

Deal Rooms are structured negotiation spaces where multiple parties can collaborate on complex business arrangements with full transparency.

Here's how it works: First, a deal room is created with key parameters like expected deal size, timeline, and category. Participants are then invited to join and contribute.

Each participant can add contributions, whether that's capital, intellectual property, services, or other resources. The system tracks all contributions and calculates fair credit allocations based on agreed-upon formulas.

What makes Deal Rooms unique is the transparent governance. You can set up voting rules, lock contracts when terms are finalized, and use AI analysis to identify potential issues or opportunities.

To get started: Browse existing deal rooms you've been invited to, or if you're an admin, create a new one. Once inside a deal room, explore the tabs to understand the deal structure, participants, and your role.

Every action is logged, every contribution is tracked, and settlements are calculated automatically based on the agreed terms.`;

export function DealRoomVoiceOverview({ variant, dealRoom, participants }: DealRoomVoiceOverviewProps) {
  const { speak, stop, isPlaying, isLoading, hasPermission, checkPermission } = useVoiceNarration();
  const [permissionChecked, setPermissionChecked] = useState(false);

  useEffect(() => {
    checkPermission().then(() => setPermissionChecked(true));
  }, [checkPermission]);

  const generateSpecificScript = () => {
    if (!dealRoom) return "";

    const formatDealSize = (min: number | null, max: number | null) => {
      if (!min && !max) return "to be determined";
      const format = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)} million dollars`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)} thousand dollars`;
        return `${n} dollars`;
      };
      if (min && max) return `between ${format(min)} and ${format(max)}`;
      if (min) return `at least ${format(min)}`;
      return `up to ${format(max!)}`;
    };

    const categoryLabels: Record<string, string> = {
      sales: "a sales deal",
      platform_build: "a platform build project",
      joint_venture: "a joint venture",
      licensing: "a licensing agreement",
      services: "a services engagement",
      infrastructure: "an infrastructure project",
      ip_creation: "an intellectual property creation project",
    };

    const timeHorizonLabels: Record<string, string> = {
      immediate: "with an immediate timeline",
      short_term: "with a short-term timeline of a few weeks",
      medium_term: "with a medium-term timeline of a few months",
      long_term: "with a long-term timeline extending over a year or more",
    };

    const participantList = participants && participants.length > 0
      ? `The current participants include: ${participants.map(p => p.name || p.email).join(", ")}.`
      : "No participants have been added yet.";

    const statusMessage = dealRoom.contract_locked
      ? "The contract terms are now locked, meaning the deal structure is finalized and ready for execution."
      : "The contract is still in draft mode, so terms can be modified before locking.";

    const votingMessage = dealRoom.voting_enabled
      ? "DAO voting is currently active, allowing participants to vote on key decisions."
      : "";

    return `Welcome to the ${dealRoom.name} deal room.

${dealRoom.description ? `This deal is about: ${dealRoom.description}` : ""}

This is ${categoryLabels[dealRoom.category] || "a business deal"}, with an expected value ${formatDealSize(dealRoom.expected_deal_size_min, dealRoom.expected_deal_size_max)}, ${timeHorizonLabels[dealRoom.time_horizon] || ""}.

${participantList}

${statusMessage} ${votingMessage}

Here's what you need to do: Start by reviewing the Overview tab to understand the deal context. Check the Participants tab to see who's involved and their roles. If you're expected to contribute, head to the Contributions tab to log your resources.

Review the Terms tab carefully to understand the smart contract conditions. If voting is enabled, participate in governance decisions through the Structures tab.

For any questions, use the Chat tab to communicate with other participants, or check the AI Analysis for insights about the deal.`;
  };

  const handleToggle = () => {
    if (isPlaying) {
      stop();
    } else {
      const script = variant === "general" ? GENERAL_OVERVIEW_SCRIPT : generateSpecificScript();
      speak(script, "biz");
    }
  };

  // Don't render if permission not checked or user doesn't have permission
  if (!permissionChecked || hasPermission === false) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isPlaying ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? "Loading..." : isPlaying ? "Stop" : variant === "general" ? "How It Works" : "Overview"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{variant === "general" ? "Listen to how Deal Rooms work" : "Listen to an overview of this deal"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
