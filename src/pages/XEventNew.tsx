import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useXEvents, XEventCategory, CreateXEventInput } from "@/hooks/useXEvents";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  ArrowRight,
  Calendar,
  MapPin,
  Video,
  Users,
  Palette,
  Ticket,
  Sparkles,
  Check,
  CalendarDays,
  Globe,
  Lock,
  UserCheck,
  Clock
} from "lucide-react";
import { format, addHours } from "date-fns";
import { toast } from "sonner";

const STEPS = [
  { id: 'basics', label: 'Event Basics', icon: CalendarDays },
  { id: 'datetime', label: 'Date & Time', icon: Clock },
  { id: 'location', label: 'Location', icon: MapPin },
  { id: 'settings', label: 'Settings', icon: Users },
  { id: 'branding', label: 'Branding', icon: Palette },
];

const categoryOptions: { value: XEventCategory; label: string; description: string }[] = [
  { value: 'workshop', label: 'Workshop', description: 'Hands-on learning session' },
  { value: 'summit', label: 'Summit', description: 'High-level strategic gathering' },
  { value: 'conference', label: 'Conference', description: 'Multi-session professional event' },
  { value: 'webinar', label: 'Webinar', description: 'Online presentation or training' },
  { value: 'roundtable', label: 'Roundtable', description: 'Discussion-focused meeting' },
  { value: 'networking', label: 'Networking', description: 'Connection-building event' },
  { value: 'private_dinner', label: 'Private Dinner', description: 'Curated intimate gathering' },
  { value: 'training', label: 'Training', description: 'Skill development session' },
  { value: 'launch_event', label: 'Launch Event', description: 'Product or initiative reveal' },
  { value: 'custom', label: 'Custom', description: 'Define your own format' },
];

