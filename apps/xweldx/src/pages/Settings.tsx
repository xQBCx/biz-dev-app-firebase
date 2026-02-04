import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Icons } from "@/components/icons/IndustrialIcons";
import { motion } from "framer-motion";

const Settings = () => {
  return (
    <AppLayout>
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div>
          <h1 className="text-3xl font-black uppercase tracking-wider">
            Settings
          </h1>
          <p className="mt-2 text-muted-foreground">
            Configure application preferences and integrations
          </p>
        </div>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* AR Glasses Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card variant="steel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.glasses className="h-5 w-5 text-accent" />
                AR Glasses Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Auto-Connect on Launch</p>
                  <p className="text-sm text-muted-foreground">
                    Automatically pair with last used device
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">AI Defect Detection</p>
                  <p className="text-sm text-muted-foreground">
                    Enable real-time defect analysis
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Voice Commands</p>
                  <p className="text-sm text-muted-foreground">
                    Enable hands-free voice control
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="secondary" className="w-full">
                <Icons.settings className="h-4 w-4" />
                Advanced Configuration
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Compliance Standards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card variant="steel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.shield className="h-5 w-5 text-success" />
                Compliance Standards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="font-bold">ASME Section VIII</span>
                </div>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="font-bold">ASME Section IX</span>
                </div>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="font-bold">API 577</span>
                </div>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="success">Active</Badge>
                  <span className="font-bold">MSS SP-58</span>
                </div>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Offline Mode */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card variant="steel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.wifiOff className="h-5 w-5 text-warning" />
                Offline Mode
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Enable Offline Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Work without internet connection
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="rounded-lg border border-border bg-secondary/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cached Inspections</span>
                  <span className="font-bold">23</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">Pending Sync</span>
                  <Badge variant="warning">3</Badge>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm">Last Synced</span>
                  <span className="text-sm text-muted-foreground">2 min ago</span>
                </div>
              </div>
              <Button variant="industrial" className="w-full">
                <Icons.wifi className="h-4 w-4" />
                Sync Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Role */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card variant="steel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.users className="h-5 w-5 text-accent" />
                User Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20 text-2xl font-bold text-accent">
                  JD
                </div>
                <div>
                  <p className="text-lg font-bold">John Doe</p>
                  <Badge variant="info">Inspector</Badge>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-secondary/50 p-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Employee ID</span>
                  <span className="font-mono">WLD-042</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Certifications</span>
                  <span>AWS CWI, ASME IX</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Role</span>
                  <span>Senior Inspector</span>
                </div>
              </div>
              <Button variant="secondary" className="w-full">
                Edit Profile
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Settings;
