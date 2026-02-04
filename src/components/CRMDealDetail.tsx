import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DealDocumentUpload } from "@/components/DealDocumentUpload";
import { DealTaskManager } from "@/components/DealTaskManager";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, DollarSign, Calendar, TrendingUp, FileText, Building2, User, Repeat, Percent } from "lucide-react";

interface Deal {
  id: string;
  name: string;
  amount?: number;
  stage: string;
  probability?: number;
  expected_close_date?: string;
  deal_type?: string;
  description?: string;
  created_at: string;
  company_id?: string;
  contact_id?: string;
  recurring_revenue?: number;
  recurring_type?: string;
  commission_rate?: number;
  upfront_amount?: number;
}

interface CRMDealDetailProps {
  dealId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

export const CRMDealDetail = ({ dealId, onEdit, onBack }: CRMDealDetailProps) => {
  const navigate = useNavigate();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [documents, setDocuments] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [company, setCompany] = useState<any>(null);
  const [contact, setContact] = useState<any>(null);

  useEffect(() => {
    loadDeal();
    loadDocuments();
    loadTasks();
    loadActivities();
  }, [dealId]);

  const loadDeal = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_deals")
        .select("*")
        .eq("id", dealId)
        .single();

      if (error) throw error;
      setDeal(data);

      // Load related company and contact if they exist
      if (data.company_id) {
        const { data: companyData } = await supabase
          .from("crm_companies")
          .select("*")
          .eq("id", data.company_id)
          .single();
        setCompany(companyData);
      }

      if (data.contact_id) {
        const { data: contactData } = await supabase
          .from("crm_contacts")
          .select("*")
          .eq("id", data.contact_id)
          .single();
        setContact(contactData);
      }
    } catch (error) {
      console.error("Error loading deal:", error);
      toast.error("Failed to load deal");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_deal_documents")
        .select("*")
        .eq("deal_id", dealId)
        .order("uploaded_at", { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error loading documents:", error);
    }
  };

  const loadTasks = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_deal_tasks")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_activities")
        .select("*")
        .eq("deal_id", dealId)
        .order("activity_date", { ascending: false });

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error loading activities:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const { error } = await supabase
        .from("crm_deals")
        .delete()
        .eq("id", dealId);

      if (error) throw error;

      toast.success("Deal deleted successfully");
      if (onBack) onBack();
      else navigate("/crm");
    } catch (error) {
      console.error("Error deleting deal:", error);
      toast.error("Failed to delete deal");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!deal) {
    return <div className="text-center p-8">Deal not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack || (() => navigate("/crm"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          <TabsTrigger value="documents">Documents ({documents.length})</TabsTrigger>
          <TabsTrigger value="activities">Activities ({activities.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h2 className="text-3xl font-bold mb-6">{deal.name}</h2>

            {/* Customer Information */}
            {(company || contact) && (
              <div className="mb-6 pb-6 border-b">
                <h3 className="font-semibold mb-3">Customer</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {company && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Company</p>
                        <p className="font-medium">{company.name}</p>
                      </div>
                    </div>
                  )}
                  {contact && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Contact</p>
                        <p className="font-medium">{contact.first_name} {contact.last_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                {deal.amount && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">One-Time Amount</p>
                      <p className="text-2xl font-bold text-green-600">
                        ${deal.amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {deal.upfront_amount && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Upfront SPIFF</p>
                      <p className="text-xl font-bold text-blue-600">
                        ${deal.upfront_amount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Stage</p>
                    <p className="font-medium capitalize">{deal.stage.replace('_', ' ')}</p>
                  </div>
                </div>

                {deal.probability !== undefined && (
                  <div className="flex items-start gap-3">
                    <Percent className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Win Probability</p>
                      <p className="font-medium">{deal.probability}%</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {deal.recurring_revenue && (
                  <div className="flex items-start gap-3">
                    <Repeat className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {deal.recurring_type ? `${deal.recurring_type.charAt(0).toUpperCase() + deal.recurring_type.slice(1)} Revenue` : 'Recurring Revenue'}
                      </p>
                      <p className="text-xl font-bold text-purple-600">
                        ${deal.recurring_revenue.toLocaleString()}/{deal.recurring_type === 'annual' ? 'yr' : deal.recurring_type === 'quarterly' ? 'qtr' : 'mo'}
                      </p>
                    </div>
                  </div>
                )}

                {deal.commission_rate && (
                  <div className="flex items-start gap-3">
                    <Percent className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Commission Rate</p>
                      <p className="font-medium">{deal.commission_rate}%</p>
                      {deal.recurring_revenue && (
                        <p className="text-sm text-muted-foreground">
                          ${((deal.recurring_revenue * deal.commission_rate) / 100).toFixed(2)}/mo
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {deal.expected_close_date && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Close Date</p>
                      <p className="font-medium">
                        {new Date(deal.expected_close_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {deal.deal_type && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Deal Type</p>
                      <p className="font-medium">{deal.deal_type}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {deal.description && (
              <div className="pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-2">Description</p>
                <p className="whitespace-pre-wrap">{deal.description}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-muted-foreground">
                Created: {new Date(deal.created_at).toLocaleDateString()}
              </p>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <DealTaskManager dealId={dealId} tasks={tasks} onTasksChange={loadTasks} />
        </TabsContent>

        <TabsContent value="documents">
          <DealDocumentUpload dealId={dealId} documents={documents} onDocumentsChange={loadDocuments} />
        </TabsContent>

        <TabsContent value="activities">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Activities</h3>
            {activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No activities logged yet. Activities from your Dashboard will appear here when linked to this deal.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div key={activity.id} className="p-4 border border-border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{activity.activity_type}</h4>
                      <p className="text-sm text-muted-foreground">
                        {new Date(activity.activity_date).toLocaleDateString()}
                      </p>
                    </div>
                    {activity.notes && (
                      <p className="text-sm text-muted-foreground">{activity.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
