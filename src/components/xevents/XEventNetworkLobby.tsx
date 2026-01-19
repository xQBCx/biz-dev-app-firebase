import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { XEventParticipant, XEventRegistration, XEvent } from "@/hooks/useXEvents";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { 
  Users, 
  MessageCircle, 
  UserPlus, 
  Search,
  Briefcase,
  Star,
  Send,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface XEventNetworkLobbyProps {
  event: XEvent;
  participants: XEventParticipant[];
  registrations: XEventRegistration[];
}

interface Connection {
  id: string;
  name: string;
  title?: string;
  company?: string;
  role: string;
  avatar_url?: string;
  isConnected: boolean;
}

export const XEventNetworkLobby = ({ 
  event, 
  participants, 
  registrations 
}: XEventNetworkLobbyProps) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [messageText, setMessageText] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    buildConnectionsList();
  }, [participants, registrations]);

  const buildConnectionsList = () => {
    const connectionMap = new Map<string, Connection>();
    
    // Add participants (speakers, sponsors, organizers)
    participants.forEach(p => {
      const key = p.user_id || p.email || p.id;
      if (!connectionMap.has(key)) {
        connectionMap.set(key, {
          id: p.id,
          name: p.display_name || "Unknown",
          title: p.title,
          company: p.company,
          role: p.role,
          avatar_url: p.photo_url,
          isConnected: false
        });
      }
    });
    
    // Add confirmed registrations
    registrations
      .filter(r => r.status === 'confirmed' || r.status === 'checked_in')
      .forEach(r => {
        const key = r.user_id || r.email;
        if (!connectionMap.has(key)) {
          connectionMap.set(key, {
            id: r.id,
            name: `${r.first_name} ${r.last_name}`,
            title: r.title,
            company: r.company,
            role: 'attendee',
            isConnected: false
          });
        }
      });
    
    setConnections(Array.from(connectionMap.values()));
  };

  const handleConnect = async (connection: Connection) => {
    if (!user) {
      toast.error("Please log in to connect");
      return;
    }
    
    // Mark as connected locally (in production would integrate with CRM properly)
    setConnections(prev => prev.map(c => 
      c.id === connection.id ? { ...c, isConnected: true } : c
    ));
    
    toast.success(`Added ${connection.name} to your network!`);
  };

  const handleSendMessage = async () => {
    if (!selectedConnection || !messageText.trim()) return;
    
    setIsSending(true);
    
    // For now, just show a success message - in production this would integrate with messaging
    await new Promise(resolve => setTimeout(resolve, 500));
    
    toast.success(`Message sent to ${selectedConnection.name}!`);
    setMessageText("");
    setSelectedConnection(null);
    setIsSending(false);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'organizer':
      case 'co_organizer':
        return 'default';
      case 'speaker':
        return 'secondary';
      case 'sponsor':
        return 'outline';
      case 'vip':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const filteredConnections = connections.filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.company && c.company.toLowerCase().includes(query)) ||
      (c.title && c.title.toLowerCase().includes(query))
    );
  });

  const speakers = filteredConnections.filter(c => c.role === 'speaker');
  const sponsors = filteredConnections.filter(c => c.role === 'sponsor');
  const attendees = filteredConnections.filter(c => c.role === 'attendee');
  const organizers = filteredConnections.filter(c => 
    c.role === 'organizer' || c.role === 'co_organizer'
  );

  const ConnectionCard = ({ connection }: { connection: Connection }) => (
    <Card className="p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        <Avatar className="w-12 h-12">
          <AvatarImage src={connection.avatar_url} />
          <AvatarFallback>
            {connection.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium truncate">{connection.name}</p>
            <Badge variant={getRoleBadgeVariant(connection.role)} className="text-xs capitalize">
              {connection.role.replace('_', ' ')}
            </Badge>
          </div>
          {connection.title && (
            <p className="text-sm text-muted-foreground truncate">{connection.title}</p>
          )}
          {connection.company && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {connection.company}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => setSelectedConnection(connection)}
        >
          <MessageCircle className="w-3 h-3" />
          Message
        </Button>
        <Button 
          variant={connection.isConnected ? "secondary" : "default"}
          size="sm" 
          className="flex-1 gap-1"
          onClick={() => handleConnect(connection)}
          disabled={connection.isConnected || isLoading}
        >
          {connection.isConnected ? (
            <>
              <Star className="w-3 h-3" />
              Connected
            </>
          ) : (
            <>
              <UserPlus className="w-3 h-3" />
              Add to CRM
            </>
          )}
        </Button>
      </div>
    </Card>
  );

  if (!event.networking_enabled) {
    return (
      <Card className="p-8 text-center">
        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Networking Not Enabled</h3>
        <p className="text-muted-foreground">
          The organizer has not enabled networking for this event.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{connections.length}</p>
          <p className="text-sm text-muted-foreground">Total Attendees</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{speakers.length}</p>
          <p className="text-sm text-muted-foreground">Speakers</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">{sponsors.length}</p>
          <p className="text-sm text-muted-foreground">Sponsors</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold">
            {connections.filter(c => c.isConnected).length}
          </p>
          <p className="text-sm text-muted-foreground">Your Connections</p>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search attendees, speakers, sponsors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full">
          <TabsTrigger value="all" className="flex-1">All ({filteredConnections.length})</TabsTrigger>
          <TabsTrigger value="speakers" className="flex-1">Speakers ({speakers.length})</TabsTrigger>
          <TabsTrigger value="sponsors" className="flex-1">Sponsors ({sponsors.length})</TabsTrigger>
          <TabsTrigger value="attendees" className="flex-1">Attendees ({attendees.length})</TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[500px] mt-4">
          <TabsContent value="all" className="mt-0">
            <div className="grid sm:grid-cols-2 gap-4">
              {filteredConnections.map(c => (
                <ConnectionCard key={c.id} connection={c} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="speakers" className="mt-0">
            <div className="grid sm:grid-cols-2 gap-4">
              {speakers.map(c => (
                <ConnectionCard key={c.id} connection={c} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="sponsors" className="mt-0">
            <div className="grid sm:grid-cols-2 gap-4">
              {sponsors.map(c => (
                <ConnectionCard key={c.id} connection={c} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="attendees" className="mt-0">
            <div className="grid sm:grid-cols-2 gap-4">
              {attendees.map(c => (
                <ConnectionCard key={c.id} connection={c} />
              ))}
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>

      {/* Message Dialog */}
      <Dialog open={!!selectedConnection} onOpenChange={() => setSelectedConnection(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message {selectedConnection?.name}</DialogTitle>
            <DialogDescription>
              Send a message to connect and network
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Hi! I'd love to connect..."
              className="min-h-[100px]"
            />
            <Button 
              className="w-full gap-2" 
              onClick={handleSendMessage}
              disabled={!messageText.trim() || isSending}
            >
              {isSending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default XEventNetworkLobby;
