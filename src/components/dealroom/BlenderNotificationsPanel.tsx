import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Bell, 
  BellOff, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Clock,
  Loader2,
  Settings,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface BlenderNotificationsPanelProps {
  dealRoomId: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  priority: string;
  read_at: string | null;
  acted_on: boolean;
  created_at: string;
  action_payload?: any;
}

interface NotificationPreferences {
  payout_executed: boolean;
  settlement_triggered: boolean;
  credit_earned: boolean;
  threshold_reached: boolean;
}

const notificationTypeConfig: Record<string, { icon: any; color: string }> = {
  payout: { icon: DollarSign, color: "text-emerald-500" },
  settlement: { icon: Zap, color: "text-blue-500" },
  credit: { icon: CheckCircle, color: "text-purple-500" },
  threshold: { icon: AlertCircle, color: "text-amber-500" },
  reminder: { icon: Clock, color: "text-muted-foreground" },
};

const priorityConfig: Record<string, string> = {
  high: "bg-destructive/20 text-destructive",
  medium: "bg-amber-500/20 text-amber-600",
  low: "bg-muted text-muted-foreground",
};

export const BlenderNotificationsPanel = ({ dealRoomId }: BlenderNotificationsPanelProps) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    payout_executed: true,
    settlement_triggered: true,
    credit_earned: true,
    threshold_reached: true,
  });

  useEffect(() => {
    if (user) {
      fetchNotifications();
      setupRealtimeSubscription();
    }
  }, [user, dealRoomId]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data } = await supabase
        .from("ai_proactive_notifications")
        .select("*")
        .eq("user_id", user.id)
        .like("notification_type", "blender_%")
        .order("created_at", { ascending: false })
        .limit(50);

      if (data) {
        // Filter to this deal room based on action_payload
        const filtered = data.filter((n: any) => 
          !n.action_payload?.deal_room_id || n.action_payload.deal_room_id === dealRoomId
        );
        setNotifications(filtered);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    if (!user) return;

    const channel = supabase
      .channel(`blender-notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_proactive_notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          if (newNotification.notification_type.startsWith('blender_')) {
            setNotifications(prev => [newNotification, ...prev]);
            toast.info(newNotification.title, {
              description: newNotification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await supabase
        .from("ai_proactive_notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      const unreadIds = notifications.filter(n => !n.read_at).map(n => n.id);
      if (unreadIds.length === 0) return;

      await supabase
        .from("ai_proactive_notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", unreadIds);

      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      );
      
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      await supabase
        .from("ai_proactive_notifications")
        .delete()
        .eq("id", notificationId);

      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read_at).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="default">{unreadCount} new</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notification Settings */}
      {showSettings && (
        <Card className="p-4">
          <h4 className="font-medium mb-4">Notification Preferences</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Payout Executed</Label>
                <p className="text-sm text-muted-foreground">
                  When a settlement payout is processed
                </p>
              </div>
              <Switch
                checked={preferences.payout_executed}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, payout_executed: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Settlement Triggered</Label>
                <p className="text-sm text-muted-foreground">
                  When a settlement contract is triggered
                </p>
              </div>
              <Switch
                checked={preferences.settlement_triggered}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, settlement_triggered: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Credit Earned</Label>
                <p className="text-sm text-muted-foreground">
                  When you earn new credits
                </p>
              </div>
              <Switch
                checked={preferences.credit_earned}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, credit_earned: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Threshold Reached</Label>
                <p className="text-sm text-muted-foreground">
                  When usage thresholds are reached
                </p>
              </div>
              <Switch
                checked={preferences.threshold_reached}
                onCheckedChange={(checked) =>
                  setPreferences({ ...preferences, threshold_reached: checked })
                }
              />
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-8 text-center">
          <BellOff className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Notifications</h3>
          <p className="text-muted-foreground">
            You'll be notified when payouts are executed or settlements are triggered
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const typeConfig = notificationTypeConfig[notification.notification_type.replace('blender_', '')] || 
                             notificationTypeConfig.reminder;
            const Icon = typeConfig.icon;
            const isUnread = !notification.read_at;

            return (
              <Card
                key={notification.id}
                className={`p-4 cursor-pointer transition-colors ${
                  isUnread ? "border-primary/50 bg-primary/5" : ""
                }`}
                onClick={() => !notification.read_at && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${typeConfig.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{notification.title}</p>
                      {isUnread && (
                        <span className="w-2 h-2 rounded-full bg-primary" />
                      )}
                      {notification.priority !== "low" && (
                        <Badge className={priorityConfig[notification.priority]}>
                          {notification.priority}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {format(new Date(notification.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notification.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
