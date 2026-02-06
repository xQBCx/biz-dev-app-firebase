import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Settings, Download, Eye, Mail, Briefcase, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Lead {
  id: string;
  org_name: string;
  contact_name: string;
  email: string;
  phone: string;
  property_count: number;
  notes: string;
  created_at: string;
}

interface JobApplication {
  id: string;
  name: string;
  email: string;
  phone: string;
  cover_letter: string;
  created_at: string;
  job_postings: {
    title: string;
  };
}

interface Inquiry {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

const PublicForms = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      // Fetch leads
      const { data: leadsData } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch job applications with job titles
      const { data: applicationsData } = await supabase
        .from('job_applications')
        .select(`
          *,
          job_postings(title)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch inquiries
      const { data: inquiriesData } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      setLeads(leadsData || []);
      setApplications(applicationsData || []);
      setInquiries(inquiriesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-center text-muted-foreground">Loading forms data...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>OS</span>
        <span>/</span>
        <span>Operations</span>
        <span>/</span>
        <span className="text-foreground">Public Forms</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Public Forms Administration</h1>
          <p className="text-muted-foreground">
            Review and manage submissions from public website forms
          </p>
        </div>
        <Button onClick={fetchAllData}>
          <Download className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Partnership Leads</p>
                <p className="text-2xl font-bold">{leads.length}</p>
              </div>
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Job Applications</p>
                <p className="text-2xl font-bold">{applications.length}</p>
              </div>
              <Briefcase className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contact Inquiries</p>
                <p className="text-2xl font-bold">{inquiries.length}</p>
              </div>
              <MessageCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Forms Data */}
      <Tabs defaultValue="leads" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leads">Partnership Leads ({leads.length})</TabsTrigger>
          <TabsTrigger value="applications">Job Applications ({applications.length})</TabsTrigger>
          <TabsTrigger value="inquiries">Inquiries ({inquiries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="leads">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Partnership Leads</CardTitle>
              <CardDescription>
                Submissions from the "Partner with Us" form
              </CardDescription>
            </CardHeader>
            <CardContent>
              {leads.length === 0 ? (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No partnership leads yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {leads.map((lead) => (
                    <div key={lead.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{lead.org_name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Contact: {lead.contact_name} • {lead.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{lead.property_count} properties</Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(lead.created_at)}
                          </p>
                        </div>
                      </div>
                      
                      {lead.phone && (
                        <p className="text-sm mb-2">
                          <strong>Phone:</strong> {lead.phone}
                        </p>
                      )}
                      
                      {lead.notes && (
                        <div className="bg-muted p-3 rounded text-sm">
                          <strong>Notes:</strong> {lead.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>
                Applications submitted through the careers page
              </CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No job applications yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{application.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            Applied for: {application.job_postings?.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {application.email} • {application.phone}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(application.created_at)}
                        </p>
                      </div>
                      
                      {application.cover_letter && (
                        <div className="bg-muted p-3 rounded text-sm">
                          <strong>Cover Letter:</strong> {application.cover_letter}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inquiries">
          <Card className="card-elegant">
            <CardHeader>
              <CardTitle>Contact Inquiries</CardTitle>
              <CardDescription>
                Messages submitted through the contact form
              </CardDescription>
            </CardHeader>
            <CardContent>
              {inquiries.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No inquiries yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inquiries.map((inquiry) => (
                    <div key={inquiry.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{inquiry.name}</h3>
                          <p className="text-sm text-muted-foreground">{inquiry.email}</p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(inquiry.created_at)}
                        </p>
                      </div>
                      
                      <div className="bg-muted p-3 rounded text-sm">
                        <strong>Message:</strong> {inquiry.message}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublicForms;