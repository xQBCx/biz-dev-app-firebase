import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Box, Wallet, Shield, Settings, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { XodiakBlockExplorer } from "@/components/xodiak/XodiakBlockExplorer";
import { XodiakWallet } from "@/components/xodiak/XodiakWallet";
import { XodiakValidatorConsole } from "@/components/xodiak/XodiakValidatorConsole";
import { XodiakChainAdmin } from "@/components/xodiak/XodiakChainAdmin";

export default function XodiakChain() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'explorer';

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/xodiak')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                XDK Chain
              </h1>
              <p className="text-muted-foreground">
                Xodiak Layer 1 Blockchain Infrastructure
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="explorer" className="gap-2">
              <Box className="h-4 w-4" />
              Explorer
            </TabsTrigger>
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="validators" className="gap-2">
              <Shield className="h-4 w-4" />
              Validators
            </TabsTrigger>
            <TabsTrigger value="admin" className="gap-2">
              <Settings className="h-4 w-4" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="explorer">
            <XodiakBlockExplorer />
          </TabsContent>

          <TabsContent value="wallet">
            <XodiakWallet />
          </TabsContent>

          <TabsContent value="validators">
            <XodiakValidatorConsole />
          </TabsContent>

          <TabsContent value="admin">
            <XodiakChainAdmin />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
