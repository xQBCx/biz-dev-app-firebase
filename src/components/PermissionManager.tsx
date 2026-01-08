import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { PlatformModule } from "@/hooks/usePermissions";

interface PermissionManagerProps {
  userId: string;
  userEmail?: string;
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
    { value: 'xcommodity', label: 'xCOMMODITYx Platform' },
  ],
  "Documentation": [
    { value: 'white_paper', label: 'Master White Paper' },
    { value: 'module_white_papers', label: 'Module White Papers' },
  ],
  "Admin": [
    { value: 'admin', label: 'Admin Panel' },
  ],
};

export const PermissionManager = ({ userId, userEmail }: PermissionManagerProps) => {
  const [permissions, setPermissions] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPermissions();
  }, [userId]);

  const loadPermissions = async () => {
    const { data, error } = await supabase
      .from('user_permissions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error loading permissions:', error);
      toast.error('Failed to load permissions');
      return;
    }

    const permsMap: Record<string, any> = {};
    data.forEach((perm: any) => {
      permsMap[perm.module] = {
        can_view: perm.can_view,
        can_create: perm.can_create,
        can_edit: perm.can_edit,
        can_delete: perm.can_delete,
      };
    });

    setPermissions(permsMap);
    setIsLoading(false);
  };

  const updatePermission = async (module: PlatformModule, field: string, value: boolean) => {
    const current = permissions[module] || {};
    const updated = { ...current, [field]: value };
    setPermissions({ ...permissions, [module]: updated });

    try {
      const { error } = await supabase
        .from('user_permissions')
        .upsert({
          user_id: userId,
          module: module as any,
          can_view: updated.can_view || false,
          can_create: updated.can_create || false,
          can_edit: updated.can_edit || false,
          can_delete: updated.can_delete || false,
        } as any, {
          onConflict: 'user_id,module'
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating permission:', error);
      toast.error('Failed to update permission');
    }
  };

  const setAllPermissions = async (enabled: boolean) => {
    setIsSaving(true);
    try {
      const allModules = Object.values(MODULE_CATEGORIES).flat();
      const updates = allModules.map(m => ({
        user_id: userId,
        module: m.value as PlatformModule,
        can_view: enabled,
        can_create: enabled,
        can_edit: enabled,
        can_delete: enabled,
      }));

      const { error } = await supabase
        .from('user_permissions')
        .upsert(updates as any, { onConflict: 'user_id,module' });

      if (error) throw error;

      await loadPermissions();
      toast.success(enabled ? 'All permissions enabled' : 'All permissions disabled');
    } catch (error) {
      console.error('Error setting all permissions:', error);
      toast.error('Failed to update permissions');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
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
                        onCheckedChange={(checked) => updatePermission(module.value as PlatformModule, 'can_view', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">View</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={perm.can_create || false}
                        onCheckedChange={(checked) => updatePermission(module.value as PlatformModule, 'can_create', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">Create</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={perm.can_edit || false}
                        onCheckedChange={(checked) => updatePermission(module.value as PlatformModule, 'can_edit', checked)}
                      />
                      <Label className="text-sm text-muted-foreground">Edit</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={perm.can_delete || false}
                        onCheckedChange={(checked) => updatePermission(module.value as PlatformModule, 'can_delete', checked)}
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
