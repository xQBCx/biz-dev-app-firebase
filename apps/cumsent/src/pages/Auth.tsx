import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { z } from "zod";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");
const nameSchema = z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters");

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [signupName, setSignupName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirm, setSignupConfirm] = useState("");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { signUp, signIn, user } = useAuth();

  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(redirectPath);
    }
  }, [user, navigate, redirectPath]);

  const validateSignup = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      nameSchema.parse(signupName.trim());
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signupName = e.errors[0].message;
      }
    }
    
    try {
      emailSchema.parse(signupEmail.trim());
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signupEmail = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(signupPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signupPassword = e.errors[0].message;
      }
    }
    
    if (signupPassword !== signupConfirm) {
      newErrors.signupConfirm = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateSignin = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(signinEmail.trim());
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signinEmail = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(signinPassword);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.signinPassword = e.errors[0].message;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignup()) return;
    
    setIsLoading(true);
    setErrors({});
    
    const { error } = await signUp(
      signupEmail.trim(),
      signupPassword,
      signupName.trim()
    );
    
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("already registered")) {
        toast({
          title: "Account exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }
    
    toast({
      title: "Account created!",
      description: "Your account has been created successfully.",
    });
    navigate(redirectPath);
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignin()) return;
    
    setIsLoading(true);
    setErrors({});
    
    const { error } = await signIn(signinEmail.trim(), signinPassword);
    
    setIsLoading(false);
    
    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        toast({
          title: "Invalid credentials",
          description: "Please check your email and password and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
      return;
    }
    
    toast({
      title: "Welcome back!",
      description: "You've successfully signed in.",
    });
    navigate(redirectPath);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-3 sm:px-4 py-6 sm:py-12 bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <Logo size="md" className="justify-center mb-3 sm:mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground px-2">Secure Consent Verification</h1>
        </div>

        <Card className="shadow-xl border-border mx-1 sm:mx-0">
          <CardHeader className="px-4 sm:px-6 pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Get Started</CardTitle>
            <CardDescription className="text-sm">
              Create an account or sign in to start verifying consent
            </CardDescription>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <Tabs defaultValue="signup" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="signup" className="text-sm">Sign Up</TabsTrigger>
                <TabsTrigger value="signin" className="text-sm">Sign In</TabsTrigger>
              </TabsList>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input 
                      id="signup-name" 
                      placeholder="John Doe" 
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="bg-input"
                    />
                    {errors.signupName && (
                      <p className="text-sm text-destructive">{errors.signupName}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="bg-input"
                    />
                    {errors.signupEmail && (
                      <p className="text-sm text-destructive">{errors.signupEmail}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="bg-input"
                    />
                    {errors.signupPassword && (
                      <p className="text-sm text-destructive">{errors.signupPassword}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm">Confirm Password</Label>
                    <Input 
                      id="signup-confirm" 
                      type="password" 
                      placeholder="••••••••" 
                      value={signupConfirm}
                      onChange={(e) => setSignupConfirm(e.target.value)}
                      className="bg-input"
                    />
                    {errors.signupConfirm && (
                      <p className="text-sm text-destructive">{errors.signupConfirm}</p>
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signin">
                <form onSubmit={handleSignin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input 
                      id="signin-email" 
                      type="email" 
                      placeholder="john@example.com" 
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      className="bg-input"
                    />
                    {errors.signinEmail && (
                      <p className="text-sm text-destructive">{errors.signinEmail}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input 
                      id="signin-password" 
                      type="password" 
                      placeholder="••••••••" 
                      value={signinPassword}
                      onChange={(e) => setSigninPassword(e.target.value)}
                      className="bg-input"
                    />
                    {errors.signinPassword && (
                      <p className="text-sm text-destructive">{errors.signinPassword}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <a href="#" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <p className="text-xs text-muted-foreground text-center mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
