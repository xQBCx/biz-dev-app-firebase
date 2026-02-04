import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  ArrowLeft,
  ArrowRight,
  Boxes,
  Users,
  ShoppingCart,
  Briefcase,
  Shield,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function XCommodityOnboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userType: 'buyer' as 'buyer' | 'seller' | 'broker' | 'all',
    companyName: '',
    walletAddress: '',
    hasOkariDevice: false,
    okariDeviceId: '',
    acceptTerms: false
  });

  const userTypeOptions = [
    {
      value: 'buyer',
      label: 'Buyer',
      description: 'I want to purchase commodities',
      icon: ShoppingCart
    },
    {
      value: 'seller',
      label: 'Seller',
      description: 'I have commodities to sell',
      icon: Boxes
    },
    {
      value: 'broker',
      label: 'Broker',
      description: 'I connect buyers and sellers',
      icon: Users
    },
    {
      value: 'all',
      label: 'All Roles',
      description: 'I operate in multiple capacities',
      icon: Briefcase
    }
  ];

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please sign in first");
      return;
    }

    if (!formData.acceptTerms) {
      toast.error("Please accept the terms to continue");
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from('commodity_user_profiles')
      .insert({
        user_id: user.id,
        user_type: formData.userType,
        company_name: formData.companyName || null,
        wallet_address: formData.walletAddress || null,
        okari_enabled: formData.hasOkariDevice,
        okari_device_ids: formData.okariDeviceId ? [formData.okariDeviceId] : [],
        trust_tier: 'silver'
      });

    if (error) {
      if (error.code === '23505') {
        toast.error("You already have a commodity profile");
        navigate('/xcommodity');
      } else {
        toast.error("Failed to create profile");
        console.error(error);
      }
    } else {
      toast.success("Welcome to xCOMMODITYx!");
      navigate('/xcommodity');
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate('/xcommodity')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Join xCOMMODITYx</h1>
          <p className="text-muted-foreground">
            Create your verified trading profile
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3].map(s => (
          <div 
            key={s}
            className={`h-1 flex-1 rounded-full ${s <= step ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>

      {/* Step 1: User Type */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>How will you use xCOMMODITYx?</CardTitle>
            <CardDescription>Select your primary role on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              value={formData.userType}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                userType: value as typeof formData.userType 
              }))}
              className="space-y-3"
            >
              {userTypeOptions.map(option => (
                <label
                  key={option.value}
                  className={`
                    flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-all
                    ${formData.userType === option.value ? 'border-primary bg-primary/5' : 'hover:border-muted-foreground/50'}
                  `}
                >
                  <RadioGroupItem value={option.value} />
                  <div className="p-2 rounded-lg bg-muted">
                    <option.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </label>
              ))}
            </RadioGroup>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Company Details */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>Tell us about your organization (optional)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input 
                id="companyName"
                placeholder="Your company or trading name"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress">Wallet Address (Optional)</Label>
              <Input 
                id="walletAddress"
                placeholder="0x... or ENS name for smart escrow"
                value={formData.walletAddress}
                onChange={(e) => setFormData(prev => ({ ...prev, walletAddress: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Required for blockchain-based escrow and commission payouts
              </p>
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button onClick={() => setStep(3)}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Okari & Terms */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Physical Verification</CardTitle>
            <CardDescription>Connect Okari GX devices for Platinum tier access</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg border bg-muted/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Zap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Okari GX Integration</p>
                  <p className="text-sm text-muted-foreground">
                    Real-time physical verification for your assets
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <Checkbox 
                  id="hasOkari"
                  checked={formData.hasOkariDevice}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    hasOkariDevice: checked as boolean 
                  }))}
                />
                <Label htmlFor="hasOkari">I have Okari GX devices installed</Label>
              </div>

              {formData.hasOkariDevice && (
                <div className="space-y-2">
                  <Label htmlFor="okariId">Device ID</Label>
                  <Input 
                    id="okariId"
                    placeholder="Enter your Okari device ID"
                    value={formData.okariDeviceId}
                    onChange={(e) => setFormData(prev => ({ ...prev, okariDeviceId: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Checkbox 
                  id="terms"
                  checked={formData.acceptTerms}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    acceptTerms: checked as boolean 
                  }))}
                />
                <Label htmlFor="terms" className="text-sm">
                  I accept the xCOMMODITYx Terms of Service and understand that:
                </Label>
              </div>
              <ul className="text-sm text-muted-foreground ml-6 space-y-1">
                <li>• Escrow funds are held by smart contract</li>
                <li>• Broker commissions are automatically enforced</li>
                <li>• Physical verification is required for Platinum status</li>
              </ul>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep(2)}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={!formData.acceptTerms || loading}
              >
                {loading ? "Creating..." : "Create Profile"}
                <Shield className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
