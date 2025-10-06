import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Twitter,
  Building2,
  Calendar,
  Target,
  Activity,
  Edit,
  Trash2,
  Plus
} from "lucide-react";
import { toast } from "sonner";

const CRMContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const [contact, setContact] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && id) {
      loadContactData();
    }
  }, [user, id]);

  const loadContactData = async () => {
    if (!user || !id) return;
    setIsLoading(true);

    try {
      // Load contact
      const { data: contactData, error: contactError } = await supabase
        .from("crm_contacts")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (contactError) throw contactError;
      setContact(contactData);

      // Load associated company
      if (contactData.company_id) {
        const { data: companyData } = await supabase
          .from("crm_companies")
          .select("*")
          .eq("id", contactData.company_id)
          .single();
        setCompany(companyData);
      }

      // Load deals
      const { data: dealsData } = await supabase
        .from("crm_deals")
        .select("*")
        .eq("contact_id", id)
        .eq("user_id", user.id);
      setDeals(dealsData || []);

      // Load activities
      const { data: activitiesData } = await supabase
        .from("crm_activities")
        .select("*")
        .eq("contact_id", id)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setActivities(activitiesData || []);

    } catch (error: any) {
      console.error("Error loading contact:", error);
      toast.error("Failed to load contact details");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDataCompleteness = () => {
    if (!contact) return 0;
    const fields = [
      'first_name', 'last_name', 'email', 'phone', 'mobile', 'title',
      'department', 'linkedin_url', 'twitter_url', 'address', 'city',
      'state', 'zip_code', 'country', 'company_id'
    ];
    const filled = fields.filter(field => contact[field] && contact[field] !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this contact?")) return;

    try {
      const { error } = await supabase
        .from("crm_contacts")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Contact deleted successfully");
      navigate("/crm");
    } catch (error: any) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-depth">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading contact details...</div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gradient-depth">
        <Navigation />
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Contact not found</div>
        </div>
      </div>
    );
  }

  const completeness = calculateDataCompleteness();

  return (
    <div className="min-h-screen bg-gradient-depth">
      <Navigation />

      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/crm")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to CRM
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => navigate(`/crm/contacts/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Contact Header Card */}
        <Card className="p-6 mb-6 shadow-elevated border border-border">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-3xl font-bold">
              {contact.first_name[0]}{contact.last_name[0]}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {contact.first_name} {contact.last_name}
                  </h1>
                  {contact.title && (
                    <p className="text-lg text-muted-foreground mb-1">{contact.title}</p>
                  )}
                  {company && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>{company.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Badge variant="secondary">{contact.lead_status}</Badge>
                  <Badge variant="outline">Score: {contact.lead_score}/100</Badge>
                </div>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${contact.email}`} className="text-sm hover:underline">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${contact.phone}`} className="text-sm hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.mobile && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">{contact.mobile}</span>
                  </div>
                )}
                {contact.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-muted-foreground" />
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {contact.twitter_url && (
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-muted-foreground" />
                    <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline">
                      Twitter Profile
                    </a>
                  </div>
                )}
                {(contact.address || contact.city || contact.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {[contact.city, contact.state, contact.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Data Completeness */}
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Profile Completeness</span>
                  <span className="text-sm font-semibold">{completeness}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>

              {/* Tags */}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  {contact.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Tabs Section */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="deals">
              Deals ({deals.length})
            </TabsTrigger>
            <TabsTrigger value="activities">
              Activities ({activities.length})
            </TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card className="p-6 shadow-elevated border border-border">
              <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Personal Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Department</dt>
                      <dd className="text-sm">{contact.department || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Lead Source</dt>
                      <dd className="text-sm">{contact.lead_source || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Created</dt>
                      <dd className="text-sm">{new Date(contact.created_at).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Last Updated</dt>
                      <dd className="text-sm">{new Date(contact.updated_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Address</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm text-muted-foreground">Street Address</dt>
                      <dd className="text-sm">{contact.address || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">City</dt>
                      <dd className="text-sm">{contact.city || "—"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">State / ZIP</dt>
                      <dd className="text-sm">
                        {[contact.state, contact.zip_code].filter(Boolean).join(" ") || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-muted-foreground">Country</dt>
                      <dd className="text-sm">{contact.country || "—"}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              {contact.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-2">Notes</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{contact.notes}</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Deals Tab */}
          <TabsContent value="deals">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Associated Deals</h2>
                <Button size="sm" onClick={() => navigate("/crm/deals/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </div>

              {deals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No deals associated with this contact</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <Card key={deal.id} className="p-4 border border-border hover:shadow-glow transition-all cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold mb-1">{deal.name}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{deal.stage}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="font-semibold">${deal.amount?.toLocaleString()}</span>
                            {deal.expected_close_date && (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(deal.expected_close_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge>{deal.status}</Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities">
            <Card className="p-6 shadow-elevated border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Activity Timeline</h2>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Activity
                </Button>
              </div>

              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activities recorded for this contact</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Activity className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h3 className="font-semibold">{activity.subject}</h3>
                          <Badge variant="outline">{activity.activity_type}</Badge>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{new Date(activity.created_at).toLocaleString()}</span>
                          <Badge variant="secondary" className="text-xs">{activity.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes">
            <Card className="p-6 shadow-elevated border border-border">
              <h2 className="text-xl font-semibold mb-4">Notes & Comments</h2>
              <p className="text-sm text-muted-foreground">Notes functionality coming soon...</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CRMContactDetail;
