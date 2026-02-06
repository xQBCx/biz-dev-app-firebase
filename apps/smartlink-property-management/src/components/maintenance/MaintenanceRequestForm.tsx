import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MaintenanceItemsGrid } from './MaintenanceItemsGrid';
import { MediaCapture } from './MediaCapture';
import { AlertCircle, Clock, Zap, TrendingUp, Wrench } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const formSchema = z.object({
  suiteNumber: z.string().min(1, 'Suite number is required'),
  locationType: z.enum(['bedroom', 'bathroom', 'kitchen', 'living_room', 'other']),
  specificLocation: z.string().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  description: z.string().min(10, 'Please provide a detailed description'),
  remarks: z.string().optional(),
});

const urgencyOptions = [
  { value: 'low', label: 'Low Priority', icon: Clock, color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium Priority', icon: TrendingUp, color: 'bg-yellow-500' },
  { value: 'high', label: 'High Priority', icon: AlertCircle, color: 'bg-orange-500' },
  { value: 'emergency', label: 'Emergency', icon: Zap, color: 'bg-red-500' },
];

interface MaintenanceRequestFormProps {
  prefilledRoomId?: string;
  prefilledSuiteNumber?: string;
  onSuccess?: () => void;
}

export const MaintenanceRequestForm = ({ prefilledRoomId, prefilledSuiteNumber, onSuccess }: MaintenanceRequestFormProps = {}) => {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      suiteNumber: prefilledSuiteNumber || '',
      urgency: 'medium',
    },
  });

  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to submit a maintenance request.",
        variant: "destructive",
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one item that needs maintenance.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get user's property_id
      const { data: profile } = await supabase
        .from('profiles')
        .select('property_id')
        .eq('user_id', user.id)
        .single();

      const { error } = await supabase
        .from('maintenance_requests')
        .insert({
          user_id: user.id,
          suite_number: values.suiteNumber,
          location_type: values.locationType,
          specific_location: values.specificLocation,
          selected_items: selectedItems,
          urgency: values.urgency,
          description: values.description,
          remarks: values.remarks,
          property_id: profile?.property_id,
          media_attachments: mediaFiles.filter(f => f.uploaded).map(f => ({
            type: f.type,
            url: f.url,
            name: f.name,
            size: f.size
          })),
          ...(prefilledRoomId && { room_id: prefilledRoomId }),
        });

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully!",
        description: "Your maintenance request has been submitted and will be processed soon.",
      });

      // Reset form
      form.reset();
      setSelectedItems([]);
      setMediaFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUrgency = form.watch('urgency');
  const urgencyConfig = urgencyOptions.find(opt => opt.value === selectedUrgency);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="bg-gradient-to-r from-slate to-slate/80 text-slate-foreground">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
              <Wrench className="h-4 w-4" />
            </div>
            Maintenance Request Form
          </CardTitle>
          <p className="text-sm opacity-90">Submit a maintenance request for your suite</p>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <MaintenanceItemsGrid 
            selectedItems={selectedItems}
            onItemToggle={handleItemToggle}
            urgencyLevel={selectedUrgency}
          />

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="suiteNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suite Number/Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 101, 2A, Penthouse" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="locationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select location type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="bedroom">Bedroom</SelectItem>
                          <SelectItem value="bathroom">Bathroom</SelectItem>
                          <SelectItem value="kitchen">Kitchen</SelectItem>
                          <SelectItem value="living_room">Living Room</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="specificLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Specific Location Details (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Master bedroom, Guest bathroom #1, Kitchen island" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {urgencyOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${option.color}`} />
                                <Icon className="h-4 w-4" />
                                {option.label}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {urgencyConfig && (
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${urgencyConfig.color}`} />
                          {urgencyConfig.label}
                        </Badge>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description of Issue</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please describe the maintenance issue in detail..."
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="remarks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Remarks (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information or special requests..."
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Attach Photos, Videos, or Voice Notes</h4>
                <MediaCapture 
                  onMediaUpdate={setMediaFiles}
                  maxFiles={8}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || selectedItems.length === 0}
                size="lg"
              >
                {isSubmitting ? 'Submitting Request...' : 'Submit Maintenance Request'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};