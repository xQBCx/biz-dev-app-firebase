import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  ArrowLeft,
  MessageSquare,
  FileText,
  Shield,
  Wallet,
  Activity,
  Send,
  Upload,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { format } from "date-fns";

interface Deal {
  id: string;
  deal_number: string;
  product_type: string;
  quantity: number;
  quantity_unit: string;
  agreed_price: number;
  currency: string;
  total_value: number;
  escrow_amount: number | null;
  escrow_status: string;
  status: string;
  pop_verified: boolean;
  created_at: string;
  buyer: {
    id: string;
    company_name: string | null;
    user_id: string;
  };
  seller: {
    id: string;
    company_name: string | null;
    user_id: string;
  };
}

interface Message {
  id: string;
  content: string;
  message_type: string;
  sender_id: string;
  created_at: string;
  sender?: {
    company_name: string | null;
    user_id: string;
  };
}

const ESCROW_STEPS = [
  { key: 'pending', label: 'Pending Deposit', icon: Clock },
  { key: 'funded', label: 'Deposit Locked', icon: Wallet },
  { key: 'pop_verified', label: 'POP Verified', icon: Shield },
  { key: 'released', label: 'Funds Released', icon: CheckCircle2 }
];

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  escrow_funded: 'bg-blue-500',
  pop_verified: 'bg-emerald-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-primary',
  disputed: 'bg-destructive',
  cancelled: 'bg-muted text-muted-foreground'
};

export default function XCommodityDealRoom() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  
  const [deal, setDeal] = useState<Deal | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);

  useEffect(() => {
    if (id && user) {
      fetchDeal();
      fetchMessages();
      fetchMyProfile();
      
      // Subscribe to new messages
      const channel = supabase
        .channel(`deal-messages-${id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'commodity_deal_messages',
          filter: `deal_id=eq.${id}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [id, user]);

  const fetchMyProfile = async () => {
    const { data } = await supabase
      .from('commodity_user_profiles')
      .select('id')
      .eq('user_id', user?.id)
      .single();
    
    if (data) setMyProfileId(data.id);
  };

  const fetchDeal = async () => {
    const { data, error } = await supabase
      .from('commodity_deals')
      .select(`
        *,
        buyer:commodity_user_profiles!commodity_deals_buyer_id_fkey(
          id, company_name, user_id
        ),
        seller:commodity_user_profiles!commodity_deals_seller_id_fkey(
          id, company_name, user_id
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      toast.error("Failed to load deal");
      navigate('/xcommodity/deals');
    } else {
      setDeal(data);
    }
    setLoading(false);
  };

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('commodity_deal_messages')
      .select(`
        *,
        sender:commodity_user_profiles!commodity_deal_messages_sender_id_fkey(
          company_name, user_id
        )
      `)
      .eq('deal_id', id)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !myProfileId) return;
    
    setSending(true);
    const { error } = await supabase
      .from('commodity_deal_messages')
      .insert({
        deal_id: id,
        sender_id: myProfileId,
        content: newMessage.trim(),
        message_type: 'text'
      });

    if (error) {
      toast.error("Failed to send message");
    } else {
      setNewMessage("");
    }
    setSending(false);
  };

  const getCurrentStep = () => {
    if (!deal) return 0;
    if (deal.status === 'completed') return 4;
    if (deal.pop_verified) return 3;
    if (deal.escrow_status === 'funded') return 2;
    return 1;
  };

  const isMyMessage = (message: Message) => {
    return message.sender?.user_id === user?.id;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg">Deal not found</h3>
            <Button className="mt-4" onClick={() => navigate('/xcommodity/deals')}>
              Back to Deals
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/xcommodity/deals')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Deal Room</h1>
              <Badge className={statusColors[deal.status]}>
                {deal.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <p className="text-muted-foreground">{deal.deal_number}</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchDeal}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Escrow Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Escrow Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {ESCROW_STEPS.map((step, index) => (
              <div key={step.key} className="flex items-center">
                <div className={`
                  flex flex-col items-center
                  ${index < currentStep ? 'text-emerald-500' : 'text-muted-foreground'}
                `}>
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center
                    ${index < currentStep ? 'bg-emerald-500 text-white' : 'bg-muted'}
                  `}>
                    <step.icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1 text-center max-w-[80px]">{step.label}</span>
                </div>
                {index < ESCROW_STEPS.length - 1 && (
                  <div className={`
                    w-12 h-0.5 mx-2
                    ${index < currentStep - 1 ? 'bg-emerald-500' : 'bg-muted'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Deal Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Deal Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Product</p>
              <p className="font-medium">{deal.product_type}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{deal.quantity.toLocaleString()} {deal.quantity_unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price per Unit</p>
              <p className="font-medium">{deal.currency} {deal.agreed_price.toFixed(2)}</p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-xl font-bold">{deal.currency} {deal.total_value.toLocaleString()}</p>
            </div>
            {deal.escrow_amount && (
              <div>
                <p className="text-sm text-muted-foreground">Escrow Required</p>
                <p className="font-medium">{deal.currency} {deal.escrow_amount.toLocaleString()}</p>
              </div>
            )}
            <div className="pt-2 border-t space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Buyer</p>
                <p className="font-medium">{deal.buyer.company_name || 'Private Buyer'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Seller</p>
                <p className="font-medium">{deal.seller.company_name || 'Private Seller'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Communication */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="chat">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Communication</CardTitle>
                <TabsList>
                  <TabsTrigger value="chat">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="documents">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>
            
            <TabsContent value="chat" className="m-0">
              <CardContent className="p-0">
                <ScrollArea className="h-[400px] p-4">
                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      messages.map(message => (
                        <div 
                          key={message.id}
                          className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`
                            max-w-[70%] rounded-lg p-3
                            ${message.message_type === 'system' 
                              ? 'bg-muted text-center w-full max-w-full text-sm' 
                              : isMyMessage(message) 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }
                          `}>
                            {message.message_type !== 'system' && (
                              <p className="text-xs opacity-70 mb-1">
                                {message.sender?.company_name || 'User'}
                              </p>
                            )}
                            <p>{message.content}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {format(new Date(message.created_at), 'HH:mm')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Textarea 
                      placeholder="Type your message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="min-h-[60px]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!newMessage.trim() || sending}
                      size="icon"
                      className="h-auto"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            <TabsContent value="documents" className="m-0">
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded yet</p>
                  <Button variant="outline" className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
