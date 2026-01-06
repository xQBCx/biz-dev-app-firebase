import { useState, useEffect } from "react";
import { Node } from "@xyflow/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Settings, X, Zap, Brain, GitBranch, Play, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface NodeConfigPanelProps {
  node: Node;
  nodeTypeDefinitions: Array<{
    id: string;
    slug: string;
    name: string;
    category: string;
    config_schema?: Record<string, any>;
  }>;
  onUpdateConfig: (config: Record<string, any>) => void;
  onClose: () => void;
}

const categoryIcons: Record<string, React.ElementType> = {
  trigger: Zap,
  action: Play,
  logic: GitBranch,
  ai: Brain,
};

const categoryColors: Record<string, string> = {
  trigger: "text-amber-400",
  action: "text-emerald-400", 
  logic: "text-blue-400",
  ai: "text-purple-400",
};

export function NodeConfigPanel({ 
  node, 
  nodeTypeDefinitions, 
  onUpdateConfig, 
  onClose 
}: NodeConfigPanelProps) {
  const nodeData = node.data as any;
  const [config, setConfig] = useState<Record<string, any>>(nodeData.config || {});
  const [hasChanges, setHasChanges] = useState(false);

  const nodeTypeDef = nodeTypeDefinitions.find(
    (nt) => nt.slug === nodeData.type || nt.slug === node.type
  );

  const configSchema = nodeTypeDef?.config_schema || getDefaultConfigSchema(nodeData.category, nodeData.type);

  useEffect(() => {
    setConfig(nodeData.config || {});
    setHasChanges(false);
  }, [node.id, nodeData.config]);

  const handleChange = (key: string, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    onUpdateConfig(config);
    setHasChanges(false);
  };

  const Icon = categoryIcons[nodeData.category] || Settings;

  return (
    <Card className="w-80 flex-shrink-0 flex flex-col">
      <CardHeader className="py-3 px-4 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className={cn("h-4 w-4", categoryColors[nodeData.category])} />
          Configure Node
        </CardTitle>
        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <div className="px-4 pb-3 space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {nodeData.category}
          </Badge>
          <span className="text-sm font-medium truncate">{nodeData.label}</span>
        </div>
        {nodeData.description && (
          <p className="text-xs text-muted-foreground">{nodeData.description}</p>
        )}
      </div>

      <ScrollArea className="flex-1 px-4">
        <div className="space-y-4 pb-4">
          {Object.entries(configSchema).map(([key, schema]: [string, any]) => (
            <ConfigField
              key={key}
              fieldKey={key}
              schema={schema}
              value={config[key]}
              onChange={(value) => handleChange(key, value)}
            />
          ))}

          {Object.keys(configSchema).length === 0 && (
            <div className="text-center py-6">
              <Settings className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                No configuration required for this node type
              </p>
            </div>
          )}
        </div>
      </ScrollArea>

      {hasChanges && (
        <div className="p-4 border-t">
          <Button className="w-full" size="sm" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Configuration
          </Button>
        </div>
      )}
    </Card>
  );
}

interface ConfigFieldProps {
  fieldKey: string;
  schema: {
    type: string;
    label?: string;
    description?: string;
    placeholder?: string;
    default?: any;
    options?: Array<{ value: string; label: string }>;
    required?: boolean;
  };
  value: any;
  onChange: (value: any) => void;
}

