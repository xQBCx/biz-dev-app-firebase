import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Search, Building2, Car, Home, Briefcase, Trophy, Phone, Mail, MapPin } from "lucide-react";
import { useSearchParams } from "react-router-dom";

type LeadType = 'office_building' | 'golf_course' | 'high_income_neighborhood' | 'dealership_small' | 'dealership_luxury' | 'fleet_company';
type LeadStatus = 'new' | 'contacted' | 'interested' | 'negotiating' | 'converted' | 'declined';

interface Lead {
  id: string;
  lead_type: LeadType;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  status: LeadStatus;
  notes: string | null;
  fleet_size: number | null;
  estimated_income: number | null;
  created_at: string;
}

const leadTypeLabels: Record<LeadType, string> = {
  office_building: "Office Building",
  golf_course: "Golf Course",
  high_income_neighborhood: "High-Income Neighborhood",
  dealership_small: "Small/Medium Dealership",
  dealership_luxury: "Luxury Dealership",
  fleet_company: "Fleet Company"
};

const leadTypeIcons: Record<LeadType, React.ElementType> = {
  office_building: Building2,
  golf_course: Trophy,
  high_income_neighborhood: Home,
  dealership_small: Car,
  dealership_luxury: Car,
  fleet_company: Briefcase
};

const statusColors: Record<LeadStatus, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  interested: "bg-green-100 text-green-800",
  negotiating: "bg-purple-100 text-purple-800",
  converted: "bg-emerald-100 text-emerald-800",
  declined: "bg-red-100 text-red-800"
};

export default function AdminLeads() {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') as LeadType | null;
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<LeadType | "all">(initialType || "all");
  const [filterStatus, setFilterStatus] = useState<LeadStatus | "all">("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    lead_type: initialType || "office_building" as LeadType,
    business_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    city: "Houston",
    notes: "",
    fleet_size: "",
    estimated_income: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, [filterType, filterStatus]);

  const fetchLeads = async () => {
    setLoading(true);
    let query = supabase.from('marketing_leads').select('*').order('created_at', { ascending: false });
    
    if (filterType !== "all") {
      query = query.eq('lead_type', filterType);
    }
    if (filterStatus !== "all") {
      query = query.eq('status', filterStatus);
    }

    const { data, error } = await query;
    
    if (error) {
      toast({ title: "Error", description: "Failed to fetch leads", variant: "destructive" });
    } else {
      setLeads(data || []);
    }
    setLoading(false);
  };

  const handleAddLead = async () => {
    const { error } = await supabase.from('marketing_leads').insert({
      lead_type: newLead.lead_type as LeadType,
      business_name: newLead.business_name,
      contact_name: newLead.contact_name || null,
      email: newLead.email || null,
      phone: newLead.phone || null,
      address: newLead.address || null,
      city: newLead.city || "Houston",
      notes: newLead.notes || null,
      fleet_size: newLead.fleet_size ? parseInt(newLead.fleet_size) : null,
      estimated_income: newLead.estimated_income ? parseInt(newLead.estimated_income) : null
    });

    if (error) {
      toast({ title: "Error", description: "Failed to add lead", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Lead added successfully" });
      setIsAddDialogOpen(false);
      setNewLead({
        lead_type: "office_building",
        business_name: "",
        contact_name: "",
        email: "",
        phone: "",
        address: "",
        city: "Houston",
        notes: "",
        fleet_size: "",
        estimated_income: ""
      });
      fetchLeads();
    }
  };

  const updateLeadStatus = async (leadId: string, newStatus: LeadStatus) => {
    const { error } = await supabase
      .from('marketing_leads')
      .update({ status: newStatus })
      .eq('id', leadId);

    if (error) {
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Status updated" });
      fetchLeads();
    }
  };

  const filteredLeads = leads.filter(lead => 
    lead.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Generation</h1>
          <p className="text-muted-foreground">Build and manage your prospect database</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" /> Add Lead</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
              <DialogDescription>Add a prospect to your marketing database</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lead Type</Label>
                  <Select value={newLead.lead_type} onValueChange={(v) => setNewLead({...newLead, lead_type: v as LeadType})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(leadTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Business Name *</Label>
                  <Input 
                    value={newLead.business_name} 
                    onChange={(e) => setNewLead({...newLead, business_name: e.target.value})}
                    placeholder="Company name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name</Label>
                  <Input 
                    value={newLead.contact_name} 
                    onChange={(e) => setNewLead({...newLead, contact_name: e.target.value})}
                    placeholder="Decision maker name"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    value={newLead.email} 
                    onChange={(e) => setNewLead({...newLead, email: e.target.value})}
                    placeholder="contact@company.com"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input 
                    value={newLead.phone} 
                    onChange={(e) => setNewLead({...newLead, phone: e.target.value})}
                    placeholder="(713) 555-0123"
                  />
                </div>
                <div>
                  <Label>City</Label>
                  <Input 
                    value={newLead.city} 
                    onChange={(e) => setNewLead({...newLead, city: e.target.value})}
                    placeholder="Houston"
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input 
                  value={newLead.address} 
                  onChange={(e) => setNewLead({...newLead, address: e.target.value})}
                  placeholder="Street address"
                />
              </div>
              {(newLead.lead_type === "fleet_company" || newLead.lead_type.includes("dealership")) && (
                <div>
                  <Label>Fleet Size / Vehicle Count</Label>
                  <Input 
                    type="number"
                    value={newLead.fleet_size} 
                    onChange={(e) => setNewLead({...newLead, fleet_size: e.target.value})}
                    placeholder="Number of vehicles"
                  />
                </div>
              )}
              {newLead.lead_type === "high_income_neighborhood" && (
                <div>
                  <Label>Est. Household Income ($)</Label>
                  <Input 
                    type="number"
                    value={newLead.estimated_income} 
                    onChange={(e) => setNewLead({...newLead, estimated_income: e.target.value})}
                    placeholder="200000"
                  />
                </div>
              )}
              <div>
                <Label>Notes</Label>
                <Textarea 
                  value={newLead.notes} 
                  onChange={(e) => setNewLead({...newLead, notes: e.target.value})}
                  placeholder="Additional information about this lead..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleAddLead} disabled={!newLead.business_name}>Add Lead</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search leads..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterType} onValueChange={(v) => setFilterType(v as LeadType | "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {Object.entries(leadTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as LeadStatus | "all")}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="interested">Interested</SelectItem>
                <SelectItem value="negotiating">Negotiating</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({filteredLeads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : filteredLeads.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No leads found. Add your first lead to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => {
                  const Icon = leadTypeIcons[lead.lead_type];
                  return (
                    <TableRow key={lead.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{leadTypeLabels[lead.lead_type]}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{lead.business_name}</div>
                        {lead.fleet_size && (
                          <div className="text-xs text-muted-foreground">{lead.fleet_size} vehicles</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.contact_name && <div className="text-sm">{lead.contact_name}</div>}
                          {lead.email && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Mail className="h-3 w-3" /> {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" /> {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {lead.city && (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3" /> {lead.city}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[lead.status]}>
                          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select value={lead.status} onValueChange={(v) => updateLeadStatus(lead.id, v as LeadStatus)}>
                          <SelectTrigger className="w-[130px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="contacted">Contacted</SelectItem>
                            <SelectItem value="interested">Interested</SelectItem>
                            <SelectItem value="negotiating">Negotiating</SelectItem>
                            <SelectItem value="converted">Converted</SelectItem>
                            <SelectItem value="declined">Declined</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
