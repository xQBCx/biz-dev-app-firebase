import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Building2, ClipboardList, Settings, FileText, Download, CheckCircle2, Clock, AlertCircle, ChevronDown, ChevronRight, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function ClientOnboardingDealRoom() {
  const { engagementSlug } = useParams<{ engagementSlug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [engagement, setEngagement] = useState<any>(null);
  const [formDefinition, setFormDefinition] = useState<any>(null);
  const [formResponseId, setFormResponseId] = useState<string | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [savedFields, setSavedFields] = useState<Set<string>>(new Set());
  const [savingFields, setSavingFields] = useState<Set<string>>(new Set());
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (engagementSlug) {
      loadEngagement();
    }
  }, [engagementSlug]);

  const loadEngagement = async () => {
    try {
      setIsLoading(true);
      
      // Fetch engagement
      const { data: engagementData, error: engagementError } = await supabase
        .from("client_onboarding_engagements")
        .select("*")
        .eq("client_slug", engagementSlug)
        .single();

      if (engagementError) throw engagementError;
      setEngagement(engagementData);

      // Fetch form definition
      const { data: formData, error: formError } = await supabase
        .from("onboarding_form_definitions")
        .select(`
          id, form_name, form_description,
          sections:onboarding_form_sections(
            id, section_name, section_description, section_number, is_collapsible, default_collapsed,
            fields:onboarding_form_fields(
              id, field_key, field_label, field_description, field_placeholder,
              field_type, is_required, options, table_columns, table_min_rows, table_max_rows,
              display_order, display_width, auto_expand
            )
          )
        `)
        .eq("form_slug", "erp-discovery")
        .eq("is_active", true)
        .single();

      if (formError) throw formError;

      // Sort sections and fields
      const sortedForm = {
        ...formData,
        sections: formData.sections
          .sort((a: any, b: any) => a.section_number - b.section_number)
          .map((section: any) => ({
            ...section,
            fields: section.fields.sort((a: any, b: any) => a.display_order - b.display_order)
          }))
      };
      setFormDefinition(sortedForm);

      // Get or create form response
      let { data: responseData, error: responseError } = await supabase
        .from("client_form_responses")
        .select("id, progress_percentage")
        .eq("engagement_id", engagementData.id)
        .eq("form_id", formData.id)
        .single();

      if (responseError && responseError.code === "PGRST116") {
        const { data: newResponse, error: createError } = await supabase
          .from("client_form_responses")
          .insert({ engagement_id: engagementData.id, form_id: formData.id, status: "in_progress" })
          .select("id, progress_percentage")
          .single();
        if (createError) throw createError;
        responseData = newResponse;
      } else if (responseError) {
        throw responseError;
      }

      setFormResponseId(responseData.id);
      setProgress(responseData.progress_percentage || 0);

      // Load existing responses
      const { data: fieldResponses } = await supabase
        .from("client_field_responses")
        .select("field_id, text_value, number_value, date_value, json_value")
        .eq("response_id", responseData.id);

      const values: Record<string, any> = {};
      const saved = new Set<string>();
      
      fieldResponses?.forEach((response: any) => {
        const field = sortedForm.sections
          .flatMap((s: any) => s.fields)
          .find((f: any) => f.id === response.field_id);
        
        if (field) {
          if (response.json_value !== null) values[field.field_key] = response.json_value;
          else if (response.number_value !== null) values[field.field_key] = response.number_value;
          else if (response.date_value !== null) values[field.field_key] = response.date_value;
          else values[field.field_key] = response.text_value || "";
          saved.add(field.field_key);
        }
      });

      setFieldValues(values);
      setSavedFields(saved);

    } catch (error: any) {
      console.error("Error loading engagement:", error);
      toast({ title: "Error", description: "Failed to load engagement", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveFieldValue = async (fieldKey: string, fieldId: string, value: any, fieldType: string) => {
    if (!formResponseId) return;
    setSavingFields(prev => new Set(prev).add(fieldKey));

    try {
      const updateData: any = { response_id: formResponseId, field_id: fieldId, last_edited_at: new Date().toISOString() };

      if (fieldType === "number" || fieldType === "currency") {
        updateData.number_value = value === "" ? null : Number(value);
      } else if (fieldType === "date") {
        updateData.date_value = value || null;
      } else if (fieldType === "table" || fieldType === "multiselect") {
        updateData.json_value = value;
      } else {
        updateData.text_value = value || null;
      }

      await supabase.from("client_field_responses").upsert(updateData, { onConflict: "response_id,field_id" });
      setSavedFields(prev => new Set(prev).add(fieldKey));

      // Update progress
      const totalRequired = formDefinition.sections.flatMap((s: any) => s.fields).filter((f: any) => f.is_required).length;
      const completedRequired = formDefinition.sections.flatMap((s: any) => s.fields).filter((f: any) => f.is_required && fieldValues[f.field_key]).length;
      const newProgress = totalRequired > 0 ? Math.round((completedRequired / totalRequired) * 100) : 0;
      setProgress(newProgress);
      
      await supabase.from("client_form_responses").update({ progress_percentage: newProgress }).eq("id", formResponseId);

    } catch (error) {
      toast({ title: "Error saving", description: `Failed to save ${fieldKey}`, variant: "destructive" });
    } finally {
      setSavingFields(prev => { const next = new Set(prev); next.delete(fieldKey); return next; });
    }
  };

  const handleFieldChange = (field: any, value: any) => {
    setFieldValues(prev => ({ ...prev, [field.field_key]: value }));
    setSavedFields(prev => { const next = new Set(prev); next.delete(field.field_key); return next; });
    
    // Debounced save
    const timeoutId = setTimeout(() => saveFieldValue(field.field_key, field.id, value, field.field_type), 800);
    return () => clearTimeout(timeoutId);
  };

  const toggleSection = (sectionId: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const renderField = (field: any) => {
    const value = fieldValues[field.field_key] ?? "";
    const isSaving = savingFields.has(field.field_key);
    const isSaved = savedFields.has(field.field_key);
    const widthClass = field.display_width === "half" ? "col-span-1" : "col-span-2";

    return (
      <div key={field.id} className={`${widthClass} space-y-2`}>
        <Label className="flex items-center gap-2">
          {field.field_label}
          {field.is_required && <span className="text-red-500">*</span>}
          {isSaving && <Loader2 className="h-3 w-3 animate-spin" />}
          {!isSaving && isSaved && <CheckCircle2 className="h-3 w-3 text-green-500" />}
        </Label>
        {field.field_description && <p className="text-sm text-muted-foreground">{field.field_description}</p>}

        {field.field_type === "text" && (
          <Input value={value} onChange={(e) => handleFieldChange(field, e.target.value)} placeholder={field.field_placeholder || ""} />
        )}
        {field.field_type === "textarea" && (
          <Textarea value={value} onChange={(e) => handleFieldChange(field, e.target.value)} placeholder={field.field_placeholder || ""} className="min-h-[100px]" />
        )}
        {field.field_type === "number" && (
          <Input type="number" value={value} onChange={(e) => handleFieldChange(field, e.target.value)} />
        )}
        {field.field_type === "currency" && (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <Input type="number" value={value} onChange={(e) => handleFieldChange(field, e.target.value)} className="pl-7" />
          </div>
        )}
        {field.field_type === "select" && (
          <Select value={value} onValueChange={(v) => handleFieldChange(field, v)}>
            <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {field.options?.map((opt: any) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {field.field_type === "multiselect" && (
          <div className="space-y-2">
            {field.options?.map((opt: any) => (
              <div key={opt.value} className="flex items-center space-x-2">
                <Checkbox
                  checked={(value || []).includes(opt.value)}
                  onCheckedChange={(checked) => {
                    const current = value || [];
                    const newVal = checked ? [...current, opt.value] : current.filter((v: string) => v !== opt.value);
                    handleFieldChange(field, newVal);
                  }}
                />
                <Label className="font-normal">{opt.label}</Label>
              </div>
            ))}
          </div>
        )}
        {field.field_type === "table" && (
          <TableField field={field} value={value || []} onChange={(v) => handleFieldChange(field, v)} />
        )}
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin" /></div>;
  }

  if (!engagement) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">Engagement Not Found</h2>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{engagement.client_name}</h1>
                <p className="text-muted-foreground">ERP Implementation Deal Room</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800"><Clock className="h-3 w-3 mr-1" />{engagement.status}</Badge>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Progress</p>
                <div className="flex items-center gap-2">
                  <Progress value={progress} className="w-32 h-2" />
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview"><Building2 className="h-4 w-4 mr-2" />Overview</TabsTrigger>
            <TabsTrigger value="questionnaire"><ClipboardList className="h-4 w-4 mr-2" />Questionnaire</TabsTrigger>
            <TabsTrigger value="hardware"><Settings className="h-4 w-4 mr-2" />Hardware</TabsTrigger>
            <TabsTrigger value="documents"><FileText className="h-4 w-4 mr-2" />Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader><CardTitle>Client Information</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div><strong>Company:</strong> {engagement.client_name}</div>
                  <div><strong>Website:</strong> <a href={engagement.client_website} target="_blank" className="text-primary hover:underline">{engagement.client_website}</a></div>
                  <div><strong>Discovery Fee:</strong> ${engagement.discovery_fee?.toLocaleString()}</div>
                  <div><strong>Monthly Fee:</strong> ${engagement.monthly_fee?.toLocaleString()}/mo</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle>Questionnaire Status</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Progress value={progress} className="h-4" />
                    <p className="text-center text-lg font-semibold">{progress}% Complete</p>
                    <Button className="w-full" onClick={() => setActiveTab("questionnaire")}>
                      {progress === 0 ? "Start Questionnaire" : "Continue Questionnaire"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="questionnaire">
            <Card>
              <CardHeader>
                <CardTitle>Discovery Questionnaire</CardTitle>
                <CardDescription>Complete the questionnaire below. Your responses are saved automatically.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formDefinition?.sections.map((section: any) => (
                    <Card key={section.id}>
                      <Collapsible open={!collapsedSections.has(section.id)} onOpenChange={() => toggleSection(section.id)}>
                        <CardHeader className="cursor-pointer" onClick={() => toggleSection(section.id)}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="p-0 h-6 w-6">
                                  {collapsedSections.has(section.id) ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                </Button>
                              </CollapsibleTrigger>
                              <div>
                                <CardTitle className="text-lg">{section.section_number}. {section.section_name}</CardTitle>
                                {section.section_description && <p className="text-sm text-muted-foreground">{section.section_description}</p>}
                              </div>
                            </div>
                            <Badge variant="outline">
                              {section.fields.filter((f: any) => savedFields.has(f.field_key)).length} / {section.fields.length}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CollapsibleContent>
                          <CardContent>
                            <div className="grid grid-cols-2 gap-6">{section.fields.map(renderField)}</div>
                          </CardContent>
                        </CollapsibleContent>
                      </Collapsible>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hardware">
            <Card>
              <CardHeader>
                <CardTitle>Hardware Recommendations</CardTitle>
                <CardDescription>Based on your responses, we recommend the following hardware.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Complete more of the questionnaire to receive personalized hardware recommendations.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Generated documents and exports.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" />Export Responses as PDF</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function TableField({ field, value, onChange }: { field: any; value: any[]; onChange: (v: any[]) => void }) {
  const columns = field.table_columns || [];
  const minRows = field.table_min_rows || 1;
  const maxRows = field.table_max_rows || 20;

  useEffect(() => {
    if (value.length < minRows) {
      const newRows = [...value];
      while (newRows.length < minRows) {
        const emptyRow: Record<string, string> = {};
        columns.forEach((col: any) => { emptyRow[col.key] = ""; });
        newRows.push(emptyRow);
      }
      onChange(newRows);
    }
  }, [minRows]);

  const addRow = () => {
    if (value.length >= maxRows) return;
    const emptyRow: Record<string, string> = {};
    columns.forEach((col: any) => { emptyRow[col.key] = ""; });
    onChange([...value, emptyRow]);
  };

  const removeRow = (index: number) => {
    if (value.length <= minRows) return;
    const newValue = [...value];
    newValue.splice(index, 1);
    onChange(newValue);
  };

  const updateCell = (rowIndex: number, columnKey: string, cellValue: string) => {
    const newValue = [...value];
    newValue[rowIndex] = { ...newValue[rowIndex], [columnKey]: cellValue };
    onChange(newValue);
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted">
          <tr>
            {columns.map((col: any) => <th key={col.key} className="px-3 py-2 text-left text-sm font-medium">{col.label}</th>)}
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {(value || []).map((row: any, rowIndex: number) => (
            <tr key={rowIndex} className="border-t">
              {columns.map((col: any) => (
                <td key={col.key} className="px-2 py-1">
                  {col.type === "textarea" ? (
                    <Textarea value={row[col.key] || ""} onChange={(e) => updateCell(rowIndex, col.key, e.target.value)} className="min-h-[60px] text-sm" />
                  ) : (
                    <Input value={row[col.key] || ""} onChange={(e) => updateCell(rowIndex, col.key, e.target.value)} className="text-sm" />
                  )}
                </td>
              ))}
              <td className="px-2 py-1">
                <Button variant="ghost" size="sm" onClick={() => removeRow(rowIndex)} disabled={value.length <= minRows} className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {value.length < maxRows && (
        <div className="p-2 border-t">
          <Button variant="outline" size="sm" onClick={addRow} className="w-full"><Plus className="h-4 w-4 mr-2" />Add Row</Button>
        </div>
      )}
    </div>
  );
}
