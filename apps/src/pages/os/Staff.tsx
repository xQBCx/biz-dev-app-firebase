import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Shield, UserPlus, Calendar, Clock, DollarSign, Megaphone, Settings } from 'lucide-react';
import TeamMembers from '@/components/staff/TeamMembers';
import Permissions from '@/components/staff/Permissions';
import OnboardingManagement from '@/components/staff/OnboardingManagement';
import Scheduling from '@/components/staff/Scheduling';
import TimeTracking from '@/components/staff/TimeTracking';
import Payroll from '@/components/staff/Payroll';
import Announcements from '@/components/staff/Announcements';
import StaffSettings from '@/components/staff/StaffSettings';

const Staff = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>OS</span>
        <span>/</span>
        <span className="text-foreground">Staff Management</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">
            Comprehensive staff management system for your property
          </p>
        </div>
      </div>

      <Tabs defaultValue="team-members" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
          <TabsTrigger value="team-members" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Permissions</span>
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Onboarding</span>
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Scheduling</span>
          </TabsTrigger>
          <TabsTrigger value="time-tracking" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="hidden sm:inline">Time</span>
          </TabsTrigger>
          <TabsTrigger value="payroll" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            <span className="hidden sm:inline">Payroll</span>
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            <span className="hidden sm:inline">Announcements</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="team-members" className="mt-6">
          <TeamMembers />
        </TabsContent>
        
        <TabsContent value="permissions" className="mt-6">
          <Permissions />
        </TabsContent>
        
        <TabsContent value="onboarding" className="mt-6">
          <OnboardingManagement />
        </TabsContent>
        
        <TabsContent value="scheduling" className="mt-6">
          <Scheduling />
        </TabsContent>
        
        <TabsContent value="time-tracking" className="mt-6">
          <TimeTracking />
        </TabsContent>
        
        <TabsContent value="payroll" className="mt-6">
          <Payroll />
        </TabsContent>
        
        <TabsContent value="announcements" className="mt-6">
          <Announcements />
        </TabsContent>
        
        <TabsContent value="settings" className="mt-6">
          <StaffSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Staff;