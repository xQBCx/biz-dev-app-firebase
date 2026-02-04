import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Send, Mail, Users, ArrowDownLeft, ArrowUpRight, ExternalLink, Inbox, CheckCircle, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface DealRoomMessagingProps {
  dealRoomId: string;
  dealRoomName: string;
  isAdmin: boolean;
}

interface Participant {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
}

interface OutboundMessage {
  id: string;
  recipient_email: string | null;
  recipient_participant_id: string | null;
  subject: string | null;
  content: string;
  channels: string[];
  sent_via_deal_room: boolean;
  sent_via_biz_dev: boolean;
  sent_via_email: boolean;
  created_at: string;
}

interface InboundEmail {
  id: string;
  from_email: string;
  from_name: string | null;
  subject: string | null;
  body_text: string | null;
  processed: boolean;
  created_at: string;
}

export const DealRoomMessaging = ({ dealRoomId, dealRoomName, isAdmin }: DealRoomMessagingProps) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [outboundMessages, setOutboundMessages] = useState<OutboundMessage[]>([]);
  const [inboundEmails, setInboundEmails] = useState<InboundEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("outbound");

  const [newMessage, setNewMessage] = useState({
    recipientType: "single",
    recipientId: "",
    recipientEmail: "",
    subject: "",
    content: "",
    sendViaDealRoom: true,
    sendViaBizDev: false,
    sendViaEmail: true
  });

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    try {
      const [participantsRes, outboundRes, inboundRes] = await Promise.all([
        supabase
          .from("deal_room_participants")
          .select("id, user_id, name, email")
          .eq("deal_room_id", dealRoomId),
        supabase
          .from("deal_room_outbound_messages")
          .select("*")
          .eq("deal_room_id", dealRoomId)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("deal_room_inbound_emails")
          .select("*")
          .eq("deal_room_id", dealRoomId)
          .order("created_at", { ascending: false })
          .limit(50)
      ]);

      if (participantsRes.data) setParticipants(participantsRes.data);
      if (outboundRes.data) setOutboundMessages(outboundRes.data);
      if (inboundRes.data) setInboundEmails(inboundRes.data);
    } catch (error) {
      console.error("Error fetching messaging data:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.content.trim()) {
      toast.error("Please enter a message");
      return;
    }

    if (newMessage.recipientType === "single" && !newMessage.recipientId && !newMessage.recipientEmail) {
      toast.error("Please select a recipient");
      return;
    }

    setSending(true);
    try {
      const channels: string[] = [];
      if (newMessage.sendViaDealRoom) channels.push("deal_room");
      if (newMessage.sendViaBizDev) channels.push("biz_dev_messages");
      if (newMessage.sendViaEmail) channels.push("external_email");

      // Get recipient details
      let recipientEmail = newMessage.recipientEmail;
      let recipientParticipantId = newMessage.recipientId || null;
      let recipientUserId = null;

      if (newMessage.recipientId) {
        const participant = participants.find(p => p.id === newMessage.recipientId);
        if (participant) {
          recipientEmail = participant.email;
          recipientUserId = participant.user_id;
        }
      }

      // Create outbound message record
      if (!user?.id) {
        toast.error("You must be logged in to send messages");
        return;
      }

      const { data: msgRecord, error: msgError } = await supabase
        .from("deal_room_outbound_messages")
        .insert({
          deal_room_id: dealRoomId,
          sender_id: user.id,
          recipient_participant_id: recipientParticipantId || null,
          recipient_email: recipientEmail || null,
          recipient_user_id: recipientUserId || null,
          subject: newMessage.subject || null,
          content: newMessage.content,
          channels: channels as ("deal_room" | "biz_dev_messages" | "external_email")[],
          sent_via_deal_room: newMessage.sendViaDealRoom,
          sent_via_biz_dev: newMessage.sendViaBizDev,
          sent_via_email: newMessage.sendViaEmail
        })
        .select()
        .single();

      if (msgError) throw msgError;

      // Send via edge function for email delivery
      if (newMessage.sendViaEmail && recipientEmail) {
        const { error: emailError } = await supabase.functions.invoke("send-deal-room-message", {
          body: {
            messageId: msgRecord.id,
            dealRoomId,
            dealRoomName,
            recipientEmail,
            subject: newMessage.subject || `Message from ${dealRoomName}`,
            content: newMessage.content
          }
        });

        if (emailError) {
          console.error("Email sending failed:", emailError);
          toast.warning("Message saved but email delivery failed");
        }
      }

      toast.success("Message sent successfully");
      setComposeOpen(false);
      setNewMessage({
        recipientType: "single",
        recipientId: "",
        recipientEmail: "",
        subject: "",
        content: "",
        sendViaDealRoom: true,
        sendViaBizDev: false,
        sendViaEmail: true
      });
      fetchData();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast.error(error.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>Deal Room Messaging</CardTitle>
            </div>
            <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Send className="h-4 w-4 mr-2" />
                  Compose Message
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Message</DialogTitle>
                  <DialogDescription>
                    Send a message to participants via multiple channels
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Recipient</Label>
                    <Select
                      value={newMessage.recipientType}
                      onValueChange={(v) => setNewMessage({ ...newMessage, recipientType: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select recipient type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single Participant</SelectItem>
                        <SelectItem value="all">All Participants</SelectItem>
                        <SelectItem value="custom">Custom Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newMessage.recipientType === "single" && (
                    <div className="space-y-2">
                      <Label>Select Participant</Label>
                      <Select
                        value={newMessage.recipientId}
                        onValueChange={(v) => setNewMessage({ ...newMessage, recipientId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a participant" />
                        </SelectTrigger>
                        <SelectContent>
                          {participants.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} ({p.email})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newMessage.recipientType === "custom" && (
                    <div className="space-y-2">
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        placeholder="recipient@example.com"
                        value={newMessage.recipientEmail}
                        onChange={(e) => setNewMessage({ ...newMessage, recipientEmail: e.target.value })}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Input
                      placeholder="Message subject..."
                      value={newMessage.subject}
                      onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Type your message..."
                      value={newMessage.content}
                      onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                      rows={6}
                    />
                  </div>

                  <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
                    <Label className="text-base">Delivery Channels</Label>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="channel-dealroom"
                          checked={newMessage.sendViaDealRoom}
                          onCheckedChange={(checked) => 
                            setNewMessage({ ...newMessage, sendViaDealRoom: !!checked })
                          }
                        />
                        <Label htmlFor="channel-dealroom" className="flex items-center gap-2 cursor-pointer">
                          <MessageSquare className="h-4 w-4 text-primary" />
                          Deal Room Chat
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="channel-bizdev"
                          checked={newMessage.sendViaBizDev}
                          onCheckedChange={(checked) => 
                            setNewMessage({ ...newMessage, sendViaBizDev: !!checked })
                          }
                        />
                        <Label htmlFor="channel-bizdev" className="flex items-center gap-2 cursor-pointer">
                          <Inbox className="h-4 w-4 text-blue-500" />
                          Biz Dev Messages (if they have it)
                        </Label>
                      </div>
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="channel-email"
                          checked={newMessage.sendViaEmail}
                          onCheckedChange={(checked) => 
                            setNewMessage({ ...newMessage, sendViaEmail: !!checked })
                          }
                        />
                        <Label htmlFor="channel-email" className="flex items-center gap-2 cursor-pointer">
                          <Mail className="h-4 w-4 text-green-500" />
                          External Email
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendMessage} disabled={sending}>
                    {sending ? "Sending..." : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>
            Send messages to participants via deal room, Biz Dev messages, or external email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="outbound" className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4" />
                Sent ({outboundMessages.length})
              </TabsTrigger>
              <TabsTrigger value="inbound" className="flex items-center gap-2">
                <ArrowDownLeft className="h-4 w-4" />
                Received ({inboundEmails.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="outbound" className="mt-4">
              {outboundMessages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No messages sent yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {outboundMessages.map((msg) => (
                      <div key={msg.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{msg.subject || "No subject"}</div>
                            <div className="text-sm text-muted-foreground">
                              To: {msg.recipient_email || "Unknown"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {msg.sent_via_deal_room && (
                              <Badge variant="outline" className="text-xs">
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                              </Badge>
                            )}
                            {msg.sent_via_email && (
                              <Badge variant="outline" className="text-xs text-green-600">
                                <Mail className="h-3 w-3 mr-1" />
                                Email
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{msg.content}</p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {format(new Date(msg.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>

            <TabsContent value="inbound" className="mt-4">
              {inboundEmails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Inbox className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No inbound emails received yet</p>
                  <p className="text-sm mt-2">
                    Replies to deal room emails will appear here when inbound email handling is configured
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {inboundEmails.map((email) => (
                      <div key={email.id} className="p-4 rounded-lg border">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium">{email.subject || "No subject"}</div>
                            <div className="text-sm text-muted-foreground">
                              From: {email.from_name || email.from_email}
                            </div>
                          </div>
                          <Badge variant={email.processed ? "default" : "secondary"}>
                            {email.processed ? (
                              <><CheckCircle className="h-3 w-3 mr-1" /> Processed</>
                            ) : (
                              <><Clock className="h-3 w-3 mr-1" /> New</>
                            )}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {email.body_text || "No preview available"}
                        </p>
                        <div className="text-xs text-muted-foreground mt-2">
                          {format(new Date(email.created_at), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Info about inbound emails */}
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-1">
              <h4 className="font-medium">About Inbound Email Handling</h4>
              <p className="text-sm text-muted-foreground">
                Emails sent from this deal room use a reply-to address that routes responses back here. 
                For full inbound email support, configure your domain's email forwarding to our webhook endpoint.
              </p>
              <Button variant="link" className="h-auto p-0 text-sm" asChild>
                <a href="https://resend.com/docs/dashboard/webhooks/introduction" target="_blank" rel="noopener noreferrer">
                  Learn about email webhooks <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
