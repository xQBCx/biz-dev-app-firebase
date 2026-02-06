import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarCheck, CalendarX, Clock, Coffee } from 'lucide-react';

interface GuestServiceData {
  checkInsToday: number;
  checkOutsToday: number;
  upcomingArrivals: number;
  lastBrewTime: string;
}

const GuestServices = () => {
  const [guestData, setGuestData] = useState<GuestServiceData>({
    checkInsToday: 0,
    checkOutsToday: 0,
    upcomingArrivals: 0,
    lastBrewTime: ''
  });

  useEffect(() => {
    fetchGuestData();
  }, []);

  const fetchGuestData = () => {
    // Mock data for guest services
    setGuestData({
      checkInsToday: Math.floor(Math.random() * 12) + 3,
      checkOutsToday: Math.floor(Math.random() * 8) + 2,
      upcomingArrivals: Math.floor(Math.random() * 6) + 1,
      lastBrewTime: new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });
  };

  return (
    <Card className="card-elegant">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <CalendarCheck className="h-5 w-5 text-primary" />
          Guest Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Check-ins/Check-outs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-green-50 rounded-lg border">
            <CalendarCheck className="h-5 w-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-green-700">{guestData.checkInsToday}</div>
            <div className="text-xs text-green-600">Check-ins</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg border">
            <CalendarX className="h-5 w-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-semibold text-blue-700">{guestData.checkOutsToday}</div>
            <div className="text-xs text-blue-600">Check-outs</div>
          </div>
        </div>

        {/* Upcoming Arrivals */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Upcoming Arrivals</span>
          </div>
          <Badge variant="outline">{guestData.upcomingArrivals}</Badge>
        </div>

        {/* Coffee Brew Reminder */}
        <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md">
          <Coffee className="h-4 w-4 text-amber-600" />
          <div className="flex-1">
            <div className="text-sm font-medium text-amber-700">Coffee Station</div>
            <div className="text-xs text-amber-600">Last brew: {guestData.lastBrewTime}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GuestServices;