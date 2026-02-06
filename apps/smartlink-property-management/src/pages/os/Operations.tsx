import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FileText, TrendingUp, Settings, Download, Plus, ExternalLink, Loader2, Search, Filter, File, BarChart3, CheckCircle2, Clock, Users, Eye, Star, Upload, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
interface SOP {
  id: string;
  department: string;
  title: string;
  sop_url: string;
  created_at: string;
}
const Operations = () => {
  const [sops, setSops] = useState<SOP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedSop, setSelectedSop] = useState<SOP | null>(null);
  const [newSop, setNewSop] = useState({
    title: '',
    department: '',
    sop_url: ''
  });
  const {
    toast
  } = useToast();
  useEffect(() => {
    fetchSOPs();
  }, []);
  const fetchSOPs = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('sops').select('*').order('department', {
        ascending: true
      }).order('title', {
        ascending: true
      });
      if (error) throw error;
      setSops(data || []);
    } catch (error) {
      console.error('Error fetching SOPs:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddSop = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAdding(true);
    try {
      const {
        error
      } = await supabase.from('sops').insert([newSop]);
      if (error) throw error;
      toast({
        title: "SOP Added",
        description: "New standard operating procedure has been added successfully."
      });
      setNewSop({
        title: '',
        department: '',
        sop_url: ''
      });
      fetchSOPs();
    } catch (error) {
      console.error('Error adding SOP:', error);
      toast({
        title: "Error",
        description: "Failed to add SOP. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAdding(false);
    }
  };
  const getDepartmentColor = (department: string) => {
    switch (department) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'frontdesk':
        return 'bg-green-100 text-green-800';
      case 'housekeeping':
        return 'bg-purple-100 text-purple-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter and search SOPs
  const filteredSOPs = sops.filter(sop => {
    const matchesSearch = sop.title.toLowerCase().includes(searchTerm.toLowerCase()) || sop.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = departmentFilter === 'all' || sop.department === departmentFilter;
    return matchesSearch && matchesDepartment;
  });
  const groupedSOPs = filteredSOPs.reduce((acc, sop) => {
    const dept = sop.department;
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(sop);
    return acc;
  }, {} as Record<string, SOP[]>);

  // SOP Templates
  const sopTemplates = [{
    id: '1',
    title: 'Emergency Response Template',
    department: 'general',
    description: 'Template for emergency procedures'
  }, {
    id: '2',
    title: 'Customer Service Template',
    department: 'frontdesk',
    description: 'Standard customer interaction procedures'
  }, {
    id: '3',
    title: 'Cleaning Protocol Template',
    department: 'housekeeping',
    description: 'Room and facility cleaning standards'
  }, {
    id: '4',
    title: 'Maintenance Checklist Template',
    department: 'maintenance',
    description: 'Equipment inspection and maintenance steps'
  }];
  const handleCreateFromTemplate = (template: any) => {
    setNewSop({
      title: template.title.replace(' Template', ''),
      department: template.department,
      sop_url: ''
    });
    toast({
      title: "Template Applied",
      description: "Form populated with template data. Add your document URL to complete."
    });
  };
  return <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>OS</span>
        <span>/</span>
        <span className="text-foreground">Operations</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Operations Center</h1>
          <p className="text-muted-foreground">
            Monitor performance, manage SOPs, and generate reports
          </p>
        </div>
        <Button onClick={fetchSOPs}>
          <Download className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="sops" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sops">Standard Operating Procedures</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="sops" className="space-y-6">
          {/* SOP Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="card-elegant">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{sops.length}</p>
                    <p className="text-sm text-muted-foreground">Total SOPs</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elegant">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{Object.keys(groupedSOPs).length}</p>
                    <p className="text-sm text-muted-foreground">Departments</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elegant">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">98%</p>
                    <p className="text-sm text-muted-foreground">Compliance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="card-elegant">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold">2.3</p>
                    <p className="text-sm text-muted-foreground">Avg. Updates/Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Bar */}
          <Card className="card-elegant">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search SOPs by title or department..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full sm:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="frontdesk">Front Desk</SelectItem>
                    <SelectItem value="housekeeping">Housekeeping</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">
                      <File className="h-4 w-4 mr-2" />
                      Templates
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>SOP Templates</SheetTitle>
                      <SheetDescription>
                        Pre-built templates to help you create standardized SOPs quickly.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 mt-6">
                      {sopTemplates.map(template => <Card key={template.id} className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{template.title}</h4>
                              <Badge className={getDepartmentColor(template.department)}>
                                {template.department}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{template.description}</p>
                            <Button size="sm" className="w-full" onClick={() => handleCreateFromTemplate(template)}>
                              <Copy className="h-4 w-4 mr-2" />
                              Use Template
                            </Button>
                          </div>
                        </Card>)}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Enhanced SOPs List */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="card-elegant">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle>Standard Operating Procedures</CardTitle>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{filteredSOPs.length} of {sops.length} SOPs</span>
                    </div>
                  </div>
                  <CardDescription>
                    Access and manage SOPs for all departments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="text-muted-foreground mt-4">Loading SOPs...</p>
                    </div> : Object.keys(groupedSOPs).length === 0 ? <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {searchTerm || departmentFilter !== 'all' ? 'No SOPs match your filters' : 'No SOPs available'}
                      </p>
                      {(searchTerm || departmentFilter !== 'all') && <Button variant="link" onClick={() => {
                    setSearchTerm('');
                    setDepartmentFilter('all');
                  }}>
                          Clear filters
                        </Button>}
                    </div> : <div className="space-y-6">
                      {Object.entries(groupedSOPs).map(([department, deptSOPs]) => <div key={department}>
                          <h3 className="text-4xl font-bold mb-6 flex items-center gap-3">
                            <Badge className={getDepartmentColor(department)}>
                              {department.charAt(0).toUpperCase() + department.slice(1)}
                            </Badge>
                            
                          </h3>
                          <div className="grid gap-3">
                            {deptSOPs.map(sop => <Card key={sop.id} className="p-8 hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-4 mb-3">
                                      <h4 className="text-xl font-semibold text-foreground">{sop.title}</h4>
                                      <Star className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <div className="flex items-center gap-8 text-base text-muted-foreground">
                                      <span className="flex items-center gap-3">
                                        <Clock className="h-5 w-5" />
                                        <span className="font-medium">{new Date(sop.created_at).toLocaleDateString()}</span>
                                      </span>
                                      <span className="flex items-center gap-3">
                                        <Eye className="h-5 w-5" />
                                        <span className="font-medium">{Math.floor(Math.random() * 50) + 10} views</span>
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <Button variant="ghost" size="lg" className="h-14 w-14" onClick={() => setSelectedSop(sop)}>
                                      <Eye className="h-6 w-6" />
                                    </Button>
                                    <Button variant="outline" size="lg" className="h-14 px-8" onClick={() => window.open(sop.sop_url, '_blank')}>
                                      <ExternalLink className="h-5 w-5 mr-2" />
                                      <span className="font-medium">Open</span>
                                    </Button>
                                  </div>
                                </div>
                              </Card>)}
                          </div>
                        </div>)}
                    </div>}
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Add SOP Form & Quick Actions */}
            <div className="space-y-6">
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Add New SOP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddSop} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title *</Label>
                      <Input id="title" placeholder="SOP Title" value={newSop.title} onChange={e => setNewSop(prev => ({
                      ...prev,
                      title: e.target.value
                    }))} required />
                    </div>

                    <div>
                      <Label htmlFor="department">Department *</Label>
                      <Select value={newSop.department} onValueChange={value => setNewSop(prev => ({
                      ...prev,
                      department: value
                    }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="frontdesk">Front Desk</SelectItem>
                          <SelectItem value="housekeeping">Housekeeping</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sop_url">Document URL *</Label>
                      <Input id="sop_url" type="url" placeholder="https://docs.company.com/sop" value={newSop.sop_url} onChange={e => setNewSop(prev => ({
                      ...prev,
                      sop_url: e.target.value
                    }))} required />
                    </div>

                    <Button type="submit" className="w-full" disabled={isAdding || !newSop.title || !newSop.department || !newSop.sop_url}>
                      {isAdding ? <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </> : <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add SOP
                        </>}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <Upload className="mr-2 h-4 w-4" />
                    Bulk Import SOPs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="mr-2 h-4 w-4" />
                    Export All SOPs
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Compliance Report
                  </Button>
                </CardContent>
              </Card>

              {/* Department Quick Stats */}
              <Card className="card-elegant">
                <CardHeader>
                  <CardTitle>Department Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['general', 'frontdesk', 'housekeeping', 'maintenance'].map(dept => {
                    const count = sops.filter(sop => sop.department === dept).length;
                    return <div key={dept} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge className={getDepartmentColor(dept)} variant="outline">
                              {dept.charAt(0).toUpperCase() + dept.slice(1)}
                            </Badge>
                          </div>
                          <span className="text-sm font-medium">{count} SOPs</span>
                        </div>;
                  })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="card-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Occupancy Rate</span>
                    <Badge variant="outline">94.2%</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Maintenance Response</span>
                    <Badge variant="outline">2.1 hrs</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Tenant Satisfaction</span>
                    <Badge variant="outline">4.7/5</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Monthly Report
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="mr-2 h-4 w-4" />
                  Update SOPs
                </Button>
              </CardContent>
            </Card>

            <Card className="card-elegant">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">All Systems</span>
                    <Badge className="bg-green-100 text-green-800">Operational</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Last Backup</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
              <CardDescription>
                Generate detailed reports and view analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground mb-4">
                  View comprehensive reports and analytics for your property portfolio.
                </p>
                <Button>View Reports</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Operations Settings</CardTitle>
              <CardDescription>
                Configure operations center preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Customize your operations center settings and preferences.
                </p>
                <Button>Configure Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Operations;