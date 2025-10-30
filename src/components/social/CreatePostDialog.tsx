import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "@/hooks/use-toast";
import { CalendarIcon, Image, Loader } from "lucide-react";
import { format } from "date-fns";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface SocialAccount {
  id: string;
  platform_id: string;
  account_name: string;
  social_platforms: {
    platform_name: string;
    logo_url: string | null;
  };
}

export const CreatePostDialog = ({ open, onOpenChange, onSuccess }: CreatePostDialogProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [scheduledFor, setScheduledFor] = useState<Date>();
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  useEffect(() => {
    if (open && user) {
      loadAccounts();
    }
  }, [open, user]);

  const loadAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const { data, error } = await supabase
        .from("social_accounts")
        .select(`
          id,
          platform_id,
          account_name,
          social_platforms (
            platform_name,
            logo_url
          )
        `)
        .eq("user_id", user?.id)
        .eq("status", "active");

      if (error) throw error;
      setAccounts(data || []);
    } catch (error) {
      console.error("Error loading accounts:", error);
      toast({
        title: "Error",
        description: "Failed to load connected accounts",
        variant: "destructive",
      });
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter post content",
        variant: "destructive",
      });
      return;
    }

    if (selectedAccounts.length === 0) {
      toast({
        title: "No accounts selected",
        description: "Please select at least one account to post to",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Create posts for each selected account
      const posts = await Promise.all(
        selectedAccounts.map(async (accountId) => {
          const account = accounts.find(a => a.id === accountId);
          return {
            user_id: user?.id,
            social_account_id: accountId,
            platform_id: account?.platform_id || "",
            content,
            media_urls: mediaUrl ? [mediaUrl] : [],
            scheduled_for: (scheduledFor || new Date()).toISOString(),
            status: (scheduledFor && scheduledFor > new Date() ? "scheduled" : "draft") as "draft" | "scheduled",
          };
        })
      );

      const { error } = await supabase
        .from("social_posts")
        .insert(posts);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Post ${scheduledFor && scheduledFor > new Date() ? 'scheduled' : 'saved as draft'} for ${selectedAccounts.length} account(s)`,
      });

      // Reset form
      setContent("");
      setMediaUrl("");
      setScheduledFor(undefined);
      setSelectedAccounts([]);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error creating post:", error);
      toast({
        title: "Error",
        description: "Failed to create post",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccount = (accountId: string) => {
    setSelectedAccounts(prev =>
      prev.includes(accountId)
        ? prev.filter(id => id !== accountId)
        : [...prev, accountId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Create and schedule a post across your connected platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Content */}
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          </div>

          {/* Media URL */}
          <div className="space-y-2">
            <Label>Media URL (optional)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
              />
              <Button variant="outline" size="icon">
                <Image className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-2">
            <Label>Schedule (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {scheduledFor ? format(scheduledFor, "PPP 'at' p") : "Post immediately"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={scheduledFor}
                  onSelect={setScheduledFor}
                  disabled={(date) => date < new Date()}
                />
                <div className="p-3 border-t">
                  <Input
                    type="time"
                    onChange={(e) => {
                      if (scheduledFor && e.target.value) {
                        const [hours, minutes] = e.target.value.split(":");
                        const newDate = new Date(scheduledFor);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setScheduledFor(newDate);
                      }
                    }}
                  />
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Account Selection */}
          <div className="space-y-2">
            <Label>Post to</Label>
            {loadingAccounts ? (
              <div className="flex items-center justify-center p-4">
                <Loader className="h-6 w-6 animate-spin" />
              </div>
            ) : accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No connected accounts. Connect accounts first.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                {accounts.map((account) => (
                  <div key={account.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={account.id}
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => toggleAccount(account.id)}
                    />
                    <label
                      htmlFor={account.id}
                      className="flex items-center gap-2 cursor-pointer flex-1"
                    >
                      {account.social_platforms?.logo_url && (
                        <img
                          src={account.social_platforms.logo_url}
                          alt=""
                          className="h-5 w-5 rounded"
                        />
                      )}
                      <span className="text-sm">
                        {account.account_name} ({account.social_platforms?.platform_name})
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading || loadingAccounts}>
              {loading && <Loader className="h-4 w-4 mr-2 animate-spin" />}
              {scheduledFor && scheduledFor > new Date() ? "Schedule" : "Save Draft"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
