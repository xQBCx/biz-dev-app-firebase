import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { User, Building2, Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface CRMContact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  title: string | null;
}

interface CRMContactSearchProps {
  onSelect: (name: string, email: string) => void;
  nameValue: string;
  emailValue: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  placeholder?: string;
}

export const CRMContactSearch = ({
  onSelect,
  nameValue,
  emailValue,
  onNameChange,
  onEmailChange,
  placeholder = "Search CRM or enter name..."
}: CRMContactSearchProps) => {
  const [searchResults, setSearchResults] = useState<CRMContact[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchCRM = async () => {
      if (!userId || nameValue.length < 2) {
        setSearchResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);
      try {
        const searchTerm = `%${nameValue.toLowerCase()}%`;
        
        const { data, error } = await supabase
          .from("crm_contacts")
          .select("id, first_name, last_name, email, title")
          .eq("user_id", userId)
          .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm}`)
          .limit(5);

        if (error) throw error;
        
        setSearchResults(data || []);
        setShowDropdown((data?.length || 0) > 0);
      } catch (error) {
        console.error("Error searching CRM:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchCRM, 300);
    return () => clearTimeout(debounce);
  }, [nameValue, userId]);

  const handleSelectContact = (contact: CRMContact) => {
    const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
    onSelect(fullName, contact.email || "");
    setShowDropdown(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
      <div className="relative flex-1" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder={placeholder}
            value={nameValue}
            onChange={(e) => onNameChange(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
            className="pl-9 flex-1"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
          )}
        </div>
        
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                CRM Contacts
              </div>
              {searchResults.map((contact) => {
                const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
                return (
                  <button
                    key={contact.id}
                    type="button"
                    onClick={() => handleSelectContact(contact)}
                    className={cn(
                      "w-full flex items-center gap-3 px-2 py-2 rounded-sm text-left",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:bg-accent focus:text-accent-foreground focus:outline-none"
                    )}
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {fullName || "No name"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {contact.email}
                      </div>
                    </div>
                    {contact.title && (
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {contact.title}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <Input
        placeholder="Email"
        type="email"
        value={emailValue}
        onChange={(e) => onEmailChange(e.target.value)}
        className="flex-1"
      />
    </div>
  );
};