function ConfigField({ fieldKey, schema, value, onChange }: ConfigFieldProps) {
  const label = schema.label || fieldKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  switch (schema.type) {
    case 'string':
    case 'text':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {label}
            {schema.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.placeholder}
            className="h-8 text-sm"
          />
          {schema.description && (
            <p className="text-[10px] text-muted-foreground">{schema.description}</p>
          )}
        </div>
      );

    case 'textarea':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {label}
            {schema.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Textarea
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.placeholder}
            rows={3}
            className="text-sm resize-none"
          />
          {schema.description && (
            <p className="text-[10px] text-muted-foreground">{schema.description}</p>
          )}
        </div>
      );

    case 'number':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {label}
            {schema.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            placeholder={schema.placeholder}
            className="h-8 text-sm"
          />
          {schema.description && (
            <p className="text-[10px] text-muted-foreground">{schema.description}</p>
          )}
        </div>
      );

    case 'boolean':
      return (
        <div className="flex items-center justify-between py-1">
          <div className="space-y-0.5">
            <Label className="text-xs">{label}</Label>
            {schema.description && (
              <p className="text-[10px] text-muted-foreground">{schema.description}</p>
            )}
          </div>
          <Switch
            checked={value || false}
            onCheckedChange={onChange}
          />
        </div>
      );

    case 'select':
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">
            {label}
            {schema.required && <span className="text-destructive ml-1">*</span>}
          </Label>
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-sm">
              <SelectValue placeholder={schema.placeholder || 'Select...'} />
            </SelectTrigger>
            <SelectContent>
              {schema.options?.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {schema.description && (
            <p className="text-[10px] text-muted-foreground">{schema.description}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-1.5">
          <Label className="text-xs">{label}</Label>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={schema.placeholder}
            className="h-8 text-sm"
          />
        </div>
      );
  }
}

function getDefaultConfigSchema(category: string, type: string): Record<string, any> {
  const schemas: Record<string, Record<string, any>> = {
    trigger_schedule: {
      cron_expression: { type: 'string', label: 'Cron Expression', placeholder: '0 9 * * 1-5', description: 'e.g., 0 9 * * 1-5 for weekdays at 9am' },
      timezone: { type: 'string', label: 'Timezone', placeholder: 'America/New_York' },
    },
    trigger_webhook: {
      secret: { type: 'string', label: 'Webhook Secret', description: 'Optional secret for signature validation' },
    },
    trigger_event: {
      event_type: { type: 'string', label: 'Event Type', placeholder: 'deal.created' },
      filters: { type: 'textarea', label: 'Filters (JSON)', placeholder: '{"amount": {"$gt": 10000}}' },
    },
    ai_analyze: {
      prompt: { type: 'textarea', label: 'Analysis Prompt', required: true, placeholder: 'Analyze this data and provide insights...' },
      model: { 
        type: 'select', 
        label: 'AI Model',
        options: [
          { value: 'gemini-2.5-flash', label: 'Gemini Flash (Fast)' },
          { value: 'gemini-2.5-pro', label: 'Gemini Pro (Quality)' },
          { value: 'gpt-5-mini', label: 'GPT-5 Mini' },
        ]
      },
    },
    ai_generate: {
      prompt: { type: 'textarea', label: 'Generation Prompt', required: true },
      output_format: { 
        type: 'select', 
        label: 'Output Format',
        options: [
          { value: 'text', label: 'Plain Text' },
          { value: 'json', label: 'JSON' },
          { value: 'markdown', label: 'Markdown' },
        ]
      },
    },
    action_email: {
      to: { type: 'string', label: 'To', placeholder: '{{lead.email}}', required: true },
      subject: { type: 'string', label: 'Subject', required: true },
      body: { type: 'textarea', label: 'Body', required: true },
    },
    action_slack: {
      channel: { type: 'string', label: 'Channel', placeholder: '#sales', required: true },
      message: { type: 'textarea', label: 'Message', required: true },
    },
    action_create_task: {
      title: { type: 'string', label: 'Task Title', required: true },
      description: { type: 'textarea', label: 'Description' },
      priority: {
        type: 'select',
        label: 'Priority',
        options: [
          { value: 'low', label: 'Low' },
          { value: 'medium', label: 'Medium' },
          { value: 'high', label: 'High' },
        ]
      },
      due_in_days: { type: 'number', label: 'Due In (days)', placeholder: '7' },
    },
    logic_condition: {
      condition: { type: 'textarea', label: 'Condition', placeholder: '{{deal.amount}} > 10000', required: true, description: 'Use template syntax for dynamic values' },
    },
    logic_delay: {
      delay_seconds: { type: 'number', label: 'Delay (seconds)', placeholder: '300' },
    },
    logic_loop: {
      collection: { type: 'string', label: 'Collection Path', placeholder: '{{items}}', required: true },
    },
  };

  return schemas[`${category}_${type}`] || schemas[type] || {};
}
