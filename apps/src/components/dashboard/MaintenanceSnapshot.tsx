import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wrench, AlertTriangle, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface MaintenanceStats {
  urgent: number;
  medium: number;
  low: number;
  total: number;
}

const MaintenanceSnapshot = () => {
  const [stats, setStats] = useState<MaintenanceStats>({
    urgent: 0,
    medium: 0,
    low: 0,
    total: 0
  });

  useEffect(() => {
    fetchMaintenanceStats();
  }, []);

  const fetchMaintenanceStats = async () => {
    try {
      // Get maintenance requests by urgency
      const { data: requests } = await supabase
        .from('maintenance_requests')
        .select('urgency')
        .eq('status', 'pending');

      if (requests) {
        const urgentCount = requests.filter(r => r.urgency === 'urgent').length;
        const mediumCount = requests.filter(r => r.urgency === 'medium').length;
        const lowCount = requests.filter(r => r.urgency === 'low').length;

        setStats({
          urgent: urgentCount,
          medium: mediumCount,
          low: lowCount,
          total: requests.length
        });
      }
    } catch (error) {
      console.error('Error fetching maintenance stats:', error);
    }
  };

  return (
    <Card className="card-elegant">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            Maintenance
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {stats.total} Open
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Urgency Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive"></div>
              <span className="text-sm">Urgent</span>
            </div>
            <Badge variant={stats.urgent > 0 ? "destructive" : "secondary"}>
              {stats.urgent}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500"></div>
              <span className="text-sm">Medium</span>
            </div>
            <Badge variant="secondary">{stats.medium}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Low</span>
            </div>
            <Badge variant="secondary">{stats.low}</Badge>
          </div>
        </div>

        {/* Alert for urgent tickets */}
        {stats.urgent > 0 && (
          <div className="flex items-center gap-2 p-2 bg-destructive/10 rounded-md">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">
              {stats.urgent} urgent ticket{stats.urgent > 1 ? 's' : ''} need immediate attention
            </span>
          </div>
        )}

        {/* Quick Actions */}
        <div className="space-y-2">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link to="/os/maintenance">
              View All Tickets
            </Link>
          </Button>
          <Button asChild size="sm" className="w-full">
            <Link to="/os/maintenance" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Ticket
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MaintenanceSnapshot;