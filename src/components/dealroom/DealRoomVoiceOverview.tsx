import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Volume2, Loader2 } from "lucide-react";
import { useVoiceNarration } from "@/hooks/useVoiceNarration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { VoiceNarrationPlayer } from "./VoiceNarrationPlayer";

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

const GENERAL_CHAPTERS = [
  { label: "Welcome", startTime: 0 },
  { label: "How It Works", startTime: 8 },
  { label: "Contributions", startTime: 18 },
  { label: "Governance", startTime: 28 },
  { label: "Getting Started", startTime: 38 },
];

const SPECIFIC_CHAPTERS = [
  { label: "Welcome", startTime: 0 },
  { label: "Deal Details", startTime: 5 },
  { label: "Participants", startTime: 15 },
  { label: "Status", startTime: 22 },
  { label: "Next Steps", startTime: 28 },
];

const GENERAL_OVERVIEW_SCRIPT = `Welcome to Deal Rooms. 

Deal Rooms are structured negotiation spaces where multiple parties can collaborate on complex business arrangements with full transparency.

Here's how it works: First, a deal room is created with key parameters like expected deal size, timeline, and category. Participants are then invited to join and contribute.

Each participant can add contributions, whether that's capital, intellectual property, services, or other resources. The system tracks all contributions and calculates fair credit allocations based on agreed-upon formulas.

What makes Deal Rooms unique is the transparent governance. You can set up voting rules, lock contracts when terms are finalized, and use AI analysis to identify potential issues or opportunities.

To get started: Browse existing deal rooms you've been invited to, or if you're an admin, create a new one. Once inside a deal room, explore the tabs to understand the deal structure, participants, and your role.

Every action is logged, every contribution is tracked, and settlements are calculated automatically based on the agreed terms.`;

export function DealRoomVoiceOverview({ variant, dealRoom, participants }: DealRoomVoiceOverviewProps) {
  const { speakCached, stop, isLoading, hasPermission, checkPermission } = useVoiceNarration();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);

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
      ? `The current participants include: ${participants.slice(0, 3).map(p => p.name || p.email).join(", ")}${participants.length > 3 ? ` and ${participants.length - 3} others` : ""}.`
      : "No participants have been added yet.";

    const statusMessage = dealRoom.contract_locked
      ? "The contract is locked and ready for execution."
      : "The contract is in draft mode.";

    return `Welcome to ${dealRoom.name}.

${dealRoom.description ? dealRoom.description.slice(0, 100) : ""}

This is ${categoryLabels[dealRoom.category] || "a business deal"}, valued ${formatDealSize(dealRoom.expected_deal_size_min, dealRoom.expected_deal_size_max)}.

${participantList}

${statusMessage}

Review the Overview tab, check Participants, and log your contributions. Use the Chat tab for questions.`;
  };

  // Generate a signature based on key deal properties only
  const getDealSignature = (): string => {
    if (variant === "general") return "v1"; // Static for general overview
    if (!dealRoom) return "unknown";
    
    // Only these properties trigger regeneration
    return JSON.stringify({
      name: dealRoom.name,
      category: dealRoom.category,
      status: dealRoom.status,
      contract_locked: dealRoom.contract_locked ?? false,
      voting_enabled: dealRoom.voting_enabled ?? false,
      deal_size_min: dealRoom.expected_deal_size_min,
      deal_size_max: dealRoom.expected_deal_size_max,
      time_horizon: dealRoom.time_horizon,
      participant_count: participants?.length ?? 0,
    });
  };

  const handleToggle = async () => {
    if (showPlayer) {
      stop();
      setShowPlayer(false);
      setAudioUrl(null);
      return;
    }

    const script = variant === "general" ? GENERAL_OVERVIEW_SCRIPT : generateSpecificScript();
    const cacheKey = variant === "general" ? "dealroom-general" : `dealroom-${dealRoom?.name?.replace(/\s+/g, '-') || 'unknown'}`;
    const dealSignature = getDealSignature();
    
    const url = await speakCached(script, cacheKey, "biz", dealSignature);
    if (url) {
      setAudioUrl(url);
      setShowPlayer(true);
    }
  };

  const handleClosePlayer = () => {
    stop();
    setShowPlayer(false);
    setAudioUrl(null);
  };

  if (!permissionChecked || hasPermission === false) {
    return null;
  }

  const chapters = variant === "general" ? GENERAL_CHAPTERS : SPECIFIC_CHAPTERS;

  return (
    <>
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
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {isLoading ? "Loading..." : variant === "general" ? "How It Works" : "Overview"}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{variant === "general" ? "Listen to how Deal Rooms work" : "Listen to an overview of this deal"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Mobile: Fixed centered bottom player. Desktop: Floating popup */}
      {showPlayer && audioUrl && (
        <>
          {/* Mobile overlay backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 sm:hidden" 
            onClick={handleClosePlayer}
          />
          {/* Player container - centered on mobile, right-aligned on desktop */}
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100vw-2rem)] max-w-80 sm:w-72 sm:max-w-none sm:absolute sm:top-full sm:bottom-auto sm:left-auto sm:right-0 sm:translate-x-0 sm:mt-2">
            <VoiceNarrationPlayer
              audioUrl={audioUrl}
              chapters={chapters}
              onClose={handleClosePlayer}
            />
          </div>
        </>
      )}
    </>
  );
}
