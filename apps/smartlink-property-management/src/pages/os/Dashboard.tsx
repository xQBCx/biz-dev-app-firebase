import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ShiftOverview from '@/components/dashboard/ShiftOverview';
import MaintenanceSnapshot from '@/components/dashboard/MaintenanceSnapshot';
import HousekeepingStatus from '@/components/dashboard/HousekeepingStatus';
import GuestServices from '@/components/dashboard/GuestServices';
import TeamSnapshot from '@/components/dashboard/TeamSnapshot';
import AcademyProgress from '@/components/dashboard/AcademyProgress';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import { PropertySwitcher } from '@/components/PropertySwitcher';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">Property Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Command center for your property operations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <PropertySwitcher />
          <Card className="px-3 py-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
              <span className="font-mono">
                {currentTime.toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </span>
            </div>
          </Card>
          <NotificationsPanel />
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Operations Pulse (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shift Overview */}
          <ShiftOverview />
          
          {/* Operations Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MaintenanceSnapshot />
            <HousekeepingStatus />
          </div>
          
          {/* Guest Services */}
          <GuestServices />
        </div>

        {/* Right Column - People & Growth (1/3 width) */}
        <div className="space-y-6">
          <TeamSnapshot />
          <AcademyProgress />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;