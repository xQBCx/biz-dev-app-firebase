import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Zap, 
  Users, 
  TrendingUp, 
  Mail, 
  Calendar,
  FileText,
  Target,
  Bot,
  Clock,
  ArrowRight,
  Play,
  Eye,
  Copy,
  Star,
  Filter,
  Sparkles,
  Building,
  Briefcase,
  MessageSquare,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'marketing' | 'operations' | 'ai-content' | 'erp-audit';
  complexity: 'simple' | 'medium' | 'advanced';
  estimatedTime: string;
  nodeCount: number;
  featured: boolean;
  usageCount: number;
  nodes: Array<{
    id: string;
    type: string;
    name: string;
    description: string;
  }>;
  triggers: string[];
  actions: string[];
}

const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'lead-nurture',
    name: 'Lead Nurturing Sequence',
    description: 'Automatically nurture new leads with personalized email sequences based on their engagement',
    category: 'sales',
    complexity: 'medium',
    estimatedTime: '15 min setup',
    nodeCount: 6,
    featured: true,
    usageCount: 1250,
    nodes: [
      { id: '1', type: 'trigger', name: 'New Lead Created', description: 'Triggers when a new lead is added to CRM' },
      { id: '2', type: 'condition', name: 'Check Lead Score', description: 'Evaluate lead quality score' },
      { id: '3', type: 'action', name: 'Send Welcome Email', description: 'Personalized welcome message' },
      { id: '4', type: 'delay', name: 'Wait 2 Days', description: 'Pause before next touchpoint' },
      { id: '5', type: 'ai', name: 'Generate Follow-up', description: 'AI creates personalized follow-up' },
      { id: '6', type: 'action', name: 'Update CRM Status', description: 'Mark lead as nurtured' }
    ],
    triggers: ['New Lead', 'Form Submission'],
    actions: ['Send Email', 'Update CRM', 'Create Task']
  },
  {
    id: 'deal-closed-automation',
    name: 'Deal Closed Celebration',
    description: 'Celebrate wins and trigger onboarding when deals are marked as won',
    category: 'sales',
    complexity: 'simple',
    estimatedTime: '5 min setup',
    nodeCount: 4,
    featured: false,
    usageCount: 890,
    nodes: [
      { id: '1', type: 'trigger', name: 'Deal Won', description: 'Triggers when deal status changes to won' },
      { id: '2', type: 'action', name: 'Notify Team', description: 'Send celebration to Slack' },
      { id: '3', type: 'action', name: 'Create Onboarding Tasks', description: 'Generate client onboarding checklist' },
      { id: '4', type: 'action', name: 'Log Revenue', description: 'Record revenue in finance system' }
    ],
    triggers: ['Deal Status Change'],
    actions: ['Notify Team', 'Create Tasks', 'Update Records']
  },
  {
    id: 'content-generator',
    name: 'AI Content Pipeline',
    description: 'Generate, review, and publish content using AI agents with human approval gates',
    category: 'ai-content',
    complexity: 'advanced',
    estimatedTime: '30 min setup',
    nodeCount: 8,
    featured: true,
    usageCount: 2100,
    nodes: [
      { id: '1', type: 'trigger', name: 'Content Request', description: 'New content request submitted' },
      { id: '2', type: 'ai', name: 'Research Topic', description: 'AI researches the topic' },
      { id: '3', type: 'ai', name: 'Generate Draft', description: 'AI writes initial draft' },
      { id: '4', type: 'action', name: 'Human Review', description: 'Send for human approval' },
      { id: '5', type: 'condition', name: 'Approved?', description: 'Check approval status' },
      { id: '6', type: 'ai', name: 'SEO Optimize', description: 'AI optimizes for search' },
      { id: '7', type: 'action', name: 'Schedule Publish', description: 'Queue for publishing' },
      { id: '8', type: 'action', name: 'Distribute', description: 'Share across channels' }
    ],
    triggers: ['Manual Trigger', 'Scheduled'],
    actions: ['AI Generate', 'Human Approval', 'Publish']
  },
  {
    id: 'meeting-follow-up',
    name: 'Meeting Follow-up Automation',
    description: 'Automatically send meeting summaries and create follow-up tasks after calendar events',
    category: 'operations',
    complexity: 'simple',
    estimatedTime: '10 min setup',
    nodeCount: 5,
    featured: false,
    usageCount: 1560,
    nodes: [
      { id: '1', type: 'trigger', name: 'Meeting Ended', description: 'Calendar event completed' },
      { id: '2', type: 'ai', name: 'Generate Summary', description: 'AI creates meeting notes' },
      { id: '3', type: 'action', name: 'Send Summary', description: 'Email summary to attendees' },
      { id: '4', type: 'action', name: 'Create Tasks', description: 'Extract and create action items' },
      { id: '5', type: 'action', name: 'Update CRM', description: 'Log meeting in contact record' }
    ],
    triggers: ['Calendar Event'],
    actions: ['AI Summarize', 'Send Email', 'Create Tasks']
  },
  {
    id: 'social-campaign',
    name: 'Social Media Campaign',
    description: 'Orchestrate multi-platform social campaigns with AI-generated content and analytics',
    category: 'marketing',
    complexity: 'advanced',
    estimatedTime: '25 min setup',
    nodeCount: 7,
    featured: true,
    usageCount: 780,
    nodes: [
      { id: '1', type: 'trigger', name: 'Campaign Start', description: 'Scheduled campaign launch' },
      { id: '2', type: 'ai', name: 'Generate Posts', description: 'AI creates platform-specific content' },
      { id: '3', type: 'action', name: 'Post to LinkedIn', description: 'Publish to LinkedIn' },
      { id: '4', type: 'action', name: 'Post to Twitter', description: 'Publish to Twitter/X' },
      { id: '5', type: 'delay', name: 'Wait for Engagement', description: 'Allow time for responses' },
      { id: '6', type: 'ai', name: 'Analyze Performance', description: 'AI reviews engagement metrics' },
      { id: '7', type: 'action', name: 'Report Results', description: 'Generate campaign report' }
    ],
    triggers: ['Scheduled', 'Manual'],
    actions: ['AI Generate', 'Post Social', 'Analyze']
  },
  {
    id: 'operational-audit',
    name: 'Operational Health Audit',
    description: 'Comprehensive audit of business operations with AI-powered recommendations',
    category: 'erp-audit',
    complexity: 'advanced',
    estimatedTime: '45 min setup',
    nodeCount: 9,
    featured: true,
    usageCount: 420,
    nodes: [
      { id: '1', type: 'trigger', name: 'Audit Initiated', description: 'Monthly or on-demand audit start' },
      { id: '2', type: 'action', name: 'Collect Metrics', description: 'Gather operational data' },
      { id: '3', type: 'ai', name: 'Process Analysis', description: 'AI analyzes workflow efficiency' },
      { id: '4', type: 'ai', name: 'Resource Analysis', description: 'AI evaluates resource utilization' },
      { id: '5', type: 'ai', name: 'Cost Analysis', description: 'AI reviews cost structures' },
      { id: '6', type: 'condition', name: 'Issues Found?', description: 'Check for critical issues' },
      { id: '7', type: 'ai', name: 'Generate Recommendations', description: 'AI creates improvement plan' },
      { id: '8', type: 'action', name: 'Create Report', description: 'Generate audit report' },
      { id: '9', type: 'action', name: 'Assign Tasks', description: 'Create improvement tasks' }
    ],
    triggers: ['Scheduled', 'Manual'],
    actions: ['Data Collection', 'AI Analysis', 'Report Generation']
  },
  {
    id: 'invoice-automation',
    name: 'Invoice Processing',
    description: 'Automate invoice creation, approval workflows, and payment tracking',
    category: 'operations',
    complexity: 'medium',
    estimatedTime: '20 min setup',
    nodeCount: 6,
    featured: false,
    usageCount: 980,
    nodes: [
      { id: '1', type: 'trigger', name: 'Project Completed', description: 'Milestone or project marked complete' },
      { id: '2', type: 'action', name: 'Generate Invoice', description: 'Create invoice from project data' },
      { id: '3', type: 'action', name: 'Send for Approval', description: 'Route to manager for approval' },
      { id: '4', type: 'condition', name: 'Approved?', description: 'Check approval status' },
      { id: '5', type: 'action', name: 'Send to Client', description: 'Email invoice to client' },
      { id: '6', type: 'action', name: 'Track Payment', description: 'Monitor payment status' }
    ],
    triggers: ['Project Status', 'Manual'],
    actions: ['Generate Invoice', 'Send Email', 'Track Status']
  },
  {
    id: 'team-performance',
    name: 'Team Performance Review',
    description: 'Automated collection and analysis of team performance metrics with AI insights',
    category: 'erp-audit',
    complexity: 'medium',
    estimatedTime: '20 min setup',
    nodeCount: 6,
    featured: false,
    usageCount: 340,
    nodes: [
      { id: '1', type: 'trigger', name: 'Review Period Start', description: 'Weekly/monthly review trigger' },
      { id: '2', type: 'action', name: 'Collect Data', description: 'Gather task and activity data' },
      { id: '3', type: 'ai', name: 'Analyze Performance', description: 'AI evaluates metrics' },
      { id: '4', type: 'ai', name: 'Generate Insights', description: 'AI creates personalized feedback' },
      { id: '5', type: 'action', name: 'Create Report', description: 'Generate performance report' },
      { id: '6', type: 'action', name: 'Notify Manager', description: 'Send to team lead' }
    ],
    triggers: ['Scheduled'],
    actions: ['Data Collection', 'AI Analysis', 'Report']
  }
];