const XEventNew = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createEvent, createTicketType } = useXEvents();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<CreateXEventInput & {
    visibility: 'public' | 'private' | 'invite_only';
    start_time: string;
    end_time: string;
  }>({
    name: '',
    category: 'workshop',
    description: '',
    tagline: '',
    visibility: 'public',
    start_date: format(addHours(new Date(), 24 * 7), 'yyyy-MM-dd'),
    end_date: format(addHours(new Date(), 24 * 7 + 2), 'yyyy-MM-dd'),
    start_time: '09:00',
    end_time: '17:00',
    timezone: 'America/Chicago',
    is_virtual: false,
    venue_name: '',
    venue_address: '',
    venue_city: '',
    venue_state: '',
    venue_country: 'USA',
    virtual_meeting_url: '',
    virtual_platform: 'Zoom',
    max_capacity: undefined,
    cover_image_url: '',
    logo_url: '',
    primary_color: '#000000',
    accent_color: '#666666',
    tags: [],
  });

  // Ticket settings
  const [enableTicketing, setEnableTicketing] = useState(true);
  const [ticketName, setTicketName] = useState('General Admission');
  const [ticketPrice, setTicketPrice] = useState(0);
  const [ticketQuantity, setTicketQuantity] = useState<number | undefined>(undefined);

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const validateStep = (): boolean => {
    switch (currentStep) {
      case 0: // Basics
        if (!formData.name.trim()) {
          toast.error('Please enter an event name');
          return false;
        }
        break;
      case 1: // Date & Time
        if (!formData.start_date || !formData.end_date) {
          toast.error('Please select event dates');
          return false;
        }
        break;
      case 2: // Location
        if (!formData.is_virtual && !formData.venue_name) {
          toast.error('Please enter a venue name or switch to virtual');
          return false;
        }
        if (formData.is_virtual && !formData.virtual_meeting_url) {
          toast.error('Please enter a meeting URL');
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setIsSubmitting(true);

    try {
      // Combine date and time
      const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
      const endDateTime = `${formData.end_date}T${formData.end_time}:00`;

      const event = await createEvent({
        ...formData,
        start_date: startDateTime,
        end_date: endDateTime,
      });

      if (!event) {
        throw new Error('Failed to create event');
      }

      // Create default ticket type if enabled
      if (enableTicketing) {
        await createTicketType({
          event_id: event.id,
          name: ticketName,
          price_cents: ticketPrice * 100,
          quantity_total: ticketQuantity,
        });
      }

      toast.success('Event created successfully!');
      navigate(`/xevents/${event.id}`);
    } catch (err: any) {
      console.error('Error creating event:', err);
      toast.error(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Basics
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Houston Tech Summit 2026"
                value={formData.name}
                onChange={(e) => updateForm({ name: e.target.value })}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                placeholder="A brief description that captures the essence"
                value={formData.tagline}
                onChange={(e) => updateForm({ tagline: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Event Category *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {categoryOptions.map(option => (
                  <Card
                    key={option.value}
                    className={`p-3 cursor-pointer transition-all hover:border-primary/50 ${
                      formData.category === option.value
                        ? 'border-primary bg-primary/5'
                        : ''
                    }`}
                    onClick={() => updateForm({ category: option.value })}
                  >
                    <div className="flex items-center gap-2">
                      {formData.category === option.value && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell attendees what to expect..."
                value={formData.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                rows={4}
              />
            </div>
          </div>
        );

      case 1: // Date & Time
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => updateForm({ start_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="start_time">Start Time *</Label>
                <Input
                  id="start_time"
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => updateForm({ start_time: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => updateForm({ end_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end_time">End Time *</Label>
                <Input
                  id="end_time"
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => updateForm({ end_time: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(v) => updateForm({ timezone: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case 2: // Location
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5" />
                <div>
                  <p className="font-medium">Virtual Event</p>
                  <p className="text-sm text-muted-foreground">Host online via video platform</p>
                </div>
              </div>
              <Switch
                checked={formData.is_virtual}
                onCheckedChange={(checked) => updateForm({ is_virtual: checked })}
              />
            </div>

            {formData.is_virtual ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="virtual_platform">Platform</Label>
                  <Select 
                    value={formData.virtual_platform} 
                    onValueChange={(v) => updateForm({ virtual_platform: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Zoom">Zoom</SelectItem>
                      <SelectItem value="Google Meet">Google Meet</SelectItem>
                      <SelectItem value="Microsoft Teams">Microsoft Teams</SelectItem>
                      <SelectItem value="Custom">Custom Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="virtual_meeting_url">Meeting URL *</Label>
                  <Input
                    id="virtual_meeting_url"
                    type="url"
                    placeholder="https://..."
                    value={formData.virtual_meeting_url}
                    onChange={(e) => updateForm({ virtual_meeting_url: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="venue_name">Venue Name *</Label>
                  <Input
                    id="venue_name"
                    placeholder="e.g., Houston Convention Center"
                    value={formData.venue_name}
                    onChange={(e) => updateForm({ venue_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue_address">Street Address</Label>
                  <Input
                    id="venue_address"
                    placeholder="123 Main Street"
                    value={formData.venue_address}
                    onChange={(e) => updateForm({ venue_address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue_city">City</Label>
                    <Input
                      id="venue_city"
                      placeholder="Houston"
                      value={formData.venue_city}
                      onChange={(e) => updateForm({ venue_city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="venue_state">State</Label>
                    <Input
                      id="venue_state"
                      placeholder="TX"
                      value={formData.venue_state}
                      onChange={(e) => updateForm({ venue_state: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 3: // Settings
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Event Visibility</Label>
              <RadioGroup
                value={formData.visibility}
                onValueChange={(v: any) => updateForm({ visibility: v })}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Globe className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-sm text-muted-foreground">Anyone can discover and register</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Lock className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Private</p>
                      <p className="text-sm text-muted-foreground">Only visible to those with the link</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="invite_only" id="invite_only" />
                  <Label htmlFor="invite_only" className="flex items-center gap-2 cursor-pointer flex-1">
                    <UserCheck className="w-4 h-4" />
                    <div>
                      <p className="font-medium">Invite Only</p>
                      <p className="text-sm text-muted-foreground">Requires invitation to register</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_capacity">Maximum Capacity</Label>
              <Input
                id="max_capacity"
                type="number"
                placeholder="Leave empty for unlimited"
                value={formData.max_capacity || ''}
                onChange={(e) => updateForm({ max_capacity: e.target.value ? parseInt(e.target.value) : undefined })}
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Ticket className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Enable Ticketing</p>
                    <p className="text-sm text-muted-foreground">Allow registration with tickets</p>
                  </div>
                </div>
                <Switch checked={enableTicketing} onCheckedChange={setEnableTicketing} />
              </div>

              {enableTicketing && (
                <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
                  <div className="space-y-2">
                    <Label>Ticket Name</Label>
                    <Input
                      value={ticketName}
                      onChange={(e) => setTicketName(e.target.value)}
                      placeholder="General Admission"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Price (USD)</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={ticketPrice}
                        onChange={(e) => setTicketPrice(parseFloat(e.target.value) || 0)}
                        placeholder="0 = Free"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        min="1"
                        value={ticketQuantity || ''}
                        onChange={(e) => setTicketQuantity(e.target.value ? parseInt(e.target.value) : undefined)}
                        placeholder="Unlimited"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 4: // Branding
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input
                id="cover_image_url"
                type="url"
                placeholder="https://..."
                value={formData.cover_image_url}
                onChange={(e) => updateForm({ cover_image_url: e.target.value })}
              />
              {formData.cover_image_url && (
                <div className="mt-2 aspect-video max-w-md bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={formData.cover_image_url} 
                    alt="Cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                type="url"
                placeholder="https://..."
                value={formData.logo_url}
                onChange={(e) => updateForm({ logo_url: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.primary_color}
                    onChange={(e) => updateForm({ primary_color: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.primary_color}
                    onChange={(e) => updateForm({ primary_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accent_color">Accent Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="accent_color"
                    type="color"
                    value={formData.accent_color}
                    onChange={(e) => updateForm({ accent_color: e.target.value })}
                    className="w-12 h-10 p-1 cursor-pointer"
                  />
                  <Input
                    value={formData.accent_color}
                    onChange={(e) => updateForm({ accent_color: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                placeholder="technology, networking, houston"
                value={formData.tags?.join(', ') || ''}
                onChange={(e) => updateForm({ 
                  tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean)
                })}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-depth">
      <div className="container max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/xevents')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Event</h1>
            <p className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].label}
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <Progress value={((currentStep + 1) / STEPS.length) * 100} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === currentStep;
              const isComplete = index < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => index <= currentStep && setCurrentStep(index)}
                  className={`flex items-center gap-1.5 text-xs transition-colors ${
                    isActive 
                      ? 'text-primary font-medium' 
                      : isComplete 
                        ? 'text-primary/70' 
                        : 'text-muted-foreground'
                  }`}
                  disabled={index > currentStep}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Content */}
        <Card className="p-6 mb-6">
          {renderStepContent()}
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={() => { if (validateStep()) handleNext(); }} className="gap-2">
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>Creating...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Create Event
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default XEventNew;
