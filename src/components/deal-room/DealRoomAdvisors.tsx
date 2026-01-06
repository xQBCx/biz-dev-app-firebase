import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Users, Plus, Mail, Briefcase, Check, X, 
  Shield, AlertCircle, Edit, Trash2, Eye, EyeOff
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Advisor {
  id: string;
  name: string;
  email: string;
  advisor_type: string;
  firm_name: string | null;
  invitation_status: string;
  permissions: Record<string, boolean>;
  created_at: string;
}

// Helper to safely cast permissions
const parsePermissions = (p: unknown): Record<string, boolean> => {
  if (typeof p === 'object' && p !== null) {
    return p as Record<string, boolean>;
  }
  return DEFAULT_PERMISSIONS;
};

interface DealRoomAdvisorsProps {
  dealRoomId: string;
  participantId: string;
}

const ADVISOR_TYPES = [
  { value: 'legal_counsel', label: 'Legal Counsel', icon: '⚖️' },
  { value: 'accountant', label: 'Accountant', icon: '📊' },
  { value: 'tax_advisor', label: 'Tax Advisor', icon: '🧾' },
  { value: 'technical_consultant', label: 'Technical Consultant', icon: '💻' },
  { value: 'financial_advisor', label: 'Financial Advisor', icon: '💰' },
  { value: 'compliance_officer', label: 'Compliance Officer', icon: '📋' },
  { value: 'mediator', label: 'Mediator', icon: '🤝' },
  { value: 'other', label: 'Other', icon: '👤' },
];

const DEFAULT_PERMISSIONS = {
  can_view_deal_terms: true,
  can_view_formulations: true,
  can_view_participant_list: true,
  can_view_chat: false,
  can_participate_in_chat: false,
  can_view_financial_details: false,
  can_download_documents: false,
  can_add_notes: true,
  can_request_changes: false,
};

