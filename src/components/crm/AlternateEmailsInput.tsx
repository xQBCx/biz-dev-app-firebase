import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Mail } from "lucide-react";

interface AlternateEmailsInputProps {
  emails: string[];
  onChange: (emails: string[]) => void;
  primaryEmail?: string;
  onPrimaryChange?: (email: string) => void;
}

export const AlternateEmailsInput = ({
  emails,
  onChange,
  primaryEmail,
  onPrimaryChange,
}: AlternateEmailsInputProps) => {
  const [newEmail, setNewEmail] = useState("");

  const handleAddEmail = () => {
    const trimmedEmail = newEmail.trim().toLowerCase();
    if (!trimmedEmail) return;
    
    // Basic email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return;
    }
    
    // Check for duplicates
    if (emails.includes(trimmedEmail)) {
      return;
    }
    
    onChange([...emails, trimmedEmail]);
    setNewEmail("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    onChange(emails.filter((e) => e !== emailToRemove));
    
    // If removing the primary outreach email, reset it
    if (primaryEmail === emailToRemove && onPrimaryChange) {
      onPrimaryChange("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2">
        <Mail className="w-4 h-4" />
        Additional Email Addresses
      </Label>
      
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Add another email address..."
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1"
        />
        <Button 
          type="button" 
          variant="outline" 
          size="icon"
          onClick={handleAddEmail}
          disabled={!newEmail.trim()}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      
      {emails.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {emails.map((email) => (
            <Badge
              key={email}
              variant={primaryEmail === email ? "default" : "secondary"}
              className="flex items-center gap-1 pr-1 cursor-pointer"
              onClick={() => onPrimaryChange?.(email)}
              title={primaryEmail === email ? "Primary for outreach" : "Click to set as primary for outreach"}
            >
              <span className="max-w-[200px] truncate">{email}</span>
              {primaryEmail === email && (
                <span className="text-[10px] ml-1 opacity-70">(primary)</span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveEmail(email);
                }}
                className="ml-1 rounded-full p-0.5 hover:bg-background/50"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      
      {emails.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Click an email to set it as the primary address for outreach.
        </p>
      )}
    </div>
  );
};
