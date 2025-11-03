import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Gift, Heart, GraduationCap, PartyPopper, Sparkles } from 'lucide-react';

interface GiftCardPersonalizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  faceValue: number;
  onConfirm: (personalization: PersonalizationData) => void;
  loading?: boolean;
}

export interface PersonalizationData {
  occasion_title?: string;
  occasion_message?: string;
  occasion_theme?: string;
  sender_name?: string;
  recipient_name?: string;
  recipient_email?: string;
  recipient_phone?: string;
  delivery_method?: string;
}

const occasionThemes = [
  { value: 'birthday', label: 'Birthday', icon: PartyPopper, color: 'from-pink-500 to-purple-500' },
  { value: 'graduation', label: 'Graduation', icon: GraduationCap, color: 'from-blue-500 to-cyan-500' },
  { value: 'thank_you', label: 'Thank You', icon: Heart, color: 'from-red-500 to-pink-500' },
  { value: 'just_because', label: 'Just Because', icon: Sparkles, color: 'from-yellow-500 to-orange-500' },
  { value: 'holiday', label: 'Holiday', icon: Gift, color: 'from-green-500 to-emerald-500' },
  { value: 'custom', label: 'Custom', icon: Gift, color: 'from-purple-500 to-indigo-500' },
];

const defaultMessages: Record<string, string> = {
  birthday: 'Happy Birthday! Wishing you an amazing day filled with joy!',
  graduation: 'Congratulations on your graduation! So proud of your achievement!',
  thank_you: 'Thank you for everything you do. You\'re amazing!',
  just_because: 'Thinking of you and wanted to send something special!',
  holiday: 'Happy Holidays! Hope your season is filled with warmth and joy!',
  custom: '',
};

export function GiftCardPersonalizationDialog({
  open,
  onOpenChange,
  productName,
  faceValue,
  onConfirm,
  loading = false,
}: GiftCardPersonalizationDialogProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<string>('email');
  const [occasionTheme, setOccasionTheme] = useState<string>('custom');
  const [occasionTitle, setOccasionTitle] = useState<string>('');
  const [occasionMessage, setOccasionMessage] = useState<string>('');
  const [senderName, setSenderName] = useState<string>('');
  const [recipientName, setRecipientName] = useState<string>('');
  const [recipientEmail, setRecipientEmail] = useState<string>('');
  const [recipientPhone, setRecipientPhone] = useState<string>('');

  const handleThemeChange = (theme: string) => {
    setOccasionTheme(theme);
    setOccasionMessage(defaultMessages[theme] || '');
    if (theme !== 'custom') {
      setOccasionTitle(occasionThemes.find(t => t.value === theme)?.label || '');
    }
  };

  const handleConfirm = () => {
    onConfirm({
      occasion_title: occasionTitle,
      occasion_message: occasionMessage,
      occasion_theme: occasionTheme,
      sender_name: senderName,
      recipient_name: recipientName,
      recipient_email: recipientEmail,
      recipient_phone: recipientPhone,
      delivery_method: deliveryMethod,
    });
  };

  const selectedThemeData = occasionThemes.find(t => t.value === occasionTheme);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalize Your Gift Card</DialogTitle>
          <DialogDescription>
            Add a personal touch to your ${faceValue} {productName} gift card
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="message" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="message">Message & Theme</TabsTrigger>
            <TabsTrigger value="delivery">Delivery Details</TabsTrigger>
          </TabsList>

          <TabsContent value="message" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Occasion Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {occasionThemes.map((theme) => {
                  const Icon = theme.icon;
                  return (
                    <button
                      key={theme.value}
                      onClick={() => handleThemeChange(theme.value)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        occasionTheme === theme.value
                          ? 'border-primary bg-primary/10'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${theme.color} flex items-center justify-center mx-auto mb-2`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-sm font-medium text-center">{theme.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion-title">Occasion Title</Label>
              <Input
                id="occasion-title"
                placeholder="e.g., Happy Birthday, Congratulations!"
                value={occasionTitle}
                onChange={(e) => setOccasionTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occasion-message">Personal Message</Label>
              <Textarea
                id="occasion-message"
                placeholder="Write your personal message here..."
                value={occasionMessage}
                onChange={(e) => setOccasionMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sender-name">Your Name (From)</Label>
                <Input
                  id="sender-name"
                  placeholder="Your name"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient-name">Recipient Name</Label>
                <Input
                  id="recipient-name"
                  placeholder="Recipient's name"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email (Free)</SelectItem>
                  <SelectItem value="sms">Text Message (SMS) (+$0.01)</SelectItem>
                  <SelectItem value="physical">Physical Card (Printable PDF) (+$3.00)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(deliveryMethod === 'email' || deliveryMethod === 'physical') && (
              <div className="space-y-2">
                <Label htmlFor="recipient-email">Recipient Email *</Label>
                <Input
                  id="recipient-email"
                  type="email"
                  placeholder="recipient@email.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {deliveryMethod === 'sms' && (
              <div className="space-y-2">
                <Label htmlFor="recipient-phone">Recipient Phone Number *</Label>
                <Input
                  id="recipient-phone"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Preview</h4>
              {selectedThemeData && (
                <div className={`p-4 rounded-lg bg-gradient-to-r ${selectedThemeData.color} text-white`}>
                  <p className="text-lg font-bold">{occasionTitle || 'Your Gift Card'}</p>
                  <p className="text-sm mt-2 opacity-90">{occasionMessage || 'Your message will appear here'}</p>
                  {senderName && <p className="text-xs mt-3 opacity-75">From: {senderName}</p>}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading || (deliveryMethod === 'email' && !recipientEmail) || (deliveryMethod === 'sms' && !recipientPhone)}
          >
            {loading ? 'Processing...' : 'Continue to Checkout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
