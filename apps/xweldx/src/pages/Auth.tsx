import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { WeldSparkIcon, Icons } from "@/components/icons/IndustrialIcons";
import { z } from "zod";
import { Eye, EyeOff, Zap, Shield, Lock, Scan } from "lucide-react";

const authSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; fullName?: string }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate("/");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateForm = () => {
    try {
      authSchema.parse({ 
        email, 
        password, 
        fullName: isLogin ? undefined : fullName 
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { email?: string; password?: string; fullName?: string } = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as keyof typeof fieldErrors] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            toast({
              title: "Login Failed",
              description: "Invalid email or password. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Login Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Welcome Back",
            description: "Successfully logged in to xWeldx",
          });
        }
      } else {
        const redirectUrl = `${window.location.origin}/`;
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          if (error.message.includes("already registered")) {
            toast({
              title: "Account Exists",
              description: "This email is already registered. Please sign in instead.",
              variant: "destructive",
            });
            setIsLogin(true);
          } else {
            toast({
              title: "Sign Up Failed",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Account Created",
            description: "Welcome to xWeldx! You can now access the system.",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#0a0a0f]">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,107,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,107,0,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      {/* Glowing orbs */}
      <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-accent/20 blur-[120px]" />
      <div className="absolute -right-32 bottom-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px]" />
      
      {/* Scan line effect */}
      <motion.div 
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-accent/50 to-transparent"
        initial={{ top: "-2px" }}
        animate={{ top: "100%" }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
      />

      {/* Left side - Branding (hidden on mobile) */}
      <div className="hidden flex-1 flex-col justify-between p-12 lg:flex">
        <div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-orange-600 shadow-lg shadow-accent/30">
              <WeldSparkIcon className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">xWeldx</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-lg"
        >
          <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight text-white">
            AI-Powered
            <br />
            <span className="bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
              Weld Inspection
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Hands-free defect detection with AR glasses integration. 
            Cut inspection tasks by 80% with intelligent automation.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-3">
            {["AI Defect Detection", "Voice Commands", "AR Glasses", "Real-time Sync"].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-2 rounded-full border border-border/50 bg-white/5 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm"
              >
                <Zap className="h-3.5 w-3.5 text-accent" />
                {feature}
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-sm text-muted-foreground/60"
        >
          © 2024 Piping Technology & Products
        </motion.div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex flex-1 items-center justify-center p-4 sm:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-orange-600 shadow-lg shadow-accent/30">
              <WeldSparkIcon className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">xWeldx</span>
          </div>

          {/* Form card */}
          <div className="relative rounded-2xl border border-border/30 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-8 shadow-2xl backdrop-blur-xl">
            {/* Corner accents */}
            <div className="absolute left-0 top-0 h-16 w-[2px] rounded-full bg-gradient-to-b from-accent to-transparent" />
            <div className="absolute left-0 top-0 h-[2px] w-16 rounded-full bg-gradient-to-r from-accent to-transparent" />
            <div className="absolute bottom-0 right-0 h-16 w-[2px] rounded-full bg-gradient-to-t from-accent/50 to-transparent" />
            <div className="absolute bottom-0 right-0 h-[2px] w-16 rounded-full bg-gradient-to-l from-accent/50 to-transparent" />

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-accent/30 bg-accent/10">
                {isLogin ? (
                  <Lock className="h-6 w-6 text-accent" />
                ) : (
                  <Scan className="h-6 w-6 text-accent" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-white">
                {isLogin ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {isLogin
                  ? "Enter your credentials to access the system"
                  : "Join the Piping Technology & Products team"}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium text-foreground/80">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="h-12 border-border/50 bg-white/5 text-white placeholder:text-muted-foreground/50 focus:border-accent focus:ring-accent"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive">{errors.fullName}</p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-foreground/80">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="inspector@pipingtech.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-border/50 bg-white/5 text-white placeholder:text-muted-foreground/50 focus:border-accent focus:ring-accent"
                  required
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-foreground/80">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 border-border/50 bg-white/5 pr-12 text-white placeholder:text-muted-foreground/50 focus:border-accent focus:ring-accent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="relative h-12 w-full overflow-hidden bg-gradient-to-r from-accent to-orange-600 text-base font-semibold text-white shadow-lg shadow-accent/30 transition-all hover:shadow-xl hover:shadow-accent/40"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="h-5 w-5" />
                    </motion.div>
                    <span>{isLogin ? "Authenticating..." : "Creating Account..."}</span>
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Access System" : "Create Account"}
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrors({});
                }}
                className="text-sm text-muted-foreground transition-colors hover:text-accent"
              >
                {isLogin
                  ? "Don't have an account? Create one"
                  : "Already have an account? Sign in"}
              </button>
            </div>

            {/* Security badge */}
            <div className="mt-6 flex items-center justify-center gap-2 rounded-lg border border-success/20 bg-success/5 px-4 py-3">
              <Shield className="h-4 w-4 text-success" />
              <span className="text-xs text-success/80">
                256-bit encrypted • Role-based access control
              </span>
            </div>
          </div>

          {/* Mobile copyright */}
          <p className="mt-8 text-center text-xs text-muted-foreground/50 lg:hidden">
            © 2024 Piping Technology & Products
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
