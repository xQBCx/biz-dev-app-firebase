import { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIMessageFeedbackProps {
  messageId?: string;
  conversationId?: string;
  onFeedback?: (type: "positive" | "negative") => void;
}

export const AIMessageFeedback = ({ 
  messageId, 
  conversationId,
  onFeedback 
}: AIMessageFeedbackProps) => {
  const [feedback, setFeedback] = useState<"positive" | "negative" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFeedback = async (type: "positive" | "negative") => {
    if (feedback === type || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store feedback in the database
      if (messageId) {
        await supabase.from("ai_message_feedback").insert({
          message_id: messageId,
          user_id: user.id,
          feedback_type: type
        });
      }

      setFeedback(type);
      onFeedback?.(type);
      
      if (type === "positive") {
        toast.success("Thanks for the feedback!");
      } else {
        toast("We'll work on improving", { description: "Your feedback helps the AI learn" });
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 ${feedback === "positive" ? "text-green-500" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => handleFeedback("positive")}
        disabled={isSubmitting}
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`h-6 w-6 ${feedback === "negative" ? "text-red-500" : "text-muted-foreground hover:text-foreground"}`}
        onClick={() => handleFeedback("negative")}
        disabled={isSubmitting}
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
};
