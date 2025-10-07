import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PropertyMapperProps {
  columns: string[];
  preview: any[];
  properties: any[];
  entityType: 'contact' | 'company' | 'deal';
  onMappingChange: (mapping: Record<string, string>) => void;
  onPropertiesUpdate: () => void;
  userId: string;
}

// Default properties for each entity type
const defaultContactProperties = [
  { property_name: 'first_name', property_label: 'First Name', is_required: true, field_type: 'standard' },
  { property_name: 'last_name', property_label: 'Last Name', is_required: true, field_type: 'standard' },
  { property_name: 'email', property_label: 'Email', is_required: true, field_type: 'standard' },
  { property_name: 'phone', property_label: 'Phone', is_required: false, field_type: 'standard' },
  { property_name: 'mobile', property_label: 'Mobile', is_required: false, field_type: 'standard' },
  { property_name: 'title', property_label: 'Job Title', is_required: false, field_type: 'standard' },
  { property_name: 'department', property_label: 'Department', is_required: false, field_type: 'standard' },
  { property_name: 'linkedin_url', property_label: 'LinkedIn URL', is_required: false, field_type: 'standard' },
  { property_name: 'twitter_url', property_label: 'Twitter URL', is_required: false, field_type: 'standard' },
  { property_name: 'address', property_label: 'Address', is_required: false, field_type: 'standard' },
  { property_name: 'city', property_label: 'City', is_required: false, field_type: 'standard' },
  { property_name: 'state', property_label: 'State', is_required: false, field_type: 'standard' },
  { property_name: 'zip_code', property_label: 'Zip Code', is_required: false, field_type: 'standard' },
  { property_name: 'country', property_label: 'Country', is_required: false, field_type: 'standard' },
  { property_name: 'lead_source', property_label: 'Lead Source', is_required: false, field_type: 'standard' },
  { property_name: 'lead_status', property_label: 'Lead Status', is_required: false, field_type: 'standard' },
  { property_name: 'notes', property_label: 'Notes', is_required: false, field_type: 'standard' }
];

const defaultCompanyProperties = [
  { property_name: 'name', property_label: 'Company Name', is_required: true, field_type: 'standard' },
  { property_name: 'website', property_label: 'Website', is_required: false, field_type: 'standard' },
  { property_name: 'industry', property_label: 'Industry', is_required: false, field_type: 'standard' },
  { property_name: 'phone', property_label: 'Phone', is_required: false, field_type: 'standard' },
  { property_name: 'email', property_label: 'Email', is_required: false, field_type: 'standard' },
  { property_name: 'address', property_label: 'Address', is_required: false, field_type: 'standard' },
  { property_name: 'city', property_label: 'City', is_required: false, field_type: 'standard' },
  { property_name: 'state', property_label: 'State', is_required: false, field_type: 'standard' },
  { property_name: 'zip_code', property_label: 'Zip Code', is_required: false, field_type: 'standard' },
  { property_name: 'country', property_label: 'Country', is_required: false, field_type: 'standard' },
  { property_name: 'employee_count', property_label: 'Employee Count', is_required: false, field_type: 'standard' },
  { property_name: 'annual_revenue', property_label: 'Annual Revenue', is_required: false, field_type: 'standard' },
  { property_name: 'description', property_label: 'Description', is_required: false, field_type: 'standard' }
];

const defaultDealProperties = [
  { property_name: 'name', property_label: 'Deal Name', is_required: true, field_type: 'standard' },
  { property_name: 'amount', property_label: 'Amount', is_required: false, field_type: 'standard' },
  { property_name: 'stage', property_label: 'Stage', is_required: true, field_type: 'standard' },
  { property_name: 'expected_close_date', property_label: 'Expected Close Date', is_required: false, field_type: 'standard' },
  { property_name: 'probability', property_label: 'Probability (%)', is_required: false, field_type: 'standard' },
  { property_name: 'deal_type', property_label: 'Deal Type', is_required: false, field_type: 'standard' },
  { property_name: 'description', property_label: 'Description', is_required: false, field_type: 'standard' }
];

