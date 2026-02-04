import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Building2, ArrowRight, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CompanyRelationshipManagerProps {
  companyId: string;
  companyName: string;
}

interface PortfolioCompany {
  id: string;
  name: string;
  company_type: string;
}

interface CompanyRelationship {
  id: string;
  parent_company_id: string;
  child_company_id: string;
  relationship_type: string;
  ownership_percentage: number | null;
  effective_date: string | null;
  end_date: string | null;
  notes: string | null;
  liability_protection_notes: string | null;
  parent_company: PortfolioCompany;
  child_company: PortfolioCompany;
}

const RELATIONSHIP_TYPES = [
  { value: 'parent_subsidiary', label: 'Parent-Subsidiary', description: 'Parent company controls subsidiary' },
  { value: 'wholly_owned_subsidiary', label: 'Wholly-Owned Subsidiary', description: '100% ownership' },
  { value: 'distribution_rights', label: 'Distribution Rights', description: 'Exclusive distribution agreement' },
  { value: 'licensing_agreement', label: 'Licensing Agreement', description: 'License to use IP/products' },
  { value: 'joint_venture', label: 'Joint Venture', description: 'Shared ownership project' },
  { value: 'strategic_partnership', label: 'Strategic Partnership', description: 'Non-ownership collaboration' },
  { value: 'minority_stake', label: 'Minority Stake', description: '<50% ownership' },
  { value: 'holding_company', label: 'Holding Company', description: 'Holds assets, not operations' },
  { value: 'sister_company', label: 'Sister Company', description: 'Shared parent ownership' },
  { value: 'franchise', label: 'Franchise', description: 'Franchise relationship' },
];

