import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Clock, Play, Pause, Square, Search, Calendar, TrendingUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface TimeEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  initials: string;
  role: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  status: 'clocked-in' | 'on-break' | 'clocked-out';
  notes?: string;
}

interface Employee {
  id: string;
  name: string;
  initials: string;
  role: string;
  weeklyHours: number;
  targetHours: number;
  status: 'clocked-in' | 'clocked-out' | 'on-break';
  todayHours: number;
}

const TimeTracking = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const employees: Employee[] = [
    { id: 'cl', name: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk Clerk', weeklyHours: 35.5, targetHours: 40, status: 'clocked-in', todayHours: 6.5 },
    { id: 'kk', name: 'Kira King', initials: 'KK', role: 'Front Desk Clerk', weeklyHours: 32.0, targetHours: 40, status: 'clocked-out', todayHours: 8.0 },
    { id: 'dc', name: 'Desi Cabrera', initials: 'DC', role: 'Housekeeping', weeklyHours: 38.5, targetHours: 40, status: 'clocked-in', todayHours: 7.5 },
    { id: 'gv', name: 'Gabriela Valle', initials: 'GV', role: 'Housekeeping Manager', weeklyHours: 42.0, targetHours: 40, status: 'on-break', todayHours: 5.0 },
    { id: 'bm', name: 'Brandon McGee', initials: 'BM', role: 'Maintenance', weeklyHours: 40.0, targetHours: 40, status: 'clocked-in', todayHours: 8.0 },
    { id: 'eh', name: 'Eileen Hatrick', initials: 'EH', role: 'Front Desk Clerk', weeklyHours: 28.5, targetHours: 32, status: 'clocked-out', todayHours: 0 },
    { id: 'mw', name: 'Malakye Wilson', initials: 'MW', role: 'Front Desk Clerk', weeklyHours: 36.0, targetHours: 40, status: 'clocked-out', todayHours: 0 },
  ];

  const timeEntries: TimeEntry[] = [
    { id: '1', employeeId: 'cl', employeeName: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk Clerk', date: '2024-01-15', clockIn: '08:00', totalHours: 6.5, status: 'clocked-in' },
    { id: '2', employeeId: 'kk', employeeName: 'Kira King', initials: 'KK', role: 'Front Desk Clerk', date: '2024-01-15', clockIn: '08:00', clockOut: '16:00', totalHours: 8.0, status: 'clocked-out' },
    { id: '3', employeeId: 'dc', employeeName: 'Desi Cabrera', initials: 'DC', role: 'Housekeeping', date: '2024-01-15', clockIn: '09:00', totalHours: 7.5, status: 'clocked-in' },
    { id: '4', employeeId: 'gv', employeeName: 'Gabriela Valle', initials: 'GV', role: 'Housekeeping Manager', date: '2024-01-15', clockIn: '07:00', breakStart: '12:00', totalHours: 5.0, status: 'on-break' },
    { id: '5', employeeId: 'bm', employeeName: 'Brandon McGee', initials: 'BM', role: 'Maintenance', date: '2024-01-15', clockIn: '08:00', totalHours: 8.0, status: 'clocked-in' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'clocked-in': return 'bg-green-100 text-green-800';
      case 'on-break': return 'bg-yellow-100 text-yellow-800';
      case 'clocked-out': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'front desk clerk': return 'bg-blue-100 text-blue-800';
      case 'housekeeping': return 'bg-green-100 text-green-800';
      case 'housekeeping manager': return 'bg-green-200 text-green-900';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalHoursToday = () => {
    return employees.reduce((total, emp) => total + emp.todayHours, 0);
  };

  const getActiveEmployees = () => {
    return employees.filter(emp => emp.status === 'clocked-in').length;
  };

  const getOnBreakEmployees = () => {
    return employees.filter(emp => emp.status === 'on-break').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Time Tracking</h2>
          <p className="text-muted-foreground">Monitor employee attendance and hours</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto"
          />
        </div>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{getTotalHoursToday()}</p>
                <p className="text-xs text-muted-foreground">Total Hours Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{getActiveEmployees()}</p>
                <p className="text-xs text-muted-foreground">Currently Working</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Pause className="h-4 w-4 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{getOnBreakEmployees()}</p>
                <p className="text-xs text-muted-foreground">On Break</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{employees.length}</p>
                <p className="text-xs text-muted-foreground">Total Staff</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employee Time Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEmployees.map((employee) => (
          <Card key={employee.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {employee.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-sm">{employee.name}</h3>
                      <Badge className={`text-xs ${getRoleColor(employee.role)}`}>
                        {employee.role}
                      </Badge>
                    </div>
                  </div>
                  <Badge className={getStatusColor(employee.status)}>
                    {employee.status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Today: {employee.todayHours}h</span>
                    <span className="text-muted-foreground">Target: 8h</span>
                  </div>
                  <Progress value={(employee.todayHours / 8) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Weekly: {employee.weeklyHours}h</span>
                    <span className="text-muted-foreground">Target: {employee.targetHours}h</span>
                  </div>
                  <Progress value={(employee.weeklyHours / employee.targetHours) * 100} className="h-2" />
                </div>

                <div className="flex gap-2">
                  {employee.status === 'clocked-out' && (
                    <Button size="sm" className="flex-1">
                      <Play className="w-3 h-3 mr-1" />
                      Clock In
                    </Button>
                  )}
                  {employee.status === 'clocked-in' && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Pause className="w-3 h-3 mr-1" />
                        Break
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Square className="w-3 h-3 mr-1" />
                        Clock Out
                      </Button>
                    </>
                  )}
                  {employee.status === 'on-break' && (
                    <>
                      <Button size="sm" className="flex-1">
                        <Play className="w-3 h-3 mr-1" />
                        Resume
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Square className="w-3 h-3 mr-1" />
                        Clock Out
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Time Entries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {entry.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">{entry.employeeName}</h4>
                    <Badge className={`text-xs ${getRoleColor(entry.role)}`}>
                      {entry.role}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <div className="font-medium">Clock In</div>
                    <div className="text-muted-foreground">{entry.clockIn}</div>
                  </div>
                  {entry.breakStart && (
                    <div className="text-center">
                      <div className="font-medium">Break</div>
                      <div className="text-muted-foreground">{entry.breakStart}</div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="font-medium">Clock Out</div>
                    <div className="text-muted-foreground">{entry.clockOut || '--'}</div>
                  </div>
                  <div className="text-center">
                    <div className="font-medium">Total</div>
                    <div className="text-muted-foreground">{entry.totalHours}h</div>
                  </div>
                  <Badge className={getStatusColor(entry.status)}>
                    {entry.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimeTracking;