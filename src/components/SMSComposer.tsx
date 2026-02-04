import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Send, Paperclip } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const SMSComposer = () => {
  const [toNumber, setToNumber] = useState("");
  const [fromNumber, setFromNumber] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const sendSMS = async () => {
    if (!toNumber || !fromNumber || !messageBody) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);

    try {
      const { data, error } = await supabase.functions.invoke('sms-send', {
        body: {
          to: toNumber,
          from: fromNumber,
          body: messageBody,
        },
      });

      if (error) throw error;

      if (data.status === 'blocked') {
        toast({
          title: "Message blocked",
          description: "Recipient has opted out of SMS",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Message sent",
        description: `SMS sent to ${toNumber}`,
      });

      setToNumber("");
      setMessageBody("");
    } catch (error: any) {
      console.error('Error sending SMS:', error);
      toast({
        title: "Send failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Send SMS
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">From</label>
            <Input
              type="tel"
              placeholder="+1234567890"
              value={fromNumber}
              onChange={(e) => setFromNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">To</label>
            <Input
              type="tel"
              placeholder="+1234567890"
              value={toNumber}
              onChange={(e) => setToNumber(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            placeholder="Type your message..."
            value={messageBody}
            onChange={(e) => setMessageBody(e.target.value)}
            rows={4}
            maxLength={1600}
          />
          <p className="text-xs text-muted-foreground text-right">
            {messageBody.length}/1600
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            disabled
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          <Button
            onClick={sendSMS}
            disabled={sending}
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending..." : "Send SMS"}
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          Note: SMS sending requires carrier configuration (SMPP or HTTP gateway)
        </div>
      </CardContent>
    </Card>
  );
};
