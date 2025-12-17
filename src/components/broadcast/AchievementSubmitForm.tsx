import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { Trophy, Loader2 } from 'lucide-react';
import { useInstincts } from '@/hooks/useInstincts';
import type { Json } from '@/integrations/supabase/types';

interface AchievementSubmitFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const ACHIEVEMENT_TYPES = [
  { value: 'deal_closed', label: 'Deal Closed' },
  { value: 'project_completed', label: 'Project Completed' },
  { value: 'milestone', label: 'Milestone Reached' },
  { value: 'partnership', label: 'Partnership Formed' },
  { value: 'award', label: 'Award/Recognition' },
  { value: 'certification', label: 'Certification Earned' },
  { value: 'other', label: 'Other Achievement' },
];

const VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public - Visible to all users' },
  { value: 'network', label: 'Network - Visible to connections' },
  { value: 'private', label: 'Private - Only visible to you' },
];

export function AchievementSubmitForm({ onSuccess, onCancel }: AchievementSubmitFormProps) {
  const { user } = useAuth();
  const { trackClick } = useInstincts();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [achievementType, setAchievementType] = useState('deal_closed');
  const [visibility, setVisibility] = useState('public');
  const [riskTolerance, setRiskTolerance] = useState([50]);
  const [executionSpeed, setExecutionSpeed] = useState([50]);
  const [dealValue, setDealValue] = useState('');
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please sign in to submit an achievement');
      return;
    }

    if (!title.trim()) {
      toast.error('Please enter an achievement title');
      return;
    }

    if (title.length > 200) {
      toast.error('Title must be less than 200 characters');
      return;
    }

    if (description.length > 2000) {
      toast.error('Description must be less than 2000 characters');
      return;
    }

    setLoading(true);

    try {
      const metricsObj: Record<string, string | number> = {};
      if (dealValue) {
        const parsedValue = parseFloat(dealValue);
        if (!isNaN(parsedValue)) {
          metricsObj.deal_value = parsedValue;
        }
      }
      if (companyName.trim()) {
        metricsObj.company_name = companyName.trim();
      }

      const { error } = await supabase
        .from('bd_achievements')
        .insert([{
          user_id: user.id,
          title: title.trim(),
          description: description.trim() || null,
          achievement_type: achievementType,
          visibility,
          risk_tolerance: riskTolerance[0] / 100,
          execution_speed: executionSpeed[0] / 100,
          metrics: Object.keys(metricsObj).length > 0 ? (metricsObj as Json) : null,
          verified: false,
        }]);

      if (error) throw error;

      trackClick('broadcast', 'achievement_submitted', {
        achievement_type: achievementType,
        visibility,
      });

      toast.success('Achievement submitted for verification!');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting achievement:', error);
      toast.error('Failed to submit achievement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 pb-2 border-b">
        <Trophy className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold">Submit Achievement for Verification</h3>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Achievement Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Closed $500K Enterprise Deal"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="type">Achievement Type</Label>
          <Select value={achievementType} onValueChange={setAchievementType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ACHIEVEMENT_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe your achievement, the challenges overcome, and the impact..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground">{description.length}/2000</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="dealValue">Deal Value (optional)</Label>
            <Input
              id="dealValue"
              type="number"
              placeholder="e.g., 500000"
              value={dealValue}
              onChange={(e) => setDealValue(e.target.value)}
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company/Client Name (optional)</Label>
            <Input
              id="companyName"
              placeholder="e.g., Acme Corp"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              maxLength={100}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Risk Tolerance: {riskTolerance[0]}%</Label>
            <p className="text-xs text-muted-foreground">How much risk was involved in achieving this?</p>
            <Slider
              value={riskTolerance}
              onValueChange={setRiskTolerance}
              max={100}
              step={5}
              className="py-2"
            />
          </div>

          <div className="space-y-2">
            <Label>Execution Speed: {executionSpeed[0]}%</Label>
            <p className="text-xs text-muted-foreground">How quickly was this accomplished relative to expectations?</p>
            <Slider
              value={executionSpeed}
              onValueChange={setExecutionSpeed}
              max={100}
              step={5}
              className="py-2"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="visibility">Visibility</Label>
          <Select value={visibility} onValueChange={setVisibility}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {VISIBILITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-3 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Trophy className="h-4 w-4 mr-2" />
              Submit for Verification
            </>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Achievements will be reviewed and verified before appearing on your public profile.
      </p>
    </form>
  );
}
