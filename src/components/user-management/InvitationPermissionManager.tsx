import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Loader2, Save, CheckCircle } from "lucide-react";
import type { PlatformModule } from "@/hooks/usePermissions";

interface InvitationPermissionManagerProps {
  invitationId: string;
  inviteeEmail: string;
  source?: 'team' | 'deal_room';
  onSaved?: () => void;
}

const MODULE_CATEGORIES = {
  "Main Platform": [
    { value: 'dashboard', label: 'Dashboard' },
    { value: 'erp', label: 'ERP' },
    { value: 'workflows', label: 'Workflows' },
    { value: 'core', label: 'Core Features' },
  ],
  "xBUILDERx": [
    { value: 'xbuilderx', label: 'xBUILDERx Platform' },
    { value: 'xbuilderx_home', label: 'xBUILDERx Home' },
    { value: 'xbuilderx_discovery', label: 'Automated Discovery' },
    { value: 'xbuilderx_engineering', label: 'Engineering & Design' },
    { value: 'xbuilderx_pipeline', label: 'Project Pipeline' },
    { value: 'xbuilderx_construction', label: 'Construction Lifecycle' },
  ],
  "XODIAK & Grid": [
    { value: 'xodiak', label: 'XODIAK Platform' },
    { value: 'xodiak_assets', label: 'Assets' },
    { value: 'xodiak_compliance', label: 'Compliance' },
    { value: 'grid_os', label: 'Grid OS' },
  ],
  "Business & CRM": [
    { value: 'directory', label: 'Directory' },
    { value: 'crm', label: 'CRM' },
    { value: 'portfolio', label: 'Portfolio' },
    { value: 'clients', label: 'Clients' },
    { value: 'client_portal', label: 'Client Portal' },
  ],
  "Cards & Franchises": [
    { value: 'business_cards', label: 'Business Cards' },
    { value: 'franchises', label: 'Franchises' },
    { value: 'franchise_applications', label: 'Franchise Applications' },
  ],
  "Team & Tasks": [
    { value: 'team', label: 'Team' },
    { value: 'team_invitations', label: 'Team Invitations' },
    { value: 'tasks', label: 'Tasks' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'activity', label: 'Activity' },
  ],
  "Tools & Services": [
    { value: 'tools', label: 'Tools' },
    { value: 'messages', label: 'Messages' },
    { value: 'ai_gift_cards', label: 'AI Gift Cards' },
    { value: 'iplaunch', label: 'IPLaunch' },
    { value: 'network', label: 'Network' },
    { value: 'integrations', label: 'Integrations' },
    { value: 'funding', label: 'Funding' },
    { value: 'theme_harvester', label: 'Theme Harvester' },
    { value: 'website_builder', label: 'Website Builder' },
    { value: 'social', label: 'Social Media' },
  ],
  "Apps & Ecosystem": [
    { value: 'launchpad', label: 'LaunchPad' },
    { value: 'app_store', label: 'App Store' },
    { value: 'my_apps', label: 'My Apps' },
    { value: 'white_label_portal', label: 'White-Label Portal' },
    { value: 'earnings', label: 'Earnings' },
    { value: 'marketplace', label: 'Marketplace' },
    { value: 'ecosystem', label: 'Ecosystem' },
  ],
  "TrueOdds": [
    { value: 'true_odds', label: 'TrueOdds Home' },
    { value: 'true_odds_explore', label: 'Explore Markets' },
    { value: 'true_odds_picks', label: 'My Picks' },
    { value: 'true_odds_signals', label: 'Signal Feed' },
  ],
  "Deal Rooms & Commodities": [
    { value: 'deal_rooms', label: 'Deal Rooms' },
    { value: 'xcommodity', label: 'xCOMMODITYx' },
  ],
  "White Papers": [
    { value: 'white_paper', label: 'White Paper' },
    { value: 'module_white_papers', label: 'Module White Papers' },
  ],
  "Admin": [
    { value: 'admin', label: 'Admin Panel' },
  ],
};

// Role presets for quick permission assignment
const ROLE_PRESETS: Record<string, { name: string; description: string; modules: string[] }> = {
  basic: {
    name: "Basic User",
    description: "Dashboard, Tasks, Calendar only",
    modules: ['dashboard', 'tasks', 'calendar', 'messages'],
  },
  sales: {
    name: "Sales User",
    description: "CRM, Clients, Tasks, Calendar, Activity",
    modules: ['dashboard', 'crm', 'clients', 'tasks', 'calendar', 'activity', 'messages'],
  },
  business: {
    name: "Business User",
    description: "CRM, Portfolio, Clients, Business Cards, Tasks",
    modules: ['dashboard', 'crm', 'portfolio', 'clients', 'business_cards', 'tasks', 'calendar', 'messages', 'activity'],
  },
  marketing: {
    name: "Marketing User",
    description: "Social, Website Builder, Content Tools",
    modules: ['dashboard', 'social', 'website_builder', 'tasks', 'calendar', 'messages', 'theme_harvester'],
  },
  operations: {
    name: "Operations User",
    description: "ERP, Workflows, Tasks, Calendar",
    modules: ['dashboard', 'erp', 'workflows', 'tasks', 'calendar', 'activity', 'messages'],
  },
  full: {
    name: "Full Access",
    description: "Access to all modules (except admin)",
    modules: [
      'dashboard', 'erp', 'workflows', 'directory', 'crm', 'portfolio', 'clients', 'client_portal',
      'business_cards', 'franchises', 'franchise_applications', 'team', 'tasks', 'calendar',
      'activity', 'tools', 'messages', 'ai_gift_cards', 'iplaunch', 'network', 'integrations',
      'funding', 'theme_harvester', 'launchpad', 'app_store', 'my_apps', 'white_label_portal',
      'earnings', 'true_odds', 'true_odds_explore', 'true_odds_picks', 'true_odds_signals',
      'social', 'website_builder', 'marketplace', 'ecosystem'
    ],
  },
};

