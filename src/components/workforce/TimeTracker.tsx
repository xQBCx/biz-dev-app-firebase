import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Clock, Calendar, DollarSign } from "lucide-react";
import { useTimeEntries, useCreateTimeEntry, useEngagements } from "@/hooks/useWorkforce";
import { format } from "date-fns";

export function TimeTracker() {
  const { data: timeEntries, isLoading } = useTimeEntries();
  const { data: engagements } = useEngagements();
  const createTimeEntry = useCreateTimeEntry();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    engagement_id: '',
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    hours: '',
    description: '',
    billable: true,
  });

  const handleCreate = async () => {
    await createTimeEntry.mutateAsync({
      engagement_id: formData.engagement_id || undefined,
      entry_date: formData.entry_date,
      hours: parseFloat(formData.hours),
      description: formData.description || undefined,
      billable: formData.billable,
    });
    setDialogOpen(false);
    setFormData({
      engagement_id: '',
      entry_date: format(new Date(), 'yyyy-MM-dd'),
      hours: '',
      description: '',
      billable: true,
    });
  };

  const activeEngagements = engagements?.filter(e => e.status === 'active') || [];

  // Group entries by date
  const entriesByDate = timeEntries?.reduce((acc, entry) => {
    const date = entry.entry_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, typeof timeEntries>) || {};

  if (isLoading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Time Entries</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Log Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Log Time Entry</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Engagement (Optional)</Label>
                <Select 
                  value={formData.engagement_id}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, engagement_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select engagement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No engagement</SelectItem>
                    {activeEngagements.map(eng => (
                      <SelectItem key={eng.id} value={eng.id}>
                        {eng.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Date</Label>
                <Input 
                  type="date"
                  value={formData.entry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, entry_date: e.target.value }))}
                />
              </div>
              <div>
                <Label>Hours</Label>
                <Input 
                  type="number"
                  step="0.25"
                  value={formData.hours}
                  onChange={(e) => setFormData(prev => ({ ...prev, hours: e.target.value }))}
                  placeholder="2.5"
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="What did you work on?"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="billable"
                  checked={formData.billable}
                  onChange={(e) => setFormData(prev => ({ ...prev, billable: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="billable">Billable</Label>
              </div>
              <Button 
                onClick={handleCreate} 
                className="w-full"
                disabled={!formData.hours || createTimeEntry.isPending}
              >
                {createTimeEntry.isPending ? 'Logging...' : 'Log Time'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(entriesByDate[format(new Date(), 'yyyy-MM-dd')] || [])
                .reduce((sum, e) => sum + e.hours, 0)
                .toFixed(1)}h
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(timeEntries || [])
                .filter(e => {
                  const date = new Date(e.entry_date);
                  const now = new Date();
                  const weekAgo = new Date(now.setDate(now.getDate() - 7));
                  return date >= weekAgo;
                })
                .reduce((sum, e) => sum + e.hours, 0)
                .toFixed(1)}h
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Billable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(timeEntries || [])
                .filter(e => e.billable)
                .reduce((sum, e) => sum + e.hours, 0)
                .toFixed(1)}h
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries List */}
      <ScrollArea className="h-[300px]">
        <div className="space-y-4">
          {Object.entries(entriesByDate)
            .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
            .slice(0, 10)
            .map(([date, entries]) => (
              <div key={date}>
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {format(new Date(date), 'EEEE, MMM d')}
                  </span>
                  <Badge variant="outline">
                    {entries!.reduce((sum, e) => sum + e.hours, 0).toFixed(1)}h
                  </Badge>
                </div>
                <div className="space-y-2 ml-6">
                  {entries!.map((entry) => {
                    const engagement = engagements?.find(e => e.id === entry.engagement_id);
                    return (
                      <div 
                        key={entry.id}
                        className="flex items-center justify-between p-2 bg-muted rounded"
                      >
                        <div className="flex items-center gap-3">
                          <Clock className="h-4 w-4 text-primary" />
                          <div>
                            <span className="font-medium">{entry.hours}h</span>
                            {entry.description && (
                              <span className="text-muted-foreground ml-2">{entry.description}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {engagement && (
                            <Badge variant="secondary">{engagement.title}</Badge>
                          )}
                          {entry.billable && (
                            <Badge className="bg-green-500/10 text-green-600">
                              <DollarSign className="h-3 w-3 mr-1" />
                              Billable
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          {(!timeEntries || timeEntries.length === 0) && (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No time entries yet</p>
              <p className="text-sm">Log your first time entry to start tracking</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
