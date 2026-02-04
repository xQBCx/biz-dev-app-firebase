import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/lite/dashboard");
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        navigate("/lite/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-elegant flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 backdrop-blur-sm mb-4 shadow-elegant">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">The Wedding View</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">Sign in to continue planning your dream wedding</p>
        </div>

        <div className="bg-card rounded-2xl p-8 shadow-elegant border border-border">
          <SupabaseAuth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "hsl(45 100% 51%)",
                    brandAccent: "hsl(35 100% 60%)",
                    brandButtonText: "white",
                    inputBackground: "white",
                    inputBorder: "hsl(20 14% 93%)",
                    inputBorderFocus: "hsl(45 100% 51%)",
                    inputBorderHover: "hsl(20 14% 85%)",
                  },
                  borderWidths: {
                    buttonBorderWidth: "1px",
                    inputBorderWidth: "1px",
                  },
                  radii: {
                    borderRadiusButton: "0.75rem",
                    buttonBorderRadius: "0.75rem",
                    inputBorderRadius: "0.75rem",
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={`${window.location.origin}/lite/dashboard`}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;
