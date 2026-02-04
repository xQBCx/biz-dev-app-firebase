import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Building2 } from "lucide-react";

interface CompanySelectorProps {
  selectedIds: string[];
  onSelect: (ids: string[]) => void;
  onClose: () => void;
}

interface BizCompany {
  id: string;
  name: string;
  role: string;
  parent_group: string | null;
}

export const CompanySelector = ({
  selectedIds,
  onSelect,
  onClose,
}: CompanySelectorProps) => {
  const { user } = useAuth();

  const { data: companies, isLoading } = useQuery({
    queryKey: ["biz-companies-selector", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("biz_company")
        .select("id, name, role, parent_group")
        .eq("user_id", user.id)
        .eq("active", true)
        .order("name");

      if (error) throw error;
      return data as BizCompany[];
    },
    enabled: !!user,
  });

  const toggleCompany = (companyId: string) => {
    if (selectedIds.includes(companyId)) {
      onSelect(selectedIds.filter((id) => id !== companyId));
    } else {
      onSelect([...selectedIds, companyId]);
    }
  };

  const selectAll = () => {
    if (companies) {
      onSelect(companies.map((c) => c.id));
    }
  };

  const selectNone = () => {
    onSelect([]);
  };

  // Group by parent_group
  const groupedCompanies = companies?.reduce((acc, company) => {
    const group = company.parent_group || "Other";
    if (!acc[group]) acc[group] = [];
    acc[group].push(company);
    return acc;
  }, {} as Record<string, BizCompany[]>);

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Associate with Companies
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !companies?.length ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No companies found. Add companies in the Companies tab first.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={selectNone}>
                Clear
              </Button>
              <Badge variant="secondary">
                {selectedIds.length} selected
              </Badge>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {Object.entries(groupedCompanies || {}).map(([group, groupCompanies]) => (
                <div key={group} className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {group}
                  </p>
                  {groupCompanies.map((company) => (
                    <div
                      key={company.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                      onClick={() => toggleCompany(company.id)}
                    >
                      <Checkbox
                        checked={selectedIds.includes(company.id)}
                        onCheckedChange={() => toggleCompany(company.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{company.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {company.role}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <Button className="w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