export const CompanyRelationshipManager = ({ companyId, companyName }: CompanyRelationshipManagerProps) => {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<CompanyRelationship[]>([]);
  const [companies, setCompanies] = useState<PortfolioCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [isParent, setIsParent] = useState(true);
  
  const [formData, setFormData] = useState({
    related_company_id: '',
    relationship_type: '',
    ownership_percentage: '',
    effective_date: '',
    end_date: '',
    notes: '',
    liability_protection_notes: '',
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, companyId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all companies except current one
      const { data: companiesData, error: companiesError } = await supabase
        .from('portfolio_companies')
        .select('id, name, company_type')
        .eq('user_id', user?.id)
        .neq('id', companyId);

      if (companiesError) throw companiesError;

      // Load relationships where this company is parent
      const { data: parentRels, error: parentError } = await supabase
        .from('company_relationships')
        .select(`
          *,
          parent_company:portfolio_companies!company_relationships_parent_company_id_fkey(id, name, company_type),
          child_company:portfolio_companies!company_relationships_child_company_id_fkey(id, name, company_type)
        `)
        .eq('parent_company_id', companyId);

      if (parentError) throw parentError;

      // Load relationships where this company is child
      const { data: childRels, error: childError } = await supabase
        .from('company_relationships')
        .select(`
          *,
          parent_company:portfolio_companies!company_relationships_parent_company_id_fkey(id, name, company_type),
          child_company:portfolio_companies!company_relationships_child_company_id_fkey(id, name, company_type)
        `)
        .eq('child_company_id', companyId);

      if (childError) throw childError;

      setCompanies(companiesData || []);
      setRelationships([...(parentRels || []), ...(childRels || [])]);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Failed to load relationships');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.related_company_id || !formData.relationship_type) {
      toast.error('Please select a company and relationship type');
      return;
    }

    try {
      const insertData = {
        user_id: user?.id,
        parent_company_id: isParent ? companyId : formData.related_company_id,
        child_company_id: isParent ? formData.related_company_id : companyId,
        relationship_type: formData.relationship_type as any,
        ownership_percentage: formData.ownership_percentage ? parseFloat(formData.ownership_percentage) : null,
        effective_date: formData.effective_date || null,
        end_date: formData.end_date || null,
        notes: formData.notes || null,
        liability_protection_notes: formData.liability_protection_notes || null,
      };

      const { error } = await supabase
        .from('company_relationships')
        .insert([insertData]);

      if (error) throw error;

      toast.success('Relationship added successfully');
      setOpen(false);
      setFormData({
        related_company_id: '',
        relationship_type: '',
        ownership_percentage: '',
        effective_date: '',
        end_date: '',
        notes: '',
        liability_protection_notes: '',
      });
      loadData();
    } catch (error: any) {
      console.error('Error adding relationship:', error);
      toast.error('Failed to add relationship');
    }
  };

  const handleDelete = async (relationshipId: string) => {
    if (!confirm('Are you sure you want to remove this relationship?')) return;

    try {
      const { error } = await supabase
        .from('company_relationships')
        .delete()
        .eq('id', relationshipId);

      if (error) throw error;

      toast.success('Relationship removed');
      loadData();
    } catch (error: any) {
      console.error('Error deleting relationship:', error);
      toast.error('Failed to remove relationship');
    }
  };

  const getRelationshipLabel = (type: string) => {
    return RELATIONSHIP_TYPES.find(rt => rt.value === type)?.label || type;
  };

  if (loading) {
    return <div>Loading relationships...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Corporate Structure Relationships
            </CardTitle>
            <CardDescription>
              Manage ownership, distribution rights, and other corporate relationships
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Relationship
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Corporate Relationship</DialogTitle>
                <DialogDescription>
                  Define how {companyName} relates to another company in your portfolio
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Relationship Direction</Label>
                  <Select value={isParent ? 'parent' : 'child'} onValueChange={(v) => setIsParent(v === 'parent')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">{companyName} controls/owns another company</SelectItem>
                      <SelectItem value="child">{companyName} is controlled/owned by another company</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="related_company_id">Related Company</Label>
                  <Select 
                    value={formData.related_company_id} 
                    onValueChange={(value) => setFormData({...formData, related_company_id: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name} ({company.company_type})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="relationship_type">Relationship Type</Label>
                  <Select 
                    value={formData.relationship_type} 
                    onValueChange={(value) => setFormData({...formData, relationship_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select relationship type" />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIP_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{type.label}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3 w-3 ml-2 text-muted-foreground" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{type.description}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownership_percentage">Ownership % (optional)</Label>
                    <Input
                      id="ownership_percentage"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.ownership_percentage}
                      onChange={(e) => setFormData({...formData, ownership_percentage: e.target.value})}
                      placeholder="e.g., 100.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="effective_date">Effective Date (optional)</Label>
                    <Input
                      id="effective_date"
                      type="date"
                      value={formData.effective_date}
                      onChange={(e) => setFormData({...formData, effective_date: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Contract details, terms, etc."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liability_protection_notes">Liability Protection Strategy</Label>
                  <Textarea
                    id="liability_protection_notes"
                    value={formData.liability_protection_notes}
                    onChange={(e) => setFormData({...formData, liability_protection_notes: e.target.value})}
                    placeholder="How this structure protects assets and limits liability..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Relationship</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {relationships.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            No corporate relationships defined yet. Add relationships to track ownership, distribution rights, and corporate structure.
          </p>
        ) : (
          <div className="space-y-4">
            {relationships.map((rel) => {
              const isCurrentParent = rel.parent_company_id === companyId;
              const otherCompany = isCurrentParent ? rel.child_company : rel.parent_company;
              
              return (
                <div key={rel.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-primary" />
                        <span className="font-medium">{isCurrentParent ? companyName : otherCompany.name}</span>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{isCurrentParent ? otherCompany.name : companyName}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(rel.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{getRelationshipLabel(rel.relationship_type)}</p>
                    </div>
                    {rel.ownership_percentage && (
                      <div>
                        <span className="text-muted-foreground">Ownership:</span>
                        <p className="font-medium">{rel.ownership_percentage}%</p>
                      </div>
                    )}
                  </div>
                  
                  {rel.notes && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="mt-1">{rel.notes}</p>
                    </div>
                  )}
                  
                  {rel.liability_protection_notes && (
                    <div className="bg-muted/50 p-3 rounded-md text-sm">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-3 w-3" />
                        <span className="font-medium">Liability Protection Strategy:</span>
                      </div>
                      <p className="text-muted-foreground">{rel.liability_protection_notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};