import { useState, useEffect } from "react";
import { BottomNav } from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Star, Zap, Camera, LogOut, Brush, Share2, Fingerprint, Moon, Sun, Monitor } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { EditProfileDialog } from "@/components/EditProfileDialog";
import { EarningsDashboard } from "@/components/EarningsDashboard";
import { ReferralCard } from "@/components/ReferralCard";
import { useShare } from "@/hooks/useShare";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";
import { useTheme } from "next-themes";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslation } from "react-i18next";

export default function Profile() {
  const { user, signOut, session } = useAuth();
  const { data: profile, isLoading } = useProfile(user?.id);
  const navigate = useNavigate();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { sharePhotographerProfile } = useShare();
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();
  
  const {
    isAvailable: biometricAvailable,
    getBiometryName,
    getBiometryIcon,
    isBiometricEnabled,
    setBiometricEnabled,
    setCredentialsStored,
    authenticate: biometricAuth,
    isNative,
  } = useBiometricAuth();

  const [biometricToggle, setBiometricToggle] = useState(isBiometricEnabled());

  // Update toggle state when checking completes
  useEffect(() => {
    setBiometricToggle(isBiometricEnabled());
  }, [isBiometricEnabled]);

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-5 w-5 text-warning" />;
    if (theme === "dark") return <Moon className="h-5 w-5 text-primary" />;
    return <Monitor className="h-5 w-5 text-muted-foreground" />;
  };

  const cycleTheme = () => {
    if (theme === "system") setTheme("light");
    else if (theme === "light") setTheme("dark");
    else setTheme("system");
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  const handleBiometricToggle = async (enabled: boolean) => {
    if (enabled) {
      // Authenticate first before enabling
      const authenticated = await biometricAuth(`Enable ${getBiometryName()} for quick sign in`);
      if (authenticated) {
        // Store session for biometric login
        if (session) {
          localStorage.setItem('biometric_session', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }));
        }
        setBiometricEnabled(true);
        setCredentialsStored(true);
        setBiometricToggle(true);
        toast.success(`${getBiometryName()} enabled for quick sign in`);
      } else {
        setBiometricToggle(false);
      }
    } else {
      // Disable biometric login
      localStorage.removeItem('biometric_session');
      setBiometricEnabled(false);
      setCredentialsStored(false);
      setBiometricToggle(false);
      toast.success(`${getBiometryName()} disabled`);
    }
  };

  // Fetch user's completed sessions
  const { data: completedSessions = [] } = useQuery({
    queryKey: ["completed-sessions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("sessions")
        .select("*, photographer:profiles!photographer_id(*), client:profiles!client_id(*)")
        .or(`client_id.eq.${user.id},photographer_id.eq.${user.id}`)
        .eq("status", "completed")
        .order("ended_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Fetch portfolio photos for photographers
  const { data: portfolioPhotos = [] } = useQuery({
    queryKey: ["portfolio", user?.id],
    queryFn: async () => {
      if (!user?.id || !profile?.is_photographer) return [];

      const { data, error } = await supabase
        .from("portfolio_photos")
        .select("*")
        .eq("photographer_id", user.id)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id && !!profile?.is_photographer,
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/login");
  };

  const initials = profile?.full_name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase() || "U";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.6)] animate-pulse">
            <Zap className="h-8 w-8 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <h1 className="text-xl font-bold">Profile</h1>
          <div className="flex gap-2">
            {profile?.is_photographer && user?.id && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => sharePhotographerProfile({
                  id: user.id,
                  full_name: profile.full_name || undefined,
                  rating: profile.rating || undefined,
                  hourly_rate: profile.hourly_rate || undefined,
                })}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-primary">{initials}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold">{profile?.full_name || "User"}</h2>
                {profile?.is_photographer && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                    <Zap className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {user?.email} • Member since {new Date(profile?.created_at || "").toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-warning fill-warning" />
                  <span className="font-bold">{profile?.rating?.toFixed(1) || "0.0"}</span>
                  <span className="text-sm text-muted-foreground">({profile?.total_sessions || 0} sessions)</span>
                </div>
              </div>
            </div>
          </div>
          
          {profile?.bio && (
            <p className="text-sm text-muted-foreground mb-4">{profile.bio}</p>
          )}
          
          {profile?.is_photographer && (
            <div className="bg-muted rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-sm font-medium">Hourly Rate</p>
                  <p className="text-2xl font-bold text-primary">${profile.hourly_rate || 25}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm font-bold capitalize">{profile.experience_level || "Intermediate"}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Button className="w-full" variant="outline" onClick={() => setShowEditDialog(true)}>
              Edit Profile
            </Button>
            {profile?.is_photographer && (
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={() => navigate("/editing")}
              >
                <Brush className="h-4 w-4 mr-2" />
                Photo Editing
              </Button>
            )}
          </div>
        </div>

        {/* Earnings Dashboard for Photographers */}
        {profile?.is_photographer && user?.id && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Earnings</h3>
            <EarningsDashboard photographerId={user.id} />
          </div>
        )}

        {/* Stats */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Camera className="h-4 w-4 text-primary" />
                <p className="text-sm text-muted-foreground">Total Sessions</p>
              </div>
              <p className="text-2xl font-bold">{profile?.total_sessions || 0}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Star className="h-4 w-4 text-warning" />
                <p className="text-sm text-muted-foreground">Average Rating</p>
              </div>
              <p className="text-2xl font-bold">{profile?.rating?.toFixed(1) || "0.0"}</p>
            </div>
          </div>
        </div>

        {/* Biometric Authentication Settings */}
        {isNative && biometricAvailable && (
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Fingerprint className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{getBiometryName()}</p>
                  <p className="text-sm text-muted-foreground">
                    Quick sign in with {getBiometryName()}
                  </p>
                </div>
              </div>
              <Switch
                checked={biometricToggle}
                onCheckedChange={handleBiometricToggle}
              />
            </div>
          </div>
        )}

        {/* Theme Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                {getThemeIcon()}
              </div>
              <div>
                <p className="font-medium">{t("appearance")}</p>
                <p className="text-sm text-muted-foreground">
                  {t(theme === "light" ? "light" : theme === "dark" ? "dark" : "system")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={cycleTheme}
              className="gap-2"
            >
              {getThemeIcon()}
              {t(theme === "light" ? "light" : theme === "dark" ? "dark" : "system")}
            </Button>
          </div>
        </div>

        {/* Language Settings */}
        <div className="bg-card border border-border rounded-xl p-6">
          <LanguageSelector />
        </div>

        {/* Referral Card */}
        <ReferralCard />

        {/* Portfolio */}
        {profile?.is_photographer && portfolioPhotos.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Portfolio</h3>
            <div className="grid grid-cols-2 gap-3">
              {portfolioPhotos.map((photo: any) => (
                <div key={photo.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={photo.photo_url}
                    alt={photo.title || "Portfolio photo"}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Sessions */}
        {completedSessions.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Recent Sessions</h3>
            <div className="space-y-4">
              {completedSessions.map((session: any) => {
                const otherPerson = user?.id === session.client_id ? session.photographer : session.client;
                return (
                  <div key={session.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-primary">
                          {otherPerson?.full_name?.[0] || "U"}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-sm">{otherPerson?.full_name || "User"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.ended_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">${session.total_amount || session.hourly_rate}</p>
                      <p className="text-xs text-muted-foreground">{session.duration_minutes || 0} min</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        profile={profile}
        userId={user?.id || ""}
      />

      <BottomNav />
    </div>
  );
}
