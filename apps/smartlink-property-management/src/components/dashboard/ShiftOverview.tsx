import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Clock, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TeamMember {
  id: string;
  full_name: string;
  initials: string;
  role: string;
}

interface ShiftData {
  currentShift: string;
  staffOnDuty: TeamMember[];
  checklistProgress: number;
  overdueAlerts: number;
}

const ShiftOverview = () => {
  const [shiftData, setShiftData] = useState<ShiftData>({
    currentShift: getCurrentShift(),
    staffOnDuty: [],
    checklistProgress: 0,
    overdueAlerts: 0
  });

  function getCurrentShift() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 14) return 'Morning';
    if (hour >= 14 && hour < 22) return 'Evening';
    return 'Overnight';
  }

  useEffect(() => {
    fetchShiftData();
  }, []);

  const fetchShiftData = async () => {
    try {
      // Get staff on duty
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, initials, role')
        .limit(4);

      let staffData: TeamMember[] = [];
      
      if (profiles && profiles.length > 0) {
        staffData = profiles;
      } else {
        // Georgetown demo staff
        staffData = [
          { id: 'staff-1', full_name: 'Sarah Martinez', initials: 'SM', role: 'Front Desk Manager' },
          { id: 'staff-2', full_name: 'Mike Johnson', initials: 'MJ', role: 'Maintenance' },
          { id: 'staff-3', full_name: 'Jessica Chen', initials: 'JC', role: 'Housekeeping' },
          { id: 'staff-4', full_name: 'Carlos Rivera', initials: 'CR', role: 'Front Desk' },
          { id: 'staff-5', full_name: 'Amanda Wilson', initials: 'AW', role: 'Housekeeping' }
        ];
      }

      const currentHour = new Date().getHours();
      const checklistProgress = currentHour >= 6 && currentHour < 14 ? 85 : 
                              currentHour >= 14 && currentHour < 22 ? 72 : 45;
      const overdueAlerts = currentHour >= 6 && currentHour < 14 ? 0 : 1;

      setShiftData(prev => ({
        ...prev,
        staffOnDuty: staffData,
        checklistProgress,
        overdueAlerts
      }));
    } catch (error) {
      console.error('Error fetching shift data:', error);
      // Fallback to demo data
      setShiftData(prev => ({
        ...prev,
        staffOnDuty: [
          { id: 'staff-1', full_name: 'Sarah Martinez', initials: 'SM', role: 'Front Desk Manager' },
          { id: 'staff-2', full_name: 'Mike Johnson', initials: 'MJ', role: 'Maintenance' },
          { id: 'staff-3', full_name: 'Jessica Chen', initials: 'JC', role: 'Housekeeping' },
          { id: 'staff-4', full_name: 'Carlos Rivera', initials: 'CR', role: 'Front Desk' }
        ],
        checklistProgress: 85,
        overdueAlerts: 0
      }));
    }
  };

  return (
    <Card className="card-elegant">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Shift Overview
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {shiftData.currentShift} Shift
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Staff on Duty */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Staff on Duty</span>
            <Badge variant="secondary" className="ml-auto">
              {shiftData.staffOnDuty.length}
            </Badge>
          </div>
          <div className="flex gap-2">
            {shiftData.staffOnDuty.slice(0, 4).map((member) => (
              <Avatar key={member.id} className="h-8 w-8">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
            ))}
            {shiftData.staffOnDuty.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  +{shiftData.staffOnDuty.length - 4}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Shift Checklist Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Shift Checklist</span>
            </div>
            <span className="text-sm text-muted-foreground">{shiftData.checklistProgress}%</span>
          </div>
          <Progress value={shiftData.checklistProgress} className="h-2" />
        </div>

        {/* Alerts */}
        {shiftData.overdueAlerts > 0 && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">
              {shiftData.overdueAlerts} overdue task{shiftData.overdueAlerts > 1 ? 's' : ''}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftOverview;