import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { DollarSign, Download, Search, Calendar, TrendingUp, Users, FileText } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PayrollEntry {
  id: string;
  employeeId: string;
  employeeName: string;
  initials: string;
  role: string;
  hoursWorked: number;
  hourlyRate: number;
  regularPay: number;
  overtimePay: number;
  grossPay: number;
  deductions: number;
  netPay: number;
  payPeriod: string;
  status: 'draft' | 'approved' | 'paid';
}

interface Employee {
  id: string;
  name: string;
  initials: string;
  role: string;
  hourlyRate: number;
  annualSalary: number;
  payType: 'hourly' | 'salary';
  ytdGross: number;
  ytdTaxes: number;
  lastPayDate: string;
}

const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedTab, setSelectedTab] = useState<'overview' | 'employees' | 'payroll'>('overview');

  const employees: Employee[] = [
    { id: 'bp', name: 'Brittany Patel', initials: 'BP', role: 'Owner', hourlyRate: 0, annualSalary: 85000, payType: 'salary', ytdGross: 16346.15, ytdTaxes: 3920.28, lastPayDate: '2024-01-01' },
    { id: 'jl', name: 'Jason Lopez', initials: 'JL', role: 'Operations Director', hourlyRate: 0, annualSalary: 65000, payType: 'salary', ytdGross: 12500.00, ytdTaxes: 3000.00, lastPayDate: '2024-01-01' },
    { id: 'tz', name: 'Tiara Zimmerman', initials: 'TZ', role: 'Operations Manager', hourlyRate: 0, annualSalary: 55000, payType: 'salary', ytdGross: 10576.92, ytdTaxes: 2538.46, lastPayDate: '2024-01-01' },
    { id: 'gv', name: 'Gabriela Valle', initials: 'GV', role: 'Housekeeping Manager', hourlyRate: 18.50, annualSalary: 0, payType: 'hourly', ytdGross: 1480.00, ytdTaxes: 355.20, lastPayDate: '2024-01-01' },
    { id: 'cl', name: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk Clerk', hourlyRate: 16.00, annualSalary: 0, payType: 'hourly', ytdGross: 1280.00, ytdTaxes: 307.20, lastPayDate: '2024-01-01' },
    { id: 'bm', name: 'Brandon McGee', initials: 'BM', role: 'Maintenance', hourlyRate: 20.00, annualSalary: 0, payType: 'hourly', ytdGross: 1600.00, ytdTaxes: 384.00, lastPayDate: '2024-01-01' },
  ];

  const payrollEntries: PayrollEntry[] = [
    { id: '1', employeeId: 'cl', employeeName: 'Cheyann Ludolph', initials: 'CL', role: 'Front Desk Clerk', hoursWorked: 80, hourlyRate: 16.00, regularPay: 1280.00, overtimePay: 0, grossPay: 1280.00, deductions: 307.20, netPay: 972.80, payPeriod: '2024-01-01 to 2024-01-15', status: 'paid' },
    { id: '2', employeeId: 'gv', employeeName: 'Gabriela Valle', initials: 'GV', role: 'Housekeeping Manager', hoursWorked: 80, hourlyRate: 18.50, regularPay: 1480.00, overtimePay: 0, grossPay: 1480.00, deductions: 355.20, netPay: 1124.80, payPeriod: '2024-01-01 to 2024-01-15', status: 'paid' },
    { id: '3', employeeId: 'bm', employeeName: 'Brandon McGee', initials: 'BM', role: 'Maintenance', hoursWorked: 80, hourlyRate: 20.00, regularPay: 1600.00, overtimePay: 0, grossPay: 1600.00, deductions: 384.00, netPay: 1216.00, payPeriod: '2024-01-01 to 2024-01-15', status: 'paid' },
    { id: '4', employeeId: 'kk', employeeName: 'Kira King', initials: 'KK', role: 'Front Desk Clerk', hoursWorked: 75, hourlyRate: 15.50, regularPay: 1162.50, overtimePay: 0, grossPay: 1162.50, deductions: 279.00, netPay: 883.50, payPeriod: '2024-01-16 to 2024-01-31', status: 'approved' },
    { id: '5', employeeId: 'dc', employeeName: 'Desi Cabrera', initials: 'DC', role: 'Housekeeping', hoursWorked: 82, hourlyRate: 15.00, regularPay: 1230.00, overtimePay: 45.00, grossPay: 1275.00, deductions: 306.00, netPay: 969.00, payPeriod: '2024-01-16 to 2024-01-31', status: 'draft' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner': return 'bg-red-100 text-red-800';
      case 'operations director': return 'bg-purple-100 text-purple-800';
      case 'operations manager': return 'bg-blue-100 text-blue-800';
      case 'housekeeping manager': return 'bg-green-200 text-green-900';
      case 'front desk clerk': return 'bg-blue-100 text-blue-800';
      case 'housekeeping': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPayroll = payrollEntries.filter(entry =>
    entry.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalPayroll = () => {
    return payrollEntries.reduce((total, entry) => total + entry.grossPay, 0);
  };

  const getTotalDeductions = () => {
    return payrollEntries.reduce((total, entry) => total + entry.deductions, 0);
  };

  const getAverageHourlyRate = () => {
    const hourlyEmployees = employees.filter(emp => emp.payType === 'hourly');
    return hourlyEmployees.reduce((sum, emp) => sum + emp.hourlyRate, 0) / hourlyEmployees.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Payroll Management</h2>
          <p className="text-muted-foreground">Manage employee compensation and payroll processing</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Run Payroll
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === 'overview' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('overview')}
        >
          Overview
        </Button>
        <Button
          variant={selectedTab === 'employees' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('employees')}
        >
          Employees
        </Button>
        <Button
          variant={selectedTab === 'payroll' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('payroll')}
        >
          Payroll History
        </Button>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="space-y-6">
          {/* Payroll Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">${getTotalPayroll().toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Payroll</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{employees.length}</p>
                    <p className="text-xs text-muted-foreground">Total Employees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <div>
                    <p className="text-2xl font-bold">${getAverageHourlyRate().toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Avg Hourly Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">${getTotalDeductions().toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total Deductions</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Payroll Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Payroll Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {payrollEntries.slice(0, 5).map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-sm">{entry.employeeName}</h4>
                        <p className="text-xs text-muted-foreground">{entry.payPeriod}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium text-sm">${entry.netPay.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{entry.hoursWorked}h worked</p>
                      </div>
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employees Tab */}
      {selectedTab === 'employees' && (
        <div className="space-y-6">
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

          {/* Employee List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                          <h3 className="font-medium">{employee.name}</h3>
                          <Badge className={`text-xs ${getRoleColor(employee.role)}`}>
                            {employee.role}
                          </Badge>
                        </div>
                      </div>
                      <Badge variant="outline">
                        {employee.payType}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Rate/Salary</p>
                        <p className="font-medium">
                          {employee.payType === 'hourly' 
                            ? `$${employee.hourlyRate}/hr` 
                            : `$${employee.annualSalary.toLocaleString()}/yr`}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">YTD Gross</p>
                        <p className="font-medium">${employee.ytdGross.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">YTD Taxes</p>
                        <p className="font-medium">${employee.ytdTaxes.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Last Pay</p>
                        <p className="font-medium">{employee.lastPayDate}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tax Rate</span>
                        <span>{((employee.ytdTaxes / employee.ytdGross) * 100).toFixed(1)}%</span>
                      </div>
                      <Progress value={(employee.ytdTaxes / employee.ytdGross) * 100} className="h-2" />
                    </div>

                    <Button variant="outline" size="sm" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Payroll History Tab */}
      {selectedTab === 'payroll' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payroll entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="last">Last Period</SelectItem>
                <SelectItem value="ytd">Year to Date</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payroll Entries */}
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredPayroll.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {entry.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium">{entry.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">{entry.payPeriod}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-6 text-sm text-center">
                      <div>
                        <p className="text-muted-foreground">Hours</p>
                        <p className="font-medium">{entry.hoursWorked}h</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Gross Pay</p>
                        <p className="font-medium">${entry.grossPay.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Deductions</p>
                        <p className="font-medium">${entry.deductions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Net Pay</p>
                        <p className="font-medium">${entry.netPay.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(entry.status)}>
                        {entry.status}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Payroll;