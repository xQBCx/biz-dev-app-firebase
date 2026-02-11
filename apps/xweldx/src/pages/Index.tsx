import { useState } from "react";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ARGlassesConnection } from "@/components/dashboard/ARGlassesConnection";
import { RecentInspections } from "@/components/dashboard/RecentInspections";
import { DefectAnalytics } from "@/components/dashboard/DefectAnalytics";
import { VoiceCommands } from "@/components/inspection/VoiceCommands";
import { CyanGlassesControls } from "@/components/glasses/CyanGlassesControls";
import { Icons, WeldSparkIcon } from "@/components/icons/IndustrialIcons";
import { ARGlassesStatus } from "@/types/inspection";
import { mockMetrics, mockRecentInspections } from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { useCyanGlasses } from "@/hooks/useCyanGlasses";
import logo from "../../public/logo.png";

const Index = () => {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [lastCommand, setLastCommand] = useState<string>();
  
  // Real Cyan glasses integration
  const cyanGlasses = useCyanGlasses();

  // Build AR status from real glasses state
  const arStatus: ARGlassesStatus = {
    connected: cyanGlasses.isConnected,
    deviceName: cyanGlasses.isConnected ? "Cyan M02S Smart Glasses" : "",
    batteryLevel: cyanGlasses.state.batteryLevel,
    streaming: cyanGlasses.isConnected,
    modelLoaded: cyanGlasses.isConnected,
  };

  const handleConnectGlasses = async () => {
    if (!cyanGlasses.isSupported) {
      toast({
        title: "Browser Not Supported",
        description: "Web Bluetooth requires Chrome, Edge, or Opera. Safari and Firefox are not supported.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Connecting to Cyan M02S",
      description: "Select your glasses from the Bluetooth dialog...",
    });

    await cyanGlasses.connect();
  };

  const handleDisconnectGlasses = () => {
    cyanGlasses.disconnect();
  };

  const handleToggleListening = () => {
    setIsListening(!isListening);
    if (!isListening) {
      toast({
        title: "Voice Commands Active",
        description: 'Say \"Log undercut\" or \"Next support\" to interact',
      });
    }
  };

  const handleViewInspectionDetails = (id: string) => {
    toast({
      title: "Opening Inspection",
      description: `Loading details for ${id}`,
    });
  };

  return (
    <AppLayout>
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-wider sm:text-4xl">
              Inspection Dashboard
            </h1>
            <p className="mt-2 text-muted-foreground">
              Real-time weld defect detection & compliance monitoring
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg border border-success/30 bg-success/10 px-4 py-2">
            <Icons.shield className="h-5 w-5 text-success" />
            <span className="text-sm font-bold uppercase tracking-wider text-success">
              ASME Sec VIII/IX Compliant
            </span>
          </div>
        </div>
      </motion.section>

      {/* Metrics Grid */}
      <section className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Today's Inspections"
          value={mockMetrics.inspectionsToday}
          subtitle="23% above average"
          icon={<Icons.clipboard className="h-6 w-6" />}
          trend={{ value: 23, positive: true }}
          variant="accent"
        />
        <MetricCard
          title="Defects Found"
          value={mockMetrics.defectsFound}
          subtitle="This month"
          icon={<Icons.alertTriangle className="h-6 w-6" />}
          variant="danger"
        />
        <MetricCard
          title="Critical Issues"
          value={mockMetrics.criticalDefects}
          subtitle="Requires immediate action"
          icon={<WeldSparkIcon className="h-6 w-6" />}
          variant="danger"
        />
        <MetricCard
          title="Compliance Rate"
          value={`${mockMetrics.complianceRate}%`}
          subtitle="API 577 / MSS SP-58"
          icon={<Icons.shield className="h-6 w-6" />}
          trend={{ value: 2.1, positive: true }}
          variant="success"
        />
      </section>

      {/* AR Glasses Connection */}
      <section className="mb-8 space-y-4">
        <ARGlassesConnection
          status={arStatus}
          onConnect={handleConnectGlasses}
          onDisconnect={handleDisconnectGlasses}
        />
        
        {/* Real Cyan Glasses Controls - only show when connected */}
        {cyanGlasses.isConnected && (
          <CyanGlassesControls />
        )}
        
        {/* Browser support warning */}
        {!cyanGlasses.isSupported && (
          <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
            <div className="flex items-center gap-3">
              <Icons.alertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-bold text-warning">Web Bluetooth Not Supported</p>
                <p className="text-sm text-muted-foreground">
                  Use Chrome, Edge, or Opera to connect to Cyan M02S glasses. Safari and Firefox don't support Web Bluetooth.
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentInspections
            inspections={mockRecentInspections}
            onViewDetails={handleViewInspectionDetails}
          />
        </div>
        <div>
          <DefectAnalytics />
        </div>
      </section>

      {/* Cost Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-8"
      >
        <div className="steel-panel rounded-lg p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider sm:text-lg">
                Monthly Repair Costs
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Total estimated repair expenditure
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-3xl font-black text-accent sm:text-4xl">
                ${mockMetrics.repairCosts.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground sm:text-sm">
                Avg. ${Math.round(mockMetrics.repairCosts / mockMetrics.defectsFound)} per defect
              </p>
            </div>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "68%" }}
              transition={{ duration: 1, delay: 0.5 }}
              className="h-full bg-gradient-to-r from-accent to-orange-600"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            68% of quarterly budget utilized
          </p>
        </div>
      </motion.section>

      {/* Voice Commands FAB */}
      <VoiceCommands
        isListening={isListening}
        onToggleListening={handleToggleListening}
        lastCommand={lastCommand}
      />
    </AppLayout>
  );
};

export default Index;
