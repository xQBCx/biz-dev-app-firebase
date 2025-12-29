import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Link, Users, Building2, Briefcase, Plus } from "lucide-react";

interface CRMIntegrationPanelProps {
  dealRoomId: string;
  isAdmin: boolean;
}

export const CRMIntegrationPanel = ({ dealRoomId, isAdmin }: CRMIntegrationPanelProps) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [dealRoomId]);

  const fetchData = async () => {
    try {
      const [contactsRes, companiesRes, dealsRes] = await Promise.all([
        supabase.from("crm_contacts").select("id, first_name, last_name, email").limit(10),
        supabase.from("crm_companies").select("id, name").limit(10),
        supabase.from("crm_deals").select("id, name").limit(10),
      ]);
      setContacts(contactsRes.data || []);
      setCompanies(companiesRes.data || []);
      setDeals(dealsRes.data || []);
    } catch (error) {
      console.error("Error fetching CRM data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Card className="p-6"><div className="animate-pulse h-32 bg-muted rounded" /></Card>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Link className="w-5 h-5 text-primary" />
          CRM Integration
        </h2>
        <p className="text-sm text-muted-foreground">Link deal room to CRM entities</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Contacts ({contacts.length})</h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {contacts.slice(0, 5).map((c) => (
              <div key={c.id} className="text-sm p-2 bg-muted rounded">
                {c.first_name} {c.last_name}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Companies ({companies.length})</h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {companies.slice(0, 5).map((c) => (
              <div key={c.id} className="text-sm p-2 bg-muted rounded">{c.name}</div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Briefcase className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Deals ({deals.length})</h3>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {deals.slice(0, 5).map((d) => (
              <div key={d.id} className="text-sm p-2 bg-muted rounded">{d.name}</div>
            ))}
          </div>
        </Card>
      </div>

      <p className="text-sm text-muted-foreground">
        CRM linking enables tracking contributions and settlements against existing contacts, companies, and deals.
      </p>
    </div>
  );
};
