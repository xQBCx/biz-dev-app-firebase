import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Eye, Edit, FileText, Users, DollarSign, Settings, Shield } from "lucide-react";

interface DealRoomPermissionManagerProps {
  participantId: string;
  dealRoomId: string;
  participantEmail?: string;
  participantName?: string;
}

// Standard Deal Room permission categories
const DEAL_ROOM_PERMISSIONS = {
  "Documents": {
    icon: FileText,
    permissions: [
      { key: 'view_documents', label: 'View Documents' },
      { key: 'upload_documents', label: 'Upload Documents' },
      { key: 'delete_documents', label: 'Delete Documents' },
      { key: 'manage_document_access', label: 'Manage Document Access' },
    ]
  },
  "Participants": {
    icon: Users,
    permissions: [
      { key: 'view_participants', label: 'View Participants' },
      { key: 'invite_participants', label: 'Invite Participants' },
      { key: 'remove_participants', label: 'Remove Participants' },
      { key: 'manage_participant_roles', label: 'Manage Roles' },
    ]
  },
  "Financials": {
    icon: DollarSign,
    permissions: [
      { key: 'view_own_financials', label: 'View Own Financials' },
      { key: 'view_all_financials', label: 'View All Financials' },
      { key: 'edit_financials', label: 'Edit Financials' },
    ]
  },
  "Deal Terms": {
    icon: Edit,
    permissions: [
      { key: 'view_deal_terms', label: 'View Deal Terms' },
      { key: 'edit_deal_terms', label: 'Edit Deal Terms' },
      { key: 'view_ingredients', label: 'View Ingredients' },
      { key: 'edit_ingredients', label: 'Edit Ingredients' },
    ]
  },
  "Deliverables": {
    icon: Shield,
    permissions: [
      { key: 'view_own_deliverables', label: 'View Own Deliverables' },
      { key: 'view_all_deliverables', label: 'View All Deliverables' },
      { key: 'manage_deliverables', label: 'Manage Deliverables' },
    ]
  },
  "Communication": {
    icon: Settings,
    permissions: [
      { key: 'send_messages', label: 'Send Messages' },
      { key: 'view_all_messages', label: 'View All Messages' },
      { key: 'create_announcements', label: 'Create Announcements' },
    ]
  },
  "Admin": {
    icon: Settings,
    permissions: [
      { key: 'manage_deal_settings', label: 'Manage Deal Settings' },
      { key: 'close_deal', label: 'Close Deal' },
      { key: 'archive_deal', label: 'Archive Deal' },
    ]
  },
};

// Visibility scopes
const VISIBILITY_SCOPES = [
  { value: 'none', label: 'None' },
  { value: 'own_only', label: 'Own Only' },
  { value: 'role_based', label: 'Role-Based' },
  { value: 'all', label: 'All' },
];

// Visibility data types
const VISIBILITY_TYPES = [
  { key: 'financials', label: 'Financials', description: 'Revenue splits, earnings %, contribution amounts' },
  { key: 'participants', label: 'Participants', description: 'Who else is in the deal, their roles, contact info' },
  { key: 'documents', label: 'Documents', description: 'Files, deliverables, attachments' },
  { key: 'deal_terms', label: 'Deal Terms', description: 'Ingredients, terms, conditions specific to the deal' },
  { key: 'contributions', label: 'Contributions', description: 'What each participant is bringing to the deal' },
  { key: 'earnings', label: 'Earnings', description: 'Payout information and distribution' },
];

