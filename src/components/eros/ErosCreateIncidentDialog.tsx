import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateErosIncident, ErosIncidentType, ErosSeverity } from '@/hooks/useEROS';
import { useNavigate } from 'react-router-dom';

const incidentSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().optional(),
  incident_type: z.enum(['natural_disaster', 'medical', 'security', 'infrastructure', 'community', 'industrial', 'environmental']),
  severity: z.enum(['critical', 'high', 'medium', 'low']),
  location_address: z.string().optional(),
  min_responders: z.coerce.number().min(1).default(1),
  required_skills: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface ErosCreateIncidentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ErosCreateIncidentDialog({ open, onOpenChange }: ErosCreateIncidentDialogProps) {
  const navigate = useNavigate();
  const createIncident = useCreateErosIncident();

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      title: '',
      description: '',
      incident_type: 'community',
      severity: 'medium',
      location_address: '',
      min_responders: 1,
      required_skills: '',
    },
  });

  const onSubmit = async (data: IncidentFormData) => {
    const skills = data.required_skills
      ? data.required_skills.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const incident = await createIncident.mutateAsync({
      title: data.title,
      description: data.description || null,
      incident_type: data.incident_type as ErosIncidentType,
      severity: data.severity as ErosSeverity,
      location_address: data.location_address || null,
      min_responders: data.min_responders,
      required_skills: skills,
    });

    onOpenChange(false);
    form.reset();
    navigate(`/eros/incidents/${incident.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create New Incident</DialogTitle>
          <DialogDescription>
            Report a new emergency incident and request responder deployment.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Incident Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Brief description of the incident" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="incident_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="security">Security</SelectItem>
                        <SelectItem value="infrastructure">Infrastructure</SelectItem>
                        <SelectItem value="community">Community</SelectItem>
                        <SelectItem value="industrial">Industrial</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Detailed description of the situation..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Address or location description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_responders"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Responders</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required_skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Required Skills</FormLabel>
                    <FormControl>
                      <Input placeholder="EMT, Security, etc." {...field} />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Comma-separated
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createIncident.isPending}>
                {createIncident.isPending ? 'Creating...' : 'Create Incident'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