export const PropertyMapper = ({
  columns,
  preview,
  properties,
  entityType,
  onMappingChange,
  onPropertiesUpdate,
  userId
}: PropertyMapperProps) => {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [showCreateProperty, setShowCreateProperty] = useState(false);
  const [newProperty, setNewProperty] = useState({
    label: '',
    name: '',
    type: 'text',
    group: 'Custom'
  });

  // Combine default and custom properties
  const defaultProps = 
    entityType === 'contact' ? defaultContactProperties : 
    entityType === 'company' ? defaultCompanyProperties : 
    defaultDealProperties;
  const allProperties = [...defaultProps, ...properties];

  const handleMappingChange = (column: string, propertyName: string) => {
    const newMapping = { ...mapping, [column]: propertyName };
    setMapping(newMapping);
    onMappingChange(newMapping);
  };

  const createCustomProperty = async () => {
    if (!newProperty.label || !newProperty.name) {
      toast.error("Property label and name are required");
      return;
    }

    try {
      const { error } = await supabase
        .from('crm_custom_properties')
        .insert({
          user_id: userId,
          property_name: newProperty.name.toLowerCase().replace(/\s+/g, '_'),
          property_label: newProperty.label,
          property_type: newProperty.type,
          entity_type: entityType,
          field_type: 'custom',
          group_name: newProperty.group
        });

      if (error) throw error;

      toast.success("Custom property created");
      setShowCreateProperty(false);
      setNewProperty({ label: '', name: '', type: 'text', group: 'Custom' });
      onPropertiesUpdate();
    } catch (error) {
      console.error('Error creating property:', error);
      toast.error("Failed to create custom property");
    }
  };

  const getMappedCount = () => Object.keys(mapping).filter(k => mapping[k]).length;
  const getUnmappedCount = () => columns.length - getMappedCount();
  const getRequiredFields = () => defaultProps.filter(p => p.is_required);
  const getMappedRequiredFields = () => {
    const requiredFieldNames = getRequiredFields().map(f => f.property_name);
    return requiredFieldNames.filter(fieldName => 
      Object.values(mapping).includes(fieldName)
    );
  };
  const missingRequiredFields = getRequiredFields().filter(field => 
    !Object.values(mapping).includes(field.property_name)
  );

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
              Map columns to {entityType} properties
            </p>
            <p className="text-blue-700 dark:text-blue-300">
              {getMappedCount()} of {columns.length} columns mapped · {getUnmappedCount()} unmapped
            </p>
            <p className="text-blue-700 dark:text-blue-300 mt-1">
              Required fields: {getMappedRequiredFields().length} of {getRequiredFields().length} mapped
              {missingRequiredFields.length > 0 && (
                <span className="text-red-600 dark:text-red-400 font-semibold">
                  {' · Missing: '}{missingRequiredFields.map(f => f.property_label).join(', ')}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div className="bg-muted px-4 py-3 grid grid-cols-[200px_1fr_200px_200px] gap-4 font-semibold text-sm">
          <div>COLUMN</div>
          <div>PREVIEW</div>
          <div>IMPORT AS</div>
          <div>PROPERTY</div>
        </div>

        <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
          {columns.map((column, idx) => (
            <div
              key={idx}
              className="px-4 py-3 grid grid-cols-[200px_1fr_200px_200px] gap-4 items-center hover:bg-muted/50"
            >
              <div className="font-medium text-sm truncate">{column}</div>
              <div className="text-sm text-muted-foreground truncate">
                {preview[0]?.[column] && String(preview[0][column]).substring(0, 50)}
              </div>
              <div>
                <Select defaultValue={entityType + "_properties"}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contact_properties">Contact properties</SelectItem>
                    <SelectItem value="company_properties">Company properties</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 items-center">
                <Select
                  value={mapping[column] || ""}
                  onValueChange={(value) => handleMappingChange(column, value)}
                >
                  <SelectTrigger className="h-8 text-xs flex-1">
                    <SelectValue placeholder="Choose property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Don't import</SelectItem>
                    {allProperties.map((prop, idx) => (
                      <SelectItem key={prop.id || `default-${idx}`} value={prop.property_name}>
                        {prop.property_label}
                        {prop.is_required && ' *'}
                        {prop.field_type === 'custom' && ' (Custom)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setShowCreateProperty(true)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showCreateProperty} onOpenChange={setShowCreateProperty}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Property</DialogTitle>
            <DialogDescription>
              Add a new custom property for {entityType}s
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Property Label</Label>
              <Input
                placeholder="e.g., Budget Range"
                value={newProperty.label}
                onChange={(e) => setNewProperty({ ...newProperty, label: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Internal Name</Label>
              <Input
                placeholder="e.g., budget_range"
                value={newProperty.name}
                onChange={(e) => setNewProperty({ ...newProperty, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={newProperty.type}
                onValueChange={(value) => setNewProperty({ ...newProperty, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="textarea">Long Text</SelectItem>
                  <SelectItem value="select">Dropdown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Group</Label>
              <Input
                placeholder="e.g., Custom Fields"
                value={newProperty.group}
                onChange={(e) => setNewProperty({ ...newProperty, group: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateProperty(false)}>
              Cancel
            </Button>
            <Button onClick={createCustomProperty}>Create Property</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
