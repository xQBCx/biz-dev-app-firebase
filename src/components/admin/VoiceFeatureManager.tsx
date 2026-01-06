import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Volume2, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserWithToggle {
  user_id: string;
  email: string;
  full_name: string | null;
  is_enabled: boolean;
}

export const VoiceFeatureManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithToggle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsersWithToggles();
  }, []);

  const fetchUsersWithToggles = async () => {
    try {
      // First get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Then get existing voice feature toggles
      const { data: toggles, error: togglesError } = await supabase
        .from('user_feature_toggles')
        .select('user_id, is_enabled')
        .eq('feature_name', 'elevenlabs_voice');

      if (togglesError) throw togglesError;

      // Merge the data
      const toggleMap = new Map(toggles?.map(t => [t.user_id, t.is_enabled]) ?? []);
      
      const usersWithToggles: UserWithToggle[] = (profiles || []).map(p => ({
        user_id: p.id,
        email: p.email || '',
        full_name: p.full_name,
        is_enabled: toggleMap.get(p.id) ?? false,
      }));

      setUsers(usersWithToggles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to load users.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleUserVoice = async (userId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('user_feature_toggles')
        .upsert({
          user_id: userId,
          feature_name: 'elevenlabs_voice',
          is_enabled: enabled,
          enabled_by: enabled ? user?.id : null,
          enabled_at: enabled ? new Date().toISOString() : null,
        }, { onConflict: 'user_id,feature_name' });

      if (error) throw error;

      setUsers(prev => 
        prev.map(u => u.user_id === userId ? { ...u, is_enabled: enabled } : u)
      );

      toast({
        title: enabled ? "Voice Enabled" : "Voice Disabled",
        description: `Voice narration has been ${enabled ? 'enabled' : 'disabled'} for this user.`,
      });
    } catch (error) {
      console.error('Error toggling voice:', error);
      toast({
        title: "Error",
        description: "Failed to update voice permission.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const enabledCount = users.filter(u => u.is_enabled).length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5 text-primary" />
            <CardTitle>Voice Narration Permissions</CardTitle>
          </div>
          <Badge variant="secondary">
            {enabledCount} / {users.length} enabled
          </Badge>
        </div>
        <CardDescription>
          Control which users can use Biz and Dev voice narration features across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {filteredUsers.map((u) => (
            <div
              key={u.user_id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {u.full_name || 'Unnamed User'}
                  </p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {u.is_enabled && (
                  <Badge variant="default" className="text-xs">
                    Voice Enabled
                  </Badge>
                )}
                <Switch
                  checked={u.is_enabled}
                  onCheckedChange={(checked) => toggleUserVoice(u.user_id, checked)}
                />
              </div>
            </div>
          ))}

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No users found matching "{searchTerm}"
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