const categoryIcons: Record<string, React.ReactNode> = {
  'sales': <TrendingUp className="h-4 w-4" />,
  'marketing': <Target className="h-4 w-4" />,
  'operations': <Briefcase className="h-4 w-4" />,
  'ai-content': <Bot className="h-4 w-4" />,
  'erp-audit': <Building className="h-4 w-4" />
};

const categoryLabels: Record<string, string> = {
  'sales': 'Sales & CRM',
  'marketing': 'Marketing',
  'operations': 'Operations',
  'ai-content': 'AI & Content',
  'erp-audit': 'ERP & Audits'
};

const complexityColors: Record<string, string> = {
  'simple': 'bg-green-500/10 text-green-500 border-green-500/20',
  'medium': 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  'advanced': 'bg-purple-500/10 text-purple-500 border-purple-500/20'
};

const nodeTypeColors: Record<string, string> = {
  'trigger': 'bg-blue-500',
  'action': 'bg-green-500',
  'condition': 'bg-yellow-500',
  'delay': 'bg-orange-500',
  'ai': 'bg-purple-500'
};

export function WorkflowTemplatesLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [previewTemplate, setPreviewTemplate] = useState<WorkflowTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const filteredTemplates = WORKFLOW_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredTemplates = filteredTemplates.filter(t => t.featured);
  const regularTemplates = filteredTemplates.filter(t => !t.featured);

  const handlePreview = (template: WorkflowTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = (template: WorkflowTemplate) => {
    toast.success(`Template "${template.name}" applied!`, {
      description: 'Opening workflow builder with template...'
    });
    setShowPreview(false);
  };

  const handleDuplicate = (template: WorkflowTemplate) => {
    toast.success(`Template duplicated!`, {
      description: `"${template.name}" saved to your workflows`
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Workflow Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Pre-built automation workflows to accelerate your business
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="bg-muted/50">
            <TabsTrigger value="all" className="gap-2">
              <Filter className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="sales" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Sales
            </TabsTrigger>
            <TabsTrigger value="marketing" className="gap-2">
              <Target className="h-4 w-4" />
              Marketing
            </TabsTrigger>
            <TabsTrigger value="operations" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Operations
            </TabsTrigger>
            <TabsTrigger value="ai-content" className="gap-2">
              <Bot className="h-4 w-4" />
              AI & Content
            </TabsTrigger>
            <TabsTrigger value="erp-audit" className="gap-2">
              <Building className="h-4 w-4" />
              ERP & Audits
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedCategory} className="mt-6 space-y-8">
            {/* Featured Templates */}
            {featuredTemplates.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Featured Templates
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onPreview={() => handlePreview(template)}
                      onUse={() => handleUseTemplate(template)}
                      onDuplicate={() => handleDuplicate(template)}
                      featured
                    />
                  ))}
                </div>
              </div>
            )}

            {/* All Templates */}
            {regularTemplates.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">All Templates</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {regularTemplates.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onPreview={() => handlePreview(template)}
                      onUse={() => handleUseTemplate(template)}
                      onDuplicate={() => handleDuplicate(template)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filteredTemplates.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium text-foreground">No templates found</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Try adjusting your search or category filter
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Template Preview Dialog */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-3xl max-h-[90vh]">
            {previewTemplate && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      {categoryIcons[previewTemplate.category]}
                      {categoryLabels[previewTemplate.category]}
                    </Badge>
                    <Badge variant="outline" className={complexityColors[previewTemplate.complexity]}>
                      {previewTemplate.complexity}
                    </Badge>
                  </div>
                  <DialogTitle className="text-2xl">{previewTemplate.name}</DialogTitle>
                  <DialogDescription>{previewTemplate.description}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[50vh]">
                  <div className="space-y-6 py-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{previewTemplate.nodeCount}</div>
                        <div className="text-xs text-muted-foreground">Nodes</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{previewTemplate.estimatedTime}</div>
                        <div className="text-xs text-muted-foreground">Setup Time</div>
                      </div>
                      <div className="text-center p-3 bg-muted/50 rounded-lg">
                        <div className="text-2xl font-bold text-primary">{previewTemplate.usageCount.toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">Uses</div>
                      </div>
                    </div>

                    {/* Workflow Steps */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Workflow Steps</h4>
                      <div className="space-y-2">
                        {previewTemplate.nodes.map((node, index) => (
                          <div key={node.id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full ${nodeTypeColors[node.type]} flex items-center justify-center text-white text-sm font-medium`}>
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-foreground text-sm">{node.name}</div>
                              <div className="text-xs text-muted-foreground">{node.description}</div>
                            </div>
                            {index < previewTemplate.nodes.length - 1 && (
                              <ArrowRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Triggers & Actions */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground text-sm">Triggers</h4>
                        <div className="flex flex-wrap gap-1">
                          {previewTemplate.triggers.map(trigger => (
                            <Badge key={trigger} variant="secondary" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-semibold text-foreground text-sm">Actions</h4>
                        <div className="flex flex-wrap gap-1">
                          {previewTemplate.actions.map(action => (
                            <Badge key={action} variant="secondary" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollArea>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => handleDuplicate(previewTemplate)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button onClick={() => handleUseTemplate(previewTemplate)}>
                    <Play className="h-4 w-4 mr-2" />
                    Use Template
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function TemplateCard({ 
  template, 
  onPreview, 
  onUse, 
  onDuplicate,
  featured = false 
}: { 
  template: WorkflowTemplate;
  onPreview: () => void;
  onUse: () => void;
  onDuplicate: () => void;
  featured?: boolean;
}) {
  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 ${featured ? 'border-primary/30 bg-primary/5' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1 text-xs">
              {categoryIcons[template.category]}
              {categoryLabels[template.category]}
            </Badge>
            {featured && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <Badge variant="outline" className={`text-xs ${complexityColors[template.complexity]}`}>
            {template.complexity}
          </Badge>
        </div>
        <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
        <CardDescription className="line-clamp-2">{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {template.nodeCount} nodes
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.estimatedTime}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {template.usageCount.toLocaleString()}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" className="flex-1" onClick={onUse}>
            <Play className="h-4 w-4 mr-1" />
            Use
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default WorkflowTemplatesLibrary;
