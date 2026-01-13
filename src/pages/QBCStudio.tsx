import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Cpu, Lock, Unlock, CheckCircle, Activity, Database, Key } from "lucide-react";
import { MetatronsCubeVisualizer } from "@/components/qbc/MetatronsCubeVisualizer";
import { EncodingInterface } from "@/components/qbc/EncodingInterface";
import { DecodingInterface } from "@/components/qbc/DecodingInterface";
import { VerificationConsole } from "@/components/qbc/VerificationConsole";
import { LatticeManager } from "@/components/qbc/LatticeManager";
import { EncodingHistory } from "@/components/qbc/EncodingHistory";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";

const QBCStudio = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("encode");
  const [currentGIO, setCurrentGIO] = useState<any>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">QBC Studio</h1>
            <p className="text-muted-foreground">
              Quantum Bit Code - Post-quantum encryption using Metatron's Cube lattice geometry
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Lock className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Encryption</p>
                  <p className="text-lg font-semibold">Post-Quantum</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Cpu className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lattice Type</p>
                  <p className="text-lg font-semibold">Metatron's Cube</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Database className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Vertices</p>
                  <p className="text-lg font-semibold">13 Nodes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Key className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Security</p>
                  <p className="text-lg font-semibold">SHA-256</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Visualizer */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Metatron's Cube
                </CardTitle>
                <CardDescription>
                  Real-time lattice visualization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <MetatronsCubeVisualizer gio={currentGIO} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Tabs */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-5 mb-6">
                    <TabsTrigger value="encode" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      <span className="hidden sm:inline">Encode</span>
                    </TabsTrigger>
                    <TabsTrigger value="decode" className="flex items-center gap-2">
                      <Unlock className="h-4 w-4" />
                      <span className="hidden sm:inline">Decode</span>
                    </TabsTrigger>
                    <TabsTrigger value="verify" className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="hidden sm:inline">Verify</span>
                    </TabsTrigger>
                    <TabsTrigger value="lattices" className="flex items-center gap-2">
                      <Cpu className="h-4 w-4" />
                      <span className="hidden sm:inline">Lattices</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      <span className="hidden sm:inline">History</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="encode">
                    <EncodingInterface onEncode={(gio) => setCurrentGIO(gio)} />
                  </TabsContent>

                  <TabsContent value="decode">
                    <DecodingInterface />
                  </TabsContent>

                  <TabsContent value="verify">
                    <VerificationConsole />
                  </TabsContent>

                  <TabsContent value="lattices">
                    <LatticeManager />
                  </TabsContent>

                  <TabsContent value="history">
                    <EncodingHistory />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QBCStudio;
