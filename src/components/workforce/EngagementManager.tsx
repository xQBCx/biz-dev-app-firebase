import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Briefcase, Clock, DollarSign, Percent } from "lucide-react";
import { useEngagements, useCreateEngagement, useUpdateEngagement } from "@/hooks/useWorkforce";
import { format } from "date-fns";

const engagementTypes = [
  { value: 'hourly', label: 'Hourly', icon: Clock },
  { value: 'project', label: 'Project', icon: Briefcase },
  { value: 'retainer', label: 'Retainer', icon: DollarSign },
  { value: 'equity_swap', label: 'Equity Swap', icon: Percent },
];

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-500',
  paused: 'bg-yellow-500/10 text-yellow-500',
  completed: 'bg-blue-500/10 text-blue-500',
  cancelled: 'bg-red-500/10 text-red-500',
};

export function EngagementManager() {
  const { data: engagements, isLoading } = useEngagements();
  const createEngagement = useCreateEngagement();
  const updateEngagement = useUpdateEngagement();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    engagement_type: 'hourly',
    hourly_rate: '',
    project_value: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
  });

  const handleCreate = async () => {
    await createEngagement.mutateAsync({
      title: formData.title,
      description: formData.description || undefined,
      engagement_type: formData.engagement_type,
      hourly_rate: formData.hourly_rate ? parseFloat(formData.hourly_rate) : undefined,
      project_value: formData.project_value ? parseFloat(formData.project_value) : undefined,
      start_date: formData.start_date,
    });
    setDialogOpen(false);
    setFormData({
      title: '',
      description: '',
      engagement_type: 'hourly',
      hourly_rate: '',
      project_value: '',
      start_date: format(new Date(), 'yyyy-MM-dd'),
    });
  };

  const handleStatusChange = async (id: string, status: string) => {
    await updateEngagement.mutateAsync({ id, status });
  };

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Engagements</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Engagement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Engagement</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input 
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Engagement title"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select 
                  value={formData.engagement_type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, engagement_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {engagementTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description"
                />
              </div>
              {formData.engagement_type === 'hourly' && (
                <div>
                  <Label>Hourly Rate ($)</Label>
                  <Input 
                    type="number"
                    value={formData.hourly_rate}
                    onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: e.target.value }))}
                    placeholder="100"
                  />
                </div>
              )}
              {formData.engagement_type === 'project' && (
                <div>
                  <Label>Project Value ($)</Label>
                  <Input 
                    type="number"
                    value={formData.project_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, project_value: e.target.value }))}
                    placeholder="5000"
                  />
                </div>
              )}
              <div>
                <Label>Start Date</Label>
                <Input 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <Button 
                onClick={handleCreate} 
                className="w-full"
                disabled={!formData.title || createEngagement.isPending}
              >
                {createEngagement.isPending ? 'Creating...' : 'Create Engagement'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-3">
          {engagements && engagements.length > 0 ? (
            engagements.map((engagement) => {
              const TypeIcon = engagementTypes.find(t => t.value === engagement.engagement_type)?.icon || Briefcase;
              return (
                <Card key={engagement.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TypeIcon className="h-4 w-4 text-primary" />
                        {engagement.title}
                      </CardTitle>
                      <Badge className={statusColors[engagement.status]}>
                        {engagement.status}
                      </Badge>
                    </div>
                    <CardDescription>{engagement.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex gap-4">
                        {engagement.hourly_rate && (
                          <span className="text-muted-foreground">
                            ${engagement.hourly_rate}/hr
                          </span>
                        )}
                        {engagement.project_value && (
                          <span className="text-muted-foreground">
                            ${engagement.project_value.toLocaleString()} project
                          </span>
                        )}
                        <span className="text-muted-foreground">
                          {engagement.total_hours_logged}h logged
                        </span>
                        <span className="font-medium text-green-600">
                          ${engagement.total_earnings.toLocaleString()} earned
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {engagement.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(engagement.id, 'paused')}
                          >
                            Pause
                          </Button>
                        )}
                        {engagement.status === 'paused' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleStatusChange(engagement.id, 'active')}
                          >
                            Resume
                          </Button>
                        )}
                        {engagement.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleStatusChange(engagement.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No engagements yet</p>
              <p className="text-sm">Create your first engagement to start tracking work</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
