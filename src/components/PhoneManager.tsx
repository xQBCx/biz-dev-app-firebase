import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Phone, Plus, Trash2, Check, PhoneCall, PhoneIncoming, PhoneOutgoing, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface PhoneNumber {
  id: string;
  phone_number: string;
  label: string;
  is_primary: boolean;
  is_active: boolean;
  lindy_integration_id?: string;
  created_at: string;
}

interface CallLog {
  id: string;
  phone_number_id: string;
  direction: 'inbound' | 'outbound';
  caller_number: string;
  duration_seconds: number;
  status: string;
  created_at: string;
  phone_number: PhoneNumber;
}

export const PhoneManager = () => {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [showAddPhone, setShowAddPhone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPhoneNumbers();
    loadCallLogs();
  }, []);

  const loadPhoneNumbers = async () => {
    try {
      const { data, error } = await supabase
        .from('phone_numbers')
        .select('*')
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPhoneNumbers(data || []);
    } catch (error) {
      console.error('Error loading phone numbers:', error);
      toast.error('Failed to load phone numbers');
    }
  };

  const loadCallLogs = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('call_logs')
        .select(`
          *,
          phone_number:phone_numbers(*)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setCallLogs(data || []);
    } catch (error) {
      console.error('Error loading call logs:', error);
      toast.error('Failed to load call logs');
    } finally {
      setIsLoading(false);
    }
  };

  const addPhoneNumber = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      const { error } = await supabase.from('phone_numbers').insert({
        phone_number: formData.get('phone_number') as string,
        label: formData.get('label') as string,
        is_primary: phoneNumbers.length === 0, // First number is primary
        is_active: true
      } as any);

      if (error) throw error;

      toast.success('Phone number added');
      setShowAddPhone(false);
      loadPhoneNumbers();
    } catch (error: any) {
      console.error('Error adding phone number:', error);
      toast.error(error.message || 'Failed to add phone number');
    }
  };

  const removePhoneNumber = async (id: string) => {
    try {
      const { error } = await supabase
        .from('phone_numbers' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Phone number removed');
      loadPhoneNumbers();
    } catch (error: any) {
      console.error('Error removing phone number:', error);
      toast.error(error.message || 'Failed to remove phone number');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Phone Numbers</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your phone numbers and view call history
          </p>
        </div>
        <Dialog open={showAddPhone} onOpenChange={setShowAddPhone}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Phone Number</DialogTitle>
            </DialogHeader>
            <form onSubmit={addPhoneNumber} className="space-y-4">
              <div>
                <Label htmlFor="phone_number">Phone Number</Label>
                <Input
                  id="phone_number"
                  name="phone_number"
                  type="tel"
                  required
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  name="label"
                  required
                  placeholder="e.g., Personal, Business, Support"
                />
              </div>
              <Button type="submit" className="w-full">
                Add Phone Number
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {phoneNumbers.length === 0 ? (
          <Card className="p-8 text-center col-span-full">
            <Phone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No phone numbers configured</p>
            <p className="text-sm text-muted-foreground">
              Add your first phone number to enable AI calling features
            </p>
          </Card>
        ) : (
          phoneNumbers.map((phone) => (
            <Card key={phone.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{phone.label}</span>
                    {phone.is_primary && (
                      <Badge variant="default" className="text-xs">Primary</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    {phone.phone_number}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removePhoneNumber(phone.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={phone.is_active ? "default" : "secondary"} className="text-xs">
                  {phone.is_active ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Active
                    </>
                  ) : (
                    "Inactive"
                  )}
                </Badge>
                {phone.lindy_integration_id && (
                  <Badge variant="outline" className="text-xs">
                    <Brain className="w-3 h-3 mr-1" />
                    AI Enabled
                  </Badge>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Recent Calls</h3>
        {isLoading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading call history...</p>
          </Card>
        ) : callLogs.length === 0 ? (
          <Card className="p-8 text-center">
            <PhoneCall className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No call history yet</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {callLogs.map((log) => (
              <Card key={log.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {log.direction === 'inbound' ? (
                      <PhoneIncoming className="w-5 h-5 text-green-600" />
                    ) : (
                      <PhoneOutgoing className="w-5 h-5 text-blue-600" />
                    )}
                    <div>
                      <div className="font-medium">{log.caller_number}</div>
                      <div className="text-sm text-muted-foreground">
                        via {log.phone_number?.label || 'Unknown'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-3 h-3" />
                      {formatDuration(log.duration_seconds)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
