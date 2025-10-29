import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Stamp, Trash2, DollarSign, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type Application = {
  id: string;
  application_type: string;
  sub_type: string;
  status: string;
  payment_model: string;
  invention_title?: string;
  mark_text?: string;
  description?: string;
  applicant_name: string;
  applicant_email?: string;
  applicant_address?: string;
  created_at: string;
  uspto_filing_date?: string;
  form_data?: any;
};

const IPApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchApplication();
    }
  }, [id]);

  const fetchApplication = async () => {
    try {
      const { data, error } = await supabase
        .from("ip_applications")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setApplication(data);
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load application",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setDeleting(true);
    try {
      const { error } = await supabase
        .from("ip_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Application deleted successfully",
      });
      navigate("/iplaunch/dashboard");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast({
        title: "Error",
        description: "Failed to delete application",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending_payment":
        return "destructive";
      case "pending_review":
        return "secondary";
      case "filed":
        return "default";
      case "approved":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Application not found</p>
            <Button onClick={() => navigate("/iplaunch/dashboard")}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/iplaunch/dashboard')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your application.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            {application.application_type === "patent" ? (
              <FileText className="h-6 w-6" />
            ) : (
              <Stamp className="h-6 w-6" />
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {application.invention_title || application.mark_text || "Untitled"}
              </h1>
              <p className="text-muted-foreground capitalize">
                {application.application_type} - {application.sub_type}
              </p>
            </div>
          </div>
          <Badge variant={getStatusColor(application.status)}>
            {getStatusLabel(application.status)}
          </Badge>
        </div>

        {application.description && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{application.description}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-3">Application Details</h3>
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Applicant Name</span>
                <span>{application.applicant_name}</span>
              </div>
              {application.applicant_email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{application.applicant_email}</span>
                </div>
              )}
              {application.applicant_address && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Address</span>
                  <span className="text-right max-w-md">{application.applicant_address}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span>{new Date(application.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Payment Model</span>
                <span className="flex items-center gap-1 capitalize">
                  {application.payment_model === "pay" ? (
                    <>
                      <DollarSign className="h-4 w-4" />
                      Standard Fee
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Equity Share
                    </>
                  )}
                </span>
              </div>
              {application.uspto_filing_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">USPTO Filing Date</span>
                  <span>{new Date(application.uspto_filing_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default IPApplicationDetail;
