import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings, Users, Clock, DollarSign, Bell, Shield, Calendar, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const StaffSettings = () => {
  const [settings, setSettings] = useState({
    // General Settings
    defaultWorkWeek: 40,
    overtimeThreshold: 40,
    breakDuration: 30,
    lunchDuration: 60,
    
    // Payroll Settings
    payPeriod: 'bi-weekly',
    payrollProcessingDay: 'friday',
    overtimeRate: 1.5,
    defaultHourlyRate: 15.00,
    
    // Scheduling Settings
    scheduleAdvanceDays: 14,
    minShiftHours: 4,
    maxShiftHours: 12,
    allowSelfScheduling: true,
    requireManagerApproval: true,
    
    // Time Tracking Settings
    allowMobileClockIn: true,
    gpsClockInRequired: false,
    clockInGracePeriod: 5,
    autoClockOutHours: 12,
    
    // Notification Settings
    emailNotifications: true,
    smsNotifications: false,
    scheduleReminders: true,
    payrollReminders: true,
    
    // Permission Settings
    restrictTimeEditing: true,
    requireReasonForChanges: true,
    managerOverrideAll: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Here you would save settings to database
    console.log('Saving settings:', settings);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management Settings</h2>
          <p className="text-muted-foreground">Configure system-wide staff management preferences</p>
        </div>
        <Button onClick={handleSaveSettings}>
          <Save className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="defaultWorkWeek">Default Work Week (hours)</Label>
              <Input
                id="defaultWorkWeek"
                type="number"
                value={settings.defaultWorkWeek}
                onChange={(e) => handleSettingChange('defaultWorkWeek', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="overtimeThreshold">Overtime Threshold (hours)</Label>
              <Input
                id="overtimeThreshold"
                type="number"
                value={settings.overtimeThreshold}
                onChange={(e) => handleSettingChange('overtimeThreshold', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="breakDuration">Default Break Duration (minutes)</Label>
              <Input
                id="breakDuration"
                type="number"
                value={settings.breakDuration}
                onChange={(e) => handleSettingChange('breakDuration', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="lunchDuration">Default Lunch Duration (minutes)</Label>
              <Input
                id="lunchDuration"
                type="number"
                value={settings.lunchDuration}
                onChange={(e) => handleSettingChange('lunchDuration', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payroll Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payroll Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="payPeriod">Pay Period</Label>
              <Select value={settings.payPeriod} onValueChange={(value) => handleSettingChange('payPeriod', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="payrollProcessingDay">Payroll Processing Day</Label>
              <Select value={settings.payrollProcessingDay} onValueChange={(value) => handleSettingChange('payrollProcessingDay', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="overtimeRate">Overtime Rate Multiplier</Label>
              <Input
                id="overtimeRate"
                type="number"
                step="0.1"
                value={settings.overtimeRate}
                onChange={(e) => handleSettingChange('overtimeRate', parseFloat(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="defaultHourlyRate">Default Hourly Rate ($)</Label>
              <Input
                id="defaultHourlyRate"
                type="number"
                step="0.01"
                value={settings.defaultHourlyRate}
                onChange={(e) => handleSettingChange('defaultHourlyRate', parseFloat(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Scheduling Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Scheduling Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="scheduleAdvanceDays">Schedule Advance Notice (days)</Label>
              <Input
                id="scheduleAdvanceDays"
                type="number"
                value={settings.scheduleAdvanceDays}
                onChange={(e) => handleSettingChange('scheduleAdvanceDays', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="minShiftHours">Minimum Shift Hours</Label>
              <Input
                id="minShiftHours"
                type="number"
                value={settings.minShiftHours}
                onChange={(e) => handleSettingChange('minShiftHours', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="maxShiftHours">Maximum Shift Hours</Label>
              <Input
                id="maxShiftHours"
                type="number"
                value={settings.maxShiftHours}
                onChange={(e) => handleSettingChange('maxShiftHours', parseInt(e.target.value))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="allowSelfScheduling">Allow Self-Scheduling</Label>
              <Switch
                id="allowSelfScheduling"
                checked={settings.allowSelfScheduling}
                onCheckedChange={(checked) => handleSettingChange('allowSelfScheduling', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="requireManagerApproval">Require Manager Approval</Label>
              <Switch
                id="requireManagerApproval"
                checked={settings.requireManagerApproval}
                onCheckedChange={(checked) => handleSettingChange('requireManagerApproval', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Tracking Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="allowMobileClockIn">Allow Mobile Clock-In</Label>
              <Switch
                id="allowMobileClockIn"
                checked={settings.allowMobileClockIn}
                onCheckedChange={(checked) => handleSettingChange('allowMobileClockIn', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="gpsClockInRequired">GPS Verification Required</Label>
              <Switch
                id="gpsClockInRequired"
                checked={settings.gpsClockInRequired}
                onCheckedChange={(checked) => handleSettingChange('gpsClockInRequired', checked)}
              />
            </div>
            
            <div>
              <Label htmlFor="clockInGracePeriod">Clock-In Grace Period (minutes)</Label>
              <Input
                id="clockInGracePeriod"
                type="number"
                value={settings.clockInGracePeriod}
                onChange={(e) => handleSettingChange('clockInGracePeriod', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <Label htmlFor="autoClockOutHours">Auto Clock-Out After (hours)</Label>
              <Input
                id="autoClockOutHours"
                type="number"
                value={settings.autoClockOutHours}
                onChange={(e) => handleSettingChange('autoClockOutHours', parseInt(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications">Email Notifications</Label>
              <Switch
                id="emailNotifications"
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications">SMS Notifications</Label>
              <Switch
                id="smsNotifications"
                checked={settings.smsNotifications}
                onCheckedChange={(checked) => handleSettingChange('smsNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="scheduleReminders">Schedule Reminders</Label>
              <Switch
                id="scheduleReminders"
                checked={settings.scheduleReminders}
                onCheckedChange={(checked) => handleSettingChange('scheduleReminders', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="payrollReminders">Payroll Reminders</Label>
              <Switch
                id="payrollReminders"
                checked={settings.payrollReminders}
                onCheckedChange={(checked) => handleSettingChange('payrollReminders', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Permission Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Permission Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="restrictTimeEditing">Restrict Time Editing</Label>
              <Switch
                id="restrictTimeEditing"
                checked={settings.restrictTimeEditing}
                onCheckedChange={(checked) => handleSettingChange('restrictTimeEditing', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="requireReasonForChanges">Require Reason for Changes</Label>
              <Switch
                id="requireReasonForChanges"
                checked={settings.requireReasonForChanges}
                onCheckedChange={(checked) => handleSettingChange('requireReasonForChanges', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="managerOverrideAll">Manager Override All Restrictions</Label>
              <Switch
                id="managerOverrideAll"
                checked={settings.managerOverrideAll}
                onCheckedChange={(checked) => handleSettingChange('managerOverrideAll', checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Changes will be applied immediately to all staff management modules.
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Reset to Defaults</Button>
              <Button onClick={handleSaveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Save All Settings
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StaffSettings;