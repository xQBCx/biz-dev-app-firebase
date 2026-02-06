import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Building, 
  Clock, 
  Users, 
  Bell, 
  Link2, 
  Shield, 
  Tag,
  Save,
  Upload,
  Palette,
  Globe,
  Key,
  UserCheck,
  Mail,
  Smartphone,
  MessageSquare
} from 'lucide-react';

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('property');

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Settings className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure your property management system
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          System Admin
        </Badge>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-none lg:flex">
          <TabsTrigger value="property" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">Property</span>
          </TabsTrigger>
          <TabsTrigger value="shifts" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Shifts</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span className="hidden sm:inline">Custom</span>
          </TabsTrigger>
        </TabsList>

        {/* Property Settings */}
        <TabsContent value="property" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Property Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="property-name">Property Name</Label>
                  <Input id="property-name" defaultValue="Microtel Georgetown" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="property-address">Address</Label>
                  <Textarea id="property-address" defaultValue="1209 W University Ave, Georgetown, TX 78628" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="property-city">City</Label>
                    <Input id="property-city" defaultValue="Georgetown" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="property-state">State</Label>
                    <Input id="property-state" defaultValue="TX" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="America/Chicago (CDT)" />
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5 text-primary" />
                  Branding & Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Property Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Building className="h-8 w-8 text-primary" />
                    </div>
                    <Button variant="outline">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Logo
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Brand Colors</Label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded border"></div>
                      <span className="text-sm">Primary</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-accent rounded border"></div>
                      <span className="text-sm">Accent</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Shift Scheduling */}
        <TabsContent value="shifts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Shift Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Morning Shift</div>
                      <div className="text-sm text-muted-foreground">6:00 AM - 2:00 PM</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Evening Shift</div>
                      <div className="text-sm text-muted-foreground">2:00 PM - 10:00 PM</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Overnight Shift</div>
                      <div className="text-sm text-muted-foreground">10:00 PM - 6:00 AM</div>
                    </div>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
                <Button className="w-full">
                  <Clock className="h-4 w-4 mr-2" />
                  Add Shift Template
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Coverage Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-assign">Auto-assign shifts</Label>
                  <Switch id="auto-assign" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="overtime-alerts">Overtime alerts</Label>
                  <Switch id="overtime-alerts" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="shift-reminders">Shift reminders</Label>
                  <Switch id="shift-reminders" defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Minimum staffing per shift</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Front Desk</div>
                      <Input defaultValue="1" className="text-center" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Housekeeping</div>
                      <Input defaultValue="2" className="text-center" />
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Maintenance</div>
                      <Input defaultValue="1" className="text-center" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Users & Roles */}
        <TabsContent value="users" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                Role Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { role: 'Owner', count: 1, color: 'bg-purple-100 text-purple-800' },
                  { role: 'Regional Manager', count: 2, color: 'bg-blue-100 text-blue-800' },
                  { role: 'Manager', count: 3, color: 'bg-green-100 text-green-800' },
                  { role: 'Supervisor', count: 5, color: 'bg-yellow-100 text-yellow-800' },
                  { role: 'Front Desk', count: 8, color: 'bg-orange-100 text-orange-800' },
                  { role: 'Housekeeping', count: 12, color: 'bg-pink-100 text-pink-800' },
                  { role: 'Maintenance', count: 4, color: 'bg-gray-100 text-gray-800' }
                ].map((item) => (
                  <div key={item.role} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{item.role}</div>
                        <div className="text-sm text-muted-foreground">{item.count} users</div>
                      </div>
                      <Badge className={item.color}>
                        {item.count}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">
                <Users className="h-4 w-4 mr-2" />
                Manage User Permissions
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Alert Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label>Push Notifications</Label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label>Email Alerts</Label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label>COMS Messages</Label>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Alert Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    'Urgent Maintenance',
                    'Missed Tasks',
                    'Staff Late/Absent',
                    'Academy Cert Expiring',
                    'Low Inventory',
                    'Guest Complaints',
                    'Security Incidents'
                  ].map((alert) => (
                    <div key={alert} className="flex items-center justify-between">
                      <Label>{alert}</Label>
                      <Switch defaultChecked />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-primary" />
                System Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'SynXis PMS', status: 'Connected', color: 'bg-green-100 text-green-800' },
                  { name: 'Opera PMS', status: 'Available', color: 'bg-gray-100 text-gray-800' },
                  { name: 'Housekeeping Pro', status: 'Connected', color: 'bg-green-100 text-green-800' },
                  { name: 'Maintenance Direct', status: 'Available', color: 'bg-gray-100 text-gray-800' },
                  { name: 'Staff Scheduler', status: 'Available', color: 'bg-gray-100 text-gray-800' },
                  { name: 'Revenue Analytics', status: 'Connected', color: 'bg-green-100 text-green-800' }
                ].map((integration) => (
                  <div key={integration.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{integration.name}</div>
                        <Badge className={integration.color}>
                          {integration.status}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        {integration.status === 'Connected' ? 'Configure' : 'Connect'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Two-factor authentication</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Magic link login</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Session timeout (hrs)</Label>
                  <Input defaultValue="8" className="w-20" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Audit logging</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-primary" />
                  Access Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Allowed IP ranges</Label>
                  <Textarea placeholder="192.168.1.0/24&#10;10.0.0.0/8" />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require VPN for remote access</Label>
                  <Switch />
                </div>
                <Button variant="outline" className="w-full">
                  <Shield className="h-4 w-4 mr-2" />
                  View Security Logs
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Custom Fields */}
        <TabsContent value="custom" className="space-y-6">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-primary" />
                Custom Fields & Categories
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">SOP Categories</h4>
                  <div className="space-y-2">
                    {['Safety Protocols', 'Guest Services', 'Emergency Procedures'].map((category) => (
                      <div key={category} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{category}</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Add Category</Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Task Types</h4>
                  <div className="space-y-2">
                    {['Daily Checklist', 'Weekly Deep Clean', 'Monthly Audit'].map((type) => (
                      <div key={type} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{type}</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Add Type</Button>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Academy Modules</h4>
                  <div className="space-y-2">
                    {['Hospitality Excellence', 'Safety Training', 'Tech Skills'].map((module) => (
                      <div key={module} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{module}</span>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="w-full">Add Module</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg" className="bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          Save All Settings
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;