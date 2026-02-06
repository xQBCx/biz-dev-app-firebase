import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface Shift {
  id: string;
  employeeId: string;
  employeeName: string;
  initials: string;
  role: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'no-show';
}

const Scheduling = () => {
  const [currentWeek, setCurrentWeek] = useState(new Date());

  const shifts: Shift[] = [
    { id: '1', employeeId: 'cl', employeeName: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk', date: '2024-01-15', startTime: '08:00', endTime: '16:00', hours: 8, status: 'confirmed' },
    { id: '2', employeeId: 'kk', employeeName: 'Kira King', initials: 'KK', role: 'Front Desk', date: '2024-01-15', startTime: '16:00', endTime: '00:00', hours: 8, status: 'scheduled' },
    { id: '3', employeeId: 'dc', employeeName: 'Desi Cabrera', initials: 'DC', role: 'Housekeeping', date: '2024-01-15', startTime: '09:00', endTime: '17:00', hours: 8, status: 'confirmed' },
    { id: '4', employeeId: 'gv', employeeName: 'Gabriela Valle', initials: 'GV', role: 'Housekeeping Manager', date: '2024-01-15', startTime: '07:00', endTime: '15:00', hours: 8, status: 'confirmed' },
    { id: '5', employeeId: 'bm', employeeName: 'Brandon McGee', initials: 'BM', role: 'Maintenance', date: '2024-01-15', startTime: '08:00', endTime: '16:00', hours: 8, status: 'scheduled' },
    
    { id: '6', employeeId: 'eh', employeeName: 'Eileen Hatrick', initials: 'EH', role: 'Front Desk', date: '2024-01-16', startTime: '08:00', endTime: '16:00', hours: 8, status: 'scheduled' },
    { id: '7', employeeId: 'mw', employeeName: 'Malakye Wilson', initials: 'MW', role: 'Front Desk', date: '2024-01-16', startTime: '16:00', endTime: '00:00', hours: 8, status: 'scheduled' },
    { id: '8', employeeId: 'lp', employeeName: 'Lilly Ponce', initials: 'LP', role: 'Housekeeping', date: '2024-01-16', startTime: '09:00', endTime: '17:00', hours: 8, status: 'confirmed' },
    { id: '9', employeeId: 'ms', employeeName: 'Maria Santillan-Munoz', initials: 'MS', role: 'Housekeeping', date: '2024-01-16', startTime: '09:00', endTime: '17:00', hours: 8, status: 'scheduled' },
  ];

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const diff = startOfWeek.getDate() - startOfWeek.getDay();
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const weekDays = getWeekDays(currentWeek);
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const getShiftsForDay = (date: string) => {
    return shifts.filter(shift => shift.date === date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'no-show': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'front desk': return 'bg-blue-100 text-blue-800';
      case 'housekeeping': return 'bg-green-100 text-green-800';
      case 'housekeeping manager': return 'bg-green-200 text-green-900';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'manager': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTotalHoursForWeek = () => {
    const weekStart = formatDate(weekDays[0]);
    const weekEnd = formatDate(weekDays[6]);
    return shifts.filter(shift => shift.date >= weekStart && shift.date <= weekEnd)
                 .reduce((total, shift) => total + shift.hours, 0);
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeek);
    newDate.setDate(currentWeek.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeek(newDate);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Scheduling</h2>
          <p className="text-muted-foreground">Manage work schedules and shifts</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Shift
        </Button>
      </div>

      {/* Week Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{shifts.length}</p>
                <p className="text-xs text-muted-foreground">Total Shifts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalHoursForWeek()}</p>
                <p className="text-xs text-muted-foreground">Total Hours</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{new Set(shifts.map(s => s.employeeId)).size}</p>
                <p className="text-xs text-muted-foreground">Staff Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 bg-green-500 rounded-full" />
              <div>
                <p className="text-2xl font-bold">{shifts.filter(s => s.status === 'confirmed').length}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Week Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Schedule
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-medium">
                {weekDays[0].toLocaleDateString()} - {weekDays[6].toLocaleDateString()}
              </span>
              <Button variant="outline" size="sm" onClick={() => navigateWeek('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayShifts = getShiftsForDay(formatDate(day));
              const isToday = formatDate(day) === formatDate(new Date());
              
              return (
                <div key={index} className={`border rounded-lg p-3 min-h-[200px] ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
                  <div className="text-center mb-3">
                    <div className="font-medium text-sm">{dayNames[day.getDay()]}</div>
                    <div className={`text-lg font-bold ${isToday ? 'text-blue-600' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {dayShifts.map((shift) => (
                      <div key={shift.id} className="bg-white border rounded p-2 text-xs">
                        <div className="flex items-center gap-1 mb-1">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {shift.initials}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium truncate">{shift.employeeName}</span>
                        </div>
                        <Badge className={`text-xs mb-1 ${getRoleColor(shift.role)}`}>
                          {shift.role}
                        </Badge>
                        <div className="text-muted-foreground">
                          {shift.startTime} - {shift.endTime}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-muted-foreground">{shift.hours}h</span>
                          <Badge className={`text-xs ${getStatusColor(shift.status)}`}>
                            {shift.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {dayShifts.length === 0 && (
                      <div className="text-center text-muted-foreground text-xs py-4">
                        No shifts scheduled
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Shift Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Shift Status Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>
              <span className="text-sm text-muted-foreground">Pending confirmation</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
              <span className="text-sm text-muted-foreground">Employee confirmed</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-gray-100 text-gray-800">Completed</Badge>
              <span className="text-sm text-muted-foreground">Shift finished</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800">No-show</Badge>
              <span className="text-sm text-muted-foreground">Employee didn't show</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scheduling;