export function DealRoomAdvisors({ dealRoomId, participantId }: DealRoomAdvisorsProps) {
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showPermissionsDialog, setShowPermissionsDialog] = useState<string | null>(null);
  const [newAdvisor, setNewAdvisor] = useState({
    name: '',
    email: '',
    advisor_type: '',
    firm_name: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAdvisors();
  }, [dealRoomId]);

  const fetchAdvisors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('deal_room_advisors')
      .select('*')
      .eq('deal_room_id', dealRoomId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching advisors:', error);
    } else {
      setAdvisors((data || []).map(d => ({ ...d, permissions: parsePermissions(d.permissions) })) as Advisor[]);
    }
    setIsLoading(false);
  };

  const inviteAdvisor = async () => {
    if (!newAdvisor.name || !newAdvisor.email || !newAdvisor.advisor_type) return;

    try {
      const { data, error } = await supabase
        .from('deal_room_advisors')
        .insert({
          deal_room_id: dealRoomId,
          invited_by_participant_id: participantId,
          name: newAdvisor.name,
          email: newAdvisor.email,
          advisor_type: newAdvisor.advisor_type,
          firm_name: newAdvisor.firm_name || null,
          permissions: DEFAULT_PERMISSIONS,
        })
        .select()
        .single();

      if (error) throw error;

      const newAdvisorData = { ...data, permissions: parsePermissions(data.permissions) } as Advisor;
      setAdvisors(prev => [newAdvisorData, ...prev]);
      setShowAddDialog(false);
      setNewAdvisor({ name: '', email: '', advisor_type: '', firm_name: '' });

      toast({
        title: "Advisor Invited",
        description: `Invitation sent to ${newAdvisor.email}`,
      });
    } catch (error) {
      console.error('Error inviting advisor:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const updatePermissions = async (advisorId: string, permissions: Record<string, boolean>) => {
    try {
      const { error } = await supabase
        .from('deal_room_advisors')
        .update({ permissions })
        .eq('id', advisorId);

      if (error) throw error;

      setAdvisors(prev => 
        prev.map(a => a.id === advisorId ? { ...a, permissions } : a)
      );

      toast({
        title: "Permissions Updated",
        description: "Advisor permissions have been saved",
      });
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  const revokeAccess = async (advisorId: string) => {
    try {
      const { error } = await supabase
        .from('deal_room_advisors')
        .update({ invitation_status: 'revoked' })
        .eq('id', advisorId);

      if (error) throw error;

      setAdvisors(prev => 
        prev.map(a => a.id === advisorId ? { ...a, invitation_status: 'revoked' } : a)
      );

      toast({
        title: "Access Revoked",
        description: "Advisor no longer has access to this deal",
      });
    } catch (error) {
      console.error('Error revoking access:', error);
    }
  };

  const getAdvisorTypeInfo = (type: string) => {
    return ADVISOR_TYPES.find(t => t.value === type) || { label: type, icon: '👤' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/10 text-green-500 gap-1"><Check className="h-3 w-3" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500/10 text-amber-500 gap-1"><Mail className="h-3 w-3" />Pending</Badge>;
      case 'declined':
        return <Badge className="bg-red-500/10 text-red-500 gap-1"><X className="h-3 w-3" />Declined</Badge>;
      case 'revoked':
        return <Badge variant="destructive" className="gap-1"><Shield className="h-3 w-3" />Revoked</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const currentEditingAdvisor = advisors.find(a => a.id === showPermissionsDialog);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Advisors
            </CardTitle>
            <CardDescription>
              Invite lawyers, accountants, or consultants to review this deal
            </CardDescription>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Invite Advisor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite an Advisor</DialogTitle>
                <DialogDescription>
                  Add a professional advisor to review this deal
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={newAdvisor.name}
                    onChange={(e) => setNewAdvisor(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newAdvisor.email}
                    onChange={(e) => setNewAdvisor(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@lawfirm.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Advisor Type</Label>
                  <Select
                    value={newAdvisor.advisor_type}
                    onValueChange={(value) => setNewAdvisor(prev => ({ ...prev, advisor_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ADVISOR_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Firm/Company Name (Optional)</Label>
                  <Input
                    value={newAdvisor.firm_name}
                    onChange={(e) => setNewAdvisor(prev => ({ ...prev, firm_name: e.target.value }))}
                    placeholder="Smith & Associates LLP"
                  />
                </div>

                <Button 
                  onClick={inviteAdvisor}
                  disabled={!newAdvisor.name || !newAdvisor.email || !newAdvisor.advisor_type}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="p-0">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            Loading advisors...
          </div>
        ) : advisors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No advisors invited yet</p>
            <p className="text-sm">Invite professionals to review your deal</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="p-4 space-y-3">
              {advisors.map((advisor) => {
                const typeInfo = getAdvisorTypeInfo(advisor.advisor_type);
                return (
                  <div
                    key={advisor.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{typeInfo.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{advisor.name}</span>
                          {getStatusBadge(advisor.invitation_status)}
                        </div>
                        <p className="text-sm text-muted-foreground">{advisor.email}</p>
                        {advisor.firm_name && (
                          <p className="text-xs text-muted-foreground">{advisor.firm_name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPermissionsDialog(advisor.id)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        Permissions
                      </Button>
                      
                      {advisor.invitation_status !== 'revoked' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeAccess(advisor.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Permissions Dialog */}
      <Dialog open={!!showPermissionsDialog} onOpenChange={() => setShowPermissionsDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Advisor Permissions</DialogTitle>
            <DialogDescription>
              Configure what {currentEditingAdvisor?.name} can access
            </DialogDescription>
          </DialogHeader>
          
          {currentEditingAdvisor && (
            <div className="space-y-4 py-4">
              {Object.entries(currentEditingAdvisor.permissions).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    {value ? <Eye className="h-4 w-4 text-green-500" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                    {key.replace(/_/g, ' ').replace('can ', '').split(' ').map(
                      word => word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Label>
                  <Switch
                    checked={value}
                    onCheckedChange={(checked) => {
                      const newPermissions = {
                        ...currentEditingAdvisor.permissions,
                        [key]: checked,
                      };
                      updatePermissions(currentEditingAdvisor.id, newPermissions);
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
