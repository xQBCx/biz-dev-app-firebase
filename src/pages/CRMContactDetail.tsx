import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
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
  Plus,
  MessageSquare,
  Video,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Star,
  Send,
  Paperclip,
  MoreHorizontal,
  Filter,
  Sparkles,
  DollarSign,
  Users,
  Zap
} from "lucide-react";
import { toast } from "sonner";

const CRMContactDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  
  // Data states
  const [contact, setContact] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [deals, setDeals] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // UI states
  const [activeTab, setActiveTab] = useState("overview");
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [showNoteComposer, setShowNoteComposer] = useState(false);
  const [activityFilter, setActivityFilter] = useState("all");
  const [emailDraft, setEmailDraft] = useState({ subject: "", body: "" });
  const [noteDraft, setNoteDraft] = useState("");

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

  // Calculate relationship health score
  const calculateRelationshipHealth = () => {
    if (!contact) return { score: 0, status: "unknown", color: "gray" };
    
    const lastActivity = activities[0];
    const daysSinceContact = lastActivity 
      ? Math.floor((Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    
    const completeness = calculateDataCompleteness();
    const engagementScore = Math.max(0, 100 - daysSinceContact);
    const dealValue = deals.reduce((sum, d) => sum + (d.amount || 0), 0);
    
    const score = Math.round((completeness * 0.3 + engagementScore * 0.4 + Math.min(dealValue / 1000, 100) * 0.3));
    
    if (score >= 80) return { score, status: "excellent", color: "green" };
    if (score >= 60) return { score, status: "good", color: "blue" };
    if (score >= 40) return { score, status: "fair", color: "yellow" };
    return { score, status: "needs-attention", color: "red" };
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

  const getLastContactInfo = () => {
    if (activities.length === 0) return { text: "Never contacted", urgency: "high", days: 999 };
    const lastActivity = activities[0];
    const days = Math.floor((Date.now() - new Date(lastActivity.created_at).getTime()) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return { text: "Today", urgency: "low", days };
    if (days === 1) return { text: "Yesterday", urgency: "low", days };
    if (days < 7) return { text: `${days} days ago`, urgency: "low", days };
    if (days < 14) return { text: `${days} days ago`, urgency: "medium", days };
    return { text: `${days} days ago`, urgency: "high", days };
  };

  const sendEmail = async () => {
    if (!emailDraft.subject || !emailDraft.body) {
      toast.error("Please fill in both subject and body");
      return;
    }
    
    try {
      await supabase.from("crm_activities").insert({
        user_id: user?.id,
        contact_id: id,
        activity_type: "email",
        subject: emailDraft.subject,
        description: emailDraft.body,
        status: "completed",
        completed_at: new Date().toISOString()
      });
      
      toast.success("Email logged successfully");
      setEmailDraft({ subject: "", body: "" });
      setShowEmailComposer(false);
      loadContactData();
    } catch (error) {
      console.error("Error logging email:", error);
      toast.error("Failed to log email");
    }
  };

  const saveNote = async () => {
    if (!noteDraft.trim()) {
      toast.error("Note cannot be empty");
      return;
    }
    
    try {
      await supabase.from("crm_activities").insert({
        user_id: user?.id,
        contact_id: id,
        activity_type: "note",
        subject: "Note",
        description: noteDraft,
        status: "completed",
        completed_at: new Date().toISOString()
      });
      
      toast.success("Note saved successfully");
      setNoteDraft("");
      setShowNoteComposer(false);
      loadContactData();
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note");
    }
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
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Loading contact details...</div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gradient-depth">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center">Contact not found</div>
        </div>
      </div>
    );
  }

  const relationshipHealth = calculateRelationshipHealth();
  const lastContact = getLastContactInfo();
  const completeness = calculateDataCompleteness();

  const filteredActivities = activities.filter(a => {
    if (activityFilter === "all") return true;
    return a.activity_type === activityFilter;
  });

  const aiSuggestions = [
    { icon: Mail, text: lastContact.days > 7 ? "Send follow-up email" : "Schedule next meeting", action: () => setShowEmailComposer(true) },
    { icon: Phone, text: "Make a call", action: () => window.location.href = `tel:${contact?.phone}` },
    { icon: Target, text: deals.length === 0 ? "Create new deal" : "Update deal status", action: () => navigate("/crm/deals/new") }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-depth">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading contact details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="min-h-screen bg-gradient-depth">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <Card className="p-12 text-center">
            <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Contact Not Found</h2>
            <p className="text-muted-foreground mb-6">This contact may have been deleted or doesn't exist.</p>
            <Button onClick={() => navigate("/crm")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to CRM
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-depth">

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {/* Mobile-optimized Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"}
            onClick={() => navigate("/crm")}
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to CRM
          </Button>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size={isMobile ? "sm" : "default"}
              onClick={() => navigate(`/crm/contacts/${id}/edit`)}
            >
              <Edit className="w-4 h-4 md:mr-2" />
              {!isMobile && "Edit"}
            </Button>
            <Button 
              variant="destructive" 
              size={isMobile ? "sm" : "default"}
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 md:mr-2" />
              {!isMobile && "Delete"}
            </Button>
          </div>
        </div>

        {/* Hero Contact Card - F-Pattern Optimized */}
        <Card className="p-4 md:p-6 mb-4 md:mb-6 shadow-elevated border border-border">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            {/* Left: Avatar & Primary Info */}
            <div className="flex items-start gap-4 md:block md:text-center">
              <div className="relative">
                <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground text-2xl md:text-3xl font-bold">
                  {contact.first_name[0]}{contact.last_name[0]}
                </div>
                {/* Relationship Health Indicator */}
                <div className={`absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 rounded-full border-4 border-background flex items-center justify-center
                  ${relationshipHealth.color === 'green' ? 'bg-green-500' : 
                    relationshipHealth.color === 'blue' ? 'bg-blue-500' :
                    relationshipHealth.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'}`}
                >
                  {relationshipHealth.score >= 80 ? (
                    <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  ) : (
                    <AlertCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  )}
                </div>
              </div>
              <div className="md:hidden flex-1">
                <h1 className="text-xl font-bold">
                  {contact.first_name} {contact.last_name}
                </h1>
                {contact.title && (
                  <p className="text-sm text-muted-foreground">{contact.title}</p>
                )}
              </div>
            </div>

            {/* Center: Details & Status */}
            <div className="flex-1">
              <div className="hidden md:block mb-4">
                <h1 className="text-2xl md:text-3xl font-bold mb-1">
                  {contact.first_name} {contact.last_name}
                </h1>
                {contact.title && (
                  <p className="text-base md:text-lg text-muted-foreground">{contact.title}</p>
                )}
                {company && (
                  <div className="flex items-center gap-2 text-muted-foreground mt-2">
                    <Building2 className="w-4 h-4" />
                    <span className="text-sm">{company.name}</span>
                  </div>
                )}
              </div>

              {/* Quick Contact Actions - Prominent CTA */}
              <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 mb-4">
                <Button 
                  size={isMobile ? "sm" : "default"}
                  onClick={() => setShowEmailComposer(true)}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </Button>
                <Button 
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => window.location.href = `tel:${contact.phone}`}
                  disabled={!contact.phone}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call
                </Button>
                <Button 
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                  onClick={() => setShowNoteComposer(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Note
                </Button>
                <Button 
                  variant="outline"
                  size={isMobile ? "sm" : "default"}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>

              {/* Contact Info Grid - Scannable */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${contact.email}`} className="hover:underline truncate">
                      {contact.email}
                    </a>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${contact.phone}`} className="hover:underline">
                      {contact.phone}
                    </a>
                  </div>
                )}
                {contact.linkedin_url && (
                  <div className="flex items-center gap-2">
                    <Linkedin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      LinkedIn
                    </a>
                  </div>
                )}
                {contact.twitter_url && (
                  <div className="flex items-center gap-2">
                    <Twitter className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a href={contact.twitter_url} target="_blank" rel="noopener noreferrer" className="hover:underline truncate">
                      Twitter
                    </a>
                  </div>
                )}
                {(contact.city || contact.state) && (
                  <div className="flex items-center gap-2 col-span-full">
                    <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="truncate">
                      {[contact.city, contact.state, contact.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Key Metrics - Visual Hierarchy */}
            <div className="flex md:flex-col gap-4 md:gap-3 md:min-w-[200px]">
              {/* Relationship Health */}
              <Card className="flex-1 md:flex-none p-3 md:p-4 border-border">
                <div className="flex md:flex-col items-center md:items-start gap-2">
                  <div className="flex items-center gap-2 flex-1 md:w-full">
                    <Star className={`w-5 h-5 ${
                      relationshipHealth.color === 'green' ? 'text-green-500 fill-green-500' :
                      relationshipHealth.color === 'blue' ? 'text-blue-500 fill-blue-500' :
                      relationshipHealth.color === 'yellow' ? 'text-yellow-500 fill-yellow-500' : 
                      'text-red-500 fill-red-500'
                    }`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Health</p>
                      <p className="text-lg md:text-2xl font-bold">{relationshipHealth.score}</p>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${
                      relationshipHealth.color === 'green' ? 'border-green-500 text-green-500' :
                      relationshipHealth.color === 'blue' ? 'border-blue-500 text-blue-500' :
                      relationshipHealth.color === 'yellow' ? 'border-yellow-500 text-yellow-500' :
                      'border-red-500 text-red-500'
                    }`}
                  >
                    {relationshipHealth.status}
                  </Badge>
                </div>
              </Card>

              {/* Last Contact - Urgency Indicator */}
              <Card className="flex-1 md:flex-none p-3 md:p-4 border-border">
                <div className="flex md:flex-col items-center md:items-start gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Clock className={`w-5 h-5 ${
                      lastContact.urgency === 'high' ? 'text-red-500' :
                      lastContact.urgency === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`} />
                    <div>
                      <p className="text-xs text-muted-foreground">Last Contact</p>
                      <p className="text-sm md:text-base font-semibold">{lastContact.text}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Lead Score */}
              <Card className="flex-1 md:flex-none p-3 md:p-4 border-border">
                <div className="flex md:flex-col items-center md:items-start gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Lead Score</p>
                    <p className="text-lg md:text-2xl font-bold">{contact.lead_score}/100</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">{contact.lead_status}</Badge>
                </div>
              </Card>
            </div>
          </div>

          {/* Tags & Completeness Bar */}
          <Separator className="my-4" />
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap">
              {contact.tags && contact.tags.length > 0 && contact.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
              {(!contact.tags || contact.tags.length === 0) && (
                <Badge variant="outline" className="text-xs text-muted-foreground">No tags</Badge>
              )}
            </div>

            {/* Profile Completeness */}
            <div className="flex items-center gap-3 min-w-[200px]">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Profile</span>
                  <span className="text-xs font-semibold">{completeness}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all ${
                      completeness >= 80 ? 'bg-green-500' :
                      completeness >= 60 ? 'bg-blue-500' :
                      completeness >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* AI Suggestions - Psychology: Actionable guidance reduces decision fatigue */}
        <Card className="p-4 md:p-6 mb-4 md:mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">AI-Suggested Actions</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiSuggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="justify-start h-auto py-3 hover:bg-background/80"
                onClick={suggestion.action}
              >
                <suggestion.icon className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="text-sm text-left">{suggestion.text}</span>
              </Button>
            ))}
          </div>
        </Card>

        {/* Email Composer - Progressive Disclosure */}
        {showEmailComposer && (
          <Card className="p-4 md:p-6 mb-4 md:mb-6 border-primary">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Compose Email</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowEmailComposer(false)}
              >
                Cancel
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">To: {contact.email}</label>
              </div>
              <Input
                placeholder="Subject"
                value={emailDraft.subject}
                onChange={(e) => setEmailDraft({ ...emailDraft, subject: e.target.value })}
              />
              <Textarea
                placeholder="Write your message..."
                value={emailDraft.body}
                onChange={(e) => setEmailDraft({ ...emailDraft, body: e.target.value })}
                className="min-h-[150px]"
              />
              <div className="flex items-center justify-between">
                <Button variant="outline" size="sm">
                  <Paperclip className="w-4 h-4 mr-2" />
                  Attach
                </Button>
                <Button onClick={sendEmail}>
                  <Send className="w-4 h-4 mr-2" />
                  Send & Log
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Note Composer */}
        {showNoteComposer && (
          <Card className="p-4 md:p-6 mb-4 md:mb-6 border-primary">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Add Note</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowNoteComposer(false)}
              >
                Cancel
              </Button>
            </div>
            <div className="space-y-3">
              <Textarea
                placeholder="Add your note here..."
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                className="min-h-[100px]"
              />
              <div className="flex justify-end">
                <Button onClick={saveNote}>
                  <Send className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Responsive Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 md:space-y-6">
          <TabsList className="grid grid-cols-4 w-full md:w-auto md:inline-flex">
            <TabsTrigger value="overview" className="text-xs md:text-sm">
              <Activity className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="deals" className="text-xs md:text-sm">
              <Target className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Deals</span>
              <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">{deals.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="activities" className="text-xs md:text-sm">
              <Clock className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Activity</span>
              <Badge variant="secondary" className="ml-1 md:ml-2 text-xs">{activities.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="details" className="text-xs md:text-sm">
              <Users className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">Details</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab - NEW */}
          <TabsContent value="overview" className="space-y-4">
            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-primary" />
                  <p className="text-xs text-muted-foreground">Open Deals</p>
                </div>
                <p className="text-2xl font-bold">{deals.filter(d => d.status === 'open').length}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <p className="text-xs text-muted-foreground">Deal Value</p>
                </div>
                <p className="text-2xl font-bold">
                  ${(deals.reduce((sum, d) => sum + (d.amount || 0), 0) / 1000).toFixed(1)}K
                </p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Activities</p>
                </div>
                <p className="text-2xl font-bold">{activities.length}</p>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
                <p className="text-2xl font-bold">{relationshipHealth.score}</p>
              </Card>
            </div>

            {/* Recent Activity Timeline */}
            <Card className="p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              {activities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No activities yet. Start by sending an email or logging a call.</p>
                  <Button 
                    size="sm" 
                    className="mt-4"
                    onClick={() => setShowEmailComposer(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Log First Activity
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4">
                    {activities.slice(0, 10).map((activity, idx) => (
                      <div key={activity.id} className="flex gap-3 pb-4 border-b border-border last:border-0">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.activity_type === 'email' ? 'bg-blue-500/10 text-blue-500' :
                          activity.activity_type === 'call' ? 'bg-green-500/10 text-green-500' :
                          activity.activity_type === 'meeting' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {activity.activity_type === 'email' ? <Mail className="w-4 h-4" /> :
                           activity.activity_type === 'call' ? <Phone className="w-4 h-4" /> :
                           activity.activity_type === 'meeting' ? <Video className="w-4 h-4" /> :
                           <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">{activity.subject}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </TabsContent>

          {/* Deals Tab - Enhanced */}
          <TabsContent value="deals">
            <Card className="p-4 md:p-6 shadow-elevated border border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold">Associated Deals</h2>
                <Button size="sm" onClick={() => navigate("/crm/deals/new")}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Deal
                </Button>
              </div>

              {deals.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="font-semibold mb-2">No deals yet</h3>
                  <p className="text-sm mb-6">Create a deal to track opportunities with this contact</p>
                  <Button onClick={() => navigate("/crm/deals/new")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Deal
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {deals.map((deal) => (
                    <Card key={deal.id} className="p-4 border border-border hover:shadow-glow transition-all cursor-pointer">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold truncate">{deal.name}</h3>
                            <Badge variant="outline" className="text-xs">{deal.stage}</Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="font-semibold text-green-600">
                              ${deal.amount?.toLocaleString()}
                            </span>
                            {deal.probability > 0 && (
                              <span className="text-muted-foreground">{deal.probability}% chance</span>
                            )}
                            {deal.expected_close_date && (
                              <span className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(deal.expected_close_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <Badge className={
                          deal.status === 'won' ? 'bg-green-500' :
                          deal.status === 'lost' ? 'bg-red-500' :
                          deal.status === 'open' ? 'bg-blue-500' : ''
                        }>
                          {deal.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Activities Tab - Enhanced with Filters */}
          <TabsContent value="activities">
            <Card className="p-4 md:p-6 shadow-elevated border border-border">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg md:text-xl font-semibold">Activity Timeline</h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {['all', 'email', 'call', 'meeting', 'note'].map((filter) => (
                      <Button
                        key={filter}
                        variant={activityFilter === filter ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActivityFilter(filter)}
                        className="text-xs"
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </Button>
                    ))}
                  </div>
                  <Button size="sm" onClick={() => setShowNoteComposer(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log
                  </Button>
                </div>
              </div>

              {filteredActivities.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <h3 className="font-semibold mb-2">No {activityFilter !== 'all' ? activityFilter : ''} activities</h3>
                  <p className="text-sm mb-6">Start tracking your interactions</p>
                  <Button onClick={() => setShowEmailComposer(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Log Activity
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[500px] pr-4">
                  <div className="space-y-4">
                    {filteredActivities.map((activity) => (
                      <div key={activity.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          activity.activity_type === 'email' ? 'bg-blue-500/10 text-blue-500' :
                          activity.activity_type === 'call' ? 'bg-green-500/10 text-green-500' :
                          activity.activity_type === 'meeting' ? 'bg-purple-500/10 text-purple-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {activity.activity_type === 'email' ? <Mail className="w-5 h-5" /> :
                           activity.activity_type === 'call' ? <Phone className="w-5 h-5" /> :
                           activity.activity_type === 'meeting' ? <Video className="w-5 h-5" /> :
                           <MessageSquare className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm md:text-base truncate">{activity.subject}</h3>
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.created_at).toLocaleString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{activity.activity_type}</Badge>
                              <Badge variant="secondary" className="text-xs">{activity.status}</Badge>
                            </div>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details">
            <Card className="p-4 md:p-6 shadow-elevated border border-border">
              <h2 className="text-lg md:text-xl font-semibold mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Personal Details
                  </h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-muted-foreground mb-1">Full Name</dt>
                      <dd className="text-sm font-medium">{contact.first_name} {contact.last_name}</dd>
                    </div>
                    {contact.title && (
                      <div>
                        <dt className="text-xs text-muted-foreground mb-1">Job Title</dt>
                        <dd className="text-sm">{contact.title}</dd>
                      </div>
                    )}
                    {contact.department && (
                      <div>
                        <dt className="text-xs text-muted-foreground mb-1">Department</dt>
                        <dd className="text-sm">{contact.department}</dd>
                      </div>
                    )}
                    {contact.lead_source && (
                      <div>
                        <dt className="text-xs text-muted-foreground mb-1">Lead Source</dt>
                        <dd className="text-sm capitalize">{contact.lead_source}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-xs text-muted-foreground mb-1">Created</dt>
                      <dd className="text-sm">{new Date(contact.created_at).toLocaleDateString()}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-muted-foreground mb-1">Last Updated</dt>
                      <dd className="text-sm">{new Date(contact.updated_at).toLocaleDateString()}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Location & Address
                  </h3>
                  <dl className="space-y-3">
                    {contact.address && (
                      <div>
                        <dt className="text-xs text-muted-foreground mb-1">Street Address</dt>
                        <dd className="text-sm">{contact.address}</dd>
                      </div>
                    )}
                    {contact.city && (
                      <div>
                        <dt className="text-xs text-muted-foreground mb-1">City</dt>
                        <dd className="text-sm">{contact.city}</dd>
                      </div>
                    )}
                    {(contact.state || contact.zip_code) && (
                      <div>
                        <dt className="text-xs text-muted-foreground mb-1">State / ZIP</dt>
                        <dd className="text-sm">
                          {[contact.state, contact.zip_code].filter(Boolean).join(" ") || "—"}
                        </dd>
                      </div>
                    )}
                    {contact.country && (
                      <div>
                        <dt className="text-xs text-muted-foreground mb-1">Country</dt>
                        <dd className="text-sm">{contact.country}</dd>
                      </div>
                    )}
                    {!contact.address && !contact.city && !contact.state && !contact.country && (
                      <p className="text-sm text-muted-foreground">No address information available</p>
                    )}
                  </dl>
                </div>
              </div>

              {contact.notes && (
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Internal Notes
                  </h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/30 p-4 rounded-lg">
                    {contact.notes}
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CRMContactDetail;
