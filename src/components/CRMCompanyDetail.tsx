import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Edit, Trash2, Globe, Mail, Phone, MapPin, Users, DollarSign } from "lucide-react";

interface Company {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  employee_count?: number;
  annual_revenue?: number;
  description?: string;
  created_at: string;
}

interface CRMCompanyDetailProps {
  companyId: string;
  onEdit?: () => void;
  onBack?: () => void;
}

export const CRMCompanyDetail = ({ companyId, onEdit, onBack }: CRMCompanyDetailProps) => {
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompany();
  }, [companyId]);

  const loadCompany = async () => {
    try {
      const { data, error } = await supabase
        .from("crm_companies")
        .select("*")
        .eq("id", companyId)
        .single();

      if (error) throw error;
      setCompany(data);
    } catch (error) {
      console.error("Error loading company:", error);
      toast.error("Failed to load company");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this company?")) return;

    try {
      const { error } = await supabase
        .from("crm_companies")
        .delete()
        .eq("id", companyId);

      if (error) throw error;

      toast.success("Company deleted successfully");
      if (onBack) onBack();
      else navigate("/crm");
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error("Failed to delete company");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  if (!company) {
    return <div className="text-center p-8">Company not found</div>;
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

      <Card className="p-6">
        <h2 className="text-3xl font-bold mb-2">{company.name}</h2>
        {company.industry && (
          <p className="text-muted-foreground mb-6">{company.industry}</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            {company.website && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {company.website}
                  </a>
                </div>
              </div>
            )}

            {company.email && (
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{company.email}</p>
                </div>
              </div>
            )}

            {company.phone && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{company.phone}</p>
                </div>
              </div>
            )}

            {(company.address || company.city) && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium">
                    {company.address && <>{company.address}<br /></>}
                    {company.city && company.state && `${company.city}, ${company.state} ${company.zip_code || ''}`}
                    {company.country && <><br />{company.country}</>}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {company.employee_count && (
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-medium">{company.employee_count.toLocaleString()}</p>
                </div>
              </div>
            )}

            {company.annual_revenue && (
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Annual Revenue</p>
                  <p className="font-medium">${company.annual_revenue.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {company.description && (
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="whitespace-pre-wrap">{company.description}</p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t">
          <p className="text-sm text-muted-foreground">
            Created: {new Date(company.created_at).toLocaleDateString()}
          </p>
        </div>
      </Card>
    </div>
  );
};