export const InvitationPermissionManager = ({ 
  invitationId, 
  inviteeEmail,
  source = 'team',
  onSaved
}: InvitationPermissionManagerProps) => {
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const savedPermissionsRef = useRef<Record<string, any>>({});

  useEffect(() => {
    loadPermissions();
  }, [invitationId, source]);

  const loadPermissions = async () => {
    try {
      const tableName = source === 'deal_room' ? 'deal_room_invitations' : 'team_invitations';
      const permColumn = source === 'deal_room' ? 'platform_permissions' : 'default_permissions';
      
      const { data, error } = await supabase
        .from(tableName)
        .select(permColumn)
        .eq('id', invitationId)
        .single();

      if (error) throw error;

      const defaultPerms = ((data as any)?.[permColumn] as Record<string, any>) || {};
      setPermissions(defaultPerms);
      savedPermissionsRef.current = JSON.parse(JSON.stringify(defaultPerms));
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load permissions');
    } finally {
      setIsLoading(false);
    }
  };

  const savePermissions = async (newPermissions: Record<string, any>, showToast = false) => {
    setIsSaving(true);
    try {
      const tableName = source === 'deal_room' ? 'deal_room_invitations' : 'team_invitations';
      const permColumn = source === 'deal_room' ? 'platform_permissions' : 'default_permissions';
      
      const { error } = await supabase
        .from(tableName)
        .update({ [permColumn]: newPermissions })
        .eq('id', invitationId);

      if (error) throw error;
      
      savedPermissionsRef.current = JSON.parse(JSON.stringify(newPermissions));
      setHasChanges(false);
      
      if (showToast) {
        setJustSaved(true);
        toast.success('Permissions saved successfully');
        setTimeout(() => setJustSaved(false), 2000);
        onSaved?.();
      }
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast.error('Failed to save permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExplicitSave = () => {
    savePermissions(permissions, true);
  };

  const updatePermission = async (module: string, field: string, value: boolean) => {
    const current = permissions[module] || {};
    const updated = { 
      ...current, 
      [field]: value,
      can_view: field === 'can_view' ? value : (current.can_view || false),
      can_create: field === 'can_create' ? value : (current.can_create || false),
      can_edit: field === 'can_edit' ? value : (current.can_edit || false),
      can_delete: field === 'can_delete' ? value : (current.can_delete || false),
    };
    const newPermissions = { ...permissions, [module]: updated };
    setPermissions(newPermissions);
    setHasChanges(true);
  };

  const setAllPermissions = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const allModules = Object.values(MODULE_CATEGORIES).flat();
      const newPermissions: Record<string, any> = {};
      
      allModules.forEach(m => {
        newPermissions[m.value] = {
          can_view: enabled,
          can_create: enabled,
          can_edit: enabled,
          can_delete: enabled,
        };
      });

      setPermissions(newPermissions);
      await savePermissions(newPermissions, true);
    } catch (error) {
      console.error('Error setting all permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  const applyPreset = async (presetKey: string) => {
    const preset = ROLE_PRESETS[presetKey];
    if (!preset) return;

    setIsSaving(true);
    try {
      const newPermissions: Record<string, any> = {};
      
      preset.modules.forEach(module => {
        newPermissions[module] = {
          can_view: true,
          can_create: true,
          can_edit: true,
          can_delete: presetKey === 'full',
        };
      });

      setPermissions(newPermissions);
      await savePermissions(newPermissions, true);
    } catch (error) {
      console.error('Error applying preset:', error);
      toast.error('Failed to apply preset');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Setting permissions for: <strong>{inviteeEmail}</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              These permissions will be applied when the user accepts the invitation and creates their account.
            </p>
          </div>
          <Button 
            onClick={handleExplicitSave} 
            disabled={isSaving || !hasChanges}
            className="ml-4"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : justSaved ? (
              <>
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Saved!
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Permissions
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Presets</CardTitle>
          <CardDescription>Apply a preset permission bundle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {Object.entries(ROLE_PRESETS).map(([key, preset]) => (
              <Button
                key={key}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(key)}
                disabled={isSaving}
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button onClick={() => setAllPermissions(true)} disabled={isSaving}>
          Enable All
        </Button>
        <Button variant="outline" onClick={() => setAllPermissions(false)} disabled={isSaving}>
          Disable All
        </Button>
      </div>

      {Object.entries(MODULE_CATEGORIES).map(([category, modules]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
            <CardDescription>Manage access to {category.toLowerCase()} features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {modules.map((module) => {
                const perm = permissions[module.value] || {};
                return (
                  <div key={module.value} className="grid grid-cols-5 gap-4 items-center border-b pb-4 last:border-0">
                    <Label className="font-medium">{module.label}</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={perm.can_view || false}
                        onCheckedChange={(checked) => updatePermission(module.value, 'can_view', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={perm.can_create || false}
                        onCheckedChange={(checked) => updatePermission(module.value, 'can_create', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">Create</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={perm.can_edit || false}
                        onCheckedChange={(checked) => updatePermission(module.value, 'can_edit', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">Edit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={perm.can_delete || false}
                        onCheckedChange={(checked) => updatePermission(module.value, 'can_delete', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">Delete</Label>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
