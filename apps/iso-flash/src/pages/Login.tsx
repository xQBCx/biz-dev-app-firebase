import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";
import { TermsDialog } from "@/components/TermsDialog";
import { ArrowLeft, Fingerprint } from "lucide-react";
import { useBiometricAuth } from "@/hooks/useBiometricAuth";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(2, "Name must be at least 2 characters");

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [pendingSignup, setPendingSignup] = useState<{ email: string; password: string; fullName: string } | null>(null);
  
  const { 
    isAvailable: biometricAvailable, 
    authenticate: biometricAuth, 
    getBiometryName, 
    getBiometryIcon,
    isBiometricEnabled,
    hasStoredCredentials 
  } = useBiometricAuth();
  
  // Get referral code from URL or session storage
  const referralCode = searchParams.get("ref") || sessionStorage.getItem("referral_code");

  useEffect(() => {
    // Store referral code if present in URL
    const urlRef = searchParams.get("ref");
    if (urlRef) {
      sessionStorage.setItem("referral_code", urlRef);
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      }
    });
  }, [navigate, searchParams]);

  // Handle biometric login
  const handleBiometricLogin = async () => {
    if (!biometricAvailable || !isBiometricEnabled() || !hasStoredCredentials()) {
      return;
    }

    setLoading(true);
    try {
      const authenticated = await biometricAuth(`Sign in with ${getBiometryName()}`);
      if (authenticated) {
        // Get stored session token from secure storage
        const storedSession = localStorage.getItem('biometric_session');
        if (storedSession) {
          const { error } = await supabase.auth.setSession(JSON.parse(storedSession));
          if (!error) {
            toast.success(`Welcome back! Signed in with ${getBiometryName()}`);
            navigate("/home");
            return;
          }
        }
        // If session restore fails, user needs to login normally
        toast.info("Please sign in with your credentials");
      }
    } catch (error) {
      console.warn('Biometric login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      const emailValidation = emailSchema.safeParse(email);
      if (!emailValidation.success) {
        toast.error(emailValidation.error.errors[0].message);
        setLoading(false);
        return;
      }

      const passwordValidation = passwordSchema.safeParse(password);
      if (!passwordValidation.success) {
        toast.error(passwordValidation.error.errors[0].message);
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const nameValidation = nameSchema.safeParse(fullName);
        if (!nameValidation.success) {
          toast.error(nameValidation.error.errors[0].message);
          setLoading(false);
          return;
        }

        // Show terms dialog before creating account
        setPendingSignup({ email, password, fullName });
        setShowTerms(true);
        setLoading(false);
        return;
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
          return;
        }
        
        toast.success("Welcome back!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTermsAccept = async () => {
    if (!pendingSignup) return;
    
    setLoading(true);
    setShowTerms(false);

    try {
      const { error } = await supabase.auth.signUp({
        email: pendingSignup.email,
        password: pendingSignup.password,
        options: {
          data: { 
            full_name: pendingSignup.fullName,
            referred_by_code: referralCode || undefined
          },
          emailRedirectTo: `${window.location.origin}/home`
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("This email is already registered. Try signing in instead.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      // Update profile with terms acceptance and referral code
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updateData: any = {
          terms_accepted: true,
          terms_accepted_at: new Date().toISOString(),
        };
        
        if (referralCode) {
          updateData.referred_by_code = referralCode;
          
          // Create the referral record
          const { data: codeData } = await supabase
            .from("referral_codes")
            .select("user_id")
            .eq("code", referralCode)
            .single();
          
          if (codeData) {
            await supabase.from("referrals").insert({
              referrer_id: codeData.user_id,
              referred_id: user.id,
              referral_code: referralCode
            });
          }
        }
        
        await supabase
          .from("profiles")
          .update(updateData)
          .eq("id", user.id);
      }
      
      // Clear referral code from session storage
      sessionStorage.removeItem("referral_code");
      
      toast.success("Account created!", {
        description: referralCode ? "Welcome to ISO Flash! You were referred by a friend." : "Welcome to ISO Flash"
      });
      navigate("/home");
    } catch (error: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
      setPendingSignup(null);
    }
  };

  const handleTermsDecline = () => {
    setShowTerms(false);
    setPendingSignup(null);
    toast.info("You must accept the terms to create an account");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="text-sm">Back</span>
      </button>
      
      {/* Logo and branding */}
      <div className="mb-12 text-center">
        <div className="inline-flex items-center justify-center mb-6">
          <img src={logo} alt="ISO Flash Logo" className="h-32 w-auto animate-glow" />
        </div>
        <p className="text-muted-foreground">Your moment, captured instantly</p>
        
        {/* Show referral badge if referred */}
        {referralCode && (
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/20 text-primary text-sm">
            <span>🎁</span>
            <span>Referred by a friend</span>
          </div>
        )}
      </div>

      {/* Auth Container */}
      <div className="w-full max-w-md">
        <form onSubmit={handleAuth} className="space-y-4">
          {isSignUp && (
            <div>
              <Input
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>
          )}
          
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 text-base"
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="h-12 text-base"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg font-bold"
            variant="default"
            size="lg"
            disabled={loading}
          >
            {loading ? "Loading..." : (isSignUp ? "Sign Up" : "Sign In")}
          </Button>

          {/* Biometric Login Button */}
          {!isSignUp && biometricAvailable && isBiometricEnabled() && hasStoredCredentials() && (
            <Button
              type="button"
              variant="outline"
              className="w-full h-14 text-lg font-medium gap-3"
              onClick={handleBiometricLogin}
              disabled={loading}
            >
              <Fingerprint className="h-6 w-6" />
              Sign in with {getBiometryName()}
            </Button>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="mt-16 max-w-md space-y-4">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">⚡</span>
          </div>
          <div>
            <p className="font-medium">Flash & Connect</p>
            <p className="text-sm text-muted-foreground">Instantly match with nearby photographers</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">📸</span>
          </div>
          <div>
            <p className="font-medium">Perfect Photos</p>
            <p className="text-sm text-muted-foreground">Get professional-quality content in seconds</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">✓</span>
          </div>
          <div>
            <p className="font-medium">Safe & Trusted</p>
            <p className="text-sm text-muted-foreground">Verified photographers with ratings you can trust</p>
          </div>
        </div>
      </div>

      {/* Terms */}
      <p className="mt-8 text-xs text-center text-muted-foreground max-w-md">
        By continuing, you agree to ISO Flash's Terms of Service and Privacy Policy
      </p>

      {/* Terms Dialog */}
      <TermsDialog
        open={showTerms}
        onAccept={handleTermsAccept}
        onDecline={handleTermsDecline}
      />
    </div>
  );
}