// Role presets
const ROLE_PRESETS = {
  creator: {
    label: 'Creator',
    color: '#6366f1',
    permissions: Object.values(DEAL_ROOM_PERMISSIONS).flatMap(c => c.permissions.map(p => p.key)),
    visibility: { financials: 'all', participants: 'all', documents: 'all', deal_terms: 'all', contributions: 'all', earnings: 'all' },
  },
  admin: {
    label: 'Admin',
    color: '#8b5cf6',
    permissions: Object.values(DEAL_ROOM_PERMISSIONS).flatMap(c => c.permissions.map(p => p.key)),
    visibility: { financials: 'all', participants: 'all', documents: 'all', deal_terms: 'all', contributions: 'all', earnings: 'all' },
  },
  investor: {
    label: 'Investor',
    color: '#10b981',
    permissions: ['view_documents', 'view_participants', 'view_own_financials', 'view_deal_terms', 'view_own_deliverables', 'send_messages'],
    visibility: { financials: 'own_only', participants: 'all', documents: 'role_based', deal_terms: 'all', contributions: 'none', earnings: 'own_only' },
  },
  advisor: {
    label: 'Advisor',
    color: '#f59e0b',
    permissions: ['view_documents', 'view_participants', 'view_all_financials', 'view_deal_terms', 'view_all_deliverables', 'send_messages', 'view_all_messages'],
    visibility: { financials: 'all', participants: 'all', documents: 'all', deal_terms: 'all', contributions: 'all', earnings: 'all' },
  },
  vendor: {
    label: 'Vendor',
    color: '#ef4444',
    permissions: ['view_documents', 'upload_documents', 'view_own_financials', 'view_own_deliverables', 'send_messages'],
    visibility: { financials: 'own_only', participants: 'role_based', documents: 'role_based', deal_terms: 'own_only', contributions: 'own_only', earnings: 'own_only' },
  },
  partner: {
    label: 'Partner',
    color: '#3b82f6',
    permissions: ['view_documents', 'upload_documents', 'view_participants', 'view_all_financials', 'view_deal_terms', 'view_all_deliverables', 'send_messages'],
    visibility: { financials: 'all', participants: 'all', documents: 'all', deal_terms: 'all', contributions: 'role_based', earnings: 'own_only' },
  },
  participant: {
    label: 'Participant',
    color: '#6b7280',
    permissions: ['view_documents', 'view_participants', 'view_own_financials', 'view_deal_terms', 'view_own_deliverables', 'send_messages'],
    visibility: { financials: 'own_only', participants: 'all', documents: 'role_based', deal_terms: 'all', contributions: 'own_only', earnings: 'own_only' },
  },
  observer: {
    label: 'Observer',
    color: '#9ca3af',
    permissions: ['view_documents', 'view_participants', 'view_deal_terms'],
    visibility: { financials: 'none', participants: 'all', documents: 'role_based', deal_terms: 'all', contributions: 'none', earnings: 'none' },
  },
};

export const DealRoomPermissionManager = ({ 
  participantId, 
  dealRoomId, 
  participantEmail, 
  participantName 
}: DealRoomPermissionManagerProps) => {
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [visibility, setVisibility] = useState<Record<string, string>>({});
  const [roleType, setRoleType] = useState<string>('participant');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [participantId, dealRoomId]);

  const loadPermissions = async () => {
    try {
      // Fetch participant data including default_permissions and visibility_config
      const { data: participant, error } = await supabase
        .from('deal_room_participants')
        .select('default_permissions, visibility_config, role_type')
        .eq('id', participantId)
        .single();

      if (error) throw error;

      if (participant) {
        const defaultPerms = (participant.default_permissions as Record<string, boolean>) || {};
        const visConfig = (participant.visibility_config as Record<string, string>) || {};
        setPermissions(defaultPerms);
        setVisibility(visConfig);
        setRoleType(participant.role_type || 'participant');
      }

      // Also load any permission overrides
      const { data: overrides } = await supabase
        .from('deal_room_permission_overrides')
        .select('permission_key, granted')
        .eq('participant_id', participantId);

      if (overrides && overrides.length > 0) {
        const overrideMap: Record<string, boolean> = { ...permissions };
        overrides.forEach(o => {
          overrideMap[o.permission_key] = o.granted;
        });
        setPermissions(overrideMap);
      }
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const savePermissions = async (newPermissions: Record<string, boolean>, newVisibility: Record<string, string>, newRoleType: string) => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('deal_room_participants')
        .update({
          default_permissions: newPermissions,
          visibility_config: newVisibility,
          role_type: newRoleType,
        })
        .eq('id', participantId);

      if (error) throw error;
      toast.success('Permissions saved');
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePermission = (key: string) => {
    const newPermissions = { ...permissions, [key]: !permissions[key] };
    setPermissions(newPermissions);
    savePermissions(newPermissions, visibility, roleType);
  };

  const updateVisibility = (key: string, value: string) => {
    const newVisibility = { ...visibility, [key]: value };
    setVisibility(newVisibility);
    savePermissions(permissions, newVisibility, roleType);
  };

  const applyRolePreset = (role: keyof typeof ROLE_PRESETS) => {
    const preset = ROLE_PRESETS[role];
    const newPermissions: Record<string, boolean> = {};
    
    // Set all permissions to false first
    Object.values(DEAL_ROOM_PERMISSIONS).forEach(category => {
      category.permissions.forEach(p => {
        newPermissions[p.key] = false;
      });
    });
    
    // Then enable the ones in the preset
    preset.permissions.forEach(p => {
      newPermissions[p] = true;
    });

    setPermissions(newPermissions);
    setVisibility(preset.visibility);
    setRoleType(role);
    savePermissions(newPermissions, preset.visibility, role);
  };

  const enableAll = () => {
    const newPermissions: Record<string, boolean> = {};
    Object.values(DEAL_ROOM_PERMISSIONS).forEach(category => {
      category.permissions.forEach(p => {
        newPermissions[p.key] = true;
      });
    });
    const newVisibility: Record<string, string> = {};
    VISIBILITY_TYPES.forEach(v => {
      newVisibility[v.key] = 'all';
    });
    setPermissions(newPermissions);
    setVisibility(newVisibility);
    savePermissions(newPermissions, newVisibility, roleType);
  };

  const disableAll = () => {
    const newPermissions: Record<string, boolean> = {};
    Object.values(DEAL_ROOM_PERMISSIONS).forEach(category => {
      category.permissions.forEach(p => {
        newPermissions[p.key] = false;
      });
    });
    const newVisibility: Record<string, string> = {};
    VISIBILITY_TYPES.forEach(v => {
      newVisibility[v.key] = 'none';
    });
    setPermissions(newPermissions);
    setVisibility(newVisibility);
    savePermissions(newPermissions, newVisibility, roleType);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with participant info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-semibold">{participantName || 'Participant'}</h3>
          {participantEmail && (
            <p className="text-sm text-muted-foreground">{participantEmail}</p>
          )}
        </div>
        <Badge 
          style={{ backgroundColor: ROLE_PRESETS[roleType as keyof typeof ROLE_PRESETS]?.color || '#6b7280' }}
          className="text-white"
        >
          {ROLE_PRESETS[roleType as keyof typeof ROLE_PRESETS]?.label || 'Participant'}
        </Badge>
      </div>

      {/* Role Presets */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Presets</CardTitle>
          <CardDescription>Apply a role template with predefined permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                size="sm"
                variant={roleType === key ? "default" : "outline"}
                onClick={() => applyRolePreset(key as keyof typeof ROLE_PRESETS)}
                disabled={isSaving}
                style={roleType === key ? { backgroundColor: preset.color } : {}}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          <div className="flex gap-2 mt-4 pt-4 border-t">
            <Button size="sm" variant="secondary" onClick={enableAll} disabled={isSaving}>
              Enable All
            </Button>
            <Button size="sm" variant="outline" onClick={disableAll} disabled={isSaving}>
              Disable All
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="permissions" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="visibility">Visibility</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4 mt-4">
          {Object.entries(DEAL_ROOM_PERMISSIONS).map(([category, { icon: Icon, permissions: perms }]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <CardTitle className="text-base">{category}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {perms.map((perm) => (
                    <div key={perm.key} className="flex items-center justify-between">
                      <Label htmlFor={perm.key} className="cursor-pointer">{perm.label}</Label>
                      <Switch
                        id={perm.key}
                        checked={permissions[perm.key] || false}
                        onCheckedChange={() => togglePermission(perm.key)}
                        disabled={isSaving}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="visibility" className="space-y-4 mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Data Visibility
              </CardTitle>
              <CardDescription>
                Control what data this participant can see from others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {VISIBILITY_TYPES.map((type) => (
                  <div key={type.key} className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">{type.label}</Label>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                      <Select
                        value={visibility[type.key] || 'own_only'}
                        onValueChange={(value) => updateVisibility(type.key, value)}
                        disabled={isSaving}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {VISIBILITY_SCOPES.map((scope) => (
                            <SelectItem key={scope.value} value={scope.value}>
                              {scope.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
